import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ProjetsService } from './projets.service';
import { CreateProjetDto } from './dto/create-projet.dto';
import { CreateActiviteDto } from './dto/create-activite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_ECRITURE_PROJET,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { StatutProjet } from '@prisma/client';

@ApiTags('projets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/projets')
export class ProjetsController {
  constructor(private readonly projetsService: ProjetsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste paginée des projets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'statut', required: false, enum: StatutProjet })
  @ApiQuery({ name: 'secteur', required: false, type: String })
  findAll(@Request() req, @Query() query: Record<string, string>) {
    return this.projetsService.findAll(req.user.organisationId, {
      page: query['page'] ? Number(query['page']) : 1,
      limit: query['limit'] ? Number(query['limit']) : 20,
      search: query['search'],
      statut: query['statut'] as StatutProjet,
      secteur: query['secteur'],
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des projets' })
  getStats(@Request() req) {
    return this.projetsService.getStats(req.user.organisationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un projet' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projetsService.findOne(id, req.user.organisationId);
  }

  @Post()
  @Roles(...ROLES_ECRITURE_PROJET)
  @ApiOperation({ summary: 'Créer un projet' })
  create(@Request() req, @Body() dto: CreateProjetDto) {
    return this.projetsService.create(req.user.organisationId, dto);
  }

  @Patch(':id')
  @Roles(...ROLES_ECRITURE_PROJET)
  @ApiOperation({ summary: 'Modifier un projet' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateProjetDto>) {
    return this.projetsService.update(id, req.user.organisationId, dto);
  }

  @Delete(':id')
  @Roles(...ROLES_ADMIN)
  @ApiOperation({ summary: 'Supprimer un projet' })
  delete(@Param('id') id: string, @Request() req) {
    return this.projetsService.delete(id, req.user.organisationId);
  }

  @Get(':id/activites')
  @ApiOperation({ summary: 'Activités d\'un projet' })
  getActivites(@Param('id') id: string) {
    return this.projetsService.getActivites(id);
  }

  @Post(':id/activites')
  @Roles(...ROLES_ECRITURE_PROJET)
  @ApiOperation({ summary: 'Créer une activité pour un projet' })
  createActivite(@Param('id') id: string, @Body() dto: CreateActiviteDto) {
    return this.projetsService.createActivite(id, dto);
  }

  @Get(':id/beneficiaires')
  @ApiOperation({ summary: 'Bénéficiaires d\'un projet' })
  getBeneficiaires(@Param('id') id: string) {
    return this.projetsService.getBeneficiaires(id);
  }

  @Post(':id/beneficiaires/:beneficiaireId')
  @Roles(...ROLES_ECRITURE_PROJET)
  @ApiOperation({ summary: 'Ajouter un bénéficiaire à un projet' })
  ajouterBeneficiaire(
    @Param('id') id: string,
    @Param('beneficiaireId') beneficiaireId: string,
    @Body() dto: { services?: string[]; notes?: string; statut?: string },
  ) {
    return this.projetsService.ajouterBeneficiaire(id, beneficiaireId, dto);
  }
}
