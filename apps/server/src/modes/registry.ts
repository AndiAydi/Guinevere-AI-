import { ModeIdSchema, type ModeDefinition } from '@guinevere/shared';

/**
 * Definisi mode. Ini single source of truth — README ditulis dari sini.
 * Di proyek lama, README menyebut 4 mode sementara kode mengimplementasikan
 * 3 yang berbeda (Casual / Hybrid / Critical). Jangan ulangi itu.
 *
 * Catatan: `personality/systemPrompt.ts` dan `enhancedSystemPrompt.ts` dari
 * proyek lama akan di-port ke packages/legacy-personality (Fase 2).
 */

const DEFINITIONS: ModeDefinition[] = [
  {
    id: 'companion',
    label: 'Companion',
    description:
      'Percakapan harian. Mengypertahankan, mendengarkan, merespon hangat tanpa berlebihan.',
    allowedTools: ['memory_read', 'memory_write', 'web_search'],
    maxIterations: 3,
    preferredProvider: 'groq',
    preferredModel: 'openai/gpt-oss-120b',
    temperature: 0.8,
    grounding: false,
  },
  {
    id: 'roleplay',
    label: 'Roleplay',
    description:
      'Roleplay dan storytelling. Mempertahankan konsistensi karakter lintas percakapan panjang.',
    allowedTools: ['memory_read', 'memory_write'],
    maxIterations: 5,
    preferredProvider: 'groq',
    preferredModel: 'openai/gpt-oss-120b',
    temperature: 0.9,
    grounding: false,
  },
  {
    id: 'reasoning',
    label: 'Reasoning',
    description:
      'Bantu coding, debugging, dan penyelesaian masalah teknis. Fokus pada solusi.',
    allowedTools: [
      'memory_read',
      'memory_write',
      'code_exec',
      'file_read',
      'file_write',
      'list_dir',
      'search_files',
      'web_search',
    ],
    maxIterations: 20,
    preferredProvider: 'groq',
    preferredModel: 'openai/gpt-oss-120b',
    temperature: 0.3,
    grounding: false,
  },
  {
    id: 'research',
    label: 'Research',
    description:
      'Analisis topik dan riset. Menyusun informasi terstruktur, memisahkan fakta dari opini.',
    allowedTools: [
      'memory_read',
      'memory_write',
      'web_search',
      'web_fetch',
      'file_write',
    ],
    maxIterations: 30,
    preferredProvider: 'gemini',
    preferredModel: 'gemini-2.5-flash',
    temperature: 0.4,
    grounding: true,
  },
  {
    id: 'learn',
    label: 'Learn',
    description:
      'Tutor belajar adaptif. Penilaian awal, penjelasan adaptif, latihan adaptif, evaluasi.',
    allowedTools: ['memory_read', 'memory_write', 'quiz_generate', 'progress_track'],
    maxIterations: 15,
    preferredProvider: 'gemini',
    preferredModel: 'gemini-2.5-flash',
    temperature: 0.5,
    grounding: false,
  },
];

const BY_ID = new Map(DEFINITIONS.map((d) => [d.id, d]));

export function getMode(id: string): ModeDefinition {
  const parsed = ModeIdSchema.safeParse(id);
  if (!parsed.success) {
    throw new Error(
      `Mode "${id}" tidak dikenal. Pilihan: ${ModeIdSchema.options.join(', ')}`,
    );
  }
  const mode = BY_ID.get(parsed.data);
  if (!mode) throw new Error(`Mode "${id}" tidak ditemukan`);
  return mode;
}

export function listModes(): ModeDefinition[] {
  return [...DEFINITIONS];
}

/**
 * Filter daftar tool berdasarkan mode. Ini yang mencegah agent
 * menjalankan tool yang tidak diizinkan pada mode saat ini.
 */
export function allowedToolsFor(modeId: string): string[] {
  return getMode(modeId).allowedTools;
}
