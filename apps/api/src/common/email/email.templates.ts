/**
 * Templates HTML des emails transactionnels ANOUANZÊ ERP.
 *
 * Chaque template retourne un objet { subject, html, text } :
 *  - `html`  : version riche, responsive, aux couleurs ANOUANZÊ
 *  - `text`  : version texte alternative (obligatoire pour la délivrabilité)
 *
 * Aucun accès réseau / base de données ici : ce sont des fonctions pures,
 * ce qui les rend testables et impossibles à faire planter.
 */

export const COULEUR_PRIMAIRE = '#146C43';
export const COULEUR_PRIMAIRE_SOMBRE = '#0F5434';
export const COULEUR_ACCENT = '#F28C25';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface BrandOptions {
  /** Nom affiché dans l'en-tête (organisation cliente ou ANOUANZÊ ERP) */
  appName?: string;
  /** URL publique du logo (optionnelle — repli sur le monogramme texte) */
  logoUrl?: string;
  /** URL de base de l'application, pour les liens du pied de page */
  appUrl?: string;
  /** Éditeur affiché en pied de page */
  editeur?: string;
  supportEmail?: string;
  contactEmail?: string;
  telephone?: string;
}

const BRAND_DEFAUT: Required<Omit<BrandOptions, 'logoUrl'>> & { logoUrl?: string } = {
  appName: 'ANOUANZÊ ERP',
  appUrl: 'https://anouanze-erp.com',
  editeur: 'IBIG SOFT',
  supportEmail: 'support@ibigsoft.com',
  contactEmail: 'contact@ibigsoft.com',
  telephone: '+225 27 22 27 60 14',
  logoUrl: undefined,
};

/** Échappe les caractères HTML — toute donnée dynamique doit passer par ici. */
export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMontant(montant?: number | null, devise = 'FCFA'): string {
  if (montant === null || montant === undefined || Number.isNaN(Number(montant))) return '—';
  return `${Number(montant).toLocaleString('fr-FR')} ${devise}`;
}

export function formatDate(date?: Date | string | null): string {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

interface LayoutBlocks {
  /** Titre principal affiché sous l'en-tête */
  titre: string;
  /** Sous-titre optionnel (bandeau accent) */
  preheader?: string;
  /** Corps HTML (déjà échappé par l'appelant) */
  corps: string;
  /** Bouton d'action principal */
  cta?: { label: string; url: string };
  /** Contenu additionnel après le CTA */
  apresCta?: string;
  brand?: BrandOptions;
}

/**
 * Gabarit commun : tableaux imbriqués + styles inline (seule technique
 * réellement compatible Outlook / Gmail / Yahoo), largeur max 600px,
 * media query pour le mobile.
 */
export function renderLayout(blocks: LayoutBlocks): string {
  const brand = { ...BRAND_DEFAUT, ...(blocks.brand ?? {}) };
  const annee = new Date().getFullYear();

  const logo = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="${esc(brand.appName)}" width="140" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:1px;">${esc(brand.appName)}</span>`;

  const cta = blocks.cta
    ? `
        <tr>
          <td align="center" style="padding:8px 32px 24px 32px;">
            <a href="${esc(blocks.cta.url)}"
               style="display:inline-block;background:${COULEUR_PRIMAIRE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;line-height:20px;padding:14px 32px;border-radius:6px;text-decoration:none;">
              ${esc(blocks.cta.label)}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 16px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8a8a8a;word-break:break-all;">
            Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
            <a href="${esc(blocks.cta.url)}" style="color:${COULEUR_PRIMAIRE};">${esc(blocks.cta.url)}</a>
          </td>
        </tr>`
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(blocks.titre)}</title>
<style type="text/css">
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; }
  table { border-collapse:collapse !important; }
  a { color:${COULEUR_PRIMAIRE}; }
  @media only screen and (max-width:620px) {
    .wrapper { width:100% !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:20px !important; line-height:28px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;">
  <div style="display:none;font-size:1px;color:#f4f6f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${esc(blocks.preheader ?? blocks.titre)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- En-tête vert -->
          <tr>
            <td align="center" style="background:${COULEUR_PRIMAIRE};padding:24px 32px;">
              ${logo}
            </td>
          </tr>
          <tr>
            <td style="height:4px;background:${COULEUR_ACCENT};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Titre -->
          <tr>
            <td class="px" style="padding:28px 32px 8px 32px;">
              <h1 class="h1" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:30px;color:#1a1a1a;font-weight:bold;">
                ${esc(blocks.titre)}
              </h1>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td class="px" style="padding:8px 32px 20px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#3c3c3c;">
              ${blocks.corps}
            </td>
          </tr>

          ${cta}

          ${blocks.apresCta ? `<tr><td class="px" style="padding:0 32px 24px 32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#5a5a5a;">${blocks.apresCta}</td></tr>` : ''}

          <!-- Pied de page -->
          <tr>
            <td style="height:1px;background:#ececec;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="px" align="center" style="padding:20px 32px 26px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8a8a8a;">
              <p style="margin:0 0 6px 0;color:#5a5a5a;font-weight:bold;">${esc(brand.appName)}</p>
              <p style="margin:0 0 10px 0;">Plateforme de gestion pour ONG, associations et organisations africaines</p>
              <p style="margin:0 0 4px 0;">
                Édité par <strong>${esc(brand.editeur)}</strong> —
                <a href="mailto:${esc(brand.contactEmail)}" style="color:${COULEUR_PRIMAIRE};text-decoration:none;">${esc(brand.contactEmail)}</a>
                · <a href="mailto:${esc(brand.supportEmail)}" style="color:${COULEUR_PRIMAIRE};text-decoration:none;">${esc(brand.supportEmail)}</a>
              </p>
              <p style="margin:0 0 10px 0;">${esc(brand.telephone)}</p>
              <p style="margin:0;color:#a8a8a8;">© ${annee} ${esc(brand.editeur)}. Tous droits réservés.<br />
              Cet email vous a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Construit une ligne de tableau récapitulatif. */
function ligne(label: string, valeur: string, pair: boolean): string {
  return `<tr style="background:${pair ? '#f7f9f8' : '#ffffff'};">
    <td style="padding:9px 12px;border:1px solid #e6e6e6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5a5a5a;">${esc(label)}</td>
    <td style="padding:9px 12px;border:1px solid #e6e6e6;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;font-weight:bold;">${valeur}</td>
  </tr>`;
}

/** Tableau récapitulatif clé/valeur (les valeurs sont échappées par l'appelant si besoin). */
export function tableauRecap(lignes: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:14px 0;border-collapse:collapse;">
    ${lignes.map(([l, v], i) => ligne(l, v, i % 2 === 0)).join('')}
  </table>`;
}

/** Encadré d'alerte (orange par défaut). */
export function encadre(contenu: string, couleur: string = COULEUR_ACCENT): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:14px 0;">
    <tr>
      <td style="border-left:4px solid ${couleur};background:#fdf7f0;padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#4a4a4a;">
        ${contenu}
      </td>
    </tr>
  </table>`;
}

/** Convertit un corps HTML simple en texte alternatif lisible. */
export function htmlVersTexte(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|tr|div|h[1-6])>/gi, '\n')
    .replace(/<td[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function build(
  subject: string,
  blocks: LayoutBlocks,
  texteSpecifique?: string,
): RenderedEmail {
  const html = renderLayout(blocks);
  const base = `${blocks.titre}\n\n${htmlVersTexte(blocks.corps)}`;
  const ctaTxt = blocks.cta ? `\n\n${blocks.cta.label} : ${blocks.cta.url}` : '';
  const apres = blocks.apresCta ? `\n\n${htmlVersTexte(blocks.apresCta)}` : '';
  const pied =
    '\n\n—\nANOUANZÊ ERP — édité par IBIG SOFT\ncontact@ibigsoft.com · support@ibigsoft.com · +225 27 22 27 60 14';
  return {
    subject,
    html,
    text: texteSpecifique ?? `${base}${ctaTxt}${apres}${pied}`,
  };
}

// ============================================================
// 1. BIENVENUE (inscription / création de compte)
// ============================================================

export function templateBienvenue(p: {
  nom: string;
  organisationNom?: string;
  loginUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const org = p.organisationNom ?? 'ANOUANZÊ ERP';
  return build(
    `Bienvenue sur ${org}`,
    {
      titre: `Bienvenue, ${esc(p.nom)} !`,
      preheader: `Votre compte ${esc(org)} est prêt.`,
      corps: `
        <p style="margin:0 0 12px 0;">Votre compte vient d'être créé sur la plateforme <strong>${esc(org)}</strong>.</p>
        <p style="margin:0 0 12px 0;">ANOUANZÊ ERP réunit dans un seul outil la gestion de vos membres, projets,
        finances, dons, ressources humaines et rapports bailleurs.</p>
        <p style="margin:0;">Connectez-vous dès maintenant pour compléter votre profil et découvrir votre tableau de bord.</p>`,
      cta: p.loginUrl ? { label: 'Accéder à mon espace', url: p.loginUrl } : undefined,
      apresCta: `<p style="margin:0;">Besoin d'aide pour démarrer ? Notre équipe support répond à
        <a href="mailto:support@ibigsoft.com">support@ibigsoft.com</a>.</p>`,
      brand: p.brand,
    },
  );
}

// ============================================================
// 2. INVITATION DANS UNE ORGANISATION
// ============================================================

export function templateInvitation(p: {
  nomInvite?: string;
  invitePar: string;
  organisationNom: string;
  role?: string;
  inviteUrl: string;
  expireLe?: Date | string;
  brand?: BrandOptions;
}): RenderedEmail {
  const recap: Array<[string, string]> = [
    ['Organisation', esc(p.organisationNom)],
    ['Invité par', esc(p.invitePar)],
  ];
  if (p.role) recap.push(['Rôle proposé', esc(p.role)]);
  if (p.expireLe) recap.push(['Invitation valable jusqu\'au', esc(formatDate(p.expireLe))]);

  return build(
    `Invitation à rejoindre ${p.organisationNom}`,
    {
      titre: `Vous êtes invité(e) à rejoindre ${esc(p.organisationNom)}`,
      preheader: `${esc(p.invitePar)} vous invite sur ANOUANZÊ ERP.`,
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour${p.nomInvite ? ' <strong>' + esc(p.nomInvite) + '</strong>' : ''},</p>
        <p style="margin:0 0 12px 0;"><strong>${esc(p.invitePar)}</strong> vous invite à rejoindre l'espace
        <strong>${esc(p.organisationNom)}</strong> sur ANOUANZÊ ERP.</p>
        ${tableauRecap(recap)}`,
      cta: { label: "Accepter l'invitation", url: p.inviteUrl },
      apresCta: `<p style="margin:0;">Si vous ne connaissez pas cette organisation, vous pouvez ignorer cet email.</p>`,
      brand: p.brand,
    },
  );
}

// ============================================================
// 3. RÉINITIALISATION DE MOT DE PASSE
// ============================================================

export function templateReinitMotDePasse(p: {
  nom: string;
  resetUrl: string;
  dureeValiditeMinutes?: number;
  brand?: BrandOptions;
}): RenderedEmail {
  const duree = p.dureeValiditeMinutes ?? 60;
  return build(
    'Réinitialisation de votre mot de passe',
    {
      titre: 'Réinitialisation du mot de passe',
      preheader: `Lien valable ${duree} minutes.`,
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">Vous avez demandé la réinitialisation de votre mot de passe ANOUANZÊ ERP.
        Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>`,
      cta: { label: 'Réinitialiser mon mot de passe', url: p.resetUrl },
      apresCta: encadre(
        `Ce lien expire dans <strong>${duree} minutes</strong>. Si vous n'êtes pas à l'origine de cette demande,
         ignorez simplement cet email : votre mot de passe actuel reste valable.`,
      ),
      brand: p.brand,
    },
  );
}

// ============================================================
// 4. CONFIRMATION DE DEMANDE DE DÉMONSTRATION (prospect)
// ============================================================

export function templateConfirmationDemo(p: {
  nomContact: string;
  organisationNom?: string;
  dateSouhaitee?: Date | string;
  brand?: BrandOptions;
}): RenderedEmail {
  const recap: Array<[string, string]> = [['Demande', 'Démonstration ANOUANZÊ ERP']];
  if (p.organisationNom) recap.push(['Organisation', esc(p.organisationNom)]);
  if (p.dateSouhaitee) recap.push(['Créneau souhaité', esc(formatDate(p.dateSouhaitee))]);

  return build(
    'Votre demande de démonstration ANOUANZÊ ERP',
    {
      titre: 'Merci pour votre demande de démonstration',
      preheader: 'Nous revenons vers vous sous 48 h ouvrées.',
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nomContact)}</strong>,</p>
        <p style="margin:0 0 12px 0;">Nous avons bien reçu votre demande de démonstration d'ANOUANZÊ ERP.
        Un conseiller IBIG SOFT vous contactera sous <strong>48 heures ouvrées</strong> pour convenir d'un créneau.</p>
        ${tableauRecap(recap)}
        <p style="margin:0;">La démonstration dure environ 45 minutes et est entièrement personnalisée
        selon votre type d'organisation.</p>`,
      apresCta: `<p style="margin:0;">Une question d'ici là ? Écrivez-nous à
        <a href="mailto:contact@ibigsoft.com">contact@ibigsoft.com</a> ou appelez le +225 27 22 27 60 14.</p>`,
      brand: p.brand,
    },
  );
}

// ============================================================
// 5. RELANCE COMMERCIALE PROSPECT (J+3, J+7)
// ============================================================

export function templateRelanceProspect(p: {
  nomContact: string;
  organisationNom?: string;
  jours: 3 | 7 | number;
  demoUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const premiere = p.jours <= 3;
  const corps = premiere
    ? `
      <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nomContact)}</strong>,</p>
      <p style="margin:0 0 12px 0;">Nous revenons vers vous suite à votre intérêt pour ANOUANZÊ ERP.
      Avez-vous pu échanger avec votre équipe${p.organisationNom ? ' de <strong>' + esc(p.organisationNom) + '</strong>' : ''} ?</p>
      <p style="margin:0 0 12px 0;">En 45 minutes, nous pouvons vous montrer comment la plateforme :</p>
      <ul style="margin:0 0 12px 20px;padding:0;">
        <li style="margin-bottom:6px;">centralise membres, projets et bénéficiaires ;</li>
        <li style="margin-bottom:6px;">produit vos états financiers et rapports bailleurs automatiquement ;</li>
        <li style="margin-bottom:6px;">sécurise vos justificatifs et votre gouvernance.</li>
      </ul>`
    : `
      <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nomContact)}</strong>,</p>
      <p style="margin:0 0 12px 0;">Nous n'avons pas encore eu l'occasion d'échanger depuis votre demande.
      Si le moment n'est pas opportun, dites-le nous simplement — nous cesserons nos relances.</p>
      <p style="margin:0 0 12px 0;">Sinon, nous restons disponibles pour une démonstration adaptée à
      ${p.organisationNom ? '<strong>' + esc(p.organisationNom) + '</strong>' : 'votre organisation'}.</p>`;

  return build(
    premiere
      ? 'Votre projet ANOUANZÊ ERP — restons en contact'
      : 'Dernière relance — démonstration ANOUANZÊ ERP',
    {
      titre: premiere ? 'Nous restons à votre disposition' : 'Souhaitez-vous toujours une démonstration ?',
      preheader: 'Planifions un échange de 45 minutes.',
      corps,
      cta: p.demoUrl ? { label: 'Planifier ma démonstration', url: p.demoUrl } : undefined,
      apresCta: `<p style="margin:0;">Vous pouvez aussi nous joindre directement au +225 27 22 27 60 14.</p>`,
      brand: p.brand,
    },
  );
}

// ============================================================
// 6. FIN D'ESSAI (J-7, J-1) ET ESSAI EXPIRÉ
// ============================================================

export function templateFinEssai(p: {
  nom: string;
  organisationNom: string;
  joursRestants: number;
  dateFin?: Date | string;
  abonnementUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const j = p.joursRestants;
  const titre =
    j <= 1 ? "Votre essai se termine demain" : `Votre essai se termine dans ${j} jours`;

  return build(
    `${titre} — ${p.organisationNom}`,
    {
      titre,
      preheader: 'Activez votre abonnement pour conserver vos données.',
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">La période d'essai d'ANOUANZÊ ERP pour <strong>${esc(p.organisationNom)}</strong>
        prend fin ${p.dateFin ? 'le <strong>' + esc(formatDate(p.dateFin)) + '</strong>' : `dans ${j} jour${j > 1 ? 's' : ''}`}.</p>
        ${encadre(
          `À l'expiration, l'accès en écriture sera suspendu. <strong>Aucune donnée n'est supprimée</strong> :
           vous retrouvez l'intégralité de votre espace dès l'activation de l'abonnement.`,
        )}`,
      cta: p.abonnementUrl ? { label: 'Activer mon abonnement', url: p.abonnementUrl } : undefined,
      apresCta: `<p style="margin:0;">Un doute sur la formule adaptée ? Écrivez à
        <a href="mailto:contact@ibigsoft.com">contact@ibigsoft.com</a>, nous vous conseillons gratuitement.</p>`,
      brand: p.brand,
    },
  );
}

export function templateEssaiExpire(p: {
  nom: string;
  organisationNom: string;
  abonnementUrl?: string;
  joursRetentionDonnees?: number;
  brand?: BrandOptions;
}): RenderedEmail {
  const retention = p.joursRetentionDonnees ?? 90;
  return build(
    `Votre période d'essai est terminée — ${p.organisationNom}`,
    {
      titre: "Votre période d'essai est terminée",
      preheader: 'Vos données sont conservées, réactivez quand vous voulez.',
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">La période d'essai d'ANOUANZÊ ERP pour <strong>${esc(p.organisationNom)}</strong>
        est arrivée à son terme. L'accès en écriture est désormais suspendu.</p>
        ${encadre(
          `Vos données restent conservées <strong>${retention} jours</strong>. Activez un abonnement
           pour retrouver immédiatement l'ensemble de votre espace, sans aucune perte.`,
        )}`,
      cta: p.abonnementUrl ? { label: 'Réactiver mon espace', url: p.abonnementUrl } : undefined,
      brand: p.brand,
    },
  );
}

// ============================================================
// 7. REÇU DE DON / CONFIRMATION DE COTISATION
// ============================================================

export function templateRecuDon(p: {
  donateurNom: string;
  montant?: number | null;
  devise?: string;
  dateDon: Date | string;
  numeroRecu?: string;
  typeDon?: string;
  organisationNom?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const recap: Array<[string, string]> = [
    ['Numéro de reçu', esc(p.numeroRecu ?? '—')],
    ['Type de don', esc(p.typeDon ?? 'Don')],
    [
      'Montant',
      p.montant !== null && p.montant !== undefined
        ? esc(formatMontant(p.montant, p.devise ?? 'FCFA'))
        : 'Don en nature',
    ],
    ['Date du don', esc(formatDate(p.dateDon))],
  ];

  return build(
    `Reçu de don${p.numeroRecu ? ' ' + p.numeroRecu : ''}`,
    {
      titre: 'Reçu de don',
      preheader: 'Merci pour votre générosité.',
      corps: `
        <p style="margin:0 0 12px 0;">Cher/Chère <strong>${esc(p.donateurNom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">${p.organisationNom ? esc(p.organisationNom) : 'Notre organisation'}
        vous remercie sincèrement pour votre don, qui a bien été enregistré.</p>
        ${tableauRecap(recap)}
        <p style="margin:0;">Ce reçu tient lieu de justificatif. Conservez-le pour vos démarches éventuelles.</p>`,
      brand: p.brand,
    },
  );
}

export function templateConfirmationCotisation(p: {
  nom: string;
  montant: number;
  devise?: string;
  periode?: string;
  datePaiement: Date | string;
  reference?: string;
  organisationNom?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const recap: Array<[string, string]> = [
    ['Montant réglé', esc(formatMontant(p.montant, p.devise ?? 'FCFA'))],
    ['Date du paiement', esc(formatDate(p.datePaiement))],
  ];
  if (p.periode) recap.push(['Période', esc(p.periode)]);
  if (p.reference) recap.push(['Référence', esc(p.reference)]);

  return build(
    'Confirmation de votre cotisation',
    {
      titre: 'Cotisation enregistrée',
      preheader: 'Votre paiement a bien été pris en compte.',
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">Nous confirmons la réception de votre cotisation
        ${p.organisationNom ? 'auprès de <strong>' + esc(p.organisationNom) + '</strong>' : ''}. Merci !</p>
        ${tableauRecap(recap)}
        <p style="margin:0;">Votre statut de membre est à jour.</p>`,
      brand: p.brand,
    },
  );
}

// ============================================================
// 8. RAPPELS D'ÉCHÉANCE
// ============================================================

export function templateRappelCotisation(p: {
  nom: string;
  montant: number;
  devise?: string;
  echeance: Date | string;
  joursRetard?: number;
  paiementUrl?: string;
  organisationNom?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const enRetard = (p.joursRetard ?? 0) > 0;
  const recap: Array<[string, string]> = [
    ['Montant dû', esc(formatMontant(p.montant, p.devise ?? 'FCFA'))],
    ['Échéance', esc(formatDate(p.echeance))],
  ];
  if (enRetard) recap.push(['Retard', `${p.joursRetard} jour${(p.joursRetard ?? 0) > 1 ? 's' : ''}`]);

  return build(
    enRetard ? 'Cotisation en retard — rappel' : 'Rappel de cotisation',
    {
      titre: enRetard ? 'Votre cotisation est en retard' : 'Rappel de cotisation',
      preheader: enRetard ? 'Merci de régulariser votre situation.' : 'Échéance à venir.',
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">${
          enRetard
            ? `Votre cotisation${p.organisationNom ? ' auprès de <strong>' + esc(p.organisationNom) + '</strong>' : ''} n'a pas encore été réglée.`
            : `Nous vous rappelons l'échéance prochaine de votre cotisation${p.organisationNom ? ' auprès de <strong>' + esc(p.organisationNom) + '</strong>' : ''}.`
        }</p>
        ${tableauRecap(recap)}
        <p style="margin:0;">Merci de procéder au règlement dans les meilleurs délais.
        Si le paiement a déjà été effectué, considérez ce message comme sans objet.</p>`,
      cta: p.paiementUrl ? { label: 'Régler ma cotisation', url: p.paiementUrl } : undefined,
      brand: p.brand,
    },
  );
}

export function templateAlerteBudget(p: {
  nom: string;
  budgetNom: string;
  pourcentageConsomme: number;
  montantConsomme?: number;
  montantTotal?: number;
  devise?: string;
  budgetUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const depasse = p.pourcentageConsomme >= 100;
  const recap: Array<[string, string]> = [
    ['Budget', esc(p.budgetNom)],
    ['Consommation', `${Math.round(p.pourcentageConsomme)} %`],
  ];
  if (p.montantConsomme !== undefined) {
    recap.push(['Montant engagé', esc(formatMontant(p.montantConsomme, p.devise ?? 'FCFA'))]);
  }
  if (p.montantTotal !== undefined) {
    recap.push(['Enveloppe totale', esc(formatMontant(p.montantTotal, p.devise ?? 'FCFA'))]);
  }

  return build(
    depasse ? `Budget dépassé : ${p.budgetNom}` : `Alerte budget : ${p.budgetNom}`,
    {
      titre: depasse ? 'Budget dépassé' : 'Seuil budgétaire atteint',
      preheader: `${Math.round(p.pourcentageConsomme)} % de l'enveloppe consommée.`,
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">${
          depasse
            ? `L'enveloppe du budget <strong>${esc(p.budgetNom)}</strong> est <strong>dépassée</strong>.`
            : `Le budget <strong>${esc(p.budgetNom)}</strong> a atteint <strong>${Math.round(p.pourcentageConsomme)} %</strong> de son enveloppe.`
        }</p>
        ${tableauRecap(recap)}
        ${encadre('Vérifiez les engagements en cours et ajustez les prévisions si nécessaire.')}`,
      cta: p.budgetUrl ? { label: 'Consulter le budget', url: p.budgetUrl } : undefined,
      brand: p.brand,
    },
  );
}

// ============================================================
// 9. SUPPORT — NOUVEAU TICKET / RÉPONSE
// ============================================================

export function templateNouveauTicket(p: {
  nom: string;
  reference: string;
  sujet: string;
  priorite?: string;
  categorie?: string;
  ticketUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  const recap: Array<[string, string]> = [
    ['Référence', esc(p.reference)],
    ['Sujet', esc(p.sujet)],
  ];
  if (p.categorie) recap.push(['Catégorie', esc(p.categorie)]);
  if (p.priorite) recap.push(['Priorité', esc(p.priorite)]);

  return build(
    `[${p.reference}] Votre demande de support a bien été reçue`,
    {
      titre: 'Votre ticket a été enregistré',
      preheader: `Référence ${esc(p.reference)}.`,
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">Votre demande a bien été transmise à l'équipe support IBIG SOFT.
        Conservez la référence ci-dessous pour tout échange ultérieur.</p>
        ${tableauRecap(recap)}
        <p style="margin:0;">Un membre de l'équipe vous répondra dans les meilleurs délais.</p>`,
      cta: p.ticketUrl ? { label: 'Suivre mon ticket', url: p.ticketUrl } : undefined,
      brand: p.brand,
    },
  );
}

export function templateReponseTicket(p: {
  nom: string;
  reference: string;
  sujet: string;
  auteur?: string;
  message: string;
  statut?: string;
  ticketUrl?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  return build(
    `[${p.reference}] Nouvelle réponse — ${p.sujet}`,
    {
      titre: 'Nouvelle réponse à votre ticket',
      preheader: `Réponse du support sur ${esc(p.reference)}.`,
      corps: `
        <p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>
        <p style="margin:0 0 12px 0;">${esc(p.auteur ?? 'Le support IBIG SOFT')} a répondu à votre ticket
        <strong>${esc(p.reference)}</strong> — « ${esc(p.sujet)} ».</p>
        ${encadre(
          `<em style="color:#6a6a6a;">${esc(p.message).replace(/\n/g, '<br />')}</em>`,
          COULEUR_PRIMAIRE,
        )}
        ${p.statut ? `<p style="margin:0 0 12px 0;">Statut du ticket : <strong>${esc(p.statut)}</strong></p>` : ''}`,
      cta: p.ticketUrl ? { label: 'Répondre / voir le ticket', url: p.ticketUrl } : undefined,
      brand: p.brand,
    },
  );
}

// ============================================================
// 10. NOTIFICATION GÉNÉRIQUE (relais des notifications internes)
// ============================================================

export function templateNotificationGenerique(p: {
  nom?: string;
  titre: string;
  message: string;
  lienUrl?: string;
  libelleLien?: string;
  brand?: BrandOptions;
}): RenderedEmail {
  return build(
    p.titre,
    {
      titre: p.titre,
      preheader: p.message.slice(0, 120),
      corps: `
        ${p.nom ? `<p style="margin:0 0 12px 0;">Bonjour <strong>${esc(p.nom)}</strong>,</p>` : ''}
        <p style="margin:0;">${esc(p.message).replace(/\n/g, '<br />')}</p>`,
      cta: p.lienUrl ? { label: p.libelleLien ?? 'Ouvrir dans ANOUANZÊ ERP', url: p.lienUrl } : undefined,
      brand: p.brand,
    },
  );
}
