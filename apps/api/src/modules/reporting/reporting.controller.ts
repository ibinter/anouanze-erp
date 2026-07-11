import {
  Controller,
  Get,
  Query,
  Request,
  Res,
  UseGuards,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/reporting')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('tableau-bord')
  @ApiOperation({ summary: 'Tableau de bord agrégé' })
  getTableauBord(@Request() req) {
    return this.reportingService.getTableauBord(req.user.organisationId);
  }

  @Get('depenses-par-mois')
  @ApiOperation({ summary: 'Dépenses mensuelles par exercice' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  getDepensesParMois(@Request() req, @Query('exercice') exercice?: string) {
    return this.reportingService.getDepensesParMois(
      req.user.organisationId,
      exercice ? Number(exercice) : new Date().getFullYear(),
    );
  }

  @Get('depenses-par-projet')
  @ApiOperation({ summary: 'Dépenses par projet' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  getDepensesParProjet(@Request() req, @Query('exercice') exercice?: string) {
    return this.reportingService.getDepensesParProjet(
      req.user.organisationId,
      exercice ? Number(exercice) : new Date().getFullYear(),
    );
  }

  @Get('depenses-par-bailleur')
  @ApiOperation({ summary: 'Dépenses par bailleur' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  getDepensesParBailleur(@Request() req, @Query('exercice') exercice?: string) {
    return this.reportingService.getDepensesParBailleur(
      req.user.organisationId,
      exercice ? Number(exercice) : new Date().getFullYear(),
    );
  }

  @Get('rapport-financier')
  @ApiOperation({ summary: 'Compte de résultat simplifié' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  getRapportFinancier(@Request() req, @Query('exercice') exercice?: string) {
    return this.reportingService.getRapportFinancier(
      req.user.organisationId,
      exercice ? Number(exercice) : new Date().getFullYear(),
    );
  }

  @Get('bilan')
  @ApiOperation({ summary: 'Bilan simplifié actif/passif' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  getBilanSimplifie(@Request() req, @Query('exercice') exercice?: string) {
    return this.reportingService.getBilanSimplifie(
      req.user.organisationId,
      exercice ? Number(exercice) : new Date().getFullYear(),
    );
  }

  @Get('export/pdf/:type')
  @ApiOperation({ summary: 'Exporter un rapport en PDF' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  async exportPDF(
    @Param('type') type: string,
    @Request() req,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const { exercice, ...rest } = query;
    const params: Record<string, unknown> = { ...rest };
    if (exercice) params['exercice'] = Number(exercice);

    const buffer = await this.reportingService.exporterRapportPDF(req.user.organisationId, type, params);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="rapport-${type}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('export/excel/:type')
  @ApiOperation({ summary: 'Exporter un rapport en Excel' })
  @ApiQuery({ name: 'exercice', required: false, type: Number })
  async exportExcel(
    @Param('type') type: string,
    @Request() req,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const { exercice, ...rest } = query;
    const params: Record<string, unknown> = { ...rest };
    if (exercice) params['exercice'] = Number(exercice);

    const buffer = await this.reportingService.exporterExcel(req.user.organisationId, type, params);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="rapport-${type}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
