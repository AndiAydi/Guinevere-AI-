import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import 'dotenv/config'; 

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  prepare: false,   // WAJIB untuk mode pooler (PgBouncer)
  ssl: 'require'    // WAJIB untuk koneksi pooler Supabase
});

export const db = drizzle(client);