import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';

@ApiTags('documents-public')
@Controller('api/v1/documents/verifier')
export class DocumentsVerifyController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Vérifier l\'authenticité d\'un document (route publique)' })
  verifier(@Param('id') id: string) {
    return this.documentsService.verifierDocument(id);
  }
}
