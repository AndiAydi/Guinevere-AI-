import { LibSQLStore } from '@mastra/libsql';
import { MongoDBStore } from '@mastra/mongodb';
import type { MastraStorage } from '@mastra/core/storage';
import type { Env } from '../env.js';

/**
 * Penyimpanan.
 *
 * Produksi: MongoDB Atlas M0 (512 MB, free, tanpa kartu kredit).
 * Dev lokal: LibSQL file-based, supaya tidak butuh server database.
 *
 * Batasan M0 yang harus diingat:
 * - 100 operasi/detik
 * - Atlas Vector Search TIDAK tersedia → semantic recall pakai embedding
 *   yang disimpan di collection biasa + cosine similarity manual.
 * - Cluster auto-pause setelah 30 hari tanpa koneksi → butuh auto-reconnect
 *   dan backup mongodump terjadwal.
 */
export function createStorage(env: Env): MastraStorage {
  if (env.MONGODB_URI) {
    return new MongoDBStore({
      id: 'guinevere-storage',
      uri: env.MONGODB_URI,
      dbName: env.MONGODB_DB_NAME,
    }) as unknown as MastraStorage;
  }

  return new LibSQLStore({
    id: 'guinevere-storage',
    url: 'file:./.mastra/guinevere.db',
  }) as unknown as MastraStorage;
}
