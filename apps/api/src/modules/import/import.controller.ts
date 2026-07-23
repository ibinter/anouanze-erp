import {
  Controller, Get, Post, Param, Query, Request,
  UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_FINANCE,
  ROLES_ECRITURE_MEMBRES,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : téléchargement des modèles ouvert ; les imports réels sont restreints.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/import')
export class ImportController {
  constructor(private readonly service: ImportService) {}

  @Get('template/:type')
  @ApiOperation({ summary: 'Télécharger un modèle Excel vide' })
  async template(@Param('type') type: string, @Res() res: Response) {
    const buffer = await this.service.genererTemplateXLSX(type);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="template-${type}.xlsx"`,
    });
    res.end(buffer);
  }

  @Post('valider/:type')
  @Roles(...ROLES_ECRITURE_MEMBRES)
  @ApiOperation({ summary: 'Valider un fichier sans importer' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichier'))
  valider(@Param('type') type: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Fichier manquant');
    return this.service.validerFichier(type, file.buffer);
  }

  @Post('membres')
  @Roles(...ROLES_ECRITURE_MEMBRES)
  @ApiOperation({ summary: 'Importer des membres depuis Excel' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichier'))
  importerMembres(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Fichier manquant');
    return this.service.importerMembres(req.user.organisationId, file.buffer);
  }

  @Post('donateurs')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Importer des donateurs depuis Excel' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichier'))
  importerDonateurs(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('Fichier manquant');
    return this.service.importerDonateurs(req.user.organisationId, file.buffer);
  }
}
