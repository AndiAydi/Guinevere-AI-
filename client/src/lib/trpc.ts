import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../../server/routers"; 
// Pastikan path di atas mengarah ke file router utama di backend lu

// Ini yang dicari-cari sama useAuth.ts!
export const trpc = createTRPCReact<AppRouter>();