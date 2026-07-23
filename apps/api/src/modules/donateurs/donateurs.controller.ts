import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_FINANCE,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';
import { DonateursService } from './donateurs.service';
import { CreateDonateurDto } from './dto/create-donateur.dto';
import { CreateDonDto } from './dto/create-don.dto';

@ApiTags('donateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/donateurs')
export class DonateursController {
  constructor(private readonly donateursService: DonateursService) {}

  @ApiOperation({ summary: 'Statistiques donateurs' })
  @Get('stats')
  getStats(@Request() req: any) {
    return this.donateursService.getStats(req.user.organisationId);
  }

  @ApiOperation({ summary: 'Liste des donateurs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.donateursService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Détail d\'un donateur' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.donateursService.findOne(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Créer un donateur' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post()
  create(@Request() req: any, @Body() dto: CreateDonateurDto) {
    return this.donateursService.create(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Modifier un donateur' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateDonateurDto>,
  ) {
    return this.donateursService.update(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Historique des dons d\'un donateur' })
  @Get(':id/dons')
  getDons(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.donateursService.getDons(id, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @ApiOperation({ summary: 'Enregistrer un don' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post(':id/dons')
  createDon(@Param('id') id: string, @Body() dto: CreateDonDto) {
    return this.donateursService.createDon(id, dto);
  }

  @ApiOperation({ summary: 'Générer un reçu de don' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Patch('dons/:donId/recu')
  genererRecu(@Param('donId') donId: string) {
    return this.donateursService.genererRecu(donId);
  }
}
