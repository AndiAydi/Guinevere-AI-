# Langkah Eksekusi Immediate — Setelah Dokumen Ini Disetujui

Nomor urut ini persis urutan pengerjaan. Jangan lompat.

## Langkah 1 — Approve dokumen (Anda)
Baca: `00-AUDIT-README.md` → `01-SDD.md` → `02-ROADMAP-TODO.md` → `03-UI-DESIGN-GUIDE.md`.
Blokir keputusan yang masih terbuka di §11 SDD.

## Langkah 2 — Saya: buat repo + scaffold (30 menit)
```
mcode-tools connector call connector__github__create_repository \
  --args '{"name":"guinevere-ai","description":"Autonomous AI agent companion — multi-mode, multi-provider, zero-cost.","private":false}'
```
Lalu: monorepo pnpm + turbo + tsconfig + `packages/shared` + `apps/server` (Mastra + MongoDBStore) + `apps/web` (Vite skeleton) + CI + `.env.example` + README kontrak.

## Langkah 3 — Anda: daftar 4 API key (10 menit)
| Provider | Link | Yang dipakai |
|---|---|---|
| Groq | https://console.groq.com/keys | `openai/gpt-oss-120b` |
| Google AI Studio | https://aistudio.google.com/apikey | `gemini-2.5-flash`, `gemini-2.5-flash-lite` |
| OpenRouter | https://openrouter.ai/keys | model `:free` |
| MongoDB Atlas | https://www.mongodb.com/atlas/register | cluster M0 (Singapore/Jakarta) |
| E2B | https://e2b.dev/dashboard | Hobby, tanpa kartu kredit |

**Jangan pernah commit key.** Semuanya masuk `.env` lokal yang gitignore-ed. Hanya nama variabel yang masuk `.env.example`.

## Langkah 4 — Saya: Provider Router + CI hijau
Fase 1. Test failover pakai mock 429, tanpa API key sungguhan.

## Langkah 5 — Anda: setup Figma, parallel dengan langkah 4
Buat design tokens dulu (§3 panduan UI), lalu 3 layar kunci. Kalau Anda mau, saya bisa generate file Tailwind token langsung dari token di §3 — tinggal bilang.

## Langkah 6 — Anda: confirmasi provider
Kickoff provider: Groq, Gemini, OpenRouter — semua diintegrasikan sesuai keputusan Anda.

---

## TAMBAHAN 6 Nov 2026 — Status Push ke Repo Asli

Semua file monorepo sudah di-push ke **`AndiAydi/Guinevere-AI-`** (branch `main`),
bukan ke repo terpisah.

### Satu file belum bisa masuk: `.github/workflows/ci.yml`

GitHub memblokir pembuatan file workflow lewat GitHub API (App token tidak punya
scope `workflows`). Solusi — buat manual sekali lewat GitHub UI:

1. Buka https://github.com/AndiAydi/Guinevere-AI-/new/main
2. Path: `.github/workflows/ci.yml`
3. Salin isi dari `guinevere/.github/workflows/ci.yml` (lokal, sudah siap)
4. Commit

Alternatif: `git clone` repo lalu `git checkout` file dari paket zip ini.

### Repo `guinevere-ai` (kosong) perlu dihapus manual

App GitHub yang terhubung tidak punya tool delete-repository.
Hapus lewat: https://github.com/AndiAydi/guinevere-ai/settings → Danger Zone → Delete.

### Repo baru yang dibuat

`https://github.com/AndiAydi/guinevere-ai` — hanya berisi satu file TEST.md,
sudah saya hapus file-nya. Repo ini sisa salah paham awal dan tidak dipakai.
