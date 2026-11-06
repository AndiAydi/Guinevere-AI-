import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';
import type { ProviderId } from '@guinevere/shared';
import type { GenerateOptions, GenerateResult, Provider } from './types.js';
import { QuotaExhaustedError } from './types.js';
import { toProviderError } from './errors.js';

/**
 * Provider TERTIARY. Free tier OpenRouter (verifikasi Nov 2026):
 * 20 RPM shared, 50 request/hari. Naik ke 1.000/hari hanya setelah top-up
 * $10 — yang berarti bukan nol rupiah, jadi jangan jadikan primer.
 * Model free dilayani provider pihak ketiga yang bisa melatih dengan promptmu;
 * header provider-data-collection: deny dipakai untuk mengurangi risiko itu.
 */
export class OpenRouterProvider implements Provider {
  readonly id: ProviderId = 'openrouter';
  readonly available: boolean;
  readonly model: string;

  private readonly client;

  constructor(apiKey: string | undefined, defaultModel: string) {
    this.available = Boolean(apiKey);
    this.model = defaultModel;
    if (apiKey) {
      this.client = createOpenAICompatible({
        name: 'openrouter',
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey,
        headers: {
          'provider-data-collection': 'deny',
        },
      });
    }
  }

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    if (!this.client) {
      throw new QuotaExhaustedError(this.id, 'OpenRouter: API key tidak diset');
    }

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
