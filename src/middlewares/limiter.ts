import rateLimit from 'express-rate-limit';
import type { RateLimitRequestHandler } from 'express-rate-limit';
import createError from 'http-errors';

export const limiter = (maxNumOfRequests = 100, timeToReEntry = 2): RateLimitRequestHandler =>
  rateLimit({
    max: maxNumOfRequests,
    windowMs: timeToReEntry * 30000, // ! 30000ms = 30s = 0.5m
    message: `Too many requests from this IP address`,
    handler: () => createError.InternalServerError(),
  });
