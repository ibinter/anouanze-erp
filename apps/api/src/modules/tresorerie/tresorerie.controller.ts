import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { TresorerieService } from './tresorerie.service';
import { CreateCompteBancaireDto } from './dto/create-compte-bancaire.dto';
import { CreateMouvementDto } from './dto/create-mouvement.dto';

@ApiTags('tresorerie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/tresorerie')
export class TresorerieController {
  constructor(private readonly tresorerieService: TresorerieService) {}

  @ApiOperation({ summary: 'Situation de trésorerie' })
  @Get('situation')
  getSituationTresorerie(@Request() req: any) {
    return this.tresorerieService.getSituationTresorerie(req.user.organisationId);
  }

  @ApiOperation({ summary: 'Liste des comptes bancaires' })
  @Get('comptes')
  getComptesBancaires(@Request() req: any) {
    return this.tresorerieService.getComptesBancaires(req.user.organisationId);
  }

  @ApiOperation({ summary: 'Créer un compte bancaire' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post('comptes')
  createCompteBancaire(@Request() req: any, @Body() dto: CreateCompteBancaireDto) {
    return this.tresorerieService.createCompteBancaire(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Solde d\'un compte' })
  @Get('comptes/:id/solde')
  getSolde(@Param('id') id: string) {
    return this.tresorerieService.getSolde(id);
  }

  @ApiOperation({ summary: 'Mouvements d\'un compte' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'dateDebut', required: false })
  @ApiQuery({ name: 'dateFin', required: false })
  @Get('comptes/:id/mouvements')
  getMouvements(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.tresorerieService.getMouvements(id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      dateDebut,
      dateFin,
    });
  }

  @ApiOperation({ summary: 'Créer un mouvement bancaire' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post('comptes/:id/mouvements')
  createMouvement(@Param('id') id: string, @Body() dto: CreateMouvementDto) {
    return this.tresorerieService.createMouvement(id, dto);
  }

  @ApiOperation({ summary: 'Rapprocher un mouvement' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Patch('mouvements/:id/rapprocher')
  rapprocher(@Param('id') id: string) {
    return this.tresorerieService.rapprocher(id);
  }
}
