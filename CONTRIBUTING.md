# Kontribusi

Guinevere AI belum terbuka untuk kontribusi umum. Repo ini pada dasarnya
proyek pribadi satu orang.

Kalau kamu mau membantu, buka **issue** dulu — diskusikan di sana sebelum
mengirim pull request. Pull request tanpa issue sebelumnya kemungkinan
akan ditolak atau ditunda.

## Yang selalu dihargai

- Test yang benar-benar lulus di CI — bukan klaim di README
- Dokumentasi yang akurat; kalau README dan kode beda, kode yang menang
- Perubahan yang kecil dan terfokus, satu tujuan per PR

## Anti-pola yang pernah menimpa proyek ini

Proyek lama menandai ~40 item `[x]` di `todo.md` padahal kodenya tidak ada
(termasuk `streamingService.ts` yang 0 byte). Karena itu:

> Sebuah item baru ditandai selesai hanya jika (1) kodenya ada, (2) test-nya
> ada dan lulus, (3) sudah diverifikasi manual, dan (4) README-nya diperbarui.

Kalau satu dari empat tidak terpenuhi, tandai `🚧`, bukan `✅`.
