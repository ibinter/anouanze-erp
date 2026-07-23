import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsRestService } from './notifications-rest.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypeNotification } from '@prisma/client';
import { MajPreferencesNotificationDto } from './dto/preferences-notification.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsRestController {
  constructor(private readonly service: NotificationsRestService) {}

  @Get()
  @ApiOperation({ summary: 'Mes notifications' })
  @ApiQuery({ name: 'lue', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getNotifications(
    @Request() req,
    @Query('lue') lue?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getNotifications(req.user.id, {
      lue: lue !== undefined ? lue === 'true' : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('non-lues/count')
  @ApiOperation({ summary: 'Nombre de notifications non lues (cloche du header)' })
  compterNonLues(@Request() req) {
    return this.service.compterNonLues(req.user.id);
  }

  @Get('apercu')
  @ApiOperation({ summary: 'Aperçu des dernières notifications (panneau de la cloche)' })
  @ApiQuery({ name: 'limit', required: false })
  apercu(@Request() req, @Query('limit') limit?: string) {
    return this.service.apercu(req.user.id, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Préférences de notification de l\'utilisateur' })
  getPreferences(@Request() req) {
    return this.service.getPreferences(req.user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Modifier mes préférences de notification' })
  majPreferences(@Request() req, @Body() dto: MajPreferencesNotificationDto) {
    return this.service.majPreferences(req.user.id, dto.preferences);
  }

  @Patch(':id/lue')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  marquerLue(@Request() req, @Param('id') id: string) {
    return this.service.marquerLue(req.user.id, id);
  }

  @Patch('marquer-toutes-lues')
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  marquerToutesLues(@Request() req) {
    return this.service.marquerToutesLues(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  supprimer(@Request() req, @Param('id') id: string) {
    return this.service.supprimerNotification(req.user.id, id);
  }

  @Post('diffuser')
  @ApiOperation({ summary: 'Diffuser une notification à toute l\'organisation' })
  diffuser(
    @Request() req,
    @Body() body: { type: TypeNotification; titre: string; message: string; lien?: string },
  ) {
    return this.service.diffuserOrganisation(req.user.organisationId, body);
  }
}
