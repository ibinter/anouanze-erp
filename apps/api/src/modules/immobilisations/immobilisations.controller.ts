import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ImmobilisationsService } from './immobilisations.service';
import { CreateImmobilisationDto } from './dto/create-immobilisation.dto';
import { CederImmobilisationDto } from './dto/ceder-immobilisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('immobilisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/immobilisations')
export class ImmobilisationsController {
  constructor(private readonly immobilisationsService: ImmobilisationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des immobilisations avec valeur nette calculée' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categorie', required: false })
  @ApiQuery({ name: 'statut', required: false })
  findAll(@Request() req, @Query() query: Record<string, string>) {
    return this.immobilisationsService.findAll(req.user.organisationId, {
      page: query['page'] ? Number(query['page']) : 1,
      limit: query['limit'] ? Number(query['limit']) : 20,
      categorie: query['categorie'],
      statut: query['statut'],
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des immobilisations' })
  getStats(@Request() req) {
    return this.immobilisationsService.getStats(req.user.organisationId);
  }

  @Get('amortissements')
  @ApiOperation({ summary: 'Calculer les dotations aux amortissements du mois' })
  @ApiQuery({ name: 'periode', required: true, description: 'Format YYYY-MM' })
  calculerAmortissements(@Request() req, @Query('periode') periode: string) {
    return this.immobilisationsService.calculerAmortissements(req.user.organisationId, periode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une immobilisation' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.immobilisationsService.findOne(id, req.user.organisationId);
  }

  @Post()
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Enregistrer une immobilisation' })
  create(@Request() req, @Body() dto: CreateImmobilisationDto) {
    return this.immobilisationsService.create(req.user.organisationId, dto);
  }

  @Put(':id')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Modifier une immobilisation' })
  update(@Param('id') id: string, @Request() req, @Body() dto: Partial<CreateImmobilisationDto>) {
    return this.immobilisationsService.update(id, req.user.organisationId, dto);
  }

  @Post(':id/ceder')
  @Roles(...ROLES_ECRITURE_FINANCE)
  @ApiOperation({ summary: 'Enregistrer la cession d\'une immobilisation' })
  ceder(@Param('id') id: string, @Request() req, @Body() dto: CederImmobilisationDto) {
    return this.immobilisationsService.ceder(id, req.user.organisationId, dto);
  }
}
