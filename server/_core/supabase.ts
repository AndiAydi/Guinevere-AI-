import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Aduh Di, kabel URL atau Anon Key Supabase di file .env belum lu isi/typo nih!");
}

// Inisialisasi client Supabase secara global
export const supabase = createClient(supabaseUrl, supabaseAnonKey);