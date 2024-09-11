import { sql } from 'drizzle-orm';
import { db } from '@/db';
import Logger from '@/utils/logger';

export default async () => {
  try {
    await db.execute(sql`select now()`);
    Logger.info('  ✅ Drizzle connected to database 🕺💃');
  } catch (err) {
    Logger.error('  🔥 Drizzle failed to connect database');
  }
};
