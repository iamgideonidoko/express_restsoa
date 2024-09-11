import 'reflect-metadata';
import '@/ioc/bind';
import expressLoader from './express';
import drizzleLoader from './drizzle';

const load = async () => {
  const app = expressLoader();
  await drizzleLoader();
  return app;
};

export default { load };
