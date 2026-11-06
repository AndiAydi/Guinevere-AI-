import type { ProviderId } from '@guinevere/shared';
import { QuotaExhaustedError } from './types.js';

interface ErrorLike {
  status?: number;
  statusCode?: number;
  message?: string;
  name?: string;
  cause?: unknown;
}

function readStatus(err: ErrorLike): number | undefined {
  return err.status ?? err.statusCode;
}

function readMessage(err: ErrorLike): string {
  return `${err.name ?? 'Error'}: ${err.message ?? 'tidak diketahui'}`;
}

/**
 * Ubah error provider menjadi error domain yang bisa diputuskan router.
 * 429 / quota_exceeded = kunCI semua配额 → failover ke provider berikutnya.
 * Error lain (401/403/400) = masalah konfigurasi → failover juga, tapi
 * dicatat sebagai config error supaya tidak humiliating provider.
 */
export function toProviderError(provider: ProviderId, raw: unknown): Error {
  const err = (raw ?? {}) as ErrorLike;
  const status = readStatus(err);
  const message = readMessage(err);

  if (status === 429 || /rate.?limit|quota|resource_exhausted/i.test(message)) {
    return new QuotaExhaustedError(provider, `${provider}: ${message}`);
  }

  const wrapped = new Error(`${provider}: ${message}`);
  wrapped.name = 'ProviderError';
  if (status !== undefined) (wrapped as { status?: number }).status = status;
  return wrapped;
}

export function isQuotaError(err: unknown): boolean {
  return err instanceof QuotaExhaustedError;
}
