import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import appConfig from '@/config';
import Logger from '@/utils/logger';

export const runMigration = async () => {
  try {
    Logger.info(' ⚙️ Running migration');
    const migrationClient = postgres(appConfig.env.DB_CONNECTION_URL, { max: 1 });
    const db = drizzle(migrationClient);
    //! Run migration skipping the one already applied
    await migrate(db, { migrationsFolder: './migrations' });
    await migrationClient.end();
    Logger.info('  ✅ Migration ran successfully 🕺💃');
  } catch (e) {
    console.log('normal error: ', e);
  }
};

if (require.main === module) void runMigration();
