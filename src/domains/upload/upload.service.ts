import { injectable, inject } from 'inversify';
import type { Logger } from 'winston';
import type { ICloudinaryUploader } from '@/utils/cloudinary';
import createHttpError from 'http-errors';
import type { UploadApiResponse } from 'cloudinary';
import { validImageExtensions, validVideoExtensions } from '@/utils/upload';
import type { ImageExtension, ResourceType, VideoExtension } from '@/interfaces/upload';
import { TYPES } from '@/ioc/types';

@injectable()
export class UploadService {
  constructor(
    @inject(TYPES.Logger) private logger: Logger,
    @inject(TYPES.Cloudinary) private cloudinaryUploader: ICloudinaryUploader,
  ) {}

  private uploadToCloudinary(buffer: Buffer) {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      this.cloudinaryUploader
        .upload_stream({}, (error, result) => {
          if (error ?? !result) return reject(error ?? 'Failed to upload file');
          resolve(result);
        })
        .end(buffer);
    });
  }

  public async uploadSingleFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    try {
      this.logger.silly(`Uploading ${file.originalname}...`);
      return await this.uploadToCloudinary(file.buffer);
    } catch (err) {
      throw createHttpError(406, 'File could not be uploaded');
    }
  }

  public async uploadMultipleFiles(files: Express.Multer.File[]): Promise<UploadApiResponse[]> {
    const uploadApiResponses: UploadApiResponse[] = [];
    for (const file of files) {
      try {
        this.logger.silly(`Uploading ${file.originalname}...`);
        uploadApiResponses.push(await this.uploadToCloudinary(file.buffer));
      } catch (err) {
        // ! Since file could not be uploaded, delete all files locally
        throw createHttpError(406, 'Files could not be uploaded');
      }
    }
    return uploadApiResponses;
  }

  private getPublicIdAndResourceType(url: string): { publicId: string; resourceType: ResourceType } {
    const fullPublicId = url.split('/').slice(-1)[0] ?? '',
      fileExtension = fullPublicId.split('.').slice(-1)[0]?.toLowerCase(),
      publicIdWithoutExtension = fullPublicId.split('.').slice(0, -1).join('.'),
      isImage = validImageExtensions.indexOf(fileExtension as ImageExtension) !== -1,
      isVideo = validVideoExtensions.indexOf(fileExtension as VideoExtension) !== -1,
      resourceType = isImage ? 'image' : isVideo ? 'video' : 'raw',
      publicId = resourceType === 'raw' ? fullPublicId : publicIdWithoutExtension;
    return { publicId, resourceType };
  }

  private async deleteFromCloudinary(publicId: string, resourceType: ResourceType) {
    await this.cloudinaryUploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  public async deleteSingleFile(url: string): Promise<void> {
    const { publicId, resourceType } = this.getPublicIdAndResourceType(url);
    try {
      await this.deleteFromCloudinary(publicId, resourceType);
    } catch (err) {
      this.logger.error('Could not delete file from cloudinary: %o', err);
      throw createHttpError(400, 'File could not be deleted');
    }
  }

  public async deleteMultipleFiles(urls: string[]): Promise<void> {
    for (const url of urls) {
      const { publicId, resourceType } = this.getPublicIdAndResourceType(url);
      try {
        await this.deleteFromCloudinary(publicId, resourceType);
      } catch (err) {
        this.logger.error('Could not delete file from cloudinary: %o', err);
        throw createHttpError(400, 'File could not be deleted');
      }
    }
  }
}
