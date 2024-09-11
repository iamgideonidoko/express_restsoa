import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import appConfig from '@/config';

// ! For query purposes
const queryClient = postgres(appConfig.env.DB_CONNECTION_URL);
export const db = drizzle(queryClient);

export type Db = typeof db;
