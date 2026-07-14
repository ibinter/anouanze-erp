import { Controller, Get, Post, Patch, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatutTicket, PrioriteTicket } from '@prisma/client';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Mes tickets support' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutTicket })
  @ApiQuery({ name: 'page', required: false })
  lister(@Request() req, @Query('statut') statut?: StatutTicket, @Query('page') page?: string) {
    return this.service.listerTickets(req.user.id, req.user.organisationId, { statut, page: page ? parseInt(page) : undefined });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques de mes tickets' })
  stats(@Request() req) {
    return this.service.getStats(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un ticket' })
  getTicket(@Param('id') id: string) {
    return this.service.getTicket(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un ticket support' })
  creer(
    @Request() req,
    @Body() body: { sujet: string; description: string; categorie?: string; priorite?: PrioriteTicket },
  ) {
    return this.service.creerTicket(req.user.id, req.user.organisationId, body);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Ajouter un message au ticket' })
  ajouterMessage(@Request() req, @Param('id') id: string, @Body() body: { contenu: string }) {
    const auteur = `${req.user.prenom ?? ''} ${req.user.nom ?? ''}`.trim() || req.user.email;
    return this.service.ajouterMessage(id, body.contenu, auteur, false);
  }

  @Patch(':id/statut')
  @ApiOperation({ summary: 'Changer le statut d\'un ticket' })
  changerStatut(@Param('id') id: string, @Body('statut') statut: StatutTicket) {
    return this.service.changerStatut(id, statut);
  }
}
