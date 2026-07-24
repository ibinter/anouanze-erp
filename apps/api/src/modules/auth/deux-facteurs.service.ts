/**
 * Double authentification (TOTP) — activation, confirmation, désactivation,
 * vérification à la connexion et codes de secours.
 *
 * ─── Stockage sans migration ───────────────────────────────────────────────
 * Le schéma Prisma expose déjà `Utilisateur.deuxFacteurs (Boolean)` et
 * `Utilisateur.deuxFacteursSecret (String?)`. Aucune colonne n'existe pour les
 * codes de secours ; plutôt que d'ajouter une migration (interdite ici), la
 * colonne `deuxFacteursSecret` contient une **enveloppe JSON versionnée** :
 *
 *   {"v":1,"secret":"BASE32","codes":["<sha256>",…],"confirme":true,"cree":"ISO"}
 *
 * - le secret n'en sort jamais vers le client une fois l'activation confirmée ;
 * - les codes de secours ne sont stockés que sous forme d'empreintes SHA-256
 *   (ce sont des valeurs aléatoires de 40 bits+, un hachage rapide suffit —
 *   contrairement à un mot de passe choisi par un humain) ;
 * - une valeur héritée (secret base32 brut, sans JSON) reste lisible.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  construireOtpauthUrl,
  formaterSecretLisible,
  genererSecretTotp,
  verifierTotp,
  TOTP_ALGORITHME,
  TOTP_CHIFFRES,
  TOTP_PERIODE,
} from './totp.util';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const NOMBRE_CODES_SECOURS = 10;

interface EnveloppeDeuxFacteurs {
  v: 1;
  secret: string;
  codes: string[];
  confirme: boolean;
  cree: string;
}

@Injectable()
export class DeuxFacteursService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ─── Enveloppe ────────────────────────────────────────────────────────────

  private lireEnveloppe(valeur: string | null | undefined): EnveloppeDeuxFacteurs | null {
    if (!valeur) return null;
    if (valeur.trim().startsWith('{')) {
      try {
        const brut = JSON.parse(valeur) as Partial<EnveloppeDeuxFacteurs>;
        if (typeof brut?.secret !== 'string' || !brut.secret) return null;
        return {
          v: 1,
          secret: brut.secret,
          codes: Array.isArray(brut.codes) ? brut.codes.filter((c) => typeof c === 'string') : [],
          confirme: brut.confirme === true,
          cree: typeof brut.cree === 'string' ? brut.cree : new Date().toISOString(),
        };
      } catch {
        return null;
      }
    }
    // Valeur héritée : secret base32 brut, considéré comme confirmé.
    return { v: 1, secret: valeur, codes: [], confirme: true, cree: new Date().toISOString() };
  }

  private ecrireEnveloppe(enveloppe: EnveloppeDeuxFacteurs): string {
    return JSON.stringify(enveloppe);
  }

  private hacherCodeSecours(code: string): string {
    return crypto.createHash('sha256').update(code.replace(/[\s-]/g, '').toUpperCase()).digest('hex');
  }

  private genererCodesSecours(): { clairs: string[]; empreintes: string[] } {
    const clairs: string[] = [];
    for (let i = 0; i < NOMBRE_CODES_SECOURS; i++) {
      const brut = crypto.randomBytes(5).toString('hex').toUpperCase(); // 10 caractères
      clairs.push(`${brut.slice(0, 5)}-${brut.slice(5)}`);
    }
    return { clairs, empreintes: clairs.map((c) => this.hacherCodeSecours(c)) };
  }

  private async chargerUtilisateur(utilisateurId: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  // ─── Statut ───────────────────────────────────────────────────────────────

  async statut(utilisateurId: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    const enveloppe = this.lireEnveloppe(user.deuxFacteursSecret);
    return {
      actif: user.deuxFacteurs === true,
      activationEnAttente: !user.deuxFacteurs && !!enveloppe && !enveloppe.confirme,
      codesSecoursRestants: user.deuxFacteurs ? (enveloppe?.codes.length ?? 0) : 0,
      algorithme: TOTP_ALGORITHME,
      chiffres: TOTP_CHIFFRES,
      periodeSecondes: TOTP_PERIODE,
      activeLe: user.deuxFacteurs && enveloppe ? enveloppe.cree : null,
    };
  }

  // ─── Activation ───────────────────────────────────────────────────────────

  /**
   * Étape 1 — prépare l'activation : génère un secret et l'URL otpauth.
   * Le secret est enregistré comme « non confirmé » : tant que l'étape 2 n'a
   * pas eu lieu, `deuxFacteurs` reste à false et la connexion est inchangée.
   */
  async preparerActivation(utilisateurId: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (user.deuxFacteurs) {
      throw new BadRequestException(
        'La double authentification est déjà active. Désactivez-la avant d’en configurer une nouvelle.',
      );
    }

    const secret = genererSecretTotp();
    const emetteur = this.config.get<string>('APP_NAME', 'ANOUANZE ERP');
    const enveloppe: EnveloppeDeuxFacteurs = {
      v: 1,
      secret,
      codes: [],
      confirme: false,
      cree: new Date().toISOString(),
    };

    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { deuxFacteursSecret: this.ecrireEnveloppe(enveloppe) },
    });

    return {
      secret,
      secretLisible: formaterSecretLisible(secret),
      otpauthUrl: construireOtpauthUrl({ secret, compte: user.email, emetteur }),
      emetteur,
      algorithme: TOTP_ALGORITHME,
      chiffres: TOTP_CHIFFRES,
      periodeSecondes: TOTP_PERIODE,
    };
  }

  /** Étape 2 — confirme l'activation avec un premier code et délivre les codes de secours. */
  async confirmerActivation(utilisateurId: string, code: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (user.deuxFacteurs) {
      throw new BadRequestException('La double authentification est déjà active.');
    }

    const enveloppe = this.lireEnveloppe(user.deuxFacteursSecret);
    if (!enveloppe) {
      throw new BadRequestException(
        'Aucune activation en cours. Recommencez la configuration depuis le début.',
      );
    }

    if (verifierTotp(enveloppe.secret, code) === null) {
      throw new BadRequestException(
        'Code incorrect. Vérifiez l’heure de votre téléphone puis saisissez le code affiché.',
      );
    }

    const { clairs, empreintes } = this.genererCodesSecours();
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        deuxFacteurs: true,
        deuxFacteursSecret: this.ecrireEnveloppe({
          ...enveloppe,
          codes: empreintes,
          confirme: true,
          cree: new Date().toISOString(),
        }),
      },
    });

    return {
      actif: true,
      codesSecours: clairs,
      message:
        'Double authentification activée. Conservez les codes de secours : ils ne seront plus affichés.',
    };
  }

  /** Désactivation — exige le mot de passe courant. */
  async desactiver(utilisateurId: string, motDePasse: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (!user.deuxFacteurs) {
      throw new BadRequestException('La double authentification n’est pas active.');
    }
    const valide = await bcrypt.compare(motDePasse ?? '', user.motDePasseHash);
    if (!valide) {
      throw new UnauthorizedException('Mot de passe incorrect.');
    }

    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { deuxFacteurs: false, deuxFacteursSecret: null },
    });

    return { actif: false, message: 'Double authentification désactivée.' };
  }

  /** Abandonne une activation préparée mais jamais confirmée. */
  async annulerActivation(utilisateurId: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (user.deuxFacteurs) {
      throw new BadRequestException(
        'La double authentification est active : utilisez la désactivation (mot de passe requis).',
      );
    }
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { deuxFacteursSecret: null },
    });
    return { actif: false, message: 'Configuration abandonnée.' };
  }

  /** Régénère les codes de secours — exige le mot de passe courant. */
  async regenererCodesSecours(utilisateurId: string, motDePasse: string) {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (!user.deuxFacteurs) {
      throw new BadRequestException('La double authentification n’est pas active.');
    }
    const valide = await bcrypt.compare(motDePasse ?? '', user.motDePasseHash);
    if (!valide) throw new UnauthorizedException('Mot de passe incorrect.');

    const enveloppe = this.lireEnveloppe(user.deuxFacteursSecret);
    if (!enveloppe) throw new BadRequestException('Configuration 2FA introuvable.');

    const { clairs, empreintes } = this.genererCodesSecours();
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { deuxFacteursSecret: this.ecrireEnveloppe({ ...enveloppe, codes: empreintes }) },
    });

    return {
      codesSecours: clairs,
      message: 'Nouveaux codes de secours générés : les anciens ne sont plus valables.',
    };
  }

  // ─── Vérification à la connexion ──────────────────────────────────────────

  /**
   * Vérifie un code TOTP **ou** un code de secours (consommé à l'usage).
   * Renvoie `true` si le code est valide, `false` sinon.
   */
  async verifierCodeConnexion(utilisateurId: string, code: string): Promise<boolean> {
    const user = await this.chargerUtilisateur(utilisateurId);
    if (!user.deuxFacteurs) return true; // 2FA non active : rien à vérifier

    const enveloppe = this.lireEnveloppe(user.deuxFacteursSecret);
    if (!enveloppe) return false;

    const propre = (code ?? '').trim();
    if (!propre) return false;

    if (verifierTotp(enveloppe.secret, propre) !== null) return true;

    // Code de secours : usage unique.
    const empreinte = this.hacherCodeSecours(propre);
    const index = enveloppe.codes.indexOf(empreinte);
    if (index === -1) return false;

    const restants = enveloppe.codes.filter((_, i) => i !== index);
    await this.prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { deuxFacteursSecret: this.ecrireEnveloppe({ ...enveloppe, codes: restants }) },
    });
    return true;
  }
}
