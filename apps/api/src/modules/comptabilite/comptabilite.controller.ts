import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ComptabiliteService } from './comptabilite.service';
import { CreateCompteDto } from './dto/create-compte.dto';
import { CreateJournalDto } from './dto/create-journal.dto';
import { CreateEcritureDto } from './dto/create-ecriture.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('comptabilite')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/comptabilite')
export class ComptabiliteController {
  constructor(private readonly comptabiliteService: ComptabiliteService) {}

  @Get('plan-comptable')
  @ApiOperation({ summary: 'Plan comptable SYCEBNL de l\'organisation' })
  getPlanComptable(@Request() req) {
    return this.comptabiliteService.getPlanComptable(req.user.organisationId);
  }

  @Post('plan-comptable')
  @ApiOperation({ summary: 'Créer un compte comptable' })
  createCompte(@Request() req, @Body() dto: CreateCompteDto) {
    return this.comptabiliteService.createCompte(req.user.organisationId, dto);
  }

  @Post('plan-comptable/init-sycebnl')
  @ApiOperation({ summary: 'Initialiser le plan comptable SYCEBNL standard' })
  initPlanComptable(@Request() req) {
    return this.comptabiliteService.initPlanComptableSYCEBNL(req.user.organisationId);
  }

  @Get('journaux')
  @ApiOperation({ summary: 'Liste des journaux comptables' })
  getJournaux(@Request() req) {
    return this.comptabiliteService.getJournaux(req.user.organisationId);
  }

  @Post('journaux')
  @ApiOperation({ summary: 'Créer un journal comptable' })
  createJournal(@Request() req, @Body() dto: CreateJournalDto) {
    return this.comptabiliteService.createJournal(req.user.organisationId, dto);
  }

  @Get('ecritures')
  @ApiOperation({ summary: 'Liste paginée des écritures comptables' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'journalId', required: false })
  @ApiQuery({ name: 'projetId', required: false })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  @ApiQuery({ name: 'periodeDebut', required: false })
  @ApiQuery({ name: 'periodeFin', required: false })
  getEcritures(@Request() req, @Query() query: Record<string, string>) {
    return this.comptabiliteService.getEcritures(req.user.organisationId, {
      page: query['page'] ? Number(query['page']) : 1,
      limit: query['limit'] ? Number(query['limit']) : 20,
      journalId: query['journalId'],
      projetId: query['projetId'],
      exercice: query['exercice'] ? Number(query['exercice']) : undefined,
      periodeDebut: query['periodeDebut'],
      periodeFin: query['periodeFin'],
    });
  }

  @Post('ecritures')
  @ApiOperation({ summary: 'Créer une écriture comptable' })
  createEcriture(@Request() req, @Body() dto: CreateEcritureDto) {
    return this.comptabiliteService.createEcriture(req.user.organisationId, dto);
  }

  @Post('ecritures/:id/valider')
  @ApiOperation({ summary: 'Valider une écriture comptable' })
  validerEcriture(@Param('id') id: string, @Request() req) {
    return this.comptabiliteService.validerEcriture(id, req.user.organisationId);
  }

  @Get('balance/:exercice')
  @ApiOperation({ summary: 'Balance générale des comptes' })
  getBalance(@Param('exercice', ParseIntPipe) exercice: number, @Request() req) {
    return this.comptabiliteService.getBalance(req.user.organisationId, exercice);
  }

  @Get('grand-livre/:compteId')
  @ApiOperation({ summary: 'Grand livre d\'un compte' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  @ApiQuery({ name: 'periodeDebut', required: false })
  @ApiQuery({ name: 'periodeFin', required: false })
  getGrandLivre(
    @Param('compteId') compteId: string,
    @Request() req,
    @Query() query: Record<string, string>,
  ) {
    return this.comptabiliteService.getGrandLivre(req.user.organisationId, compteId, {
      exercice: query['exercice'] ? Number(query['exercice']) : undefined,
      periodeDebut: query['periodeDebut'],
      periodeFin: query['periodeFin'],
    });
  }
}
