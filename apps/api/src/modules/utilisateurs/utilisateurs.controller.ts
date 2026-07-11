import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UtilisateursService } from './utilisateurs.service';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { ChangerMotDePasseDto } from './dto/changer-mot-de-passe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleUtilisateur } from '@prisma/client';

@ApiTags('utilisateurs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/utilisateurs')
export class UtilisateursController {
  constructor(private readonly service: UtilisateursService) {}

  @ApiOperation({ summary: 'Lister tous les utilisateurs' })
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUtilisateurDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Changer le mot de passe' })
  @Post(':id/changer-mot-de-passe')
  changerMotDePasse(
    @Param('id') id: string,
    @Body() dto: ChangerMotDePasseDto,
  ) {
    return this.service.changerMotDePasse(id, dto);
  }

  @ApiOperation({ summary: 'Organisations de l\'utilisateur' })
  @Get(':id/organisations')
  getOrganisations(@Param('id') id: string) {
    return this.service.getOrganisations(id);
  }

  @ApiOperation({ summary: 'Assigner une organisation à l\'utilisateur' })
  @Post(':id/organisations/:orgId')
  assignerOrganisation(
    @Param('id') id: string,
    @Param('orgId') orgId: string,
    @Body('role') role: RoleUtilisateur,
  ) {
    return this.service.assignerOrganisation(id, orgId, role);
  }
}
