import type { ImageMIMEType, VideoMIMEType, VideoExtension, ImageExtension } from '@/interfaces/upload';
import createHttpError from 'http-errors';

const validImageMimeTypes: ImageMIMEType[] = ['image/jpeg', 'image/png', 'image/gif'];

export const validImageExtensions: ImageExtension[] = ['jpeg', 'jpg', 'png', 'gif'];

const validVideoMimeTypes: VideoMIMEType[] = ['video/mp4'];

export const validVideoExtensions: VideoExtension[] = ['mp4'];

const imageLimit = 5_000_000; // ! 5MB

const videoLimit = 50_000_000; // ! 50MB

const getFileLimit = (mimeType: string): number => {
  const isVideo = validVideoMimeTypes.indexOf(mimeType as VideoMIMEType) !== -1;
  if (isVideo) return videoLimit;
  return imageLimit;
};

export const validateFile = (file: Express.Multer.File) => {
  const { size, mimetype } = file;
  const isValidFile =
    validImageMimeTypes.indexOf(mimetype as ImageMIMEType) !== -1 ||
    validVideoMimeTypes.indexOf(mimetype as VideoMIMEType) !== -1;
  if (!isValidFile) throw createHttpError(400, 'Invalid file type');
  const fileLimit = getFileLimit(mimetype);
  if (size > fileLimit) throw createHttpError(400, `File size exceeds ${fileLimit / 1_000_000}MB`);
};

export const validateCloudinaryUrl = (url: string) => {
  const hostname = url.split('/')[2];
  if (!url || hostname !== 'res.cloudinary.com') throw createHttpError(400, 'Invalid URL');
};

export const validateUpload = ({
  type,
  file,
  files,
}: {
  type: 'file' | 'files';
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}) => {
  if (type === 'file') {
    if (!file) throw createHttpError(400, 'File not found');
    return validateFile(file);
  } else if (type === 'files') {
    if (!files) throw createHttpError(400, 'Files not found');
    if (files.length > 10) throw createHttpError(400, 'Max of 10 files can be uploaded at a time');
    for (const file of files) {
      file && validateFile(file);
    }
  }
};
