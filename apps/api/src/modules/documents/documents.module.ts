import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsController } from './documents.controller';
import { DocumentsVerifyController } from './documents-verify.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    }),
  ],
  controllers: [DocumentsController, DocumentsVerifyController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
