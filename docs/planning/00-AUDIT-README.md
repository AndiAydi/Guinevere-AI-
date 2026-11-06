# Audit: Repo `AndiAydi/Guinevere-AI-`

Tanggal audit: 6 November 2026 · Sumber: GitHub API (repo publik `Guinevere-AI-`)

## 1. Keadaan saat ini

Repo `Guinevere-AI-` **hanya berisi satu file: `README.md`** (1.839 byte). Branch hanya `main`, HEAD = `dfe57c04`.

Isi README menyebut 4 mode (Companion, Roleplay, Deep Reasoning, Deep Research), stack Node.js + TypeScript, dan 7 item roadmap. Semua item roadmap masih kosong — **belum ada satu pun baris kode yang tersisa**.

## 2. Yang sebenarnya pernah ada (recovered dari git history)

Commit `0d247c21` (13 Sep 2026) berisi `README.md` + `todo.md`. Selanjutnya 20 commit berturut-turut menghapus seluruh isi repo. Sebelum dihapus, commit `58d6a2af` (26 Jun 2026) adalah snapshot **terakhir** kode utuh.

### Arsitektur lama (yang berhasil dibangun sebelumnya)

```
package.json  name: "guinevere-ai", type: module, MIT
├── server/                    # Express + tRPC v11
│   ├── _core/                 # llm.ts, trpc.ts, sdk.ts, oauth.ts, supabase.ts,
│   │                          #   map.ts, imageGeneration.ts, voiceTranscription.ts,
│   │                          #   notification.ts, dataApi.ts, cookies.ts, vite.ts
│   ├── personality/           # systemPrompt, enhancedSystemPrompt, manager,
│   │                          #   responseProcessor, constants  (+2 test)
│   ├── problemSolving/        # codeExecutor, problemAnalyzer, solutionGenerator,
│   │                          #   problemSolvingService  (+2 test)
│   ├── services/              # chatService, analyticsService, userPreferencesService,
│   │                          #   streamingService  ← FILE 0 BYTE, tidak pernah diisi
│   ├── routers/               # chat.ts, auth.ts, problemSolving.ts  (+1 test)
│   ├── middleware/            # rateLimiter.ts
│   ├── db.ts, db-helpers.ts, storage.ts (S3), insert-user.ts
├── client/                    # React 18 + Vite + Tailwind + Radix UI + TanStack Query
│   ├── app/{login,dashboard}, src/{components,contexts,hooks,lib,pages}
├── shared/                    # const.ts, types.ts, _core/
├── drizzle/                   # schema.ts + 0000_shocking_lord_hawal.sql
├── Guin_core/app_ultimate.py  # PROTOTYPE PYTHON: Streamlit + Google Gemini
├── vite.config.ts, vitest.config.ts, vercel.json, tsconfig.json
```

Dependency kunci: `@trpc/server` v11, `drizzle-orm`, `@supabase/supabase-js`, `@google/genai` v2.5, `@aws-sdk/client-s3`, `@radix-ui/*`, `@tanstack/react-query` v5, `zod`.

### Klaim `todo.md` lama vs kenyataan

`todo.md` (yang dihapus) menandai ~40 item sebagai `[x]` selesai, termasuk "All 71 tests passing" dan "Code execution sandbox for safe code testing". **Klaim ini tidak dapat diverifikasi** karena kodenya sudah dihapus dan tidak ada CI run yang terekam. Yang jelas terbukti ada: `server/problemSolving/codeExecutor.ts` (7.313 byte) + `codeExecutor.test.ts` (5.266 byte), dan `problemAnalyzer.ts` (9.279 byte).

Masalah struktural yang tersembunyi di sana:

| Temuan | Detail | Dampak |
|---|---|---|
| `streamingService.ts` = 0 byte | Commit "Add response streaming support" membuat file kosong | Fitur streaming pernah "selesai" padahal tidak ada implementasinya |
| 2 package manager | `package-lock.json` **dan** `pnpm-lock.yaml` Commitment | Drift dependency, build tidak reproducible |
| `drizzle copy/` | Folder duplikat hasil copy-paste | Beban repo, risiko migrasi keliru |
| Dua basis data bersamaan | Supabase (Postgres) via `drizzle.config.ts` + `db-helpers.ts`, plus `@aws-sdk/client-s3` untuk storage | Arsitektur storage sprawl |
| `Guin_core/app_ultimate.py` | Prototipe Python Streamlit berdiri sendiri | Dua product line terpisah |
| Mode tidak konsisten | README lama menyebut 4 mode; `enhancedSystemPrompt.ts` + `problemSolving/` + `chatService.ts` mengimplementasikan **3** mode (Casual / Hybrid / Critical) | README dan kode tidak sinkron |

### Kode lama yang layak diporting (bukan dibuang)

1. `server/personality/` — sistem prompt berlapis, mode detection, emotional layering, butterfly detection. 9.105 byte `enhancedSystemPrompt.ts` + 4.930 `systemPrompt.ts`. Ini inti **identitas Guinevere** dan justru tidak ada di repo baru mana pun.
2. `server/problemSolving/codeExecutor.ts` — sandbox eksekusi kode multi-bahasa. Langsung relevan untuk "AI yang handle tugas sendiri".
3. `drizzle/schema.ts` — schema relational untuk conversation history, user relationship, personality state. Cukup baik untuk di-port ke storage baru.
4. `server/middleware/rateLimiter.ts` — wajib, karena semua model yang dipakai berbatas kuota harian.
5. `server/_core/llm.ts` (7.262 byte) — lapisan provider; perlu dirombak ke multi-provider router.
6. `server/personality/manager.test.ts`, `responseProcessor.test.ts`, `codeExecutor.test.ts`, `problemAnalyzer.test.ts`, `routers/chat.test.ts` — 5 file test yang benar-benar ada (total ~22.600 byte).

## 3. Repo lain di akun Anda

| Repo | Status | Peran |
|---|---|---|
| `AndiAydi/Guinevere-AI-` | Publik, hanya README | Sumber audit ini;history ada |
| `AndiAydi/Guinevere-linux-ui` | **Private**, HTML + Tailwind, 8.408 byte `index.html` | Konsep desktop dark-glassmorphism. Sesuai keputusan Anda: **di-skip**, fokus Guinevere AI |
| `AndiAydi/Alyavere-AI` | Publik, Python + FastAPI/HTML, commit 1 Nov 2026 | Proyek KIR (Karya Ilmiah Remaja) SMA N 1 Mertoyudan: adaptive learning companion. Akan diintegrasikan sebagai mode **Learning** |
| `AndiAydi/AI-Classifier` | Publik, JavaScript | Terpisah |
| `AndiAydi/Guin-Journal` | **Private**, JavaScript, web journal | Proyek terpisah, tidak disentuh |
| `AndiAydi/Engineering-Journey` | Publik | Dokumentasi perjalanan belajar |

## 4. Kesimpulan audit

Yang **tidak boleh terulang**: menandai fitur selesai tanpa implementasi (pola `streamingService.ts`), memakai dua package manager, dan menyimpan dua basis data tanpa batas yang jelas.

Yang **wajib dipertahankan**: identitas persona Guinevere (`server/personality/`), kemampuan eksekusi kode (`codeExecutor`), dan rate limiter.

Yang **harus diperbaiki**: README dan kode harus sinkron — README harus ditulis dari kode, bukan sebaliknya. README lama sekarang jadi **kontrak mode**, bukan deskripsi.

---

# LampIRAN A — Langkah-Langkah Terverifikasi: Membangun Aplikasi dari Nol

Metodologi ini yang saya pakai saat membaca repo Anda, dan yang bisa Anda pakai ulang untuk project apa pun.

## A.1 Fase 0 — Kontrak sebelum kode (½ hari)

1. **Tulis README sebagai kontrak, bukan narasi.** Satu kalimat: "apa yang harus bisa dilakukan app ini?". Then list capability, bukan komponen teknis.
2. **Tulis 5–10 skenario pengguna dalam bentuk "Given/When/Then".** Ini yang jadi bahan test case Anda sendiri.
3. **Tetapkan batasan non-negosiable** (kosten, runtime, deploy target). Ini yang kills Options A/B/C paling cepat — dan di kasus Anda, jawaban "nol rupiah" langsung menutup opsi server paid.
4. **Baru pilih stack**, setelah 1–3 selesai.

## A.2 Fase 1 — Riset batasan (½ hari, wajib pakai sumber primer)

Jangan percaya angka free tier dari blog 2024. Yang terjadi di 2026: Google memangkas kuota Gemini 50–80% pada Des 2025, `gemini-2.5-flash` di-deprecate 1 Des 2026, Cloudflare Containers free tier = N/A, OpenRouter free tier turun ke 50 req/hari.

Checklist verifikasi per layanan:
- [ ] Buka **halaman pricing resmi**, cari baris "Free" / "Free tier" — bukan landing page
- [ ] Cari **batas region** — "tersedia di 120 negara" ≠ "gratis di 120 negara"
- [ ] Cari **syarat kartu kredit** — "no card required" sering hilang setelah dynamic billing
- [ ] Cari **tanggal efektif** — kuota sering berubah tengah tahun
- [ ] Cari **batas concurrency**, bukan hanya kuota harian
- [ ] Cross-check 2 sumber independen

## A.3 Fase 2 — Skeleton yang bisa jalan dalam 1 jam

1. `pnpm init` → `pnpm dlx create-<framework>` → `git init` → commit pertama ("chore: skeleton yang jalan")
2. Deploy **sebelum** menulis fitur.-deploy pipeline kosong =ORIZB yang paling murah
3. CI: typecheck + lint + test, triggered on push. Wajib, karena projects jangka panjang mati bukan karena fitur kurang, tapi karena regresi diam-diam
4. `README` + `LICENSE` + `.gitignore` + `.env.example` di commit pertama

## A.4 Fase 3 — Vertical slice, bukan horizontal layer

**Jangan** buat semua model dulu, lalu semua endpoint, lalu semua UI. Ambil **satu** capability dari ujung ke ujung:

> Input user → agent → model → tool → hasil → tampil di UI → persist ke DB

Horizontal layer = 3–4 minggu sebelum ada yang bisa dicoba. Vertical slice = 1–2 hari dan langsung proving.

## A.5 Fase 4 — Feature flag & progressive disclosure

Setiap fitur besar di balik flag. Kalau agent-nya rusak, kamu bisa disable tanpa rollback. Untuk agent: **turn off tool satu per satu** — itu save hours saat debugging.

## A.6 Fase 5 — Observability sebelum scale

Sebelum agent menjalankan 50 task, kamu butuh melihat: prompt apa yang dikirim, tool apa yang dipanggil, berapa token, kenapa dia looping. Tanpa trace, agent = black box yang mahal dan membingungkan.

## A.7 Fase 6 — Deploy & maintenance

1. **Preview deploy per branch** — review UI tanpa deploy produksi
2. **Health check + rollback satu klik**
3. **Budget alert di provider AI** —WAJIB. Satu bug loop = 500 request/menit
4. **Backup database terjadwal** + test restore
5. **Secret rotation terjadwal**
6. **Ringkasan mingguan otomatis**: task sukses/gagal, token terpakai, provider mana yang rate-limited

## A.8 Fase 7 — Retensi & atasIGH (anti-hype)

- **Kill criteria** per fitur: "kalau tidak dipakai 2 minggu, hapus"
- **Constraint tetap tertulis di README** — biaya nol, maks 1 Concurrent, maks N task/hari
- Tanggal kedaluwarsa gratis di kalender (mis. 30 hari sebelum kuota berubah)
