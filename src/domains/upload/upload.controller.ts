import { inject } from 'inversify';
import {
  Route,
  Post,
  Controller,
  SuccessResponse,
  Tags,
  Security,
  UploadedFile,
  UploadedFiles,
  Middlewares,
  Delete,
  Example,
  Body,
} from 'tsoa';
import { UploadService } from './upload.service';
// NOTE: importing DTO with absolute path causes TSOA generation to fail because it takes it as a node module
import { validateUpload } from '@/utils/upload';
import { validateBody } from '@/middlewares/validator';
import { DeleteFileInput, DeleteFilesInput } from './upload.dto';

@Route('upload')
@Tags('Upload')
export class UploadController extends Controller {
  constructor(@inject(UploadService) private readonly uploadService: UploadService) {
    super();
  }

  /**
  Upload a single file
  */
  @Security('cookieAuth')
  @Post('single')
  @SuccessResponse(201, 'Uploaded')
  public async uploadSingleFile(@UploadedFile('file') file: Express.Multer.File): Promise<{ url: string }> {
    validateUpload({ type: 'file', file: file });
    const { secure_url: url } = await this.uploadService.uploadSingleFile(file);
    this.setStatus(201);
    return { url };
  }

  /**
  Upload multiple files
  */
  @Security('cookieAuth')
  @Post('many')
  @SuccessResponse(201, 'Uploaded')
  public async uploadMultipleFiles(@UploadedFiles('files') files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    validateUpload({ type: 'files', files: files });
    const responses = await this.uploadService.uploadMultipleFiles(files);
    this.setStatus(201);
    return {
      urls: responses.map((response) => response.secure_url),
    };
  }

  /**
  Upload a single file
  */
  @Security('cookieAuth')
  @Delete('single')
  @Example<string>('Ok')
  @Middlewares([validateBody(DeleteFileInput)])
  public async deleteSingleFile(@Body() body: DeleteFileInput): Promise<string> {
    await this.uploadService.deleteSingleFile(body.url);
    return 'Ok';
  }

  /**
  Delete multiple files
  */
  @Security('cookieAuth')
  @Delete('many')
  @Example<string>('Ok')
  @Middlewares([validateBody(DeleteFilesInput)])
  public async deleteMultipleFiles(@Body() body: DeleteFilesInput): Promise<string> {
    await this.uploadService.deleteMultipleFiles(body.urls);
    this.setStatus(201);
    return 'Ok';
  }
}
