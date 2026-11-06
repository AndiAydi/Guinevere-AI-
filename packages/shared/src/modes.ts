import { z } from 'zod';

/**
 * Lima mode Guinevere. Mode mendefinisikan perilakunya, bukan hanya
 * system prompt — tiap mode punya tool whitelist, batas iterasi, dan
 * preferensi model. Single source of truth: README harus menulis dari
 * file ini, bukan sebaliknya.
 */
export const MODE_IDS = [
  'companion',
  'roleplay',
  'reasoning',
  'research',
  'learn',
] as const;

export const ModeIdSchema = z.enum(MODE_IDS);
export type ModeId = z.infer<typeof ModeIdSchema>;

export const ModeDefinitionSchema = z.object({
  id: ModeIdSchema,
  label: z.string(),
  description: z.string(),
  /** Tool yang boleh dipanggil pada mode ini. */
  allowedTools: z.array(z.string()),
  /** Jumlah iterasi agent maksimum untuk satu request. */
  maxIterations: z.number().int().positive(),
  /** Model preferensi; router boleh deviate ke fallback. */
  preferredProvider: z.enum(['groq', 'gemini', 'openrouter']),
  preferredModel: z.string(),
  /** Temperature decoding. */
  temperature: z.number().min(0).max(2),
  /** Aktifkan Google Search grounding (hanya provider yang mendukung). */
  grounding: z.boolean().default(false),
});
export type ModeDefinition = z.infer<typeof ModeDefinitionSchema>;
