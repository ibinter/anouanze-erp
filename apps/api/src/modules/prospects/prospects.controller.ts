import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatutProspect } from '@prisma/client';
import { ProspectsService } from './prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { AjouterNoteProspectDto, ChangerStatutProspectDto } from './dto/update-prospect.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleUtilisateur } from '@prisma/client';

/**
 * Dépôt public d'une demande de démonstration.
 * Contrôleur séparé : **aucun garde JWT** (appelé par la landing page).
 */
@ApiTags('prospects')
@Controller('api/v1/prospects')
export class ProspectsPublicController {
  constructor(private readonly service: ProspectsService) {}

  @Post()
  @ApiOperation({ summary: 'Déposer une demande de démonstration (public, sans authentification)' })
  creer(@Body() dto: CreateProspectDto) {
    return this.service.creer(dto);
  }
}

/**
 * Gestion commerciale des prospects — réservée aux administrateurs.
 */
@ApiTags('prospects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.SUPER_ADMIN, RoleUtilisateur.ADMIN_ORGANISATION)
@Controller('api/v1/prospects')
export class ProspectsController {
  constructor(private readonly service: ProspectsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister et filtrer les prospects' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutProspect })
  @ApiQuery({ name: 'recherche', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  lister(
    @Query('statut') statut?: StatutProspect,
    @Query('recherche') recherche?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.lister({
      statut,
      recherche,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Répartition des prospects par statut' })
  stats() {
    return this.service.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un prospect" })
  getProspect(@Param('id') id: string) {
    return this.service.getProspect(id);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: "Changer le statut d'un prospect" })
  changerStatut(@Param('id') id: string, @Body() dto: ChangerStatutProspectDto) {
    return this.service.changerStatut(id, dto.statut, dto.note);
  }

  @Patch(':id/note')
  @ApiOperation({ summary: 'Ajouter une note au prospect' })
  ajouterNote(@Param('id') id: string, @Body() dto: AjouterNoteProspectDto) {
    return this.service.ajouterNote(id, dto.note);
  }
}
