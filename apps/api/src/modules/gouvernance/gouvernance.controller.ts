import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GouvernanceService } from './gouvernance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMIN,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { StatutResolution, TypeOrgane } from '@prisma/client';

@ApiTags('gouvernance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; l'écriture est réservée à la
// direction (organes, réunions et résolutions engagent l'organisation).
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/gouvernance')
export class GouvernanceController {
  constructor(private readonly service: GouvernanceService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques gouvernance' })
  getStats(@Request() req) {
    return this.service.getStats(req.user.organisationId);
  }

  @Get('organes')
  @ApiOperation({ summary: 'Liste des organes de gouvernance' })
  getOrganes(@Request() req) {
    return this.service.getOrganes(req.user.organisationId);
  }

  @Roles(...ROLES_ADMIN)
  @Post('organes')
  @ApiOperation({ summary: 'Créer un organe' })
  createOrgane(@Request() req, @Body() body: { nom: string; type?: TypeOrgane; description?: string; nbMembres?: number }) {
    return this.service.createOrgane(req.user.organisationId, body);
  }

  @Roles(...ROLES_ADMIN)
  @Patch('organes/:id')
  updateOrgane(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateOrgane(req.user.organisationId, id, body);
  }

  @Get('reunions')
  @ApiOperation({ summary: 'Liste des réunions' })
  @ApiQuery({ name: 'organeId', required: false })
  getReunions(@Request() req, @Query('organeId') organeId?: string) {
    return this.service.getReunions(req.user.organisationId, organeId);
  }

  @Roles(...ROLES_ADMIN)
  @Post('organes/:organeId/reunions')
  @ApiOperation({ summary: 'Planifier une réunion' })
  createReunion(@Param('organeId') organeId: string, @Body() body: { titre: string; dateReunion: string; lieu?: string; ordre?: string[] }) {
    return this.service.createReunion(organeId, { ...body, dateReunion: new Date(body.dateReunion) });
  }

  @Roles(...ROLES_ADMIN)
  @Patch('reunions/:id')
  updateReunion(@Param('id') id: string, @Body() body: any) {
    return this.service.updateReunion(id, body);
  }

  @Get('resolutions')
  @ApiOperation({ summary: 'Liste des résolutions' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutResolution })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getResolutions(
    @Request() req,
    @Query('statut') statut?: StatutResolution,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getResolutions(req.user.organisationId, {
      statut,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Roles(...ROLES_ADMIN)
  @Post('resolutions')
  @ApiOperation({ summary: 'Créer une résolution' })
  createResolution(@Request() req, @Body() body: any) {
    return this.service.createResolution(req.user.organisationId, body);
  }

  @Roles(...ROLES_ADMIN)
  @Patch('resolutions/:id')
  updateResolution(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateResolution(req.user.organisationId, id, body);
  }
}
