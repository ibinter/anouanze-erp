import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { OrganisationsService } from './organisations.service';
import { CreateOrganisationDto } from './dto/create-organisation.dto';
import { UpdateOrganisationDto } from './dto/update-organisation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ROLES_ADMINISTRATION,
  ROLES_LECTURE_LARGE,
  ROLES_SUPER_ADMIN,
} from '../../common/constants/roles-groupes';

@ApiTags('organisations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
// Défaut : consultation de sa propre organisation ouverte à tous les rôles.
// Le cycle de vie des organisations relève de la console SUPER_ADMIN.
@Roles(...ROLES_LECTURE_LARGE)
@Controller('api/v1/organisations')
export class OrganisationsController {
  constructor(private readonly service: OrganisationsService) {}

  @ApiOperation({ summary: 'Créer une organisation' })
  @Roles(...ROLES_SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateOrganisationDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Lister les organisations' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  // Liste inter-organisations : console SUPER_ADMIN uniquement.
  @Roles(...ROLES_SUPER_ADMIN)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    });
  }

  @ApiOperation({ summary: 'Récupérer une organisation par slug' })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Récupérer une organisation par ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour une organisation' })
  @Roles(...ROLES_ADMINISTRATION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganisationDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Supprimer une organisation' })
  @Roles(...ROLES_SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
