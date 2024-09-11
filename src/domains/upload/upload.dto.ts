import { IsUrl, IsArray, ArrayMaxSize } from 'class-validator';

export class DeleteFileInput {
  @IsUrl({ host_whitelist: ['res.cloudinary.com'] }, { message: 'URL must be a valid cloudinary URL' })
  url: string;
}

export class DeleteFilesInput {
  @IsArray()
  @ArrayMaxSize(50)
  @IsUrl({ host_whitelist: ['res.cloudinary.com'] }, { message: 'URL must be a valid cloudinary URL', each: true })
  urls: string[];
}
