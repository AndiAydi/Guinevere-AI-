import { db } from './server/db';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function ambilDataUser() {
  console.log("🚀 Menghubungi Supabase buat narik data...");
  
  try {
    const semuaUser = await db.select().from(users);
    
    console.log("\n=== 📄 SEMUA USER DI DATABASE ===");
    console.dir(semuaUser, { depth: null }); 
    
    const dataAndy = await db.select()
      .from(users)
      .where(eq(users.email, "andiaydi90@gmail.com"));

    console.log("\n=== 👑 DATA PERDANA SANG KREATOR ===");
    console.dir(dataAndy, { depth: null });

  } catch (error) {
    console.error("❌ Waduh, gagal pas mau narik data:", error);
  } finally {
    console.log("\n🔌 Memutuskan koneksi pooler, terminal aman!");
    process.exit(0); 
  }
}

ambilDataUser();