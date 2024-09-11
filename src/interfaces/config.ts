import { env } from '@/config/env';

type Env = typeof env;

export interface IAppConfig {
  env: Env;
}
