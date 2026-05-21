import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { supabase } from "../_core/supabase"; // Narik koneksi Supabase lu

export const authRouter = router({
  // 1. FUNGSI KIRIM KODE VERIFIKASI (OTP) KE EMAIL SURAT
  sendOTP: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // Perintahkan Supabase buat ngirim kode OTP 6 digit ke email
      const { error } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
          // Kalo user baru belum terdaftar, Supabase otomatis bakal daftarin (Sign Up)
          shouldCreateUser: true, 
        },
      });

      if (error) {
        console.error("Supabase OTP Error:", error.message);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Gagal ngirim kode verifikasi: ${error.message}`,
        });
      }

      return { success: true, message: "Kode OTP berhasil dikirim ke email surat lu, cug!" };
    }),

  // 2. FUNGSI VERIFIKASI KODE OTP YANG DIINPUT USER
  verifyOTP: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      token: z.string().length(6) // Kode OTP biasanya 6 digit
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: input.email,
        token: input.token,
        type: 'email', // Pilih tipe verifikasi email
      });

      if (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Kodenya salah atau udah kedaluwarsa nih, Di. Coba cek lagi!",
        });
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    }),
});