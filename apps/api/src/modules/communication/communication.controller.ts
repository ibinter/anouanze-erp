import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { EnvoyerNotificationDto } from './dto/envoyer-notification.dto';
import { EnvoyerEmailMasseDto } from './dto/envoyer-email-masse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_OPERATIONNELLE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : consultation de ses propres notifications/annonces, tous rôles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Post('notifications')
  @Roles(...ROLES_ECRITURE_OPERATIONNELLE)
  @ApiOperation({ summary: 'Envoyer une notification à des utilisateurs' })
  envoyerNotification(@Request() req, @Body() dto: EnvoyerNotificationDto) {
    return this.communicationService.envoyerNotification(req.user.organisationId, dto);
  }

  @Post('email-masse')
  @Roles(...ROLES_ECRITURE_OPERATIONNELLE)
  @ApiOperation({ summary: 'Envoyer un email en masse' })
  envoyerEmailMasse(@Request() req, @Body() dto: EnvoyerEmailMasseDto) {
    return this.communicationService.envoyerEmailMasse(req.user.organisationId, dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Mes notifications' })
  getNotifications(@Request() req): Promise<any> {
    return this.communicationService.getNotifications(req.user.id, req.user.organisationId);
  }

  @Patch('notifications/:id/lue')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  marquerLue(@Param('id') id: string, @Request() req) {
    return this.communicationService.marquerLue(id, req.user.id);
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Annonces publiques de l\'organisation' })
  getAnnonces(@Request() req) {
    return this.communicationService.getAnnonces(req.user.organisationId);
  }
}
