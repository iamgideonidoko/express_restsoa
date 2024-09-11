import type { IAppConfig } from '@/interfaces/config';
import { env } from './env';
import merge from 'deepmerge';

const appConfig: IAppConfig = {
  env: Object.defineProperties(
    merge(env, {
      // ! ... Other custom env properties
    }),
    Object.getOwnPropertyDescriptors(env),
  ),
};

export default appConfig;
