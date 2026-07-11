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
import { RhService } from './rh.service';
import { CreateEmployeDto } from './dto/create-employe.dto';
import { GenererFichePaieDto } from './dto/generer-fiche-paie.dto';
import { DemanderCongeDto } from './dto/demander-conge.dto';
import { CreateVolontaireDto } from './dto/create-volontaire.dto';

@ApiTags('rh')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/rh')
export class RhController {
  constructor(private readonly rhService: RhService) {}

  // ─── Stats ────────────────────────────────────────────────

  @ApiOperation({ summary: 'Statistiques RH' })
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
  @Post('employes')
  createEmploye(@Request() req: any, @Body() dto: CreateEmployeDto) {
    return this.rhService.createEmploye(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Modifier un employé' })
  @Put('employes/:id')
  updateEmploye(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateEmployeDto>,
  ) {
    return this.rhService.updateEmploye(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Supprimer un employé' })
  @Delete('employes/:id')
  deleteEmploye(@Param('id') id: string, @Request() req: any) {
    return this.rhService.deleteEmploye(id, req.user.organisationId);
  }

  // ─── Fiches de paie ───────────────────────────────────────

  @ApiOperation({ summary: 'Fiches de paie d\'un employé' })
  @Get('employes/:id/fiches-paie')
  getFichesPaie(@Param('id') id: string) {
    return this.rhService.getFichesPaie(id);
  }

  @ApiOperation({ summary: 'Générer une fiche de paie' })
  @Post('employes/:id/fiches-paie/:periode')
  genererFichePaie(
    @Param('id') id: string,
    @Param('periode') periode: string,
    @Body() dto: GenererFichePaieDto,
  ) {
    return this.rhService.genererFichePaie(id, periode, dto);
  }

  @ApiOperation({ summary: 'Valider une fiche de paie' })
  @Patch('fiches-paie/:id/valider')
  validerFichePaie(@Param('id') id: string) {
    return this.rhService.validerFichePaie(id);
  }

  // ─── Congés ───────────────────────────────────────────────

  @ApiOperation({ summary: 'Congés d\'un employé' })
  @Get('employes/:id/conges')
  getConges(@Param('id') id: string) {
    return this.rhService.getConges(id);
  }

  @ApiOperation({ summary: 'Demander un congé' })
  @Post('employes/:id/conges')
  demanderConge(@Param('id') id: string, @Body() dto: DemanderCongeDto) {
    return this.rhService.demanderConge(id, dto);
  }

  @ApiOperation({ summary: 'Approuver un congé' })
  @Patch('conges/:id/approuver')
  approuverConge(@Param('id') id: string) {
    return this.rhService.approuverConge(id);
  }

  @ApiOperation({ summary: 'Rejeter un congé' })
  @Patch('conges/:id/rejeter')
  rejeterConge(@Param('id') id: string) {
    return this.rhService.rejeterConge(id);
  }

  // ─── Volontaires ──────────────────────────────────────────

  @ApiOperation({ summary: 'Liste des volontaires' })
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
  @Post('volontaires')
  createVolontaire(@Request() req: any, @Body() dto: CreateVolontaireDto) {
    return this.rhService.createVolontaire(req.user.organisationId, dto);
  }
}
