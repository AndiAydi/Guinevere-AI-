import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { Env } from '../../env.js';
import { getMode, listModes } from '../../modes/registry.js';
import { systemPromptFor } from '../../modes/prompts.js';
import { createRouter } from '../../providers/index.js';

/**
 * Agent per mode.
 *
 * Mastra menerima satu model per Agent, sedangkan kita memakai router
 * multi-provider. Solusinya: model "router" adalah wrapper yang memanggil
 * ProviderRouter.generate() — sehingga agent tetap satu objek per mode
 * tanpa kehilangan failover.
 */
function createRouterModel(env: Env, modeId: string) {
  const router = createRouter(env);
  const mode = getMode(modeId);

  return async (prompt: unknown) => {
    const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: String(prompt) }];
    const result = await router.generate({
      system: systemPromptFor(mode),
      messages: messages as never,
      preferred: mode.preferredProvider,
      temperature: mode.temperature,
      grounding: mode.grounding,
    });
    return result.text;
  };
}

export function createAgents(env: Env) {
  const agents: Record<string, Agent> = {};

  for (const mode of listModes()) {
    agents[mode.id] = new Agent({
      id: `guinevere-${mode.id}`,
      name: `Guinevere ${mode.label}`,
      instructions: systemPromptFor(mode),
      model: createRouterModel(env, mode.id) as never,
      memory: new Memory({
        // Working memory bersifat resource-scoped: ingat lintas percakapan.
        // Akan diisi dengan profil, preferensi, dan konteks pengguna.
      }),
    });
  }

  return agents;
}
