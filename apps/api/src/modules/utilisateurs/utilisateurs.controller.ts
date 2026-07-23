import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UtilisateursService } from './utilisateurs.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { InviterUtilisateurDto } from './dto/inviter-utilisateur.dto';
import { ChangerRoleDto } from './dto/changer-role.dto';
import { ChangerStatutDto } from './dto/changer-statut.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RoleUtilisateur } from '@prisma/client';

interface UtilisateurToken {
  id: string;
  email: string;
  organisationId?: string;
  role?: RoleUtilisateur;
}

@ApiTags('utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/utilisateurs')
export class UtilisateursController {
  constructor(private readonly service: UtilisateursService) {}

  // ─── Administration des membres de l'organisation courante ───
  // Déclarées AVANT `:id` pour éviter toute collision de routing.
  // Cloisonnement : organisationId issu du jeton uniquement, jamais du client.

  @ApiOperation({ summary: "Lister les membres de l'organisation courante" })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Get('organisation/membres')
  listerMembres(@CurrentUser() auteur: UtilisateurToken) {
    // organisationId lu dans le jeton uniquement (pas d'en-tête x-organisation-id)
    return this.service.listerMembresOrganisation(auteur?.organisationId);
  }

  @ApiOperation({
    summary: "Matrice rôle × permissions réellement appliquée par l'API",
  })
  @Get('organisation/matrice-permissions')
  matricePermissions() {
    return this.service.getMatricePermissions();
  }

  @ApiOperation({ summary: "Inviter un utilisateur dans l'organisation" })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Post('organisation/inviter')
  inviter(
    @Body() dto: InviterUtilisateurDto,
    @CurrentUser() auteur: UtilisateurToken,
  ) {
    return this.service.inviterDansOrganisation(dto, auteur);
  }

  @ApiOperation({ summary: "Modifier le rôle d'un membre" })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Patch('organisation/membres/:id/role')
  changerRole(
    @Param('id') id: string,
    @Body() dto: ChangerRoleDto,
    @CurrentUser() auteur: UtilisateurToken,
  ) {
    return this.service.changerRoleDansOrganisation(id, dto.role, auteur);
  }

  @ApiOperation({ summary: "Activer ou désactiver l'accès d'un membre" })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Patch('organisation/membres/:id/statut')
  changerStatut(
    @Param('id') id: string,
    @Body() dto: ChangerStatutDto,
    @CurrentUser() auteur: UtilisateurToken,
  ) {
    return this.service.changerStatutDansOrganisation(id, dto.actif, auteur);
  }

  // ─── Routes existantes ───

  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUtilisateurDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Changer le mot de passe' })
  @Post(':id/changer-mot-de-passe')
  changerMotDePasse(
    @Param('id') id: string,
    @Body() dto: ChangerMotDePasseDto,
  ) {
    return this.service.changerMotDePasse(id, dto);
  }

  @ApiOperation({ summary: 'Organisations de l\'utilisateur' })
  @Get(':id/organisations')
  getOrganisations(@Param('id') id: string) {
    return this.service.getOrganisations(id);
  }

  @ApiOperation({ summary: 'Assigner une organisation à l\'utilisateur' })
  @Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
  @Post(':id/organisations/:orgId')
  assignerOrganisation(
    @Param('id') id: string,
    @Param('orgId') orgId: string,
    @Body('role') role: RoleUtilisateur,
  ) {
    return this.service.assignerOrganisation(id, orgId, role);
  }
}
