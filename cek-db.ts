import { db } from './server/db'; 
import { users } from './drizzle/schema'; 

console.log("Program dimulai..."); // Harus muncul di terminal

async function cek() {
  try {
    console.log("Mencoba query...");
    const semuaUser = await db.select().from(users);
    console.log("Hasil:", semuaUser);
  } catch (error) {
    console.error("Error nih:", error);
  }
}

cek();