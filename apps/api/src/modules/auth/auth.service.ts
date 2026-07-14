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
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email } });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.motDePasseHash);
    if (!valid) return null;
    const { motDePasseHash: _, ...result } = user;
    return result;
  }

  async login(user: any) {
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
