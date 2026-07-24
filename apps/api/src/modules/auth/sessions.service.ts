/**
 * Sessions et appareils — lecture et révocation des sessions de l'utilisateur
 * **courant uniquement** (l'identifiant vient du jeton, jamais du client).
 *
 * Le modèle `Session` existant fournit token, refreshToken, ipAdresse,
 * userAgent, expiresAt et createdAt. Il n'a pas de colonne « dernière
 * activité » : celle-ci est donc déduite du champ `iat` du jeton d'accès
 * stocké, qui est réécrit à chaque rafraîchissement (auth.service.refreshToken).
 * C'est donc la date de **dernière rotation du jeton**, libellée comme telle.
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface SessionPresentee {
  id: string;
  courante: boolean;
  appareil: string;
  navigateur: string | null;
  systeme: string | null;
  ipAdresse: string | null;
  createdAt: Date;
  expiresAt: Date;
  /** Date d'émission du jeton d'accès en cours (≈ dernière activité). */
  derniereRotation: Date | null;
  expiree: boolean;
}

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Analyse du user-agent (sans dépendance) ──────────────────────────────

  private analyserUserAgent(ua: string | null | undefined) {
    if (!ua) {
      return { appareil: 'Appareil inconnu', navigateur: null, systeme: null };
    }

    const systeme =
      /Windows NT 10/.test(ua) ? 'Windows 10/11'
      : /Windows NT/.test(ua) ? 'Windows'
      : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
      : /Android/.test(ua) ? 'Android'
      : /Mac OS X/.test(ua) ? 'macOS'
      : /CrOS/.test(ua) ? 'ChromeOS'
      : /Linux/.test(ua) ? 'Linux'
      : null;

    const navigateur =
      /Edg\//.test(ua) ? 'Edge'
      : /OPR\/|Opera/.test(ua) ? 'Opera'
      : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? 'Chrome'
      : /Firefox\//.test(ua) ? 'Firefox'
      : /Safari\//.test(ua) && /Version\//.test(ua) ? 'Safari'
      : /PostmanRuntime|curl|axios|node-fetch/i.test(ua) ? 'Client API'
      : null;

    const mobile = /Mobile|Android|iPhone|iPad|iPod/.test(ua);
    const type = /iPad|Tablet/.test(ua) ? 'Tablette' : mobile ? 'Mobile' : 'Ordinateur';

    const appareil = [navigateur, systeme].filter(Boolean).join(' · ') || type;
    return { appareil: `${appareil} (${type})`, navigateur, systeme };
  }

  /** Extrait `iat` d'un JWT sans vérifier la signature (donnée d'affichage). */
  private dateEmissionJeton(token: string | null | undefined): Date | null {
    if (!token) return null;
    const parties = token.split('.');
    if (parties.length !== 3) return null;
    try {
      const charge = JSON.parse(Buffer.from(parties[1], 'base64').toString('utf8'));
      return typeof charge?.iat === 'number' ? new Date(charge.iat * 1000) : null;
    } catch {
      return null;
    }
  }

  // ─── Lecture ──────────────────────────────────────────────────────────────

  /** Sessions de l'utilisateur courant, la session en cours en premier. */
  async listerMesSessions(utilisateurId: string, tokenCourant?: string): Promise<SessionPresentee[]> {
    const sessions = await this.prisma.session.findMany({
      where: { utilisateurId },
      orderBy: { createdAt: 'desc' },
    });

    const maintenant = new Date();
    const presentees = sessions.map((s) => {
      const { appareil, navigateur, systeme } = this.analyserUserAgent(s.userAgent);
      return {
        id: s.id,
        courante: !!tokenCourant && s.token === tokenCourant,
        appareil,
        navigateur,
        systeme,
        ipAdresse: s.ipAdresse,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        derniereRotation: this.dateEmissionJeton(s.token),
        expiree: s.expiresAt < maintenant,
      };
    });

    return presentees.sort((a, b) => {
      if (a.courante !== b.courante) return a.courante ? -1 : 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // ─── Révocation ───────────────────────────────────────────────────────────

  /** Révoque une session précise — refusée si elle n'appartient pas à l'utilisateur. */
  async revoquerSession(utilisateurId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session introuvable');
    if (session.utilisateurId !== utilisateurId) {
      // Message identique à « introuvable » pour ne rien révéler d'un autre compte.
      throw new ForbiddenException('Session introuvable');
    }

    await this.prisma.session.delete({ where: { id: sessionId } });
    return { id: sessionId, message: 'Session révoquée' };
  }

  /** Ferme toutes les autres sessions de l'utilisateur (la courante est conservée). */
  async revoquerAutresSessions(utilisateurId: string, tokenCourant?: string) {
    const resultat = await this.prisma.session.deleteMany({
      where: {
        utilisateurId,
        ...(tokenCourant ? { NOT: { token: tokenCourant } } : {}),
      },
    });
    return {
      revoquees: resultat.count,
      message:
        resultat.count > 0
          ? `${resultat.count} session(s) fermée(s).`
          : 'Aucune autre session active.',
    };
  }
}
