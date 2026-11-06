import type { ProviderId } from '@guinevere/shared';
import { isQuotaError } from './errors.js';
import type { GenerateOptions, GenerateResult, Provider } from './types.js';

/**
 * Router multi-provider.
 *
 * Kenapa wajib: semua provider yang kita pakai berbatas kuota harian, dan
 * kuota itu (bukan token) adalah bottleneck utama. Dengan fallback chain,
 * satu provider yang kena 429 tidak menjatuhkan aplikasi.
 *
 * Chain default: Groq → Gemini → OpenRouter.
 * Prioritas bisa diubah per-request lewat `preferred`.
 */

export interface RouterOptions {
  providers: Provider[];
  /** Berapa kali mencoba provider berbeda sebelum menyerah. */
  maxAttempts?: number;
  /** Callback dipanggil saat provider gagal — untuk telemetry. */
  onFailure?: (provider: ProviderId, error: Error) => void;
  /** Callback dipanggil setelah provider sukses — untuk telemetry. */
  onSuccess?: (provider: ProviderId, model: string, tokensIn?: number, tokensOut?: number) => void;
}

export class ProviderRouter {
  private readonly providers: Provider[];
  private readonly maxAttempts: number;
  private readonly onFailure?: RouterOptions['onFailure'];
  private readonly onSuccess?: RouterOptions['onSuccess'];

  constructor(opts: RouterOptions) {
    this.providers = opts.providers.filter((p) => p.available);
    this.maxAttempts = opts.maxAttempts ?? this.providers.length;
    this.onFailure = opts.onFailure;
    this.onSuccess = opts.onSuccess;
  }

  /** Provider yang tersedia, dalam urutan prioritas. */
  availableProviders(): Provider[] {
    return [...this.providers];
  }

  /**
   * Generate dengan failover otomatis.
   * `preferred` menggeser satu provider ke depan tanpa menghapus urutan lain.
   */
  async generate(
    opts: GenerateOptions & { preferred?: ProviderId },
  ): Promise<GenerateResult> {
    const ordered = this.orderBy(opts.preferred);
    if (ordered.length === 0) {
      throw new Error(
        'Tidak ada provider AI yang tersedia. Set minimal satu API key di .env ' +
          '(GROQ_API_KEY, GEMINI_API_KEY, atau OPENROUTER_API_KEY).',
      );
    }

    const errors: Error[] = [];
    const limit = Math.min(this.maxAttempts, ordered.length);

    for (let i = 0; i < limit; i++) {
      const provider = ordered[i];
      if (!provider) break;

      try {
        const result = await provider.generate({
          ...opts,
          model: opts.model ?? provider.model,
        });
        this.onSuccess?.(
          result.provider,
          result.model,
          result.tokensIn,
          result.tokensOut,
        );
        return { ...result, attempts: i + 1 };
      } catch (err) {
        const normalized =
          err instanceof Error ? err : new Error(String(err));
        errors.push(normalized);
        this.onFailure?.(provider.id, normalized);

        // Hanya error kuota/layanan yang layak di-failover.
        // Error konfigurasi (401) tetap dicoba ke provider berikutnya,
        // karena tiap provider punya key sendiri.
        if (!isQuotaError(normalized) && !(normalized as { status?: number }).status) {
          continue;
        }
      }
    }

    const detail = errors.map((e) => `  - ${e.message}`).join('\n');
    throw new Error(`Semua provider AI gagal:\n${detail}`);
  }

  private orderBy(preferred?: ProviderId): Provider[] {
    if (!preferred) return this.providers;
    const idx = this.providers.findIndex((p) => p.id === preferred);
    if (idx <= 0) return this.providers;
    const head = this.providers[idx];
    if (!head) return this.providers;
    return [head, ...this.providers.slice(0, idx), ...this.providers.slice(idx + 1)];
  }
}
