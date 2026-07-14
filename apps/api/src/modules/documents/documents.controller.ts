import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { StatutDocument } from '@prisma/client';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiOperation({ summary: 'Liste des documents' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categorie') categorie?: string,
    @Query('statut') statut?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
  ) {
    return this.documentsService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      categorie,
      statut: statut as StatutDocument | undefined,
      search,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @ApiOperation({ summary: 'Détail d\'un document' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.findOne(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Uploader un document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fichier: { type: 'string', format: 'binary' },
        nom: { type: 'string' },
        description: { type: 'string' },
        categorie: { type: 'string' },
        tags: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('fichier'))
  @Post()
  upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.upload(req.user.organisationId, req.user.sub, file, dto);
  }

  @ApiOperation({ summary: 'Modifier les métadonnées d\'un document' })
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Supprimer un document' })
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.delete(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Obtenir une URL de téléchargement temporaire' })
  @Get(':id/signed-url')
  getSignedUrl(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.getSignedUrl(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Archiver un document' })
  @Patch(':id/archiver')
  archiverDocument(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.archiverDocument(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Générer le QR code de vérification' })
  @Get(':id/qr')
  getQrCode(@Param('id') id: string, @Request() req: any) {
    const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
    return this.documentsService.getQrCode(id, req.user.organisationId, baseUrl);
  }

}
