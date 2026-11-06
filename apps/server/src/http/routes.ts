import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getMode, listModes } from '../modes/registry.js';
import { createRouter } from '../providers/index.js';
import type { Env } from '../env.js';

export function createApp(env: Env) {
  const app = new Hono();
  const router = createRouter(env);

  app.use('*', cors({ origin: ['http://localhost:5173'], credentials: true }));

  app.get('/health', (c) =>
    c.json({
      ok: true,
      providers: router.availableProviders().map((p) => ({
        id: p.id,
        model: p.model,
      })),
      timestamp: new Date().toISOString(),
    }),
  );

  app.get('/modes', (c) => c.json({ modes: listModes() }));

  app.post('/chat', async (c) => {
    const body = await c.req.json().catch(() => null);
    const modeId = typeof body?.mode === 'string' ? body.mode : 'companion';
    const message = typeof body?.message === 'string' ? body.message : '';

    if (!message.trim()) {
      return c.json({ error: 'Field "message" wajib diisi.' }, 400);
    }

    let mode;
    try {
      mode = getMode(modeId);
    } catch (err) {
      return c.json({ error: (err as Error).message }, 400);
    }

    try {
      const result = await router.generate({
        system: undefined,
        messages: [{ role: 'user', content: message }],
        preferred: mode.preferredProvider,
        temperature: mode.temperature,
        grounding: mode.grounding,
      });

      return c.json({
        text: result.text,
        provider: result.provider,
        model: result.model,
        mode: mode.id,
        tokensIn: result.tokensIn,
        tokensOut: result.tokensOut,
        attempts: result.attempts,
      });
    } catch (err) {
      return c.json({ error: (err as Error).message }, 502);
    }
  });

  return app;
}
