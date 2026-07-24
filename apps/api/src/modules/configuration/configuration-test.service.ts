import { Injectable, Logger } from '@nestjs/common';
import { CategorieConfiguration } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { ConfigurationService } from './configuration.service';

/** Diagnostic renvoyé au client — ne contient JAMAIS la valeur d'une clé. */
export interface ResultatTestConfiguration {
  categorie: CategorieConfiguration;
  ok: boolean;
  message: string;
  /** Clés attendues et non renseignées (nom seulement). */
  manquantes: string[];
  /** Anomalies de format détectées, décrites sans citer la valeur. */
  avertissements: string[];
  testeLe: string;
}

@Injectable()
export class ConfigurationTestService {
  private readonly logger = new Logger(ConfigurationTestService.name);

  constructor(private readonly configuration: ConfigurationService) {}

  async tester(categorie: CategorieConfiguration): Promise<ResultatTestConfiguration> {
    switch (categorie) {
      case CategorieConfiguration.PAIEMENT:
        return this.testerPaiement();
      case CategorieConfiguration.EMAIL:
        return this.testerEmail();
      case CategorieConfiguration.IA:
        return this.testerIa();
      default:
        return this.testerGeneral();
    }
  }

  // ---------------------------------------------------------------------

  /** CinetPay : présence et bonne forme des identifiants — aucun appel sortant. */
  private async testerPaiement(): Promise<ResultatTestConfiguration> {
    const manquantes: string[] = [];
    const avertissements: string[] = [];

    const apiKey = await this.configuration.get('CINETPAY_API_KEY');
    const siteId = await this.configuration.get('CINETPAY_SITE_ID');
    const secretKey = await this.configuration.get('CINETPAY_SECRET_KEY');
    const notifyUrl = await this.configuration.get('CINETPAY_NOTIFY_URL');
    const returnUrl = await this.configuration.get('CINETPAY_RETURN_URL');
    const mode = (await this.configuration.get('CINETPAY_MODE')) ?? 'PRODUCTION';

    if (!apiKey) manquantes.push('CINETPAY_API_KEY');
    else if (apiKey.length < 16) avertissements.push("CINETPAY_API_KEY semble trop courte pour une clé d'API CinetPay.");

    if (!siteId) manquantes.push('CINETPAY_SITE_ID');
    else if (!/^\d{4,12}$/.test(siteId))
      avertissements.push('CINETPAY_SITE_ID doit être un identifiant numérique (4 à 12 chiffres).');

    if (!notifyUrl) manquantes.push('CINETPAY_NOTIFY_URL');
    else if (!this.estUrlValide(notifyUrl))
      avertissements.push('CINETPAY_NOTIFY_URL n’est pas une URL http(s) valide.');
    else if (notifyUrl.startsWith('http://'))
      avertissements.push('CINETPAY_NOTIFY_URL devrait être en HTTPS : CinetPay refuse les rappels non chiffrés.');

    if (!returnUrl) manquantes.push('CINETPAY_RETURN_URL');
    else if (!this.estUrlValide(returnUrl))
      avertissements.push('CINETPAY_RETURN_URL n’est pas une URL http(s) valide.');

    if (!secretKey)
      avertissements.push(
        'CINETPAY_SECRET_KEY absente : la signature HMAC des webhooks ne pourra pas être vérifiée.',
      );

    if (!['PRODUCTION', 'TEST'].includes(mode.toUpperCase()))
      avertissements.push('CINETPAY_MODE doit valoir PRODUCTION ou TEST.');

    const ok = manquantes.length === 0;
    return {
      categorie: CategorieConfiguration.PAIEMENT,
      ok,
      message: ok
        ? `Identifiants CinetPay complets et bien formés (mode ${mode.toUpperCase()}).`
        : `Configuration CinetPay incomplète : ${manquantes.length} clé(s) manquante(s).`,
      manquantes,
      avertissements,
      testeLe: new Date().toISOString(),
    };
  }

  /** SMTP : ouverture réelle de la connexion via `transporter.verify()`. */
  private async testerEmail(): Promise<ResultatTestConfiguration> {
    const manquantes: string[] = [];
    const avertissements: string[] = [];

    const host = await this.configuration.get('SMTP_HOST');
    const user = await this.configuration.get('SMTP_USER');
    const pass = await this.configuration.get('SMTP_PASSWORD');
    const from = await this.configuration.get('EMAIL_FROM');
    const port = (await this.configuration.getNumber('SMTP_PORT', 587)) ?? 587;
    const secure = (await this.configuration.getBool('SMTP_SECURE', false)) || port === 465;

    if (!host) manquantes.push('SMTP_HOST');
    if (!from) avertissements.push("EMAIL_FROM absent : l'expéditeur par défaut sera utilisé.");
    if (user && !pass) avertissements.push('SMTP_USER est renseigné mais SMTP_PASSWORD est absent.');
    if (!user) avertissements.push("SMTP_USER absent : connexion tentée sans authentification (relais local).");

    if (manquantes.length > 0) {
      return {
        categorie: CategorieConfiguration.EMAIL,
        ok: false,
        message: 'Configuration SMTP incomplète : le serveur sortant n’est pas renseigné.',
        manquantes,
        avertissements,
        testeLe: new Date().toISOString(),
      };
    }

    const transporter = nodemailer.createTransport({
      host: host as string,
      port,
      secure,
      ...(user ? { auth: { user, pass: pass ?? '' } } : {}),
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    });

    try {
      await transporter.verify();
      return {
        categorie: CategorieConfiguration.EMAIL,
        ok: true,
        message: `Connexion SMTP établie avec ${host}:${port}${secure ? ' (TLS)' : ''}.`,
        manquantes,
        avertissements,
        testeLe: new Date().toISOString(),
      };
    } catch (erreur) {
      const detail = erreur instanceof Error ? erreur.message : String(erreur);
      this.logger.warn(`Test SMTP en échec : ${detail}`);
      return {
        categorie: CategorieConfiguration.EMAIL,
        ok: false,
        // `detail` provient de nodemailer (code réseau/SMTP) : aucune valeur de clé.
        message: `Connexion SMTP impossible vers ${host}:${port} — ${detail}`,
        manquantes,
        avertissements,
        testeLe: new Date().toISOString(),
      };
    } finally {
      try {
        transporter.close();
      } catch {
        /* fermeture best-effort */
      }
    }
  }

  /** IA : cohérence entre le fournisseur choisi et la clé correspondante. */
  private async testerIa(): Promise<ResultatTestConfiguration> {
    const manquantes: string[] = [];
    const avertissements: string[] = [];

    const fournisseur = ((await this.configuration.get('SARA_PROVIDER')) ?? 'groq').toLowerCase();
    const cleAttendue: Record<string, string> = {
      groq: 'GROQ_API_KEY',
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      mistral: 'MISTRAL_API_KEY',
    };

    const cle = cleAttendue[fournisseur];
    if (!cle) {
      return {
        categorie: CategorieConfiguration.IA,
        ok: false,
        message: `Fournisseur d'IA inconnu : « ${fournisseur} ». Valeurs acceptées : ${Object.keys(cleAttendue).join(', ')}.`,
        manquantes: ['SARA_PROVIDER'],
        avertissements,
        testeLe: new Date().toISOString(),
      };
    }

    const valeur = await this.configuration.get(cle);
    if (!valeur) manquantes.push(cle);
    else if (valeur.length < 20) avertissements.push(`${cle} semble trop courte pour une clé d'API valide.`);

    const ok = manquantes.length === 0;
    return {
      categorie: CategorieConfiguration.IA,
      ok,
      message: ok
        ? `Fournisseur « ${fournisseur} » configuré : ${cle} est renseignée.`
        : `Fournisseur « ${fournisseur} » sélectionné mais ${cle} n'est pas renseignée.`,
      manquantes,
      avertissements,
      testeLe: new Date().toISOString(),
    };
  }

  private async testerGeneral(): Promise<ResultatTestConfiguration> {
    const avertissements: string[] = [];
    if (!this.configuration.chiffrementActif()) {
      avertissements.push(
        "CONFIG_ENCRYPTION_KEY absente : les valeurs secrètes ne peuvent pas être enregistrées depuis l'interface.",
      );
    }
    return {
      categorie: CategorieConfiguration.GENERAL,
      ok: avertissements.length === 0,
      message:
        avertissements.length === 0
          ? 'Socle de configuration opérationnel : le chiffrement au repos est actif.'
          : 'Socle de configuration partiellement opérationnel.',
      manquantes: [],
      avertissements,
      testeLe: new Date().toISOString(),
    };
  }

  private estUrlValide(valeur: string): boolean {
    try {
      const url = new URL(valeur);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
