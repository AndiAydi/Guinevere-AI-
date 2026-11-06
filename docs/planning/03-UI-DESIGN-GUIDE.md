# Panduan Desain UI — Guinevere AI v2

Bagian ini adalah brief handoff ke Figma/Canva. Urutan pengerjaan yang saya sarankan: **Figma dulu, Canva tidak dipakai untuk UI app**.

---

## 1. Figma vs Canva — pilih yang mana untuk apa

| Tool | Gunakan untuk | Jangan gunakan untuk |
|---|---|---|
| **Figma** | UI app, design system, component library, prototype, handoff ke dev | — |
| **Canva** | Moodboard, poster-library, thumbnail, gambar shareable, banner | Komponen app, spacing system, dark/light token |
| **Penpot** | Alternatif Figma gratis & self-hosted | — |

**Alasan teknis:** Figma menghasilkan design token yang bisa diekspor langsung ke Tailwind (`Design Tokens → JSON → tailwind.config.ts`). Canva tidak punya konsep variable/token yang bisa di-sync ke kode. Kalau pakai Canva untuk UI app, kamu akan mengetik ulang spacing & warna secara manual — pekerjaan berulang setiap kali ada revisi.

> Kalau kamu belum punya Figma: **[Figma Starter](https://www.figma.com/)** gratis untuk 3 file aktif. Designers bisa **request free Professional seat** untuk project open-source. Repository ini MIT/public → eligible.

**Alur kerja yang saya sarankan:**

```
1. Figma: buat design tokens dulu (warna, tipografi, spacing, radius)
2. Figma: component library (button, input, card, chat bubble, task card, terminal)
3. Figma: prototype 3 layar kunci (Chat, Task Board, Sandbox) — klik-through
4. Ekspor token ke JSON → Tailwind config
5. Coding sidebar paralel dengan komponen Figma
6. Review berkala: implementasi vs Figma, perbaiki yang meleset
```

---

## 2. Prinsip Desain

### 2.1 Persona Visual

Guinevere — setup tiga karakter dalam README: elegan, hangat, sedikit mistis, tapi **produktif**. Analogi visual: **mentor pribadi yang elegan**, bukan sci-fi robot.

- Berbisik dalam warna, bukan molt
- Typography-led: angka dan kode harus terbaca, tapi nuansa personal ada
- Glassmorphism secukupnya (ter inspiration dari `Guinevere-linux-ui` yang Anda buat) — tapi **jangan berlebihan**, karena mengorbankan keterbacaan
- Animasi: halus, Purposeful. Tidak ada bounce playful

### 2.2 Prinsip Fungsional (lebih penting dari estetika)

Karena ini *agent* yang menjalankan tugas, UI harus **menunjukkan agent sedang bekerja**:

| Prinsip | Implementasi |
|---|---|
| **Always show the work** | Tool call, stdout, dan langkah workflow terlihat real-time, bukan spinner |
| **Interruptible** | Tombol stop selalu terlihat saat agent bekerja |
| **Honest failure** | Kalau gagal, tampilkan error asli + apa yang dicoba — bukan "terjadi kesalahan" |
| **Quota visible** | Kuota provider terlihat di header, karena ini hard constraint Rp 0 |
| **Approval is explicit** | Aksi destruktif = dialog dengan konsekuensi tertulis, bukan confirm generik |
| **Mode is always visible** | Badge mode aktif, karena tiap mode punya perilaku berbeda |

### 2.3 Dark Mode sebagai Default

Basis: `Guinevere-linux-ui` (index.html) memakai `#101415` background, `Inter` + `JetBrains Mono`, glass panels `rgba(255,255,255,0.08)` + `blur(24px)`, border `rgba(255,255,255,0.15)`.

Token ini jadi fondasi — reusability, jangan mulai dari nol.

---

## 3. Design Tokens

### 3.1 Warna

```css
/* ── Background (dalam ke terang) ───────────────────────── */
--bg-base:      #0b0d0e;   /* app shell */
--bg-surface:   #101415;   /* panel utama — dari linux-ui */
--bg-raised:    #171b1c;   /* card, popover */
--bg-overlay:   #1f2425;   /* modal, dropdown */
--bg-input:     #0f1213;   /* field input */

/* ── Glass ────────────────────────────────────────────────── */
--glass-bg:     rgba(255,255,255,0.08);
--glass-border: rgba(255,255,255,0.15);
--glass-blur:   24px;

/* ── Teks ─────────────────────────────────────────────────── */
--text-primary:   #e0e3e5;  /* dari linux-ui */
--text-secondary: #9aa3a6;
--text-tertiary:  #6b7375;
--text-inverse:   #0b0d0e;

/* ── Aksen — persona Guinevere ───────────────────────────── */
--accent:        #7c9cff;  /* ungu-biru: elegan, tidak norak */
--accent-hover:  #94aeff;
--accent-muted:  rgba(124,156,255,0.12);
--accent-border: rgba(124,156,255,0.30);

/* ── Status semantik ─────────────────────────────────────── */
--success:  #4ade80;   /* tool sukses, task selesai */
--warning:  #fbbf24;   /* approval pending, kuota 70% */
--danger:   #f87171;   /* error, request destruktif */
--info:     #38bdf8;   /* info runtime, provider switch */
```

**Warna mode (badge):**

| Mode | Warna | Ikon |
|---|---|---|
| Companion | `#f9a8d4` (rose) |sparkle |
| Roleplay | `#c4b5fd` (violet) | mask |
| Reasoning | `#7dd3fc` (sky) | brain |
| Research | `#86efac` (green) | search |
| Learn | `#fcd34d` (amber) | book |

### 3.2 Tipografi

| Peran | Font | Ukuran | Weight |
|---|---|---|---|
| Display / heading | Inter | 24 / 32 | 600 |
| Body | Inter | 14 / 20 | 400 |
| Caption | Inter | 12 / 16 | 500 |
| Code | JetBrains Mono | 13 / 20 | 500 |
| Terminal output | JetBrains Mono | 12 / 18 | 400 |

Dari `linux-ui`: `Inter` (400/500/600) + `JetBrains Mono` (500). Pertahankan.

### 3.3 Spacing & Radius

```css
/* Spacing — kelipatan 4 */
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;

/* Radius */
--radius-sm: 6px;   --radius-md: 10px;   --radius-lg: 14px;
--radius-full: 9999px;

/* Border */
--border-subtle: rgba(255,255,255,0.08);
--border-default: rgba(255,255,255,0.15);
--border-strong: rgba(255,255,255,0.25);
```

### 3.4 Elevation

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.3);
--shadow-md:  0 4px 12px rgba(0,0,0,0.35);
--shadow-lg:  0 8px 32px rgba(0,0,0,0.4);   /* dari linux-ui */
```

### 3.5 Motion

```css
--duration-fast: 120ms;   --duration-base: 200ms;  --duration-slow: 320ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Aturan: stream token masuk dengan **fade + translateY(4px)**, max 60ms stagger. Jangan re-render seluruh pesan saat streaming — hanya append.

---

## 4. Layar Kunci

### 4.1 Chat (halaman utama)

```
┌──────────────────────────────────────────────────────────────┐
│ ● Guinevere    [Reasoning ▾]   Groq 412/1000 ▓▓▓░  ⏱ 2:14 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 🤔 · run_command · 3.2s                          │      │
│  │ $ python analyze.py data.csv                      │      │
│  │ ✓ 128 rows processed                              │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │ Guin                                                │      │
│  │ File `analyze.py` sudah dibuat dan dijalankan.     │      │
│  │ Hasilnya 128 baris valid, 3 duplikat terdeteksi.  │      │
│  │ Mau saya simpan juga sebagai CSV bersih?          │      │
│  └────────────────────────────────────────────────────┘      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [ Reasoning ]  Kirim tugas…                    ⏹ Stop   │
│                                         📎 🔍 ⚙️            │
└──────────────────────────────────────────────────────────────┘
```

Komponen: `ChatMessage`, `ToolCallCard` (expandable, streaming status), `ModeBadge`, `QuotaMeter`, `Composer` (textarea auto-grow, multi-line, `Enter` kirim / `Shift+Enter` newline), `StopButton`.

### 4.2 Task Board

Grid kanban: **Queued → Running → Needs Approval → Done → Failed**

Kartu task: judul, mode badge, progress bar langkah, durasi, jumlah tool call, artefak (file), tombol "Approve / Reject" kalau tertahan.

### 4.3 Sandbox Terminal

Tabs per eksekusi. Header: bahasa, status, durasi, tombol stop & download artefak. Body: monospace, output terminal asli (ANSI), prompt dengan `>`.

### 4.4 Memory Viewer

Tampilkan working memory apa yang Disimpan agent tentang user — **transparan**. Kolom: profil, preferensi, konteks, relationship level. Editable + bisa dihapus. Ini penting: user harus bisa lihat & kontrol apa yang "diingat" AI.

### 4.5 Settings

- Provider & urutan routing (dengan kuota tersisa hari ini)
- Sandbox provider + status E2B credit
- Mode default, intensitas persona, bahasa
- Budget guard: batas request/jam, auto-pindah model
- Danger zone: hapus semua memory, export memory

---

## 5. Component Library (yang perlu dibuat di Figma)

**Primitif:** Button (primary/secondary/ghost/danger, size sm/md/lg), Input, Textarea, Select, Switch, Slider, Badge, Tooltip, Dialog, Dropdown, Tabs, Toast, Skeleton, Spinner.

**Domain:** `ChatBubble` (user/assistant/system/tool), `ModeBadge`, `QuotaMeter`, `ToolCallCard`, `TaskCard`, `StepIndicator`, `CodeBlock` (dengan syntax highlight + tombol copy), `TerminalBlock`, `ArtifactCard`, `ApprovalDialog`, `MemoryCard`.

**Tooltip & microcopy (tulis dalam bahasa Indonesia, natural):**

| Aksi | Microcopy |
|---|---|
| Kirim | "Kirim" |
| Hentikan | "Hentikan" |
| Setujui | "Setujui & lanjutkan" |
| Tolak | "Tolak" |
| Kosong chat | "Ada yang bisa-Guinevere bantu?" |
| Kosong task | "Belum ada tugas. Sebutkan sesuatu yang harus dikerjakan." |
| Error | "Gagal menjalankan. Ini yang terjadi: {error asli}" |
| Kuota habis | "Kuota {provider} habis untuk hari ini. Dialihkan ke {provider lain}." |
| Copy code | "Kode disalin" |

---

## 6. Deliverable Figma yang perlu ada sebelum coding frontend

- [ ] File `Guinevere Design System` — tokens + primitives, ter-component
- [ ] File `Guinevere App` — 5 layar kunci, desktop 1440px + mobile 390px
- [ ] Mode **Interactive Prototype**: Chat → klik "Setujui" → Task Board → Sandbox
- [ ] File `Guinevere Tokens` — JSON export untuk Tailwind
- [ ] Dark mode sebagai default; light mode opsional (v2)

---

## 7. Checklist Paralel Coding ↔ Design

Sebelum lanjut coding frontend, pastikan:

1. Tokens Figma sudah diekspor ke `packages/ui/src/tokens.ts` + `tailwind.config.ts`
2. Komponen yang dipakai Phase 2–3 sudah ada di Figma
3. Kalau desain berubah → update token dulu, baru komponen, baru halaman (jangan bolak-balik)
4. CardComponent baru: Figma dulu (kecuali benar-benar minuscule)
