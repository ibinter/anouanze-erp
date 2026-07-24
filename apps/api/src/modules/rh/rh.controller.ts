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
  Request,
  ParseBoolPipe,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_RH,
  ROLES_LECTURE_RH,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { RhService } from './rh.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { GenererFichePaieDto } from './dto/generer-fiche-paie.dto';
import { DemanderCongeDto } from './dto/demander-conge.dto';
import { CreateVolontaireDto } from './dto/create-volontaire.dto';

@ApiTags('rh')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut du contrôleur : lecture restreinte — les données RH sont nominatives
// (salaires, congés, contrats). Chaque route redéclare @Roles si besoin.
@Roles(...ROLES_LECTURE_RH)
@Controller('api/v1/rh')
export class RhController {
  constructor(private readonly rhService: RhService) {}

  // ─── Stats ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Statistiques RH' })
  // Agrégats non nominatifs, affichés sur le tableau de bord : lecture large.
  @Roles(...ROLES_LECTURE_LARGE)
  @Get('stats')
  getStats(@Request() req: any) {
    return this.rhService.getStats(req.user.organisationId);
  }

  // ─── Employés ─────────────────────────────────────────────

  @ApiOperation({ summary: 'Liste des employés' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'actif', required: false })
  @Get('employes')
  findAllEmployes(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('actif') actif?: string,
  ) {
    return this.rhService.findAllEmployes(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      actif: actif !== undefined ? actif === 'true' : undefined,
    });
  }

  @ApiOperation({ summary: 'Détail d\'un employé' })
  @Get('employes/:id')
  findOneEmploye(@Param('id') id: string, @Request() req: any) {
    return this.rhService.findOneEmploye(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Créer un employé' })
  @Roles(...ROLES_ECRITURE_RH)
  @Post('employes')
  createEmploye(@Request() req: any, @Body() dto: CreateEmployeDto) {
    return this.rhService.createEmploye(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Modifier un employé' })
  @Roles(...ROLES_ECRITURE_RH)
  @Put('employes/:id')
  updateEmploye(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateEmployeDto>,
  ) {
    return this.rhService.updateEmploye(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Supprimer un employé' })
  @Roles(...ROLES_ECRITURE_RH)
  @Delete('employes/:id')
  deleteEmploye(@Param('id') id: string, @Request() req: any) {
    return this.rhService.deleteEmploye(id, req.user.organisationId);
  }

  // ─── Fiches de paie ───────────────────────────────────────

  @ApiOperation({ summary: 'Fiches de paie d\'un employé' })
  @Get('employes/:id/fiches-paie')
  getFichesPaie(@Param('id') id: string, @Request() req: any) {
    return this.rhService.getFichesPaie(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Générer une fiche de paie' })
  @Roles(...ROLES_ECRITURE_RH)
  @Post('employes/:id/fiches-paie/:periode')
  genererFichePaie(
    @Param('id') id: string,
    @Param('periode') periode: string,
    @Request() req: any,
    @Body() dto: GenererFichePaieDto,
  ) {
    return this.rhService.genererFichePaie(id, req.user.organisationId, periode, dto);
  }

  @ApiOperation({ summary: 'Valider une fiche de paie' })
  @Roles(...ROLES_ECRITURE_RH)
  @Patch('fiches-paie/:id/valider')
  validerFichePaie(@Param('id') id: string, @Request() req: any) {
    return this.rhService.validerFichePaie(id, req.user.organisationId);
  }

  // ─── Congés ───────────────────────────────────────────────
  //
  // Deux points d'entrée volontairement distincts :
  //  • `/mes-conges`          → self-service, employé déduit du jeton, ouvert large ;
  //  • `/employes/:id/conges` → dépôt/consultation pour un tiers, réservé RH.
  // Dans les deux cas l'employé ciblé est vérifié comme appartenant à
  // l'organisation du jeton.

  @ApiOperation({ summary: 'Mes congés (utilisateur connecté)' })
  @Roles(...ROLES_LECTURE_LARGE)
  @Get('mes-conges')
  getMesConges(@Request() req: any) {
    return this.rhService.getMesConges(req.user);
  }

  @ApiOperation({ summary: 'Déposer ma propre demande de congé' })
  // Self-service : aucun `:id` accepté, l'employé est résolu depuis le jeton.
  // Un utilisateur ne peut donc déposer que pour lui-même.
  @Roles(...ROLES_LECTURE_LARGE)
  @Post('mes-conges')
  demanderMonConge(@Request() req: any, @Body() dto: DemanderCongeDto) {
    return this.rhService.demanderMonConge(req.user, dto);
  }

  @ApiOperation({ summary: 'Congés d\'un employé' })
  @Get('employes/:id/conges')
  getConges(@Param('id') id: string, @Request() req: any) {
    return this.rhService.getConges(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Demander un congé au nom d\'un employé (RH)' })
  @Roles(...ROLES_ECRITURE_RH)
  @Post('employes/:id/conges')
  demanderConge(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: DemanderCongeDto,
  ) {
    return this.rhService.demanderConge(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Approuver un congé' })
  @Roles(...ROLES_ECRITURE_RH)
  @Patch('conges/:id/approuver')
  approuverConge(@Param('id') id: string, @Request() req: any) {
    return this.rhService.approuverConge(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Rejeter un congé' })
  @Roles(...ROLES_ECRITURE_RH)
  @Patch('conges/:id/rejeter')
  rejeterConge(@Param('id') id: string, @Request() req: any) {
    return this.rhService.rejeterConge(id, req.user.organisationId);
  }

  // ─── Volontaires ──────────────────────────────────────────

  @ApiOperation({ summary: 'Liste des volontaires' })
  // Donnée peu sensible et utile aux équipes projet : lecture large.
  @Roles(...ROLES_LECTURE_LARGE)
  @Get('volontaires')
  findAllVolontaires(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.rhService.findAllVolontaires(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Créer un volontaire' })
  @Roles(...ROLES_ECRITURE_RH)
  @Post('volontaires')
  createVolontaire(@Request() req: any, @Body() dto: CreateVolontaireDto) {
    return this.rhService.createVolontaire(req.user.organisationId, dto);
  }
}
