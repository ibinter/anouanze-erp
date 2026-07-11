import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { MealService } from './meal.service';
import { CreateIndicateurDto } from './dto/create-indicateur.dto';
import { CreateCollecteDto } from './dto/create-collecte.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('meal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/meal/projets/:projetId')
export class MealController {
  constructor(private readonly mealService: MealService) {}

  @Get('indicateurs')
  @ApiOperation({ summary: 'Liste des indicateurs MEAL du projet' })
  getIndicateurs(@Param('projetId') projetId: string) {
    return this.mealService.getIndicateurs(projetId);
  }

  @Post('indicateurs')
  @ApiOperation({ summary: 'Créer un indicateur SMART' })
  createIndicateur(@Param('projetId') projetId: string, @Body() dto: CreateIndicateurDto) {
    return this.mealService.createIndicateur(projetId, dto);
  }

  @Patch('indicateurs/:indicateurId')
  @ApiOperation({ summary: 'Mettre à jour un indicateur (valeur réalisée)' })
  updateIndicateur(
    @Param('projetId') projetId: string,
    @Param('indicateurId') indicateurId: string,
    @Body() dto: Partial<CreateIndicateurDto> & { valeurRealisee?: number },
  ) {
    return this.mealService.updateIndicateur(projetId, indicateurId, dto);
  }

  @Get('indicateurs/:indicateurId/collectes')
  @ApiOperation({ summary: 'Historique des collectes de données d\'un indicateur' })
  getCollectes(
    @Param('projetId') projetId: string,
    @Param('indicateurId') indicateurId: string,
  ) {
    return this.mealService.getCollectes(projetId, indicateurId);
  }

  @Post('indicateurs/:indicateurId/collectes')
  @ApiOperation({ summary: 'Enregistrer une collecte de données' })
  createCollecte(
    @Param('projetId') projetId: string,
    @Param('indicateurId') indicateurId: string,
    @Body() dto: CreateCollecteDto,
    @Request() req,
  ) {
    return this.mealService.createCollecte(projetId, indicateurId, dto, req.user.id);
  }

  @Get('rapport')
  @ApiOperation({ summary: 'Rapport MEAL complet du projet' })
  getRapportMEAL(@Param('projetId') projetId: string) {
    return this.mealService.getRapportMEAL(projetId);
  }

  @Get('cadre-logique')
  @ApiOperation({ summary: 'Cadre logique simplifié du projet' })
  getLogCadre(@Param('projetId') projetId: string) {
    return this.mealService.getLogCadre(projetId);
  }
}
