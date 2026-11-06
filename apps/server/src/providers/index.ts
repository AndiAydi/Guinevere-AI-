import type { Env } from '../env.js';
import { GeminiProvider } from './gemini.js';
import { GroqProvider } from './groq.js';
import { OpenRouterProvider } from './openrouter.js';
import { ProviderRouter } from './router.js';

export function createRouter(env: Env): ProviderRouter {
  const providers = [
    new GroqProvider(env.GROQ_API_KEY, env.GROQ_MODEL),
    new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL),
    new OpenRouterProvider(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL),
  ];

  return new ProviderRouter({
    providers,
    onFailure: (provider, error) => {
      console.warn(`[provider] ${provider} gagal: ${error.message}`);
    },
  });
}

export * from './types.js';
export { ProviderRouter } from './router.js';
