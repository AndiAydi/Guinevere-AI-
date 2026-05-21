import { router } from "../_core/trpc";
import { chatRouter } from "./chat";
import { authRouter } from "./auth";

// Ini adalah gerbang utama yang menyatukan semua fitur backend Guinevere AI
export const appRouter = router({
  chat: chatRouter, // Otak AI Gemini lu kemarin
  auth: authRouter, // Fitur Login OTP Supabase yang barusan kita bikin
});

export type AppRouter = typeof appRouter;