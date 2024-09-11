import { container } from './';
import { TYPES } from './types';
import { db, type Db } from '@/db';
import type { Logger as ILogger } from 'winston';
import Logger from '@/utils/logger';
import { cloudinaryUploader, type ICloudinaryUploader } from '@/utils/cloudinary';

container.bind<Db>(TYPES.Db).toConstantValue(db);
container.bind<ILogger>(TYPES.Logger).toConstantValue(Logger);
container.bind<ICloudinaryUploader>(TYPES.Cloudinary).toConstantValue(cloudinaryUploader);
