export enum Deps {
  Db = 'Db',
  Logger = 'Logger',
  Cloudflare = 'Cloudflare',
  Cloudinary = 'Cloudinary',
}

export const TYPES = {
  Db: Symbol.for(Deps.Db),
  Logger: Symbol.for(Deps.Logger),
  Cloudflare: Symbol.for(Deps.Cloudflare),
  Cloudinary: Symbol.for(Deps.Cloudinary),
};
