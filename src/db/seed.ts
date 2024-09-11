import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import appConfig from '@/config';
import Logger from '@/utils/logger';

export const seed = async () => {
  try {
    Logger.info(' ⚙️ Seeding...');
    const seedClient = postgres(appConfig.env.DB_CONNECTION_URL, { max: 1 });
    drizzle(seedClient);
    //! Run migration skipping the one already applied
    await seedClient.end();
    Logger.info('  ✅ Seeded successfully 🕺💃');
  } catch (e) {
    Logger.error('  🔥 Seed failed: %o', e instanceof Error ? `${e.name}, ${e.message}` : e);
  }
};

if (require.main === module) void seed();
