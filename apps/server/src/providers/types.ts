import type { ProviderId } from '@guinevere/shared';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  system?: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Aktifkan Google Search grounding (Gemini saja). */
  grounding?: boolean;
  signal?: AbortSignal;
}

export interface GenerateResult {
  text: string;
  provider: ProviderId;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  /** Berapa kali router harus failover sebelum berhasil. */
  attempts: number;
}

export class QuotaExhaustedError extends Error {
  constructor(
    public readonly provider: ProviderId,
    message = `Kuota ${provider} habis`,
  ) {
    super(message);
    this.name = 'QuotaExhaustedError';
  }
}

export interface Provider {
  readonly id: ProviderId;
  /** Model default provider ini. */
  readonly model: string;
  /** True bila kredensial tersedia. */
  readonly available: boolean;
  generate(opts: GenerateOptions): Promise<GenerateResult>;
  /** Sisa kuota hari ini bila provider melaporkannya. */
  quota?(): Promise<{ remaining: number | null; resetAt: Date | null } | null>;
}
