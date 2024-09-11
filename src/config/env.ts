import { cleanEnv, num, str, url, email, host, bool } from 'envalid';

export const env = cleanEnv(process.env, {
  IS_LOCAL: bool({ default: true }),
  PORT: num({ default: 6900 }),
  NODE_ENV: str({ choices: ['development', 'production'], default: 'development' }),
  DB_CONNECTION_URL: url(),
  LOGS_LEVEL: str({ default: 'silly' }),
  TOKEN_SPAN: str({ default: '1h' }),
  REFRESH_SPAN: str({ default: '7d' }),
  TOKEN_SECRET: str(),
  REFRESH_SECRET: str(),
  CLOUDFLARE_EMAIL: email(),
  CLOUDFLARE_API_KEY: str(),
  CLOUDFLARE_DOMAIN: host(),
  CLOUDFLARE_ZONE_ID: str(),
  CLOUDINARY_CLOUD_NAME: str({ default: process.env.NODE_ENV === 'production' ? '' : undefined }),
  CLOUDINARY_API_KEY: str({ default: process.env.NODE_ENV === 'production' ? '' : undefined }),
  CLOUDINARY_API_SECRET: str({ default: process.env.NODE_ENV === 'production' ? '' : undefined }),
});
