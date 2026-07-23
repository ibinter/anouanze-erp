import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AchatsService } from './achats.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { CreateCommandeDto } from './dto/create-commande.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('achats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/achats')
export class AchatsController {
  constructor(private readonly achatsService: AchatsService) {}

  @Get('fournisseurs')
  @ApiOperation({ summary: 'Liste des fournisseurs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  findAllFournisseurs(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.achatsService.findAllFournisseurs(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @Post('fournisseurs')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Créer un fournisseur' })
  createFournisseur(@Request() req, @Body() dto: CreateFournisseurDto) {
    return this.achatsService.createFournisseur(req.user.organisationId, dto);
  }

  @Patch('fournisseurs/:id')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Modifier un fournisseur' })
  updateFournisseur(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: Partial<CreateFournisseurDto>,
  ) {
    return this.achatsService.updateFournisseur(id, req.user.organisationId, dto);
  }

  @Get('commandes')
  @ApiOperation({ summary: 'Liste des commandes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'statut', required: false })
  findAllCommandes(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('statut') statut?: string,
  ) {
    return this.achatsService.findAllCommandes(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      statut,
    });
  }

  @Get('commandes/stats')
  @ApiOperation({ summary: 'Statistiques des achats' })
  getStats(@Request() req) {
    return this.achatsService.getStats(req.user.organisationId);
  }

  @Get('commandes/:id')
  @ApiOperation({ summary: 'Détail d\'une commande' })
  findOneCommande(@Param('id') id: string, @Request() req) {
    return this.achatsService.findOneCommande(id, req.user.organisationId);
  }

  @Post('commandes')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Créer une commande' })
  createCommande(@Request() req, @Body() dto: CreateCommandeDto) {
    return this.achatsService.createCommande(req.user.organisationId, dto);
  }

  @Post('commandes/:id/valider')
  @Roles(...ROLES_ADMIN)
  @ApiOperation({ summary: 'Valider une commande' })
  validerCommande(@Param('id') id: string, @Request() req) {
    return this.achatsService.validerCommande(id, req.user.organisationId);
  }

  @Post('commandes/:id/recevoir')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Marquer une commande comme reçue' })
  recevoirCommande(@Param('id') id: string, @Request() req) {
    return this.achatsService.recevoirCommande(id, req.user.organisationId);
  }
}
