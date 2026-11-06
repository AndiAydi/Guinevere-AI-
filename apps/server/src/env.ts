import { z } from 'zod';

/**
 * Konfigurasi environment. Semua provider AI opsional — yang tersedia
 * akan dipakai, yang tidak akan dilewati. Ini yang membuat biaya tetap Rp 0:
 * tidak ada konfigurasi yang memaksa tagihan.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4111),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default('openai/gpt-oss-120b'),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-2.5-flash-lite'),

  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-oss-120b:free'),

  MONGODB_URI: z.string().optional(),
  MONGODB_DB_NAME: z.string().default('guinevere'),

  E2B_API_KEY: z.string().optional(),
  E2B_TEMPLATE: z.string().default('base'),
  DAYTONA_API_KEY: z.string().optional(),
  SANDBOX_PROVIDER: z.enum(['auto', 'e2b', 'daytona', 'local']).default('auto'),
  SANDBOX_TIMEOUT_MS: z.coerce.number().int().positive().default(300_000),

  RATE_LIMIT_REQUESTS_PER_HOUR: z.coerce.number().int().min(0).default(0),
  TOOL_AUDIT_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Konfigurasi environment tidak valid:\n${issues}`);
  }
  return parsed.data;
}
