/**
 * PLACEHOLDER — belum diisi.
 *
 * Sumber yang akan di-port di Fase 2 (dari repo lama AndiAydi/Guinevere-AI-
 * di commit 58d6a2af):
 *
 *   server/personality/constants.ts            (3.131 B)
 *   server/personality/systemPrompt.ts         (4.930 B)
 *   server/personality/enhancedSystemPrompt.ts  (9.095 B)
 *   server/personality/manager.ts              (5.070 B)
 *   server/personality/responseProcessor.ts    (5.217 B)
 *   server/personality/manager.test.ts         (7.121 B)
 *   server/personality/responseProcessor.test.ts (4.462 B)
 *
 * Plan port:
 * 1. Ambil file dari commit 58d6a2af.
 * 2. Pecah responsibilities: prompt → mode registry; manager/responseProcessor
 *    → Mastra Observational Memory + persona_state collection.
 * 3. Rewrite test ke Vitest (test lama memakai API server yang sudah hilang).
 *
 * PENTING: jangan tandai "selesai" hanya karena file sudah dicopy. Definition
 * of Done: kode ter-port + test lulus + README ter-update.
 */
export const LEGACY_PORT_STATUS = 'not_started' as const;
