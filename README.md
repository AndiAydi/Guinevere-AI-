# Guinevere AI

> **Asisten pribadi AI multi-mode yang menjalankan tugas, bukan hanya menjawab.**

Guinevere adalah agen AI yang dirancang untuk bekerja mandiri: menerima instruksi
dalam bahasa natural, menyusun rencana, menjalankan perkakas (menjalankan kode,
membaca/menulis file, mencari di web), memverifikasi hasilnya, lalu melapor
dengan jujur — termasuk kalau gagal.

⚠️ **Status: Pra-rilis (v0.1).** Belum ada versi stabil. Struktur dan fitur
bisa berubah. Lihat [Roadmap](./docs/ROADMAP.md).

---

## Kontrak

README ini adalah **kontrak**, bukan narasi. Semua angka dan status di bawah
harus selalu cocok dengan kode — kalau tidak, itu bug.

### Guinevere harus bisa

| # | Kemampuan | Mode | Status |
|---|---|---|---|
| 1 | Percakapan harian yang hangat dan konsisten | Companion | 🚧 |
| 2 | Roleplay dengan karakter yang konsisten | Roleplay | 🚧 |
| 3 | Membantu coding, debugging, dan debugging teknis | Reasoning | 🚧 |
| 4 | Riset terstruktur dengan pemisahan fakta & opini | Research | 🚧 |
| 5 | Tutor belajar adaptif (ekspansi Alyavere-AI KIR) | Learn | 🚧 |
| 6 | Menjalankan kode dan perintah shell di sandbox terisolasi | Reasoning | ⏳ |
| 7 | Menyelesaikan tugas multi-langkah secara otonom | Reasoning | ⏳ |
| 8 | Mengingat konteks pengguna lintas percakapan | Semua | ⏳ |

### Batasan yang tidak bisa dilanggar

| Batasan | Nilai | Alasan |
|---|---|---|
| **Biaya operasional** | **Rp 0 / bulan** | Semua provider free tier, tanpa kartu kredit, tanpa billing aktif |
| **Bahasa** | TypeScript (strict) | Satu bahasa untuk server, web, dan tooling |
| **Package manager** | pnpm saja | Proyek lama memakai dua sekaligus dan build-nya rusak |
| **Data privat** | Tidak pernah kirim kredensial/rahasia ke provider free | Prompt pada free tier bisa dipakai untuk training |
| **Eksekusi kode** | Selalu di sandbox terisolasi, maks 5 menit | Isolasi adalah batas keamanan, bukan preferensi |
| **Aksi destruktif** | Selalu minta persetujuan eksplisit | Menghapus file, kirim email, git push → butuh konfirmasi |

---

## Mode

| Mode | Fungsi | Tool yang boleh dipanggil | Iterasi maks | Model preferensi |
|---|---|---|---|---|
| **Companion** | Teman ngobrol harian | memory, web_search | 3 | Groq |
| **Roleplay** | Cerita & skenario | memory | 5 | Groq |
| **Reasoning** | Coding & debugging | + code_exec, file, search | 20 | Groq |
| **Research** | Analisis & riset | + web_fetch | 30 | Gemini (grounding) |
| **Learn** | Tutor adaptif | + quiz, progress | 15 | Gemini |

Sumber kebenaran: `packages/shared/src/modes.ts` dan
`apps/server/src/modes/registry.ts`. Kalau tabel ini berbeda dengan kode,
**kode yang benar dan tabel yang diperbaiki**.

---

## Arsitektur

```
┌────────────────────────────────────────────────┐
│  apps/web    React + Vite  →  Cloudflare Pages  │
└───────────────────────┬────────────────────────┘
                        │  HTTP / SSE
┌───────────────────────▼────────────────────────┐
│  apps/server   Mastra (Hono)                   │
│                                                  │
│   Mode Engine ── Provider Router ── Tool Reg.  │
│        │                │              │        │
│   Mastra Storage    Groq→Gemini→OR   Sandbox   │
└──────────────────────────────────────────────────┘
```

Repo ini monorepo pnpm:

```
apps/
  server/    API, agent, workflow, provider router, sandbox
  web/       Antarmuka React
packages/
  shared/    Tipe & skema zod yang dipakai lintas app
  ui/        Design token + komponen React
  config/    Konfigurasi ESLint/TS shared
  legacy-personality/  ← port modul persona dari proyek lama (Fase 2)
```

---

## Menjalankan

```bash
pnpm install
cp .env.example .env      # lalu isi minimal satu API key provider
pnpm dev                  # server :4111 · web :5173
```

Semua layanan yang dipakai punya free tier **tanpa kartu kredit**:

| Layanan | Dipakai untuk | Kuota free (per Nov 2026) |
|---|---|---|
| [Groq](https://console.groq.com/keys) | Provider utama | 30 RPM, 1.000 req/hari, 200K token/hari per model |
| [Google AI Studio](https://aistudio.google.com/apikey) | Provider cadangan + search grounding | s/d 1.500 req/hari, 5.000 search/bulan |
| [OpenRouter](https://openrouter.ai/keys) | Provider cadangan terakhir | 20 RPM, 50 req/hari |
| [MongoDB Atlas](https://www.mongodb.com/atlas/register) | Database (M0) | 512 MB, 100 op/detik |
| [E2B](https://e2b.dev/dashboard) | Sandbox eksekusi kode | $100 credit sekali, 20 concurrent |

> **Penting:** kuota free tier berubah sewaktu-waktu. Angka di atas diverifikasi
> pada 6 November 2026. Jangan percaya angka lama — cek halaman pricing resmi.

> **Peringatan Cloudflare:** Cloudflare **Containers tidak punya free tier**
> (free = N/A, minimum $5/bulan). Workers free juga hanya 10 ms CPU per
> request, jadi tidak cocok untuk orkestrator agent. Cloudflare dipakai hanya
> untuk hosting frontend statis.

---

## Contributing

Belum terbuka untuk kontribusi umum. Buka issue dulu kalau ada ide atau bug.
Lihat `CONTRIBUTING.md`.

## License

MIT — lihat `LICENSE`.
