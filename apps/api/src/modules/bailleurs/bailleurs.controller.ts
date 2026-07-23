import {
  Controller,
  Get,
  Post,
  Put,
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
import { BailleursService } from './bailleurs.service';
import { CreateBailleurDto } from './dto/create-bailleur.dto';
import { CreateConventionDto } from './dto/create-convention.dto';
import { CreateDecaissementDto } from './dto/create-decaissement.dto';

@ApiTags('bailleurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/bailleurs')
export class BailleursController {
  constructor(private readonly bailleursService: BailleursService) {}

  @ApiOperation({ summary: 'Liste des bailleurs' })
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
    return this.bailleursService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Détail d\'un bailleur' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.bailleursService.findOne(id, req.user.organisationId);
  }

  @ApiOperation({ summary: 'Créer un bailleur' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post()
  create(@Request() req: any, @Body() dto: CreateBailleurDto) {
    return this.bailleursService.create(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Modifier un bailleur' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: Partial<CreateBailleurDto>,
  ) {
    return this.bailleursService.update(id, req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Conventions d\'un bailleur' })
  @Get(':id/conventions')
  getConventions(@Param('id') id: string) {
    return this.bailleursService.getConventions(id);
  }

  @ApiOperation({ summary: 'Créer une convention' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post(':id/conventions')
  createConvention(@Param('id') id: string, @Body() dto: CreateConventionDto) {
    return this.bailleursService.createConvention(id, dto);
  }

  @ApiOperation({ summary: 'Décaissements d\'une convention' })
  @Get('conventions/:conventionId/decaissements')
  getDecaissements(@Param('conventionId') conventionId: string) {
    return this.bailleursService.getDecaissements(conventionId);
  }

  @ApiOperation({ summary: 'Créer un décaissement' })
  @Roles(...ROLES_ECRITURE_FINANCE)
  @Post('conventions/:conventionId/decaissements')
  createDecaissement(
    @Param('conventionId') conventionId: string,
    @Body() dto: CreateDecaissementDto,
  ) {
    return this.bailleursService.createDecaissement(conventionId, dto);
  }

  @ApiOperation({ summary: 'Taux de justification d\'une convention' })
  @Get('conventions/:conventionId/justification')
  getTauxJustification(@Param('conventionId') conventionId: string) {
    return this.bailleursService.getTauxJustification(conventionId);
  }
}
