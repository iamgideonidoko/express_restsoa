import { v2 as cloudinary } from 'cloudinary';
import appConfig from '@/config';

cloudinary.config({
  cloud_name: appConfig.env.CLOUDINARY_CLOUD_NAME,
  api_key: appConfig.env.CLOUDINARY_API_KEY,
  api_secret: appConfig.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryUploader = cloudinary.uploader;

export type ICloudinaryUploader = typeof cloudinary.uploader;
