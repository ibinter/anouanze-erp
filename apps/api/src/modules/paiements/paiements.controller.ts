import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaiementsService } from './paiements.service';
import { InitierPaiementDto } from './dto/initier-paiement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('paiements')
@Controller('api/v1/paiements')
export class PaiementsController {
  constructor(private readonly paiementsService: PaiementsService) {}

  @Post('initier')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Initier un paiement' })
  initierPaiement(@Request() req, @Body() dto: InitierPaiementDto) {
    return this.paiementsService.initierPaiement(req.user.organisationId, dto);
  }

  @Get('statut/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Vérifier le statut d\'une transaction' })
  verifierStatut(@Param('id') id: string): Promise<any> {
    return this.paiementsService.verifierStatut(id);
  }

  @Post('webhook/cinetpay')
  @ApiOperation({ summary: 'Webhook CinetPay' })
  webhookCinetpay(@Body() payload: Record<string, unknown>) {
    return this.paiementsService.webhookCinetpay(payload);
  }

  @Post('webhook/orange-money')
  @ApiOperation({ summary: 'Webhook Orange Money' })
  webhookOrangeMoney(@Body() payload: Record<string, unknown>) {
    return this.paiementsService.webhookOrangeMoney(payload);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Statistiques de paiement' })
  getStats(@Request() req) {
    return this.paiementsService.getStats(req.user.organisationId);
  }
}
