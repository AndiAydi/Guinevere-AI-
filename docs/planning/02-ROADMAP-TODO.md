# Guinevere AI v2 — Roadmap & TODO Fitur Utama

> **Aturan main:** satu branch per fase, satu PR per milestone. Tidak ada item yang ditandai `[x]` tanpa: (1) kode ada, (2) test ada dan lulus, (3) sudah diverifikasi manual, (4) README diperbarui. Ini-amin rule yang caused "71 tests passing" di proyek lama padahal `streamingService.ts` 0 byte.

---

## Fase 0 — Fondasi (target: 1 minggu)

Goal: repo baru hidup, CI hijau, satu Capability end-to-end dari user sampai agent.

- [ ] **F0.1** Buat repo GitHub baru `guinevere-ai` (monorepo, bukanorganization), visibility publik
- [ ] **F0.2** `pnpm init` + `pnpm-workspace.yaml` + `turbo.json` + `tsconfig.base.json` (strict)
- [ ] **F0.3** `packages/shared`: zod schemas, tipe Task/Message/Tool, konstanta mode
- [ ] **F0.4** `apps/server`: `Mastra` instance + `MongoDBStore` (Atlas M0) + `LibSQLStore` fallback lokal
- [ ] **F0.5** `packages/config`: eslint, prettier, vitest config — **satu package manager saja (pnpm)**
- [ ] **F0.6** `.env.example` berisi semua key: `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `MONGODB_URI`, `E2B_API_KEY`
- [ ] **F0.7** CI GitHub Actions: typecheck → lint → test → build
- [ ] **F0.8** `apps/web`: Vite + React + Tailwind skeleton, halaman kosong yang bisa di-deploy
- [ ] **F0.9** Deploy `apps/web` ke Cloudflare Pages (pipeline kosong =ORIZB termurah)
- [ ] **F0.10** `README.md` ditulis ulang sebagai kontrak (bukan narasi) + `LICENSE` (MIT) + `CONTRIBUTING.md`

**Exit criteria F0:** `pnpm i && pnpm dev` jalan di laptop; CI hijau; web ter-deploy; satu pesan "halo" sampai ke model Groq.

---

## Fase 1 — Provider Router (target: 4 hari)

Ini fondasi semua fitur lain. Tanpa router, sisa aplikasi satu provider = satu titik gagal.

- [ ] **F1.1** `providers/groq.ts` — via Vercel AI SDK, model `openai/gpt-oss-120b`
- [ ] **F1.2** `providers/gemini.ts` — `gemini-2.5-flash` + `gemini-2.5-flash-lite`, dengan Google Search grounding
- [ ] **F1.3** `providers/openrouter.ts` — model `:free`, `provider.data_collection: "deny"`
- [ ] **F1.4** `providers/router.ts` — failover chain, exponential backoff, circuit breaker (5 gagal → skip 10 menit)
- [ ] **F1.5** Parse header rate-limit → simpan ke collection `budget_usage`
- [ ] **F1.6** **Budget alert**: threshold 70% & 90% kuota harian → notifikasi + auto-turunkan model ke tier lebih ringan
- [ ] **F1.7** Test: simulasi 429 di provider A → lalu failover ke B (unit test, tanpa API key sungguhan)
- [ ] **F1.8** Dashboard kecil di web: kuota terpakai per provider hari ini

**Exit criteria F1:** Matikan API key Groq → sistem tetap jalan via Gemini. Matikan Gemini → OpenRouter. Semua tercatat di log.

---

## Fase 2 — Mode Engine + Memory (target: 1 minggu)

- [ ] **F2.1** `modes/registry.ts` — definisi deklaratif tiap mode (systemPrompt, tools, maxIter, model)
- [ ] **F2.2** Mode **Companion** — percakapan harian, hangat, singkat
- [ ] **F2.3** Mode **Roleplay** — konsistensi karakter lintas percakapan panjang
- [ ] **F2.4** Mode **Reasoning** — fokus solusi, tanpa obrolan basa-basi
- [ ] **F2.5** Mode **Research** — pisahkan fakta dari opini, sertakan sumber
- [ ] **F2.6** **Port `server/personality/`** → `packages/legacy-personality`, refactor ke Mastra `Memory`
- [ ] **F2.7** Observational Memory — working memory terstruktur (profil, preferensi, konteks)
- [ ] **F2.8** `persona_state` — emotional layer, relationship level, butterfly detection (dari kode lama)
- [ ] **F2.9** Semantic recall via embedding + cosine similarity (bukan Atlas Vector Search — tidak ada di M0)
- [ ] **F2.10** Multi-thread: banyak percakapan per user

**Exit criteria F2:** Beralih mode di tengah percakapan → kepribadian & gaya berubah sesuai mode; memory lintas percakapan tersimpan dan terpakai.

---

## Fase 3 — Tool Registry + Approval Gate (target: 5 hari)

- [ ] **F3.1** `tools/registry.ts` — deklarasi tool: `modes[]`, `requiresApproval`, `timeoutMs`, `sandbox`
- [ ] **F3.2** Tool dasar: `read_file`, `write_file`, `list_dir`, `search_files`
- [ ] **F3.3** Tool web: `web_search` (Gemini grounding), `web_fetch` (fetch + ekstraksi)
- [ ] **F3.4** Tool `exec_code` (multi-bahasa: Python, JS/TS, SQL, shell)
- [ ] **F3.5** Tool shell: `run_command` dengan allowlist + timeout
- [ ] **F3.6** **Approval gate** — tool destruktif (hapus file, kirim email, git push) wajib konfirmasi user
- [ ] **F3.7** `tool_audit` collection + TTL 30 hari
- [ ] **F3.8** Panel UI: tampilkan tool call real-time + hasil

**Exit criteria F3:** "Buat file X dengan isi Y" → file muncul di workspace, tercatat di audit, dan request destruktif tertahan approval.

---

## Fase 4 — Sandbox Terisolasi (target: 1 minggu)

- [ ] **F4.1** `sandbox/adapter.ts` — interface `Sandbox { exec(), upload(), download(), destroy() }`
- [ ] **F4.2** `sandbox/e2b.ts` — E2B Hobby, Firecracker microVM, session 1 jam
- [ ] **F4.3** `sandbox/daytona.ts` — fallback, $200 credit
- [ ] **F4.4** `sandbox/local.ts` — Docker di laptop, untuk dev & fallback terakhir
- [ ] **F4.5** Fallback chain berdasar env var `SANDBOX_PROVIDER=auto|e2b|daytona|local`
- [ ] **F4.6** Streaming stdout/stderr ke UI via SSE
- [ ] **F4.7** Timeout & kill otomatis (maks 5 menit per eksekusi)
- [ ] **F4.8** Ambil kode lama `codeExecutor.ts` → evaluasi: port logika, ganti transport

**Exit criteria F4:** Kode Python dangerous (`import os; os.system("rm -rf /")`) → ditolak atau terisolasi, tidak menyentuh host.

---

## Fase 5 — Task Otonom (LAYER INTI, target: 2 minggu)

- [ ] **F5.1** `workflows/autonomous-task.ts` — plan → execute → verify → report, dengan `suspend()/resume()`
- [ ] **F5.2** Planner: LLM memecah request jadi langkah Berners-Lee
- [ ] **F5.3** Executor: jalankan tiap langkah di sandbox, kirim error balik ke LLM untuk revisi
- [ ] **F5.4** Verifier: cek output vs requirement; ulangi maks 3x
- [ ] **F5.5** Batas keras: 20 iterasi, 5 menit, 3 backtrack
- [ ] **F5.6** UI Task Board: kartu task dengan status, langkah, artefak, log
- [ ] **F5.7** Human-in-the-loop: pause workflow di titik yang butuh keputusan user
- [ ] **F5.8** Notifikasi saat task selesai (bisa via Telegram bot — roadmap jangka panjang)

**Exit criteria F5:** Satu perintah natural language → task multi-langkah tereksekusi sampai selesai dengan hasil terverifikasi.

---

## Fase 6 — Produktivitas Harian (target: 1 minggu)

- [ ] **F6.1** MCP client framework + registry
- [ ] **F6.2** Integrasi **Gmail** — baca, cari, draf (kirim wajib approval)
- [ ] **F6.3** Integrasi **Google Calendar** — baca jadwal, buat event
- [ ] **F6.4** Integrasi **Google Drive / Docs** — cari & baca dokumen
- [ ] **F6.5** **Reminder** — scheduled task via Mastra schedules / cron
- [ ] **F6.6** Kontrol "jangan kirim jam 00:00–06:00" (jam lokal Asia/Jakarta)

**Exit criteria F6:** "Ingatkan saya besok jam 8 untuk kirim laporan" → reminder aktif dan survives restart.

---

## Fase 7 — Mode Learn (ekspansi Alyavere KIR, target: 2 minggu)

- [ ] **F7.1** Port konsep dari `Alyavere-AI` (Python) → mode Learn
- [ ] **F7.2** Initial assessment — ukur pemahaman awal
- [ ] **F7.3** Adaptive explanation — jelaskan dengan cara berbeda sesuai level
- [ ] **F7.4** Adaptive practice — soal adjusts by performance
- [ ] **F7.5** Learning evaluation — review progress +-topic yang perlu diulang
- [ ] **F7.6** Progress chart di web (reuso ide dari `Guin-Journal`)
- [ ] **F7.7** Pisahkan repo `Alyavere-AI` tetap sebagai repositori riset KIR;porting di Guinevere = implementasi lanjutan

**Exit criteria F7:** Student curriculum topik X → assessment → explanation → latihan adaptif → evaluasi; progress tercatat.

---

## Fase 8 — UI/UX Polish (target: 1 minggu)

- [ ] **F8.1** Design system: token warna, tipografi, spacing, dark/light
- [ ] **F8.2** Chat streaming dengan render markdown + syntax highlight kode
- [ ] **F8.3** Sandbox terminal view (monospace, output warna)
- [ ] **F8.4** Responsive: mobile, tablet, desktop
- [ ] **F8.5** Pusta keyboard: `⌘K` command palette, `⌘B` toggle sidebar
- [ ] **F8.6** Empty states & error states yang informatif
- [ ] **F8.7** Aksesibilitas: kontras, focus ring, screen reader label

---

## Fase 9 — Deploy & Maintenance (target: 4 hari)

- [ ] **F9.1** Deploy `apps/server` (lokal + tunnel, atau Fly/Railway free)
- [ ] **F9.2** Preview deploy per branch
- [ ] **F9.3** Health check endpoint + auto-restart
- [ ] **F9.4** **Budget alert** di 3 provider + auto-turf ke model ringan
- [ ] **F9.5** Backup `mongodump` terjadwal ke lokal + **tes restore**
- [ ] **F9.6** Secret management: `.env` lokal, `.env.example` di repo, rotasi
- [ ] **F9.7** Ringkasan mingguan otomatis: task sukses/gagal, token, provider kena rate-limit
- [ ] **F9.8** Runbook: apa yang dilakukan kalau provider mati / M0 penuh / E2B habis
- [ ] **F9.9** Auto-backup & export memory ke JSON/Markdown

---

## Fase 10 — Jangka Panjang (opsional)

- [ ] **F10.1** Integrasi **Telegram/Discord** sebagai interface
- [ ] **F10.2** **Voice** input/output (Whisper via Groq free tier — 20 RPM, 2K RPD)
- [ ] **F10.3** Export percakapan → PDF/JSON
- [ ] **F10.4** Multi-user & auth
- [ ] **F10.5** Tauri wrapper untuk desktop
- [ ] **F10.6** Marketplace skill / MCP registry sendiri

---

## Backlog Prioritas (dari temuan audit)

| Item | Sumber | Prioritas |
|---|---|---|
| Streaming response yang benar-benar ada | `streamingService.ts` 0 byte | P0 (Fase 1) |
| Rate limiter terpasang di SEMUA endpoint | kode lama | P0 (Fase 1) |
| README sinkron dengan kode | README lama ≠ kode lama | P0 (Fase 0) |
| Feature flag per fitur | tidak ada | P1 (Fase 1) |
| Test yang benar-benar dieksekusi di CI | klaim "71 tests" tak terverifikasi | P0 (Fase 0) |
| Single source of truth untuk mode | 4 mode di README, 3 di kode | P0 (Fase 2) |
| Observability trace per task | tidak ada | P1 (Fase 5) |
| Kill criteria per fitur | tidak ada | P2 (Fase 9) |
