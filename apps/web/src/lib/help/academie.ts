import type { CategorieParcours, Parcours, Ressource } from './types';

/**
 * Parcours de formation de l'Académie ANOUANZÊ.
 *
 * IMPORTANT : aucun contenu vidéo n'est publié à ce jour.
 * Toutes les leçons ont `disponible: false` et l'interface affiche
 * « Contenu vidéo bientôt disponible ». Les liens internes renvoient
 * vers les pages réelles de l'ERP ou vers le guide utilisateur.
 */
export const PARCOURS: Parcours[] = [
  {
    id: 'p-demarrage',
    categorie: 'Démarrage',
    titre: 'Prendre en main ANOUANZÊ ERP',
    description: "Découvrir l'interface, la navigation et les premiers réflexes de saisie.",
    niveau: 'Débutant',
    lecons: [
      { id: 'l-dem-1', titre: "Se connecter et sécuriser son compte", resume: "Première connexion, mot de passe et bonnes pratiques de session.", dureeMinutes: 8, niveau: 'Débutant', disponible: false, lienInterne: '/aide', objectifs: ['Se connecter sans blocage', 'Choisir un mot de passe robuste'] },
      { id: 'l-dem-2', titre: "Comprendre le tableau de bord", resume: "Lire les indicateurs et accéder aux modules depuis l'accueil.", dureeMinutes: 10, niveau: 'Débutant', disponible: false, lienInterne: '/dashboard', objectifs: ['Identifier les zones clés', 'Naviguer entre les modules'] },
      { id: 'l-dem-3', titre: 'Naviguer, rechercher et filtrer', resume: "Utiliser la barre latérale, la recherche et les filtres de listes.", dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Retrouver une fiche rapidement', 'Combiner plusieurs filtres'] },
      { id: 'l-dem-4', titre: 'Configurer son organisation', resume: "Identité, logo, devise et exercice comptable.", dureeMinutes: 15, niveau: 'Débutant', disponible: false, lienInterne: '/parametres', objectifs: ["Paramétrer l'identité", "Ouvrir un exercice"] },
    ],
  },
  {
    id: 'p-administration',
    categorie: 'Administration',
    titre: 'Administrer la plateforme',
    description: 'Gérer les utilisateurs, les rôles et les données de référence.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-adm-1', titre: 'Créer des utilisateurs et attribuer des rôles', resume: "Ouvrir les accès sans donner plus de droits que nécessaire.", dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/parametres', objectifs: ['Créer un compte', 'Appliquer le moindre privilège'] },
      { id: 'l-adm-2', titre: 'Structurer les données de référence', resume: "Catégories, journaux et listes partagées entre modules.", dureeMinutes: 10, niveau: 'Intermédiaire', disponible: false, objectifs: ['Éviter les listes redondantes'] },
      { id: 'l-adm-3', titre: "Exploiter le journal d'audit", resume: "Retrouver l'auteur et l'horodatage d'une modification.", dureeMinutes: 8, niveau: 'Intermédiaire', disponible: false, lienInterne: '/audit', objectifs: ['Filtrer le journal', 'Documenter un incident'] },
      { id: 'l-adm-4', titre: 'Gérer les départs et les arrivées', resume: "Désactiver un compte sans perdre la traçabilité.", dureeMinutes: 6, niveau: 'Intermédiaire', disponible: false, objectifs: ['Désactiver plutôt que supprimer'] },
    ],
  },
  {
    id: 'p-modules',
    categorie: 'Modules métier',
    titre: 'Maîtriser les modules métier',
    description: 'Membres, dons, bailleurs, projets, événements et gouvernance.',
    niveau: 'Débutant',
    lecons: [
      { id: 'l-mod-1', titre: 'Gérer les membres et les cotisations', resume: "Adhésion, catégories et suivi des cotisations.", dureeMinutes: 14, niveau: 'Débutant', disponible: false, lienInterne: '/membres', objectifs: ['Créer une adhésion', 'Encaisser une cotisation'] },
      { id: 'l-mod-2', titre: 'Enregistrer dons et donateurs', resume: "Dons numéraires, dons en nature, affectation et reçus.", dureeMinutes: 16, niveau: 'Débutant', disponible: false, lienInterne: '/donateurs', objectifs: ['Distinguer affecté et non affecté'] },
      { id: 'l-mod-3', titre: 'Suivre bailleurs et conventions', resume: "Tranches de financement et obligations de rapport.", dureeMinutes: 18, niveau: 'Intermédiaire', disponible: false, lienInterne: '/bailleurs', objectifs: ['Enregistrer une convention', 'Anticiper les échéances'] },
      { id: 'l-mod-4', titre: 'Piloter un projet de bout en bout', resume: "Cadrage, activités, financements et avancement.", dureeMinutes: 20, niveau: 'Intermédiaire', disponible: false, lienInterne: '/projets', objectifs: ['Structurer un projet', 'Suivre la consommation'] },
      { id: 'l-mod-5', titre: 'Organiser un événement', resume: "Participants, présences et budget de l'événement.", dureeMinutes: 10, niveau: 'Débutant', disponible: false, lienInterne: '/evenements', objectifs: ['Tenir une liste de présence fiable'] },
      { id: 'l-mod-6', titre: 'Documenter la gouvernance', resume: "Instances, mandats, réunions et décisions.", dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/gouvernance', objectifs: ['Consigner une décision et son suivi'] },
    ],
  },
  {
    id: 'p-finance',
    categorie: 'Finance',
    titre: 'Comptabilité, budget et trésorerie',
    description: 'Tenir une comptabilité SYCEBNL et piloter les finances.',
    niveau: 'Avancé',
    lecons: [
      { id: 'l-fin-1', titre: 'Comprendre le référentiel SYCEBNL', resume: "Logique du plan de comptes et des états financiers.", dureeMinutes: 20, niveau: 'Avancé', disponible: false, lienInterne: '/comptabilite', objectifs: ['Situer le référentiel', 'Lire un plan de comptes'] },
      { id: 'l-fin-2', titre: 'Saisir des écritures équilibrées', resume: "Journaux, dates, débit/crédit et axes analytiques.", dureeMinutes: 22, niveau: 'Intermédiaire', disponible: false, lienInterne: '/comptabilite', objectifs: ['Saisir sans rejet', 'Imputer un projet'] },
      { id: 'l-fin-3', titre: 'Construire et suivre un budget', resume: "Budget annuel, budget projet et analyse des écarts.", dureeMinutes: 18, niveau: 'Intermédiaire', disponible: false, lienInterne: '/budget', objectifs: ['Aligner budget et comptes'] },
      { id: 'l-fin-4', titre: 'Tenir la trésorerie et rapprocher', resume: "Comptes, mouvements et rapprochement mensuel.", dureeMinutes: 16, niveau: 'Intermédiaire', disponible: false, lienInterne: '/tresorerie', objectifs: ['Rapprocher un relevé'] },
      { id: 'l-fin-5', titre: 'Maîtriser le circuit achats', resume: "Commande, réception, facture et règlement.", dureeMinutes: 15, niveau: 'Intermédiaire', disponible: false, lienInterne: '/achats', objectifs: ["Respecter l'ordre du circuit"] },
      { id: 'l-fin-6', titre: 'Suivre stocks et immobilisations', resume: "Entrées, sorties, inventaire et amortissements.", dureeMinutes: 14, niveau: 'Intermédiaire', disponible: false, lienInterne: '/stocks', objectifs: ['Régulariser un écart d\'inventaire'] },
    ],
  },
  {
    id: 'p-rapports',
    categorie: 'Rapports',
    titre: 'Rapports, BI et suivi-évaluation',
    description: 'Produire des rapports fiables et exploiter les indicateurs MEAL.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-rap-1', titre: 'Générer et filtrer un rapport', resume: "Choisir le bon rapport et appliquer les bons filtres.", dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/reporting', objectifs: ['Éviter les rapports vides'] },
      { id: 'l-rap-2', titre: 'Exporter pour diffusion', resume: "PDF pour la diffusion, tableur pour le retraitement.", dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Choisir le bon format'] },
      { id: 'l-rap-3', titre: 'Définir des indicateurs MEAL', resume: "Référence, cible, fréquence et source de vérification.", dureeMinutes: 18, niveau: 'Avancé', disponible: false, lienInterne: '/meal', objectifs: ['Écrire un indicateur mesurable'] },
      { id: 'l-rap-4', titre: 'Préparer un rapport bailleur', resume: "Réconcilier dépenses, budget et pièces justificatives.", dureeMinutes: 25, niveau: 'Avancé', disponible: false, objectifs: ['Justifier les écarts'] },
    ],
  },
  {
    id: 'p-mobile',
    categorie: 'Mobile',
    titre: 'Utilisation mobile et terrain',
    description: "Travailler depuis un téléphone ou une tablette et gérer les paiements mobiles.",
    niveau: 'Débutant',
    lecons: [
      { id: 'l-mob-1', titre: "Utiliser l'ERP sur téléphone", resume: "Navigation responsive et limites de la saisie mobile.", dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Savoir ce qui se fait bien sur mobile'] },
      { id: 'l-mob-2', titre: 'Collecter des données terrain', resume: "Saisie des bénéficiaires et des présences en déplacement.", dureeMinutes: 12, niveau: 'Débutant', disponible: false, lienInterne: '/beneficiaires', objectifs: ['Éviter les doublons de saisie'] },
      { id: 'l-mob-3', titre: 'Rapprocher les paiements mobiles', resume: "Associer une transaction à une fiche et la comptabiliser.", dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/paiements', objectifs: ['Traiter les transactions non rattachées'] },
    ],
  },
  {
    id: 'p-securite',
    categorie: 'Sécurité',
    titre: 'Sécurité et protection des données',
    description: 'Protéger les accès, les données personnelles et la traçabilité.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-sec-1', titre: 'Hygiène des mots de passe et des sessions', resume: "Comptes nominatifs, mots de passe uniques, déconnexion.", dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Ne jamais partager un compte'] },
      { id: 'l-sec-2', titre: 'Appliquer le moindre privilège', resume: "Concevoir des rôles resserrés par métier.", dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, objectifs: ['Auditer les droits attribués'] },
      { id: 'l-sec-3', titre: 'Protéger les données personnelles', resume: "Minimisation, accès restreints et diffusion des exports.", dureeMinutes: 14, niveau: 'Intermédiaire', disponible: false, objectifs: ['Limiter la collecte au nécessaire'] },
      { id: 'l-sec-4', titre: 'Réagir à un incident', resume: "Réflexes immédiats, journal d'audit et ouverture de ticket.", dureeMinutes: 10, niveau: 'Intermédiaire', disponible: false, lienInterne: '/tickets', objectifs: ['Documenter un incident exploitable'] },
    ],
  },
];

export const CATEGORIES_PARCOURS: CategorieParcours[] = [
  'Démarrage',
  'Administration',
  'Modules métier',
  'Finance',
  'Rapports',
  'Mobile',
  'Sécurité',
];

/**
 * Bibliothèque de ressources.
 * Les ressources marquées `disponible: false` ne sont pas encore publiées :
 * l'interface ne propose aucun téléchargement fictif.
 */
export const RESSOURCES: Ressource[] = [
  { id: 'r-guide', titre: 'Guide utilisateur complet', description: "Objectifs, procédures, erreurs fréquentes et permissions, module par module.", type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-faq', titre: 'FAQ internes', description: "Réponses aux questions les plus fréquentes, classées par thème.", type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-cas', titre: 'Cas pratiques pas à pas', description: "Scénarios complets avec données fictives, de l'adhésion à la clôture.", type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-import', titre: 'Modèles de fichiers d\'import', description: "Les modèles de colonnes attendus sont proposés dans le module Import de données.", type: 'Modèle d\'import', href: '/import', disponible: true },
  { id: 'r-audit', titre: "Journal d'audit", description: "Trace des actions réalisées, utile pour les contrôles internes.", type: 'Page interne', href: '/audit', disponible: true },
  { id: 'r-support', titre: 'Ouvrir un ticket de support', description: "Signaler un incident ou demander une évolution à IBIG SOFT.", type: 'Page interne', href: '/tickets', disponible: true },
  { id: 'r-video', titre: 'Vidéos de formation', description: "Aucune vidéo n'est publiée à ce jour. Les capsules seront ajoutées ici dès leur mise à disposition par IBIG SOFT.", type: 'À venir', disponible: false },
  { id: 'r-certif', titre: 'Parcours certifiant', description: "Évaluation et attestation de fin de parcours : fonctionnalité non disponible pour le moment.", type: 'À venir', disponible: false },
];
