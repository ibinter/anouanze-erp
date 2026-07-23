/** Les 7 catégories de l'espace Paramètres (section 9.6 du cahier des charges). */
export type CategorieId =
  | 'organisation'
  | 'utilisateurs'
  | 'documents'
  | 'notifications'
  | 'integrations'
  | 'donnees'
  | 'abonnement';

export interface Categorie {
  id: CategorieId;
  lettre: string;
  titre: string;
  resume: string;
  /** Termes indexés pour la recherche dans les paramètres. */
  motsCles: string[];
}

export const CATEGORIES: Categorie[] = [
  {
    id: 'organisation',
    lettre: 'A',
    titre: 'Organisation',
    resume: 'Identité, logo, coordonnées, pays, langue, devise et exercice comptable.',
    motsCles: [
      'organisation', 'identite', 'identité', 'nom', 'sigle', 'logo', 'couleur', 'charte',
      'coordonnees', 'coordonnées', 'email', 'telephone', 'téléphone', 'site web', 'siege', 'siège',
      'adresse', 'pays', 'langue', 'francais', 'français', 'anglais', 'fuseau', 'horaire',
      'devise', 'xof', 'franc cfa', 'euro', 'dollar', 'exercice', 'comptable', 'annee', 'année',
      'type', 'association', 'ong', 'fondation',
    ],
  },
  {
    id: 'utilisateurs',
    lettre: 'B',
    titre: 'Utilisateurs & sécurité',
    resume: 'Membres, rôles, permissions, invitations, sessions et mots de passe.',
    motsCles: [
      'utilisateur', 'utilisateurs', 'membre', 'membres', 'compte', 'comptes', 'role', 'rôle',
      'roles', 'rôles', 'permission', 'permissions', 'matrice', 'droits', 'rbac', 'securite',
      'sécurité', 'inviter', 'invitation', 'activer', 'desactiver', 'désactiver', 'admin',
      'administrateur', 'super admin', 'comptable', 'directeur', 'auditeur', 'lecteur',
      'bailleur', 'donateur', 'rh', 'projet', 'session', 'sessions', 'appareil', 'appareils',
      '2fa', 'double authentification', 'mot de passe', 'connexion',
    ],
  },
  {
    id: 'documents',
    lettre: 'C',
    titre: 'Documents',
    resume: 'En-têtes, pieds de page, numérotation et mentions légales.',
    motsCles: [
      'document', 'documents', 'entete', 'en-tête', 'entête', 'pied de page', 'pagination',
      'numerotation', 'numérotation', 'prefixe', 'préfixe', 'compteur', 'reference', 'référence',
      'mention', 'mentions', 'legales', 'légales', 'pdf', 'impression', 'recu', 'reçu',
      'facture', 'rapport', 'modele', 'modèle', 'gabarit',
    ],
  },
  {
    id: 'notifications',
    lettre: 'D',
    titre: 'Notifications',
    resume: 'Canaux email et application, alertes métier.',
    motsCles: [
      'notification', 'notifications', 'alerte', 'alertes', 'email', 'mail', 'canal', 'canaux',
      'rappel', 'cotisation', 'budget', 'stock', 'paiement', 'rapport mensuel', 'preference',
      'préférence', 'preferences', 'préférences',
    ],
  },
  {
    id: 'integrations',
    lettre: 'E',
    titre: 'Intégrations',
    resume: 'Paiements mobiles, intelligence artificielle, API et webhooks.',
    motsCles: [
      'integration', 'intégration', 'integrations', 'intégrations', 'paiement', 'paiements',
      'mobile money', 'orange money', 'mtn', 'momo', 'wave', 'cinetpay', 'webhook', 'webhooks',
      'ia', 'intelligence artificielle', 'sara', 'assistant', 'api', 'cle api', 'clé api',
      'openapi', 'swagger',
    ],
  },
  {
    id: 'donnees',
    lettre: 'F',
    titre: 'Données',
    resume: 'Import, export, sauvegarde et suppression.',
    motsCles: [
      'donnee', 'donnée', 'donnees', 'données', 'import', 'importer', 'export', 'exporter',
      'excel', 'xlsx', 'csv', 'pdf', 'sauvegarde', 'backup', 'restauration', 'restaurer',
      'archive', 'purge', 'suppression', 'portabilite', 'portabilité', 'rgpd',
    ],
  },
  {
    id: 'abonnement',
    lettre: 'G',
    titre: 'Abonnement',
    resume: 'Formule souscrite, nombre d’utilisateurs et consommation.',
    motsCles: [
      'abonnement', 'formule', 'plan', 'tarif', 'facture', 'facturation', 'quota', 'quotas',
      'consommation', 'usage', 'licence', 'utilisateurs inclus', 'stockage', 'contrat',
      'ibig soft', 'support',
    ],
  },
];

function normaliser(v: string) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Recherche dans les paramètres : renvoie les catégories correspondant à la requête. */
export function filtrerCategories(requete: string): Categorie[] {
  const q = normaliser(requete.trim());
  if (!q) return CATEGORIES;
  return CATEGORIES.filter((c) =>
    [c.titre, c.resume, ...c.motsCles].some((champ) => normaliser(champ).includes(q)),
  );
}
