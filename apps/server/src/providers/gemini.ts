import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, type ToolSet } from 'ai';
import type { ProviderId } from '@guinevere/shared';
import type { GenerateOptions, GenerateResult, Provider } from './types.js';
import { QuotaExhaustedError } from './types.js';
import { toProviderError } from './errors.js';

/**
 * Provider SECONDARY + satu-satunya yang mendukung Google Search grounding
 * gratis (500 RPD, shared dengan Flash-Lite).
 * Indonesia termasuk region yang didukung
 * (ai.google.dev/gemini-api/docs/available-regions).
 *
 * PERINGATAN: pada free tier, prompt & respons dapat dipakai Google untuk
 * melatih model. Jangan kirim data sensitif lewat provider ini.
 */
export class GeminiProvider implements Provider {
  readonly id: ProviderId = 'gemini';
  readonly available: boolean;
  readonly model: string;

  readonly fallbackModel: string;
  private readonly client;

  constructor(
    apiKey: string | undefined,
    defaultModel: string,
    fallbackModel: string,
  ) {
    this.available = Boolean(apiKey);
    this.model = defaultModel;
    this.fallbackModel = fallbackModel;
    if (apiKey) this.client = createGoogleGenerativeAI({ apiKey });
  }

  async generate(opts: GenerateOptions): Promise<GenerateResult> {
    if (!this.client) {
      throw new QuotaExhaustedError(this.id, 'Gemini: API key tidak diset');
    }

    const model = opts.model ?? this.model;

    // Grounding memakai tool bawaan provider: google.tools.googleSearch({}).
    // Nama toolnya WAJIB "google_search" (dicek provider).
    const tools: ToolSet | undefined = opts.grounding
      ? { googleSearch: this.client.tools.googleSearch({}) }
      : undefined;

    try {
      const result = await generateText({
        model: this.client(model),
        system: opts.system,
        messages: opts.messages as never,
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens,
        tools,
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
