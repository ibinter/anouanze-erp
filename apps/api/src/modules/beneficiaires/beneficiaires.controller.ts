import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BeneficiairesService } from './beneficiaires.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ECRITURE_PROJET,
  ROLES_LECTURE_LARGE,
} from '../../common/constants/roles-groupes';

@ApiTags('beneficiaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : lecture ouverte à tous les rôles ; chaque écriture redéclare @Roles.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/beneficiaires')
export class BeneficiairesController {
  constructor(private readonly beneficiairesService: BeneficiairesService) {}

  @ApiOperation({ summary: 'Liste des bénéficiaires' })
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
    return this.beneficiairesService.findAll(req.user.organisationId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Créer un bénéficiaire' })
  @Roles(...ROLES_ECRITURE_PROJET)
  @Post()
  create(@Request() req: any, @Body() dto: any) {
    return this.beneficiairesService.create(req.user.organisationId, dto);
  }

  @ApiOperation({ summary: 'Détail d\'un bénéficiaire' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beneficiairesService.findOne(id);
  }
}
