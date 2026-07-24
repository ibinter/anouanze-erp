import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategorieConfiguration, RoleUtilisateur } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ConfigurationService } from './configuration.service';
import { ConfigurationTestService } from './configuration-test.service';
import { DefinirConfigurationDto } from './dto/definir-configuration.dto';

interface UtilisateurToken {
  id: string;
  email: string;
  organisationId?: string;
  role?: RoleUtilisateur;
}

/**
 * Administration des clés d'intégration (CinetPay, SMTP, IA).
 *
 * ⚠️ Contrôleur INTÉGRALEMENT réservé au SUPER_ADMIN — `@Roles` est posé à la
 * fois sur la classe et sur chaque route. Aucune valeur secrète n'est jamais
 * renvoyée : ni en lecture, ni dans les diagnostics, ni dans les journaux.
 */
@ApiTags('configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleUtilisateur.SUPER_ADMIN)
@Controller('api/v1/configuration')
export class ConfigurationController {
  constructor(
    private readonly service: ConfigurationService,
    private readonly testService: ConfigurationTestService,
  ) {}

  @ApiOperation({
    summary: "État du socle de configuration (chiffrement disponible, catégories)",
  })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Get('etat')
  etat() {
    return {
      chiffrementActif: this.service.chiffrementActif(),
      categories: Object.values(CategorieConfiguration),
      avertissement: this.service.chiffrementActif()
        ? null
        : "CONFIG_ENCRYPTION_KEY absente : les valeurs secrètes ne peuvent pas être enregistrées. Définissez-la sur le serveur puis redémarrez l'API.",
    };
  }

  @ApiOperation({
    summary: "Test de connectivité d'une catégorie (aucune valeur n'est renvoyée)",
  })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @HttpCode(200)
  @Post('tester/:categorie')
  tester(@Param('categorie') categorie: string) {
    return this.testService.tester(this.parserCategorie(categorie));
  }

  @ApiOperation({
    summary: "Lister les clés d'une catégorie — jamais la valeur d'une clé secrète",
  })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Get(':categorie')
  lister(@Param('categorie') categorie: string) {
    return this.service.listerParCategorie(this.parserCategorie(categorie));
  }

  @ApiOperation({ summary: 'Enregistrer la valeur d’une clé' })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Put(':cle')
  async definir(
    @Param('cle') cle: string,
    @Body() dto: DefinirConfigurationDto,
    @CurrentUser() auteur: UtilisateurToken,
  ) {
    await this.service.set(cle, dto.valeur, {}, auteur?.id);
    return {
      cle: cle.trim().toUpperCase(),
      enregistre: true,
      message: 'Valeur enregistrée. Elle prend effet dans les 30 secondes (cache applicatif).',
    };
  }

  @ApiOperation({
    summary: 'Supprimer la valeur d’une clé (retour à la variable d’environnement)',
  })
  @Roles(RoleUtilisateur.SUPER_ADMIN)
  @Delete(':cle')
  async supprimer(@Param('cle') cle: string, @CurrentUser() auteur: UtilisateurToken) {
    const { supprime } = await this.service.supprimer(cle, auteur?.id);
    return {
      cle: cle.trim().toUpperCase(),
      supprime,
      message: supprime
        ? "Valeur supprimée : la clé retombe sur la variable d'environnement si elle existe."
        : "Aucune valeur en base pour cette clé : elle utilisait déjà la variable d'environnement.",
    };
  }

  // ---------------------------------------------------------------------

  private parserCategorie(brut: string): CategorieConfiguration {
    const normalise = (brut ?? '').trim().toUpperCase();
    const valides = Object.values(CategorieConfiguration) as string[];
    if (!valides.includes(normalise)) {
      throw new BadRequestException(
        `Catégorie inconnue : « ${brut} ». Valeurs acceptées : ${valides.join(', ')}.`,
      );
    }
    return normalise as CategorieConfiguration;
  }
}
