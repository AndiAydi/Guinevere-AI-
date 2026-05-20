import { db } from './db'; 
import { users } from '../drizzle/schema'; 

async function seedUser() {
  console.log("Menyiapkan injeksi data pertama...");
  
  try {
    await db.insert(users).values({
      name: "Andy", 
      email: "andiaydi90@gmail.com",
      loginMethod: "email",
      role: "admin",
      openId: "andy-admin-001",
    });
    
    console.log("BOOM! Data berhasil masuk ke database! 💥");
  } catch (error) {
    console.error("Waduh, ada yang nyangkut:", error);
  } finally {
    process.exit(0);
  }
}

seedUser();