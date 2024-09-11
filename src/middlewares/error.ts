import type { Request, Response, ErrorRequestHandler, NextFunction } from 'express';
import Logger from '@/utils/logger';
import { ValidateError } from 'tsoa';

export const errorHandler =
  (): ErrorRequestHandler => (err: unknown, req: Request, res: Response, next: NextFunction) => {
    Logger.error(
      `🔥 ${req.path}: %o`,
      err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    );
    if (err instanceof ValidateError) {
      return res.status(422).json({
        error: 'Validation failed',
        details: err?.fields,
      });
    }
    if (err instanceof Error && 'statusCode' in err && typeof err.statusCode === 'number') {
      return res.status(err.statusCode).json({
        error: err.message,
      });
    }
    return next(
      res.status(500).json({
        error: 'Something went wrong',
      }),
    );
  };
