import express from 'express';
import { json, urlencoded } from 'express';
import Logger from '@/utils/logger';
import cors from 'cors';
import compression from 'compression';
import xss from 'xss-clean';
import morgan from 'morgan';
import helmet from 'helmet';
import appConfig from '@/config';
import { limiter, errorHandler } from '@/middlewares';
import { RegisterRoutes } from '@/tsoa/routes';
import { GenerateDocs } from './docs';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';

export default () => {
  const app = express();

  app.disable('trust proxy');

  // ! Convert req.body string to json
  app.use(json());
  // ! Parse url payloads with qs library
  app.use(urlencoded({ extended: true }));
  // ! Parse cookies
  app.use(cookieParser());
  // ! Development logging
  app.use(morgan('dev'));
  // ! Enable cors for all origins in dev
  app.use(
    cors({
      origin: appConfig.env.isDev || [],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    }),
  );
  // ! Compress payload
  app.use(compression());
  // ! Sanitize data against xss
  app.use(xss());
  // ! Add secure http headers
  app.use(
    helmet({
      crossOriginEmbedderPolicy: !appConfig.env.isDev,
      contentSecurityPolicy: !appConfig.env.isDev,
    }),
  );
  // ! Limit rate
  app.use(limiter());

  app.get('/', (_, res) => res.send('Health: OK'));

  GenerateDocs(app);
  RegisterRoutes(app);

  // ! Throw error for unhandled routes
  app.use(() => {
    throw createError.NotFound('Route not found');
  });

  // ! Global error handler
  app.use(errorHandler());

  // ! Throw error unhandled rejection
  process.on('unhandledRejection', (reason: Error) => {
    Logger.error(`🔥 Unhandled Rejection: `, reason);
    throw reason;
  });

  // ! Kill app if there's an uncaught exception
  process.on('uncaughtException', (error: Error) => {
    Logger.error(`🔥 UncaughtException Error: `, error);
    process.exit(1);
  });
  return app;
};
