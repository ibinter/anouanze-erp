import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CategorieConfiguration } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CATALOGUE_CONFIGURATION,
  clesParCategorie,
  trouverCle,
} from './configuration.catalogue';
import {
  ChiffrementNonConfigureError,
  chiffrementDisponible,
  chiffrer,
  dechiffrer,
} from './chiffrement';

/** Origine effective d'une valeur de configuration. */
export type SourceConfiguration = 'base' | 'environnement' | 'absent';

/** Ligne renvoyée par `listerParCategorie` — jamais de valeur secrète. */
export interface EntreeConfiguration {
  cle: string;
  categorie: CategorieConfiguration;
  secret: boolean;
  /** Vrai si une valeur exploitable existe (base ou environnement). */
  defini: boolean;
  description: string;
  source: SourceConfiguration;
  modifieLe: Date | null;
  modifiePar: string | null;
  /** Valeur en clair — uniquement pour les clés NON secrètes, sinon `undefined`. */
  valeur?: string;
  valeursAutorisees?: string[];
  exemple?: string;
}

export interface OptionsEcriture {
  categorie?: CategorieConfiguration;
  secret?: boolean;
  description?: string;
}

interface EntreeCache {
  valeur: string | undefined;
  expireA: number;
}

/** Durée de vie du cache mémoire — `get()` est appelé à chaque envoi d'email. */
const TTL_CACHE_MS = 30_000;

/**
 * Accès unifié aux paramètres d'intégration.
 *
 * ⚠️ ORDRE DE RÉSOLUTION : **base de données d'abord, variable d'environnement
 * ensuite**. Rien de ce qui fonctionne aujourd'hui (SMTP, CinetPay, IA…) ne
 * casse si la table `configurations` est vide ou absente : on retombe toujours
 * sur `process.env`.
 */
@Injectable()
export class ConfigurationService {
  private readonly logger = new Logger(ConfigurationService.name);
  private readonly cache = new Map<string, EntreeCache>();
  /**
   * Horodatage jusqu'auquel on cesse d'interroger la base après une erreur
   * (table absente, base coupée) : évite de marteler PostgreSQL. Une nouvelle
   * tentative a lieu automatiquement passé ce délai.
   */
  private baseIndisponibleJusqua = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------
  // Lecture
  // ---------------------------------------------------------------------

  /**
   * Valeur effective d'une clé : base d'abord, puis variable d'environnement.
   * Renvoie `undefined` si aucune source ne la fournit (ou si la valeur stockée
   * est illisible — dans ce cas le repli environnement s'applique).
   */
  async get(cle: string): Promise<string | undefined> {
    const nom = this.normaliser(cle);
    if (!nom) return undefined;

    const enCache = this.cache.get(nom);
    if (enCache && enCache.expireA > Date.now()) {
      return enCache.valeur ?? this.lireEnvironnement(nom);
    }

    const valeurBase = await this.lireBase(nom);
    this.cache.set(nom, { valeur: valeurBase, expireA: Date.now() + TTL_CACHE_MS });
    return valeurBase ?? this.lireEnvironnement(nom);
  }

  /** Variante booléenne : « true », « 1 », « oui », « yes » → true. */
  async getBool(cle: string, defaut = false): Promise<boolean> {
    const brut = (await this.get(cle))?.trim().toLowerCase();
    if (brut === undefined || brut === '') return defaut;
    if (['true', '1', 'oui', 'yes', 'on'].includes(brut)) return true;
    if (['false', '0', 'non', 'no', 'off'].includes(brut)) return false;
    return defaut;
  }

  /** Variante numérique : renvoie `defaut` si la valeur n'est pas un nombre fini. */
  async getNumber(cle: string, defaut?: number): Promise<number | undefined> {
    const brut = (await this.get(cle))?.trim();
    if (!brut) return defaut;
    const nombre = Number(brut);
    return Number.isFinite(nombre) ? nombre : defaut;
  }

  /** Vrai uniquement si TOUTES les clés demandées ont une valeur non vide. */
  async isConfigured(...cles: string[]): Promise<boolean> {
    if (cles.length === 0) return false;
    const valeurs = await Promise.all(cles.map((cle) => this.get(cle)));
    return valeurs.every((valeur) => typeof valeur === 'string' && valeur.trim().length > 0);
  }

  /**
   * État de toutes les clés d'une catégorie.
   * Ne renvoie JAMAIS la valeur d'une clé secrète — seulement `defini` et `source`.
   */
  async listerParCategorie(categorie: CategorieConfiguration): Promise<EntreeConfiguration[]> {
    const definitions = clesParCategorie(categorie);
    const enBase = await this.lireBaseMultiple(definitions.map((d) => d.cle));

    return definitions.map((definition) => {
      const ligne = enBase.get(definition.cle);
      const valeurBase = ligne
        ? dechiffrer(ligne.valeur, definition.cle)?.trim() || undefined
        : undefined;
      const valeurEnv = this.lireEnvironnement(definition.cle);
      const source: SourceConfiguration = valeurBase
        ? 'base'
        : valeurEnv
          ? 'environnement'
          : 'absent';

      return {
        cle: definition.cle,
        categorie: definition.categorie,
        secret: definition.secret,
        defini: source !== 'absent',
        description: definition.description,
        source,
        modifieLe: ligne?.modifieLe ?? null,
        modifiePar: ligne?.modifiePar ?? null,
        valeur: definition.secret ? undefined : (valeurBase ?? valeurEnv),
        valeursAutorisees: definition.valeursAutorisees,
        exemple: definition.exemple,
      };
    });
  }

  /** Liste complète, toutes catégories confondues (mêmes garanties de secret). */
  async listerTout(): Promise<EntreeConfiguration[]> {
    const categories = Array.from(
      new Set(CATALOGUE_CONFIGURATION.map((entree) => entree.categorie)),
    );
    const blocs = await Promise.all(categories.map((c) => this.listerParCategorie(c)));
    return blocs.flat();
  }

  // ---------------------------------------------------------------------
  // Écriture
  // ---------------------------------------------------------------------

  /**
   * Enregistre (ou met à jour) une valeur.
   * Les clés secrètes sont chiffrées ; sans `CONFIG_ENCRYPTION_KEY` l'écriture
   * d'un secret est refusée avec un message explicite (l'application, elle,
   * continue de fonctionner).
   */
  async set(
    cle: string,
    valeur: string,
    options: OptionsEcriture = {},
    utilisateurId?: string,
  ): Promise<void> {
    const nom = this.normaliser(cle);
    const definition = trouverCle(nom);
    if (!definition) {
      throw new BadRequestException(
        `Clé de configuration inconnue : « ${nom} ». Seules les clés du catalogue sont modifiables.`,
      );
    }

    const brut = typeof valeur === 'string' ? valeur.trim() : '';
    if (!brut) {
      throw new BadRequestException(
        `La valeur de « ${nom} » ne peut pas être vide. Utilisez la suppression pour revenir à la variable d'environnement.`,
      );
    }

    if (definition.valeursAutorisees && !definition.valeursAutorisees.includes(brut)) {
      throw new BadRequestException(
        `Valeur invalide pour « ${nom} ». Valeurs acceptées : ${definition.valeursAutorisees.join(', ')}.`,
      );
    }

    const secret = options.secret ?? definition.secret;
    let stockee = brut;
    if (secret) {
      if (!chiffrementDisponible()) {
        throw new BadRequestException(
          "Chiffrement non configuré : la variable d'environnement CONFIG_ENCRYPTION_KEY est absente sur le serveur. " +
            `Impossible d'enregistrer « ${nom} » qui est une valeur secrète.`,
        );
      }
      try {
        stockee = chiffrer(brut);
      } catch (erreur) {
        if (erreur instanceof ChiffrementNonConfigureError) {
          throw new BadRequestException(erreur.message);
        }
        throw erreur;
      }
    }

    const categorie = options.categorie ?? definition.categorie;
    const description = options.description ?? definition.description;

    await this.prisma.configuration.upsert({
      where: { cle: nom },
      create: {
        cle: nom,
        valeur: stockee,
        categorie,
        secret,
        description,
        modifiePar: utilisateurId ?? null,
      },
      update: {
        valeur: stockee,
        categorie,
        secret,
        description,
        modifiePar: utilisateurId ?? null,
      },
    });

    this.baseIndisponibleJusqua = 0;
    this.invalider(nom);
    // Journalisation : qui, quelle clé, quand — JAMAIS la valeur.
    this.logger.log(
      `Configuration « ${nom} » (${categorie}${secret ? ', secrète' : ''}) modifiée par ${
        utilisateurId ?? 'utilisateur inconnu'
      }.`,
    );
  }

  /** Supprime une valeur : la clé retombe sur la variable d'environnement. */
  async supprimer(cle: string, utilisateurId?: string): Promise<{ supprime: boolean }> {
    const nom = this.normaliser(cle);
    if (!trouverCle(nom)) {
      throw new BadRequestException(`Clé de configuration inconnue : « ${nom} ».`);
    }

    const resultat = await this.prisma.configuration.deleteMany({ where: { cle: nom } });
    this.invalider(nom);
    if (resultat.count > 0) {
      this.logger.log(
        `Configuration « ${nom} » supprimée par ${utilisateurId ?? 'utilisateur inconnu'} — repli sur l'environnement.`,
      );
    }
    return { supprime: resultat.count > 0 };
  }

  /** Vide le cache mémoire (une clé, ou tout). */
  invalider(cle?: string): void {
    if (cle) this.cache.delete(this.normaliser(cle));
    else this.cache.clear();
  }

  /** Indique à l'interface si les secrets peuvent être enregistrés. */
  chiffrementActif(): boolean {
    return chiffrementDisponible();
  }

  // ---------------------------------------------------------------------
  // Accès bas niveau
  // ---------------------------------------------------------------------

  private normaliser(cle: string): string {
    return (cle ?? '').trim().toUpperCase();
  }

  private lireEnvironnement(cle: string): string | undefined {
    const brut = this.config.get<string>(cle) ?? process.env[cle];
    if (typeof brut !== 'string') return undefined;
    const valeur = brut.trim();
    return valeur.length > 0 ? valeur : undefined;
  }

  /** Lecture d'une clé en base. Toute erreur (table absente, base coupée) → `undefined`. */
  private async lireBase(cle: string): Promise<string | undefined> {
    if (Date.now() < this.baseIndisponibleJusqua) return undefined;
    try {
      const ligne = await this.prisma.configuration.findUnique({ where: { cle } });
      if (!ligne) return undefined;
      const clair = dechiffrer(ligne.valeur, cle)?.trim();
      return clair && clair.length > 0 ? clair : undefined;
    } catch (erreur) {
      this.signalerBaseIndisponible(erreur);
      return undefined;
    }
  }

  private async lireBaseMultiple(cles: string[]): Promise<
    Map<string, { valeur: string; modifieLe: Date; modifiePar: string | null }>
  > {
    const index = new Map<string, { valeur: string; modifieLe: Date; modifiePar: string | null }>();
    try {
      const lignes = await this.prisma.configuration.findMany({ where: { cle: { in: cles } } });
      for (const ligne of lignes) {
        index.set(ligne.cle, {
          valeur: ligne.valeur,
          modifieLe: ligne.modifieLe,
          modifiePar: ligne.modifiePar,
        });
      }
    } catch (erreur) {
      this.signalerBaseIndisponible(erreur);
    }
    return index;
  }

  private signalerBaseIndisponible(erreur: unknown): void {
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    if (Date.now() >= this.baseIndisponibleJusqua) {
      this.logger.warn(
        `Table « configurations » inaccessible (${message}). ` +
          "Repli intégral sur les variables d'environnement — la migration 20260724000003 n'est peut-être pas appliquée.",
      );
    }
    // Nouvelle tentative dans une minute.
    this.baseIndisponibleJusqua = Date.now() + 60_000;
  }
}
