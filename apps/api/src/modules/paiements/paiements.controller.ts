import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

// Attention : les routes `webhook/*` sont volontairement publiques (appels
// entrants des agrégateurs de paiement) — ni JwtAuthGuard ni RolesGuard.
@ApiTags('paiements')
@Controller('api/v1/paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post('initier')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Initier un paiement' })
  initierPaiement(@Request() req, @Body() dto: InitierPaiementDto) {
    return this.paiementsService.initierPaiement(req.user.organisationId, dto);
  }

  @Get('statut/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_LECTURE_LARGE)
  @ApiOperation({ summary: 'Vérifier le statut d\'une transaction' })
  verifierStatut(@Param('id') id: string): Promise<any> {
    return this.paiementsService.verifierStatut(id);
  }

  @Get('configuration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_LECTURE_LARGE)
  @ApiOperation({
    summary:
      "Statut d'intégration réel des passerelles (pilote l'affichage Disponible / En intégration)",
  })
  getConfiguration(): Promise<Record<string, unknown>> {
    return this.paiementsService.getConfigurationPasserelles();
  }

  @Get('diagnostic')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: "Variables d'environnement passerelle manquantes (aucune clé exposée)" })
  getDiagnostic(): Promise<Record<string, unknown>> {
    return this.paiementsService.getDiagnosticPasserelles();
  }

  @Post('webhook/cinetpay')
  @ApiOperation({ summary: 'Webhook CinetPay' })
  webhookCinetpay(
    @Body() payload: Record<string, unknown>,
    @Headers('x-token') xToken?: string,
  ): Promise<any> {
    return this.paiementsService.webhookCinetpay(payload, xToken);
  }

  @Post('webhook/orange-money')
  @ApiOperation({ summary: 'Webhook Orange Money' })
  webhookOrangeMoney(@Body() payload: Record<string, unknown>): Promise<any> {
    return this.paiementsService.webhookOrangeMoney(payload);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_LECTURE_LARGE)
  @ApiOperation({ summary: 'Liste des transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'statut', required: false })
  getTransactions(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
    @Query('statut') statut?: string,
  ): Promise<any> {
    return this.paiementsService.getTransactions(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type,
      statut,
    });
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...ROLES_LECTURE_LARGE)
  @ApiOperation({ summary: 'Statistiques de paiement' })
  getStats(@Request() req) {
    return this.paiementsService.getStats(req.user.organisationId);
  }
}
