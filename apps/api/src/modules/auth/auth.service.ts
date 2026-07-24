import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { RegisterDto } from './dto/register.dto';
import { DeuxFacteursService } from './deux-facteurs.service';
import { validerMotDePasse } from './politique-mot-de-passe';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/** Contexte technique de la connexion (jamais fourni par le client). */
export interface ContexteConnexion {
  ipAdresse?: string | null;
  userAgent?: string | null;
  /** Code TOTP ou code de secours, uniquement si le compte a la 2FA active. */
  code?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
    private readonly deuxFacteurs: DeuxFacteursService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.motDePasseHash);
    if (!valid) return null;
    const { motDePasseHash: _, ...result } = user;
    return result;
  }

  /**
   * Pré-connexion : vérifie les identifiants et indique si un code 2FA sera
   * demandé, **sans créer de session ni délivrer de jeton**.
   * Permet à l'écran de connexion d'afficher l'étape « code » au bon moment.
   */
  async preLogin(email: string, motDePasse: string) {
    const user = await this.validateUser(email, motDePasse);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return { deuxFacteursRequis: user.deuxFacteurs === true };
  }

  async login(user: any, contexte: ContexteConnexion = {}) {
    // ─── Double authentification (opt-in) ───
    // Compte sans 2FA : ce bloc est intégralement ignoré, le flux est inchangé.
    if (user?.deuxFacteurs === true) {
      const code = contexte.code?.trim();
      if (!code) {
        // Aucun jeton n'est délivré : l'appelant doit rejouer la connexion avec le code.
        throw new UnauthorizedException({
          message: 'Code de double authentification requis',
          deuxFacteursRequis: true,
        });
      }
      const valide = await this.deuxFacteurs.verifierCodeConnexion(user.id, code);
      if (!valide) {
        throw new UnauthorizedException({
          message: 'Code de double authentification invalide',
          deuxFacteursRequis: true,
        });
      }
    }

    const userOrg = await this.prisma.utilisateurOrganisation.findFirst({
      where: { utilisateurId: user.id },
      select: { organisationId: true, role: true },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      organisationId: userOrg?.organisationId ?? null,
      role: userOrg?.role ?? null,
    };

    const jwtSecret = this.config.get<string>('JWT_SECRET')!;
    const jwtRefreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || jwtSecret;

    const accessToken = this.jwt.sign(payload, {
      secret: jwtSecret,
      expiresIn: '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: jwtRefreshSecret,
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        utilisateurId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt,
        ipAdresse: contexte.ipAdresse ?? null,
        userAgent: contexte.userAgent ?? null,
      },
    });

    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { dernierLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        avatar: user.avatar,
        langue: user.langue,
        organisationId: userOrg?.organisationId ?? null,
        role: userOrg?.role ?? null,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }

    // Politique de mot de passe — appliquée côté serveur
    const controle = validerMotDePasse(dto.motDePasse, {
      email: dto.email,
      nom: dto.nom,
      prenom: dto.prenom,
    });
    if (!controle.valide) {
      throw new BadRequestException(controle.erreurs);
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, 12);

    const user = await this.prisma.utilisateur.create({
      data: {
        email: dto.email,
        motDePasseHash,
        nom: dto.nom,
        prenom: dto.prenom,
        telephone: dto.telephone,
      },
    });

    const { motDePasseHash: _, ...result } = user;
    return result;
  }

  async refreshToken(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: token },
      include: { utilisateur: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const jwtSecret = this.config.get<string>('JWT_SECRET')!;
    const jwtRefreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || jwtSecret;

    let payload: any;
    try {
      payload = this.jwt.verify(token, { secret: jwtRefreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const accessToken = this.jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
        organisationId: payload.organisationId ?? null,
        role: payload.role ?? null,
      },
      { secret: jwtSecret, expiresIn: '15m' },
    );

    await this.prisma.session.update({
      where: { id: session.id },
      data: { token: accessToken },
    });

    return { accessToken };
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
  }

  async forgotPassword(emailAddr: string): Promise<void> {
    const user = await this.prisma.utilisateur.findUnique({ where: { email: emailAddr } });
    // Réponse identique que l'utilisateur existe ou non (sécurité anti-énumération)
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expire = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma.utilisateur as any).update({
      where: { id: user.id },
      data: { tokenReinit: token, tokenReinitExpire: expire },
    });

    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:3000');
    const resetUrl = `${appUrl}/reinitialiser-mot-de-passe?token=${token}`;

    // Non bloquant — une erreur SMTP ne fait pas échouer la requête
    this.email.sendPasswordReset(emailAddr, user.prenom ?? user.nom ?? 'Utilisateur', resetUrl)
      .catch(() => {/* journalisé dans EmailService */});
  }

  async resetPassword(token: string, nouveauMotDePasse: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (this.prisma.utilisateur as any).findUnique({ where: { tokenReinit: token } });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!user || !(user as any).tokenReinitExpire || (user as any).tokenReinitExpire < new Date()) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    // Politique de mot de passe — appliquée côté serveur
    const controle = validerMotDePasse(nouveauMotDePasse, {
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
    });
    if (!controle.valide) {
      throw new BadRequestException(controle.erreurs);
    }

    const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 12);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.prisma.utilisateur as any).update({
      where: { id: user.id },
      data: { motDePasseHash, tokenReinit: null, tokenReinitExpire: null },
    });

    // Invalider toutes les sessions actives
    await this.prisma.session.deleteMany({ where: { utilisateurId: user.id } });
  }
}
