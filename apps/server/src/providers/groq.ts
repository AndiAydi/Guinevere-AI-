import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import type { ProviderId } from '@guinevere/shared';
import type {
  GenerateOptions,
  GenerateResult,
  Provider,
} from './types.js';
import { QuotaExhaustedError } from './types.js';
import { toProviderError } from './errors.js';

/**
 * Provider PRIMARY. Free tier Groq (verifikasi Nov 2026):
 * 30 RPM, 1.000 RPD, 200K token/hari per model. Tanpa kartu kredit.
 * Catatan: batas berlaku per ORGANISASI, bukan per API key.
 */
export class GroqProvider implements Provider {
  readonly id: ProviderId = 'groq';
  readonly available: boolean;
  readonly model: string;

  private readonly client;

  constructor(apiKey: string | undefined, defaultModel: string) {
    this.available = Boolean(apiKey);
    this.model = defaultModel;
    if (apiKey) this.client = createGroq({ apiKey });
  }

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    if (!this.client) throw new QuotaExhaustedError(this.id, 'Groq: API key tidak diset');

    const model = opts.model ?? this.model;
    try {
      const result = await generateText({
        model: this.client(model),
        system: opts.system,
        messages: opts.messages as never,
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens,
        abortSignal: opts.signal,
      });

      return {
        text: result.text,
        provider: this.id,
        model,
        tokensIn: result.usage?.inputTokens,
        tokensOut: result.usage?.outputTokens,
        attempts: 1,
      };
    } catch (err) {
      throw toProviderError(this.id, err);
    }
  }
}
