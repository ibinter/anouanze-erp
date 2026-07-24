import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DeuxFacteursService } from './deux-facteurs.service';
import { SessionsService } from './sessions.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ConfirmerDeuxFacteursDto,
  MotDePasseCourantDto,
} from './dto/deux-facteurs.dto';
import { decrirePolitique } from './politique-mot-de-passe';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Adresse IP réelle de l'appelant (derrière un reverse proxy le cas échéant). */
function ipDeRequete(req: any): string | null {
  const entete = req.headers?.['x-forwarded-for'];
  if (typeof entete === 'string' && entete.length) return entete.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? null;
}

function jetonDeRequete(req: any): string | undefined {
  const entete = req.headers?.['authorization'] as string | undefined;
  return entete?.startsWith('Bearer ') ? entete.slice(7) : undefined;
}

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly deuxFacteursService: DeuxFacteursService,
    private readonly sessionsService: SessionsService,
  ) {}

  @ApiOperation({
    summary: 'Connexion utilisateur',
    description:
      'Si le compte a activé la double authentification, un champ `code` est exigé : ' +
      'sans lui, la réponse est un 401 { deuxFacteursRequis: true } et aucun jeton n’est délivré.',
  })
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Request() req: any, @Body('code') code?: string) {
    return this.authService.login(req.user, {
      code,
      ipAdresse: ipDeRequete(req),
      userAgent: req.headers?.['user-agent'] ?? null,
    });
  }

  @ApiOperation({
    summary: 'Pré-connexion : indique si un code 2FA sera demandé',
    description: 'Vérifie les identifiants sans créer de session ni délivrer de jeton.',
  })
  @HttpCode(HttpStatus.OK)
  @Post('pre-login')
  async preLogin(
    @Body('email') email: string,
    @Body('motDePasse') motDePasse: string,
  ) {
    return this.authService.preLogin(email, motDePasse);
  }

  @ApiOperation({ summary: 'Politique de mot de passe appliquée par l’API' })
  @Get('politique-mot-de-passe')
  politiqueMotDePasse() {
    return decrirePolitique();
  }

  @ApiOperation({ summary: 'Inscription utilisateur' })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Renouvellement du token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }

  @ApiOperation({ summary: 'Déconnexion' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: any) {
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader?.replace('Bearer ', '');
    await this.authService.logout(token);
    return { message: 'Déconnexion réussie' };
  }

  @ApiOperation({ summary: 'Demande de réinitialisation de mot de passe' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.' };
  }

  @ApiOperation({ summary: 'Réinitialisation du mot de passe via token' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('motDePasse') motDePasse: string,
  ) {
    await this.authService.resetPassword(token, motDePasse);
    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Double authentification (TOTP) — opt-in, compte courant uniquement
  // ══════════════════════════════════════════════════════════════════════════

  @ApiOperation({ summary: 'Statut de la double authentification du compte courant' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('2fa/statut')
  statutDeuxFacteurs(@Request() req: any) {
    return this.deuxFacteursService.statut(req.user.id);
  }

  @ApiOperation({
    summary: 'Préparer l’activation : secret + URL otpauth (QR code)',
    description:
      'Le secret et l’URL otpauth ne sont renvoyés QUE pendant cette étape. ' +
      'Tant que l’activation n’est pas confirmée, la connexion reste inchangée.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/preparer')
  preparerDeuxFacteurs(@Request() req: any) {
    return this.deuxFacteursService.preparerActivation(req.user.id);
  }

  @ApiOperation({ summary: 'Confirmer l’activation avec un premier code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/activer')
  activerDeuxFacteurs(@Request() req: any, @Body() dto: ConfirmerDeuxFacteursDto) {
    return this.deuxFacteursService.confirmerActivation(req.user.id, dto.code);
  }

  @ApiOperation({ summary: 'Abandonner une activation préparée mais non confirmée' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/annuler')
  annulerDeuxFacteurs(@Request() req: any) {
    return this.deuxFacteursService.annulerActivation(req.user.id);
  }

  @ApiOperation({ summary: 'Désactiver la double authentification (mot de passe requis)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/desactiver')
  desactiverDeuxFacteurs(@Request() req: any, @Body() dto: MotDePasseCourantDto) {
    return this.deuxFacteursService.desactiver(req.user.id, dto.motDePasse);
  }

  @ApiOperation({ summary: 'Régénérer les codes de secours (mot de passe requis)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/codes-secours')
  regenererCodesSecours(@Request() req: any, @Body() dto: MotDePasseCourantDto) {
    return this.deuxFacteursService.regenererCodesSecours(req.user.id, dto.motDePasse);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Sessions et appareils — strictement limité au compte courant
  // ══════════════════════════════════════════════════════════════════════════

  @ApiOperation({ summary: 'Lister mes sessions actives' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  mesSessions(@Request() req: any) {
    return this.sessionsService.listerMesSessions(req.user.id, jetonDeRequete(req));
  }

  @ApiOperation({ summary: 'Révoquer une de mes sessions' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  revoquerSession(@Request() req: any, @Param('id') id: string) {
    return this.sessionsService.revoquerSession(req.user.id, id);
  }

  @ApiOperation({ summary: 'Déconnecter tous mes autres appareils' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('sessions/revoquer-autres')
  revoquerAutresSessions(@Request() req: any) {
    return this.sessionsService.revoquerAutresSessions(req.user.id, jetonDeRequete(req));
  }
}
