import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleUtilisateur } from '@prisma/client';
import { AbonnementsService } from './abonnements.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import {
  ChangerPlanDto,
  ChangerStatutFactureDto,
  GenererFactureDto,
  UpdateAbonnementDto,
} from './dto/abonnement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface UtilisateurToken {
  id: string;
  email: string;
  organisationId?: string;
  role?: RoleUtilisateur;
  roles?: RoleUtilisateur[];
}

function estSuperAdmin(u?: UtilisateurToken): boolean {
  const roles = u?.roles ?? (u?.role ? [u.role] : []);
  return roles.includes(RoleUtilisateur.SUPER_ADMIN);
}

@ApiTags('abonnements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/abonnements')
export class AbonnementsController {
  constructor(private readonly service: AbonnementsService) {}

  // ─── Catalogue des plans ───
  // Routes littérales déclarées avant les routes paramétrées.

  @ApiOperation({ summary: 'Catalogue des formules commercialisées' })
  @ApiQuery({ name: 'tous', required: false, description: 'Inclure les plans désactivés (SUPER_ADMIN)' })
  @Get('plans')
  listerPlans(@Query('tous') tous: string | undefined, @CurrentUser() auteur: UtilisateurToken) {
    return this.service.listerPlans(tous === 'true' && estSuperAdmin(auteur));
  }

  @ApiOperation({ summary: 'Créer une formule' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Post('plans')
  creerPlan(@Body() dto: CreatePlanDto) {
    return this.service.creerPlan(dto);
  }

  @ApiOperation({ summary: 'Modifier une formule' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Patch('plans/:id')
  modifierPlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.service.modifierPlan(id, dto);
  }

  @ApiOperation({ summary: 'Désactiver une formule (jamais de suppression physique)' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Delete('plans/:id')
  desactiverPlan(@Param('id') id: string) {
    return this.service.desactiverPlan(id);
  }

  // ─── Abonnement de l'organisation courante ───
  // Cloisonnement : organisationId issu du jeton uniquement.

  @ApiOperation({ summary: "Abonnement courant de l'organisation + consommation des sièges" })
  @Get('courant')
  courant(@CurrentUser() auteur: UtilisateurToken) {
    return this.service.abonnementCourant(auteur?.organisationId);
  }

  @ApiOperation({ summary: "Factures de l'organisation courante" })
  @Get('factures')
  factures(@CurrentUser() auteur: UtilisateurToken) {
    return this.service.listerFactures(auteur?.organisationId);
  }

  @ApiOperation({ summary: 'Détail d\'une facture' })
  @Get('factures/:id')
  facture(@Param('id') id: string, @CurrentUser() auteur: UtilisateurToken) {
    // Un SUPER_ADMIN peut consulter toute facture ; les autres, uniquement les leurs.
    return this.service.getFacture(id, estSuperAdmin(auteur) ? undefined : auteur?.organisationId);
  }

  @ApiOperation({ summary: 'Changer la formule de l\'organisation' })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Post('changer-plan')
  changerPlan(@Body() dto: ChangerPlanDto, @CurrentUser() auteur: UtilisateurToken) {
    // Seul un SUPER_ADMIN peut viser une autre organisation que la sienne.
    const cible = estSuperAdmin(auteur) && dto.organisationId
      ? dto.organisationId
      : auteur?.organisationId;
    return this.service.changerPlan(dto, cible);
  }

  // ─── Supervision (SUPER_ADMIN) ───

  @ApiOperation({ summary: 'MRR réel et indicateurs d\'abonnement' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Get('statistiques')
  statistiques() {
    return this.service.statistiques();
  }

  @ApiOperation({ summary: 'Lister tous les abonnements' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Get()
  lister() {
    return this.service.listerAbonnements();
  }

  @ApiOperation({ summary: 'Générer la facture d\'un abonnement' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Post(':id/factures')
  genererFacture(@Param('id') id: string, @Body() dto: GenererFactureDto) {
    return this.service.genererFacture(id, dto);
  }

  @ApiOperation({ summary: 'Mettre à jour un abonnement (statut, renouvellement)' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Patch(':id')
  modifier(@Param('id') id: string, @Body() dto: UpdateAbonnementDto) {
    return this.service.modifierAbonnement(id, dto);
  }

  @ApiOperation({ summary: 'Changer le statut d\'une facture (émission, encaissement)' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Patch('factures/:id/statut')
  changerStatutFacture(@Param('id') id: string, @Body() dto: ChangerStatutFactureDto) {
    return this.service.changerStatutFacture(id, dto);
  }
}
