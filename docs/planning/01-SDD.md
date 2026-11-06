# Guinevere AI v2 — Software Design Document (SDD)

Status: Draft v1 · 6 November 2026 · Target: agent AI multi-mode, **biaya operasional Rp 0**

---

## 1. Ringkasan Eksekutif

**Guinevere AI** adalah agen AI pribadi multi-mode yang dijalankan entirely di atas free tier provider hosted, dengan biaya bulanan **Rp 0**. Fokus fase 1: **eksekusi tugas teknis otonom** (menjalankan kode, debugging, testing, membuat file & script), **produktivitas harian** (email, kalender, reminder, dokumen, pencarian web), dan **tutor belajar adaptif** (ekspansi Alyavere-AI KIR).

Perubahan fundamental vs. proyek lama: dari *chatbot berpersona* menjadi *agen yang mengerjakan tugas*. Percakapan tetap ada — itu medium-nya — tapi unit hasilnya adalah **tugas yang selesai**, bukan pesan yang dibalas.

## 2. Keputusan Arsitektur (Sudah Dikunci)

| # | Keputusan | Nilai | Alasan |
|---|---|---|---|
| D1 | Bahasa | **TypeScript** (strict) | Pilihan Anda; satu bahasa untuk server + web + tooling |
| D2 | Orkestrator | **Mastra** | Dipilih Anda. Apache-2.0 core, Node 22.13+, built-in agents/workflows/memory/observability, Studio lokal gratis |
| D3 | Repo | **Baru, bersih** | Monorepo pnpm: `apps/web` + `apps/server` + `packages/*` |
| D4 | Provider AI | **Multi-provider router**: Groq → Gemini → OpenRouter `:free` | Semua diintegrasikan;Groq punya kuota free terbesar |
| D5 | Sandbox | **Hosted gratis** (E2B Hobby / adapter) | Pilihan Anda. ⚠️ Cloudflare Containers free tier = **N/A** (lihat §4) |
| D6 | Database | **MongoDB Atlas M0** | Pilihan Anda (512 MB free, no card) — didukung adapter `@mastra/mongodb` |
| D7 | Frontend | **Web app**, React + Vite + Tailwind | Fokus Guinevere AI; `Guinevere-linux-ui` di-skip |
| D8 | Batasan biaya | **Rp 0/bulan** | Hard constraint. Semua free tier, tanpa kartu kredit, tanpa billing aktif |

### 2.1 Kenapa "Router" dan bukan satu provider

Quota free tier adalah **bottleneck utama**, bukan token. Router multi-provider mengubah satuIhraq 50 req/hari menjadi ~2.000 req/hari efektif (Groq 1.000/model + Gemini 1.500 + OpenRouter 50), dan otomatis failover saat provider kena 429.

Prioritas routing:

```
Groq (gpt-oss-120b)     →  primary. 30 RPM, 1.000 RPD, 200K tok/hari per model
  ↓ 429 / quota habis
Gemini (flash / flash-lite) →  secondary. Grounding w/ Google Search 500 RPD
  ↓ 429 / quota habis
OpenRouter (:free)      →  tertiary. 50 RPD, 20 RPM shared
  ↓ 429 / quota habis
Local fallback          → Jawaban template + antrean, JANGAN diam-diam gagal
```

> **Penting — Groq free tier**: batas Groq adalah **per organisasi**, bukan per API key. Membuat banyak key tidak menambah kuota. kuota 200.000 token/hari juga cepat habis untuk model 120B pada task panjang. Karena itu router wajib, bukan opsional.

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                      apps/web (React + Vite)                │
│   Chat · Task Board · Sandbox Terminal · Memory Viewer      │
│   Settings (mode, provider, budget) · Analytics             │
└────────────────────────────┬────────────────────────────────┘
                             │ SSE / streaming
┌────────────────────────────▼────────────────────────────────┐
│                    apps/server (Mastra + Hono)              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Orchestrator│  │  Tool Router │  │  Provider Router │  │
│  │  (Mastra)    │  │              │  │  Groq→Gem→OR     │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                   │            │
│  ┌──────▼─────────────────▼───────────────────▼─────────┐  │
│  │                 Mode Engine                        │  │
│  │  Companion │ Roleplay │ Reasoning │ Research │ Learn │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │  Mastra Storage (@mastra/mongodb → Atlas M0)        │  │
│  │  memory · threads · workflow state · observability  │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────┬──────────────┘
            │                                 │
   ┌────────▼─────────┐              ┌────────▼──────────┐
   │  Sandbox Adapter │              │  MCP Tool Clients │
   │  E2B / Daytona   │              │  Gmail·GCal·Drive │
   │  (Firecracker)   │              │  GitHub·Files·Web │
   └──────────────────┘              └───────────────────┘
```

### 3.1 Komponen inti

**A. Mode Engine** — Mode bukan sekadar system prompt. Tiap mode punya: `systemPrompt`, daftar tool yang diizinkan, batas iterasi, model preferensi, dan parameter decoding. Ini yang hilang di proyek lama: README menyebut 4 mode, kode mengimplementasikan 3 yang berbeda.

| Mode | Tool yang diizinkan | Model preferensi | Iterasi maks |
|---|---|---|---|
| Companion | memory_read, memory_write, web_search | Groq gpt-oss-120b | 3 |
| Roleplay | memory_read, memory_write | Groq gpt-oss-120b | 5 |
| Reasoning | + code_exec, file_read, file_write, web_search | Groq + reasoning model | 20 |
| Research | + web_fetch, browser | Gemini (grounding) | 30 |
| Learn | + quiz_gen, progress_track | Gemini flash | 15 |

**B. Provider Router** — Satu interface `LLMProvider`, implementasi `GroqProvider`, `GeminiProvider`, `OpenRouterProvider`. Semua lewat Vercel AI SDK (dipakai Mastra secara internal).-fitur kunci: parse `429`/`rate_limit_error` → failover otomatis + backoff eksponensial + header `x-ratelimit-remaining-*` untuk monitoring.

**C. Tool Registry** — Semua tool dideklarasikan sekali di `packages/tools`, dengan metadata: `mode allowed`, `requiresApproval`, `timeoutMs`, `sandbox: local|remote|none`. Approval gate = tool yang mengubah dunia (kirim email, hapus file, git push) harus minta konfirmasi.

**D. Sandbox Adapter** — Interface `Sandbox` dengan method `exec(code, lang, opts)`. Implementasi: `E2BSandbox`, `DaytonaSandbox`, `LocalDockerSandbox`. Default: E2B Hobby. Fallback chain ditentukan env var.

**E. Observational Memory** — Mastra Observational Memory: agent merangkum percakapan jadi working memory terstruktur, bukan menyimpan semua token. Ini yang membuat konteks panjang tetap murah di free tier (token = mata uang utama).

## 4. Catatan Penting tentang Batasan Rp 0

Empat temuan terverifikasi yang **berlawanan dengan ekspektasi umum**:

1. **Cloudflare Containers tidak punya free tier.** Official pricing: Free = `N/A` untuk vCPU/Memory/Disk. Butuh Workers Paid, minimum **$5/bulan**. Janganpriseduaapkan "Cloudflare Containers free tier" dalam docker-compose.
2. **Cloudflare Workers free = 10 ms CPU per request.** Tidak cukup untuk orkestrator agent. Workers hanya cocok untuk frontend statis (Pages) dan proxy tipis.
3. **OpenRouter free = 50 req/hari**, naik ke 1.000 hanya setelah top-up $10. Jadi top-up = bukan nol rupiah. OpenRouter harus jadi tier tertiary, bukan primer.
4. **MongoDB Atlas M0 punya 3 batasan yanguru**: 100 op/detik, **Atlas Vector Search tidak tersedia** di M0, dan cluster **auto-pause setelah 30 hari tanpa koneksi**. Untuk RAG, pakai embedding + query biasa, bukan Vector Search.

**Yang benar-benar gratis tanpa kartu kredit (terverifikasi):**

| Layanan | Batas Free | Catatan |
|---|---|---|
| Groq | 30 RPM, 1.000 RPD, 200K tok/hari per model | Tanpa kartu. Quota **per organisasi** |
| Google Gemini | s/d 1.500 RPD (flash-lite), Grounding 500 RPD | **Indonesia termasuk region didukung** ✓. Prompt/respons bisa dipakai Google untuk melatih model |
| MongoDB Atlas M0 | 512 MB, 100 op/s, 500 koneksi | Auto-pause 30 hari idle. 1 cluster/project |
| E2B Hobby | $100 credit **sekali**, 20 concurrent, 1 jam/sesi | Tanpa kartu. ~2 tahun pemakaian personal |
| Cloudflare Pages | UnLIMITED static assets | Untuk hosting frontend |
| Mastra Studio | Self-host gratis, 100K observability events | Core Apache-2.0; folder `ee/` butuh lisensi enterprise |
| Neon Postgres | Free tier | Cadangan jika M0 tidak cukup |

**Yang TIDAK gratis:** Cloudflare Containers, Workers AI >10K neuron/hari, OpenRouter >50 req/hari, E2B setelah $100 habis, Railway/Fly/Vercel Pro.

> **Peringatan quota:** Di Groq, `gpt-oss-120b` membayar ~200K token/hari. Satu task debugging panjang bisa menghabiskan kuota mingguan. Karena itu: (a) routing wajib, (b) compaction memory, (c) budget alert di semua provider.

## 5. Struktur Monorepo

```
guinevere/
├── package.json                 # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json                   # task orchestration (build/test/lint/typecheck)
├── tsconfig.base.json
├── .env.example                 # SEMUA key provider di sini, didokumentasikan
├── apps/
│   ├── server/
│   │   ├── src/
│   │   │   ├── mastra/
│   │   │   │   ├── index.ts          # Mastra instance + storage (MongoDBStore)
│   │   │   │   ├── agents/           # companion, roleplay, reasoning, research, learn
│   │   │   │   ├── workflows/        # autonomous-task, deep-research, adaptive-lesson
│   │   │   │   └── tools/            # registry + deklarasi tool
│   │   │   ├── providers/            # router.ts, groq.ts, gemini.ts, openrouter.ts
│   │   │   ├── sandbox/              # adapter.ts, e2b.ts, daytona.ts, local.ts
│   │   │   ├── modes/                # mode definitions + registry
│   │   │   ├── memory/               # persona state, relationship, working memory
│   │   │   ├── http/                 # Hono routes: /chat, /tasks, /sandbox, /memory
│   │   │   └── telemetry/             # budget tracking, rate-limit monitor
│   │   └── tests/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/                   # routing, layout, providers
│   │   │   ├── features/              # chat, tasks, sandbox, memory, settings
│   │   │   ├── components/            # ui primitives (shadcn-style)
│   │   │   └── lib/                   # api client, sse hook, store
│   │   └── public/
│   └── (ops) docker-compose.yml, Dockerfile
└── packages/
    ├── shared/       # types, zod schemas, constants, event contracts
    ├── ui/           # komponen React yang di-share
    ├── config/       # eslint, tsconfig, prettier
    └── legacy-personality/   # ← PORT dari server/personality/ (lama)
```

### 5.1 Modul legacy yang di-port

| Sumber lama | Tujuan baru | Catatan |
|---|---|---|
| `server/personality/*` | `packages/legacy-personality` | Di-refactor ke Mastra memory. Ini identitas Guinevere |
| `server/problemSolving/codeExecutor.ts` | `packages/shared/sandbox-core` | Logika eksekusi; transport diganti ke adapter |
| `drizzle/schema.ts` | Ganti ke schema MongoDB (Mongoose) | Conversation history, relationship, personality state |
| `server/middleware/rateLimiter.ts` | `apps/server/src/middleware` | Wajib: semua provider punya kuota harian |
| `server/personality/*.test.ts` (2) + `codeExecutor.test.ts` + `problemAnalyzer.test.ts` | Test di-rewrite ke Vitest | ~22.600 byte test yang benar-benar ada |
| `Guin_core/app_ultimate.py` | Referensi design saja | Prototipe Streamlit; jangan di-port, tapi *inspired* |

## 6. Model Data (MongoDB)

Database: `guinevere`, cluster Atlas M0.

| Collection | Dokumen inti | Index |
|---|---|---|
| `threads` | `{_id, title, mode, resourceId, createdAt, updatedAt}` | `resourceId`, `updatedAt` |
| `messages` | `{_id, threadId, role, content, provider, model, tokens, toolCalls[], createdAt}` | `threadId`, `createdAt` |
| `persona_state` | `{_id: resourceId, emotionalLayer, butterflyFlags, relationshipLevel, preferences}` | `resourceId` unique |
| `tasks` | `{_id, title, status, plan[], steps[], sandboxId, artifacts[], createdAt}` | `status`, `createdAt` |
| `tool_audit` | `{_id, tool, args, approved, result, durationMs, createdAt}` | `createdAt` (TTL 30 hari) |
| `budget_usage` | `{_id: date, provider, requests, tokens, cost}` | `date` |

> Catatan M0: **tanpa Atlas Vector Search**. Semantic recall harus via embedding stored di collection biasa + query `$text` atau manual cosine similarity. Batas 512 MB →TTL otomatis untuk `tool_audit`, dan kompresi riwayat chat lama ke working memory.

## 7. Alur Task Otonom (fitur inti)

```
User: "Buat script Python yangMembersihkan CSV, lalu jalankan di data contoh"
  │
  ├─→ Planner (LLM): pecah jadi langkah
  │     1. baca schema CSV    2. tulis script   3. jalankan   4. verifikasi output
  │
  ├─→ Approval gate: "Menjalankan script di sandbox" → user confirm
  │
  ├─→ Executor (Mastra workflow, suspend/resume)
  │     for each step:
  │       tool call → sandbox adapter → E2B (remote) → stdout/stderr
  │       if error → backtrack: kirim error ke LLM → revisi langkah
  │
  ├─→ Verifier: cek output memenuhi requirement; kalau tidak, ulangi (maks 3x)
  │
  └─→ Report: ringkasan, artefak, log eksekusi, link file
```

Batas keras: maks 20 iterasi, maks 5 menit per task, maks 3 backtrack. Gagal → report jujur, bukan loop.

## 8. Strategi Deployment (Rp 0)

| Komponen | Hosting | Alasan |
|---|---|---|
| `apps/web` | **Cloudflare Pages** | Static assets unlimited, 100k request/hari Workers |
| `apps/server` | **Lokal** (laptop) atau **Fly.io free** / Railway trial | Worker tidak cocok (10ms CPU). Butuh proses Node panjang |
| Sandbox | **E2B Hobby** | $100 credit sekali, tanpa kartu |
| Database | **MongoDB Atlas M0** | 512 MB, no card |
| Model | Groq + Gemini + OpenRouter free | D4 |
| Observability | **Mastra Studio self-host** | Core gratis, tanpa cloud |

> Alternatif nolBiaya penuh: jalankan `apps/server` di laptop (Linux Mint) + tunnel via Cloudflare Tunnel (gratis). Trade-off: hanya nyala saat laptop nyala.

## 9. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kuota free habis mendadak | Agent mati saat dipakai | Multi-provider router + queue + pesan jelas "menunggu kuota" |
| Prompt terkirim ke provider free | Data privat_used untuk training | Konten sensitif → mode lokal/rule-based; jangan kirim kredensial |
| M0 auto-pause 30 hari | Data "hilang" | Auto-reconnect + backup `mongodump` terjadwal ke lokal |
| Loop agent = biaya & waktu | 429 cascade, kuota habis | Batas iterasi, budget alert per provider, circuit breaker |
| 512 MB M0 penuh | Write gagal | TTL `tool_audit`, kompresi chat → working memory, archive ke file |
| E2B credit habis | Sandbox mati | Adapter fallback (Daytona/local Docker) |
| Stacking 2 package manager lagi | Build rusak | Hanya pnpm, `packageManager` field, CI guard |
| Klaim "selesai" tanpa implementasi | Ulangan pola lama | Definition of Done: kode + test + verifikasi manual + update README |
