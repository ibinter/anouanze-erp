import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des logs d\'audit' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'ressource', required: false })
  @ApiQuery({ name: 'utilisateurId', required: false })
  @ApiQuery({ name: 'dateDebut', required: false })
  @ApiQuery({ name: 'dateFin', required: false })
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('action') action?: string,
    @Query('ressource') ressource?: string,
    @Query('utilisateurId') utilisateurId?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.auditService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      action,
      ressource,
      utilisateurId,
      dateDebut,
      dateFin,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques d\'audit du mois' })
  getStats(@Request() req) {
    return this.auditService.getStats(req.user.organisationId);
  }
}
