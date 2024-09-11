import { JwtAddedPayload } from '@/domains/auth/auth.interface';

export type Prettify<T> = {
  [K in keyof T]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types
} & {};

export type AuthUserRequest = Request & { user?: JwtAddedPayload };
