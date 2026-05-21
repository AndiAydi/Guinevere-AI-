import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { chatRouter } from "./routers/chat";
import { problemSolvingRouter } from "./routers/problemSolving";

export const appRouter = router({
  // Router bawaan sistem core
  system: systemRouter,
  
  // Router fitur robot Guinevere AI lu
  chat: chatRouter,
  problemSolving: problemSolvingRouter,
  
  // Router Autentikasi (Ini dia satpamnya, Di!)
  auth: router({
    // Frontend tinggal manggil: trpc.auth.me.useQuery()
    me: publicProcedure.query(({ ctx }) => {
      // tRPC otomatis ngecek session lewat ctx (context)
      if (!ctx.user) {
        return { authenticated: false, user: null };
      }
      return { authenticated: true, user: ctx.user };
    }),

    // Fitur Logout resmi bawaan tRPC
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;