/**
 * SARA — Base de connaissances OFFICIELLE ANOUANZÊ ERP (RAG léger).
 *
 * SOURCE DE VÉRITÉ : les tarifs, plans, modules et FAQ ci-dessous sont repris
 * À L'IDENTIQUE du contenu de la landing page — constantes MODULES, PLANS et
 * FAQ de `src/app/page.tsx` (ou, si la migration i18n est active, les clés
 * `pricing.plans` / `features.modules` / `faq.items` de `messages/fr.json`).
 * Toute modification de la landing DOIT être répercutée ici.
 * AUCUN tarif, délai, remise ou fonctionnalité ne doit être inventé.
 */

export interface KnowledgeEntry {
  /** Identifiant stable du passage. */
  id: string;
  /** Titre affichable (utilisé comme source citable). */
  title: string;
  /** Source citable de l'information. */
  source: string;
  /** Mots-clés de recherche (normalisés à la volée). */
  keywords: string[];
  /** Contenu factuel injecté dans le contexte du modèle. */
  content: string;
}

/* ─── MODULES (12) — identique à MODULES dans page.tsx ─────────────────── */

const MODULES_ENTRY: KnowledgeEntry = {
  id: 'modules',
  title: 'Les 12 modules d\'ANOUANZÊ ERP',
  source: 'Site officiel ANOUANZÊ ERP — section Fonctionnalités',
  keywords: [
    'module', 'modules', 'fonctionnalite', 'fonctionnalites', 'gouvernance', 'membre', 'membres',
    'cotisation', 'cotisations', 'donateur', 'donateurs', 'bailleur', 'bailleurs', 'projet',
    'projets', 'meal', 'rh', 'ressources humaines', 'paie', 'salarie', 'volontaire',
    'comptabilite', 'sycebnl', 'budget', 'tresorerie', 'achat', 'achats', 'stock', 'stocks',
    'document', 'documents', 'ged', 'evenement', 'evenements', 'agenda', 'rapport', 'rapports',
    'bi', 'tableau de bord', 'assistant ia', 'ia',
  ],
  content: `ANOUANZÊ ERP comprend 12 modules :
1. Gouvernance — assemblées générales, résolutions, mandats, organes de direction.
2. Membres & Cotisations — registre complet, suivi des cotisations, relances automatiques, historique des adhésions.
3. Donateurs & Bailleurs — CRM dédié aux donateurs individuels et bailleurs institutionnels, suivi des dons et conventions.
4. Projets & MEAL — planification, cadre logique, indicateurs de suivi, évaluation, rapports bailleurs automatisés.
5. Ressources Humaines — salariés, volontaires, contrats, congés, fiches de paie conformes au droit ivoirien.
6. Comptabilité SYCEBNL — plan comptable OHADA intégré, journaux, écritures, balance, états financiers conformes.
7. Budget & Trésorerie — planification budgétaire par projet, rapprochement bancaire, prévisions de flux.
8. Achats & Stocks — bons de commande, fournisseurs, réception, gestion de stock terrain en temps réel.
9. Documents — GED intégrée, classement par projet/bailleur, signatures électroniques, versioning.
10. Événements — agenda organisationnel, invitations, présences, comptes-rendus automatiques.
11. Rapports & BI — tableaux de bord temps réel, exports Excel/PDF, rapports bailleurs en un clic.
12. Assistant IA — questions en français, analyses, rapports et recommandations instantanés.`,
};

/* ─── TARIFS — identique à PLANS dans page.tsx ─────────────────────────── */

const PRICING_ENTRY: KnowledgeEntry = {
  id: 'tarifs',
  title: 'Tarifs et plans ANOUANZÊ ERP',
  source: 'Site officiel ANOUANZÊ ERP — section Tarifs',
  keywords: [
    'tarif', 'tarifs', 'prix', 'cout', 'couts', 'combien', 'plan', 'plans', 'formule', 'formules',
    'abonnement', 'facturation', 'fcfa', 'essentiel', 'starter', 'pro', 'enterprise', 'devis',
    'annuel', 'mensuel', 'mois', 'an', 'utilisateur', 'utilisateurs', 'licence', 'budget prix',
  ],
  content: `Tarifs officiels ANOUANZÊ ERP (aucun autre tarif ni remise n'existe) :

• ESSENTIEL — 12 900 FCFA / mois, ou 129 000 FCFA / an (2 mois offerts).
  Pour les petits groupements et associations naissantes.
  Inclus : 3 utilisateurs, Membres & cotisations, Trésorerie de base, Comptabilité simplifiée, Documents (1 Go), Support par email (72h).
  NON inclus : Projets & MEAL, RH & Paie, Assistant IA, API & intégrations.

• STARTER — 29 900 FCFA / mois, ou 299 000 FCFA / an (2 mois offerts).
  Pour les associations structurées et ONG locales.
  Inclus : 8 utilisateurs, Membres & cotisations, Comptabilité SYCEBNL complète, Budget & Trésorerie, Projets (3 projets actifs), Documents (5 Go), Événements & Agenda, Support prioritaire (24h).
  NON inclus : RH & Paie, Assistant IA, API & intégrations.

• PRO — 59 900 FCFA / mois, ou 599 000 FCFA / an (2 mois offerts). Plan le plus choisi.
  Pour les ONG actives avec projets et équipes.
  Inclus : 15 utilisateurs, tous les modules, Projets & MEAL illimités, RH/Paie/Volontaires, Achats & Stocks, Assistant IA, Documents illimités (20 Go), Rapports bailleurs automatiques, Support prioritaire (4h).

• ENTERPRISE — Sur devis (pas de prix public).
  Pour les réseaux, fédérations et grandes ONG.
  Inclus : utilisateurs illimités, multi-organisations, console superadmin, stockage illimité, intégrations sur mesure (API), formation & déploiement inclus, SLA garanti & support 24/7, hébergement on-premise possible, accompagnement dédié IBIG SOFT.

Différence Pro / Starter : le Pro inclut tous les modules (RH, MEAL illimité, Assistant IA) ; le Starter est limité à 3 projets actifs, sans RH ni Assistant IA.
Changement de plan : montée en gamme immédiate (facturation au prorata) ; passage à un plan inférieur possible en fin de période.`,
};

/* ─── ESSAI GRATUIT ─────────────────────────────────────────────────────── */

const TRIAL_ENTRY: KnowledgeEntry = {
  id: 'essai',
  title: 'Essai gratuit',
  source: 'Site officiel ANOUANZÊ ERP — FAQ',
  keywords: [
    'essai', 'gratuit', 'gratuite', 'test', 'tester', 'demo', 'demonstration', 'trial',
    '30 jours', '14 jours', 'carte bancaire', 'sans engagement',
  ],
  content: `Essai gratuit : 30 jours d'essai gratuit sans carte bancaire pour les plans Starter et Pro. Le plan Essentiel est disponible en essai de 14 jours.
Une démonstration est accessible depuis la page /demo du site.`,
};

/* ─── CONFORMITÉ ────────────────────────────────────────────────────────── */

const COMPLIANCE_ENTRY: KnowledgeEntry = {
  id: 'conformite',
  title: 'Conformité SYCEBNL / OHADA',
  source: 'Site officiel ANOUANZÊ ERP — FAQ & module Comptabilité',
  keywords: [
    'sycebnl', 'ohada', 'conformite', 'conforme', 'norme', 'normes', 'comptable', 'comptabilite',
    'audit', 'audits', 'etats financiers', 'plan comptable', 'reglementation', 'legal',
  ],
  content: `ANOUANZÊ ERP implémente le référentiel SYCEBNL (Système Comptable des Entités à But Non Lucratif) de l'OHADA, en vigueur dans 17 pays d'Afrique.
Le plan comptable OHADA est intégré : journaux, écritures, balance et états financiers conformes. La traçabilité complète et la piste d'audit intégrée facilitent les audits.`,
};

/* ─── SÉCURITÉ & DONNÉES ────────────────────────────────────────────────── */

const SECURITY_ENTRY: KnowledgeEntry = {
  id: 'securite',
  title: 'Sécurité et hébergement des données',
  source: 'Site officiel ANOUANZÊ ERP — FAQ',
  keywords: [
    'securite', 'securise', 'securisees', 'donnees', 'rgpd', 'confidentialite', 'sauvegarde',
    'sauvegardes', 'chiffrement', 'ssl', 'hebergement', 'serveur', 'acces', 'role', 'roles',
    'propriete', 'backup',
  ],
  content: `Sécurité : données hébergées sur des serveurs sécurisés avec chiffrement SSL, sauvegardes quotidiennes automatiques et accès restreint par rôles. L'organisation reste propriétaire de ses données à tout moment.
Le plan Enterprise permet un hébergement on-premise.`,
};

/* ─── ACCÈS, PWA, HORS-LIGNE ────────────────────────────────────────────── */

const ACCESS_ENTRY: KnowledgeEntry = {
  id: 'acces',
  title: 'Accès web, mobile et PWA',
  source: 'Site officiel ANOUANZÊ ERP — FAQ',
  keywords: [
    'mobile', 'smartphone', 'tablette', 'pwa', 'application', 'installer', 'hors ligne',
    'offline', 'internet', 'connexion', 'navigateur', 'responsive', 'android', 'ios',
  ],
  content: `ANOUANZÊ ERP est une application web : une connexion internet est requise (il n'existe pas de mode hors-ligne). Connexion minimum recommandée : 1 Mbps.
L'interface est entièrement responsive (ordinateur, tablette, smartphone) et peut être installée comme application depuis le navigateur (PWA).`,
};

/* ─── MIGRATION & FORMATION ─────────────────────────────────────────────── */

const ONBOARDING_ENTRY: KnowledgeEntry = {
  id: 'migration-formation',
  title: 'Migration des données et formation',
  source: 'Site officiel ANOUANZÊ ERP — FAQ & Comment ça marche',
  keywords: [
    'migration', 'migrer', 'import', 'importer', 'excel', 'csv', 'reprise', 'donnees existantes',
    'formation', 'former', 'accompagnement', 'demarrage', 'onboarding', 'installation',
    'configuration', 'parametrage', 'mise en place',
  ],
  content: `Migration : l'équipe IBIG SOFT accompagne l'import des données existantes (Excel, CSV, anciens logiciels). Ce service est inclus dans les plans Pro et Enterprise, et disponible en option pour les autres plans.
Formation : la formation initiale (2h en ligne) est incluse dans tous les plans. Des formations avancées sur site sont disponibles en option. Le plan Enterprise inclut une formation complète.
Mise en route en 3 étapes : 1) créer son espace (inscription en 5 minutes, configuration et import par l'équipe) ; 2) paramétrer les modules utiles (plan comptable, projets, membres) ; 3) piloter via les tableaux de bord temps réel.`,
};

/* ─── PUBLICS CIBLES ────────────────────────────────────────────────────── */

const AUDIENCE_ENTRY: KnowledgeEntry = {
  id: 'publics',
  title: 'Organisations concernées',
  source: 'Site officiel ANOUANZÊ ERP — section À qui s\'adresse ANOUANZÊ',
  keywords: [
    'ong', 'association', 'associations', 'organisation', 'organisations', 'federation',
    'reseau', 'cooperative', 'groupement', 'eglise', 'paroisse', 'religieuse', 'fondation',
    'but non lucratif', 'asbl', 'pour qui', 'cible',
  ],
  content: `ANOUANZÊ ERP s'adresse aux associations, ONG et organisations à but non lucratif d'Afrique francophone :
ONG de santé (santé communautaire, nutrition, SIDA, eau et assainissement), ONG d'éducation (alphabétisation, bourses, centres de formation, écoles communautaires), ONG agricoles (développement rural, coopératives, filières), associations locales (groupements de femmes, jeunes, quartier, culturels, sportifs), organisations religieuses (paroisses, diocèses, institutions confessionnelles) et réseaux/fédérations (fédérations nationales, réseaux multi-pays, coordinations).`,
};

/* ─── ÉDITEUR & CONTACTS ────────────────────────────────────────────────── */

const CONTACT_ENTRY: KnowledgeEntry = {
  id: 'contact',
  title: 'Contacts IBIG SOFT',
  source: 'Site officiel ANOUANZÊ ERP — pied de page',
  keywords: [
    'contact', 'contacter', 'joindre', 'telephone', 'tel', 'email', 'mail', 'adresse',
    'support', 'assistance', 'aide', 'conseiller', 'commercial', 'devis', 'ibig', 'ibigsoft',
    'editeur', 'partenaire', 'partenaires', 'rendez-vous', 'appel',
  ],
  content: `ANOUANZÊ ERP est édité par IBIG SOFT (Intermark Business International Group).
Contacts officiels :
- Email : contact@ibigsoft.com
- Téléphone : +225 27 22 27 60 14 / +225 05 55 05 99 01
- Site éditeur : ibigsoft.com
- Programme partenaires : ibigpartners.com
Pages utiles du site : /demo (démonstration et essai), /contact (contact & support), /conditions-sara (conditions d'utilisation de l'assistante SARA).`,
};

/* ─── BÉNÉFICES ─────────────────────────────────────────────────────────── */

const BENEFITS_ENTRY: KnowledgeEntry = {
  id: 'benefices',
  title: 'Bénéfices d\'ANOUANZÊ ERP',
  source: 'Site officiel ANOUANZÊ ERP — section Bénéfices',
  keywords: [
    'benefice', 'benefices', 'avantage', 'avantages', 'pourquoi', 'interet', 'gain',
    'temps', 'erreur', 'erreurs', 'pilotage', 'productivite', 'excel', 'papier',
  ],
  content: `Bénéfices : gagner du temps (automatisation des relances, rapports, fiches de paie), piloter avec précision (indicateurs, tableaux de bord, alertes temps réel), réduire les erreurs (saisie unique, calculs automatiques, contrôles intégrés), sécuriser les données (accès par rôles, sauvegardes quotidiennes, connexions chiffrées), faciliter les audits (traçabilité complète, piste d'audit) et travailler partout (web, mobile, tablette).
ANOUANZÊ remplace les fichiers Excel dispersés et les registres papier par une base centralisée en temps réel.`,
};

/* ─── IDENTITÉ SARA ─────────────────────────────────────────────────────── */

const SARA_ENTRY: KnowledgeEntry = {
  id: 'sara',
  title: 'SARA, assistante virtuelle',
  source: 'Site officiel ANOUANZÊ ERP — assistante SARA',
  keywords: [
    'sara', 'assistante', 'assistant', 'chatbot', 'bot', 'qui es-tu', 'qui est tu',
    'intelligence artificielle', 'ia',
  ],
  content: `SARA est l'assistante virtuelle officielle d'ANOUANZÊ ERP, éditée par IBIG SOFT. Elle renseigne les visiteurs sur les modules, les tarifs, la conformité SYCEBNL/OHADA, l'essai gratuit et oriente vers l'équipe IBIG SOFT.
Les conditions d'utilisation de SARA sont publiées sur la page /conditions-sara.
SARA ne traite aucune donnée comptable réelle d'une organisation et ne peut pas accéder aux comptes clients.`,
};

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  MODULES_ENTRY,
  PRICING_ENTRY,
  TRIAL_ENTRY,
  COMPLIANCE_ENTRY,
  SECURITY_ENTRY,
  ACCESS_ENTRY,
  ONBOARDING_ENTRY,
  AUDIENCE_ENTRY,
  CONTACT_ENTRY,
  BENEFITS_ENTRY,
  SARA_ENTRY,
];

/** Normalise : minuscules, sans accents, ponctuation → espaces. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'a', 'au', 'aux', 'en', 'pour',
  'par', 'sur', 'dans', 'avec', 'sans', 'est', 'sont', 'ce', 'cet', 'cette', 'ces', 'que', 'qui',
  'quoi', 'dont', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mon', 'ma', 'mes',
  'votre', 'vos', 'notre', 'nos', 'son', 'sa', 'ses', 'plus', 'moins', 'the', 'and', 'for', 'you',
]);

/** Racine commune d'au moins 4 caractères — stemming approximatif du français. */
function sharePrefix(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4) return false;
  const min = Math.min(a.length, b.length);
  let common = 0;
  while (common < min && a[common] === b[common]) common += 1;
  return common >= 4;
}

export interface ScoredEntry {
  entry: KnowledgeEntry;
  score: number;
}

/**
 * Recherche par mots-clés (RAG léger, sans dépendance externe).
 * Score = correspondances de mots-clés (pondérées) + occurrences dans le contenu.
 */
export function searchKnowledge(query: string, limit = 3): ScoredEntry[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  const tokens = normalizedQuery
    .split(' ')
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
  if (tokens.length === 0) return [];

  const scored: ScoredEntry[] = KNOWLEDGE_BASE.map((entry) => {
    const normalizedKeywords = entry.keywords.map(normalize);
    const normalizedContent = normalize(`${entry.title} ${entry.content}`);
    let score = 0;

    for (const keyword of normalizedKeywords) {
      if (keyword.includes(' ')) {
        if (normalizedQuery.includes(keyword)) score += 5;
      } else if (tokens.includes(keyword)) {
        score += 4;
      } else if (tokens.some((t) => sharePrefix(t, keyword))) {
        // Correspondance morphologique approximative (essayer/essai, tarif/tarification).
        score += 2;
      }
    }
    for (const token of tokens) {
      if (normalizedContent.includes(token)) score += 1;
    }
    return { entry, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

/**
 * Construit le bloc de contexte injecté dans le message système.
 * Retourne une chaîne vide si aucun passage pertinent n'a été trouvé.
 */
export function buildKnowledgeContext(query: string, limit = 3): string {
  const results = searchKnowledge(query, limit);
  if (results.length === 0) return '';

  const blocks = results.map(
    ({ entry }) => `### ${entry.title}\n${entry.content}\n(Source : ${entry.source})`,
  );

  return `INFORMATIONS OFFICIELLES PERTINENTES (seule source autorisée pour répondre aux faits ci-dessous — ne rien ajouter, ne rien extrapoler) :\n\n${blocks.join('\n\n')}`;
}
