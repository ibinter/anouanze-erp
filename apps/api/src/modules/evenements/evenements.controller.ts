import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EvenementsService } from './evenements.service';
import { CreateEvenementDto } from './dto/create-evenement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_ECRITURE_OPERATIONNELLE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('evenements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/evenements')
export class EvenementsController {
  constructor(private readonly evenementsService: EvenementsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des événements' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'dateDebut', required: false })
  @ApiQuery({ name: 'dateFin', required: false })
  findAll(
    @Request() req,
    @Query('type') type?: string,
    @Query('statut') statut?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.evenementsService.findAll(req.user.organisationId, { type, statut, dateDebut, dateFin });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un événement' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.evenementsService.findOne(id, req.user.organisationId);
  }

  @Post()
  @Roles(...ROLES_ECRITURE_OPERATIONNELLE)
  @ApiOperation({ summary: 'Créer un événement' })
  create(@Request() req, @Body() dto: CreateEvenementDto) {
    return this.evenementsService.create(req.user.organisationId, dto);
  }

  @Patch(':id')
  @Roles(...ROLES_ECRITURE_OPERATIONNELLE)
  @ApiOperation({ summary: 'Modifier un événement' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateEvenementDto>) {
    return this.evenementsService.update(id, req.user.organisationId, dto);
  }

  @Delete(':id')
  @Roles(...ROLES_ADMIN)
  @ApiOperation({ summary: 'Supprimer un événement' })
  delete(@Param('id') id: string, @Request() req) {
    return this.evenementsService.delete(id, req.user.organisationId);
  }

  @Post(':id/inscrire')
  // Auto-inscription : volontairement ouverte à tous les rôles (défaut du contrôleur).
  @ApiOperation({ summary: 'S\'inscrire à un événement' })
  inscrire(@Param('id') id: string, @Request() req) {
    return this.evenementsService.inscrire(id, req.user.membreId ?? req.user.id);
  }

  @Get(':id/inscrits')
  @ApiOperation({ summary: 'Liste des inscrits' })
  getInscrits(@Param('id') id: string): Promise<any> {
    return this.evenementsService.getInscrits(id);
  }

  @Post(':id/presence/:membreId')
  @Roles(...ROLES_ECRITURE_OPERATIONNELLE)
  @ApiOperation({ summary: 'Marquer la présence d\'un membre' })
  marquerPresence(@Param('id') id: string, @Param('membreId') membreId: string) {
    return this.evenementsService.marquerPresence(id, membreId);
  }
}
