import Loader from './loaders';
import { createServer as createHTTPServer } from 'http';
import { createServer as createHTTPSServer } from 'https';
import appConfig from './config';
import Logger from './utils/logger';
import { runMigration } from './db/migrate';

void (async () => {
  if (require.main !== module) return; // ! Run directly
  // ! Run migration if machine not local
  if (!appConfig.env.IS_LOCAL) await runMigration(); // ! Migrate
  // ! Load app
  const app = await Loader.load(),
    protocol = appConfig.env.isDev ? 'http' : 'http',
    host = appConfig.env.IS_LOCAL ? '127.0.0.1' : '0.0.0.0',
    server = { http: createHTTPServer, https: createHTTPSServer }[protocol]({}, app);

  server
    .listen(appConfig.env.PORT, host, () => {
      Logger.info(`Speak Lord🤲🏽, your server is listening on: ${protocol}://${host}/${appConfig.env.PORT} 🚀.`);
    })
    .on('error', (err) => {
      Logger.error(err);
      process.exit(1);
    });
})();
