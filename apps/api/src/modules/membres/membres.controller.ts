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
import { MembresService } from './membres.service';
import { CreateMembreDto } from './dto/create-membre.dto';
import { CreateCotisationDto } from './dto/create-cotisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_ECRITURE_FINANCE,
  ROLES_ECRITURE_MEMBRES,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { StatutMembre } from '@prisma/client';

@ApiTags('membres')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/membres')
export class MembresController {
  constructor(private readonly membresService: MembresService) {}

  @Get()
  @ApiOperation({ summary: 'Liste paginée des membres' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'statut', required: false, enum: StatutMembre })
  findAll(@Request() req, @Query() query: Record<string, string>) {
    const organisationId: string = req.user.organisationId;
    return this.membresService.findAll(organisationId, {
      page: query['page'] ? Number(query['page']) : 1,
      limit: query['limit'] ? Number(query['limit']) : 20,
      search: query['search'],
      statut: query['statut'] as StatutMembre,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des membres' })
  getStats(@Request() req) {
    return this.membresService.getStats(req.user.organisationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un membre' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.membresService.findOne(id, req.user.organisationId);
  }

  @Post()
  @Roles(...ROLES_ECRITURE_MEMBRES)
  @ApiOperation({ summary: 'Créer un membre' })
  create(@Request() req, @Body() dto: CreateMembreDto) {
    return this.membresService.create(req.user.organisationId, dto);
  }

  @Patch(':id')
  @Roles(...ROLES_ECRITURE_MEMBRES)
  @ApiOperation({ summary: 'Modifier un membre' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateMembreDto>) {
    return this.membresService.update(id, req.user.organisationId, dto);
  }

  @Delete(':id')
  @Roles(...ROLES_ADMIN)
  @ApiOperation({ summary: 'Supprimer un membre' })
  delete(@Param('id') id: string, @Request() req) {
    return this.membresService.delete(id, req.user.organisationId);
  }

  @Get(':id/cotisations')
  @ApiOperation({ summary: 'Cotisations d\'un membre' })
  getCotisations(@Param('id') id: string) {
    return this.membresService.getCotisations(id);
  }

  @Post(':id/cotisations')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Créer une cotisation pour un membre' })
  createCotisation(@Param('id') id: string, @Body() dto: CreateCotisationDto) {
    return this.membresService.createCotisation(id, dto);
  }
}
