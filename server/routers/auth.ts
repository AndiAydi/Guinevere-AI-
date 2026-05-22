import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { supabase } from "../_core/supabase"; 

export const authRouter = router({
  sendOTP: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const { error } = await supabase.auth.signInWithOtp({
        email: input.email,
        options: {
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

      return { 
        success: true, 
        message: "Kode OTP berhasil dikirim ke email surat lu, cug!",
        // 🤖 IoT Ready: Robot bakal kedip & tegap pas sukses kirim
        iot_meta: { oled_state: "EYE_BLINK", servo_action: "LOOK_STRAIGHT" }
      };
    }),

  verifyOTP: publicProcedure
    .input(z.object({ 
      email: z.string().email(),
      token: z.string().length(6) 
    }))
    .mutation(async ({ input }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: input.email,
        token: input.token,
        type: 'email', 
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
        iot_meta: { oled_state: "EYE_LOVE", servo_action: "NOD_HEAD_HAPPY" }
      };
    }),
});