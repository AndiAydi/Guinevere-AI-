import { serve } from '@hono/node-server';
import { loadEnv } from './env.js';
import { createApp } from './http/routes.js';
import { createRouter } from './providers/index.js';

const env = loadEnv();
const app = createApp(env);
const router = createRouter(env);

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  const providers = router.availableProviders();
  console.log(
    `[guinevere] server siap di http://localhost:${info.port} (${env.NODE_ENV})`,
  );
  console.log(
    `[guinevere] provider AI tersedia: ${
      providers.length > 0
        ? providers.map((p) => `${p.id} (${p.model})`).join(', ')
        : 'TIDAK ADA'
    }`,
  );
  if (providers.length === 0) {
    console.warn(
      '[guinevere] PERINGATAN: tidak ada API key provider yang diset. ' +
        'Salin .env.example ke .env dan isi minimal satu.',
    );
  }
});

export { app };
