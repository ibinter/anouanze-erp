import type { Parcours, Ressource } from './types';

/**
 * English version of the ANOUANZÊ Academy learning paths.
 *
 * Same `id` values and same order as the French source (`academie.ts`), so
 * both languages can be swapped one for the other at render time — and so the
 * progress stored in `localStorage` (which keys on lesson ids) stays valid
 * when the user switches language.
 *
 * `categorie` and `niveau` keep their canonical FRENCH identifier; only the
 * display is translated, by `libelleCategorieParcours()` / `libelleNiveau()`.
 *
 * IMPORTANT — no video content has been published to date. Every lesson keeps
 * `disponible: false` and the interface states that video content is coming
 * soon. Internal links point to the real ERP pages or to the user guide.
 */
export const PARCOURS_EN: Parcours[] = [
  {
    id: 'p-demarrage',
    categorie: 'Démarrage',
    titre: 'Getting started with ANOUANZÊ ERP',
    description: 'Discover the interface, the navigation and the first data-entry reflexes.',
    niveau: 'Débutant',
    lecons: [
      { id: 'l-dem-1', titre: 'Logging in and securing your account', resume: 'First login, password and good session practice.', dureeMinutes: 8, niveau: 'Débutant', disponible: false, lienInterne: '/aide', objectifs: ['Log in without being locked out', 'Choose a strong password'] },
      { id: 'l-dem-2', titre: 'Understanding the dashboard', resume: 'Read the indicators and reach the modules from the home page.', dureeMinutes: 10, niveau: 'Débutant', disponible: false, lienInterne: '/dashboard', objectifs: ['Identify the key areas', 'Move between modules'] },
      { id: 'l-dem-3', titre: 'Navigating, searching and filtering', resume: 'Use the sidebar, the search box and the list filters.', dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Find a record quickly', 'Combine several filters'] },
      { id: 'l-dem-4', titre: 'Configuring your organisation', resume: 'Identity, logo, currency and financial year.', dureeMinutes: 15, niveau: 'Débutant', disponible: false, lienInterne: '/parametres', objectifs: ['Set up the organisation identity', 'Open a financial year'] },
    ],
  },
  {
    id: 'p-administration',
    categorie: 'Administration',
    titre: 'Administering the platform',
    description: 'Manage users, roles and reference data.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-adm-1', titre: 'Creating users and assigning roles', resume: 'Grant access without giving away more rights than necessary.', dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/parametres', objectifs: ['Create an account', 'Apply least privilege'] },
      { id: 'l-adm-2', titre: 'Structuring reference data', resume: 'Categories, journals and lists shared across modules.', dureeMinutes: 10, niveau: 'Intermédiaire', disponible: false, objectifs: ['Avoid redundant lists'] },
      { id: 'l-adm-3', titre: 'Making use of the audit log', resume: 'Find out who made a change and when.', dureeMinutes: 8, niveau: 'Intermédiaire', disponible: false, lienInterne: '/audit', objectifs: ['Filter the log', 'Document an incident'] },
      { id: 'l-adm-4', titre: 'Handling joiners and leavers', resume: 'Deactivate an account without losing the audit trail.', dureeMinutes: 6, niveau: 'Intermédiaire', disponible: false, objectifs: ['Deactivate rather than delete'] },
    ],
  },
  {
    id: 'p-modules',
    categorie: 'Modules métier',
    titre: 'Mastering the business modules',
    description: 'Members, donations, funders, projects, events and governance.',
    niveau: 'Débutant',
    lecons: [
      { id: 'l-mod-1', titre: 'Managing members and membership dues', resume: 'Membership, categories and monitoring of dues.', dureeMinutes: 14, niveau: 'Débutant', disponible: false, lienInterne: '/membres', objectifs: ['Register a membership', 'Collect membership dues'] },
      { id: 'l-mod-2', titre: 'Recording donations and donors', resume: 'Cash donations, in-kind donations, allocation and receipts.', dureeMinutes: 16, niveau: 'Débutant', disponible: false, lienInterne: '/donateurs', objectifs: ['Tell earmarked from unrestricted donations'] },
      { id: 'l-mod-3', titre: 'Tracking funders and grant agreements', resume: 'Funding instalments and reporting obligations.', dureeMinutes: 18, niveau: 'Intermédiaire', disponible: false, lienInterne: '/bailleurs', objectifs: ['Record a grant agreement', 'Anticipate reporting deadlines'] },
      { id: 'l-mod-4', titre: 'Running a project from end to end', resume: 'Scoping, activities, funding and progress.', dureeMinutes: 20, niveau: 'Intermédiaire', disponible: false, lienInterne: '/projets', objectifs: ['Structure a project', 'Monitor budget consumption'] },
      { id: 'l-mod-5', titre: 'Organising an event', resume: 'Participants, attendance and event budget.', dureeMinutes: 10, niveau: 'Débutant', disponible: false, lienInterne: '/evenements', objectifs: ['Keep a reliable attendance list'] },
      { id: 'l-mod-6', titre: 'Documenting governance', resume: 'Bodies, terms of office, meetings and decisions.', dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/gouvernance', objectifs: ['Record a decision and its follow-up'] },
    ],
  },
  {
    id: 'p-finance',
    categorie: 'Finance',
    titre: 'Accounting, budget and treasury',
    description: 'Keep SYCEBNL-compliant accounts and steer the finances.',
    niveau: 'Avancé',
    lecons: [
      { id: 'l-fin-1', titre: 'Understanding the SYCEBNL framework', resume: 'The logic behind the chart of accounts and the financial statements.', dureeMinutes: 20, niveau: 'Avancé', disponible: false, lienInterne: '/comptabilite', objectifs: ['Place the framework in context', 'Read a chart of accounts'] },
      { id: 'l-fin-2', titre: 'Posting balanced journal entries', resume: 'Journals, dates, debit/credit and analytical dimensions.', dureeMinutes: 22, niveau: 'Intermédiaire', disponible: false, lienInterne: '/comptabilite', objectifs: ['Post without rejection', 'Charge an entry to a project'] },
      { id: 'l-fin-3', titre: 'Building and monitoring a budget', resume: 'Annual budget, project budget and variance analysis.', dureeMinutes: 18, niveau: 'Intermédiaire', disponible: false, lienInterne: '/budget', objectifs: ['Align the budget with the accounts'] },
      { id: 'l-fin-4', titre: 'Managing treasury and reconciling', resume: 'Accounts, movements and monthly reconciliation.', dureeMinutes: 16, niveau: 'Intermédiaire', disponible: false, lienInterne: '/tresorerie', objectifs: ['Reconcile a bank statement'] },
      { id: 'l-fin-5', titre: 'Mastering the purchasing cycle', resume: 'Purchase order, goods receipt, invoice and payment.', dureeMinutes: 15, niveau: 'Intermédiaire', disponible: false, lienInterne: '/achats', objectifs: ['Follow the cycle in the right order'] },
      { id: 'l-fin-6', titre: 'Tracking stock and fixed assets', resume: 'Receipts, issues, stock count and depreciation.', dureeMinutes: 14, niveau: 'Intermédiaire', disponible: false, lienInterne: '/stocks', objectifs: ['Adjust a stock-count discrepancy'] },
    ],
  },
  {
    id: 'p-rapports',
    categorie: 'Rapports',
    titre: 'Reports, BI and monitoring & evaluation',
    description: 'Produce reliable reports and make use of MEAL indicators.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-rap-1', titre: 'Generating and filtering a report', resume: 'Pick the right report and apply the right filters.', dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/reporting', objectifs: ['Avoid empty reports'] },
      { id: 'l-rap-2', titre: 'Exporting for circulation', resume: 'PDF for circulation, spreadsheet for further processing.', dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Choose the right format'] },
      { id: 'l-rap-3', titre: 'Defining MEAL indicators', resume: 'Baseline, target, frequency and means of verification.', dureeMinutes: 18, niveau: 'Avancé', disponible: false, lienInterne: '/meal', objectifs: ['Write a measurable indicator'] },
      { id: 'l-rap-4', titre: 'Preparing a funder report', resume: 'Reconcile expenditure, budget and supporting documents.', dureeMinutes: 25, niveau: 'Avancé', disponible: false, objectifs: ['Justify the variances'] },
    ],
  },
  {
    id: 'p-mobile',
    categorie: 'Mobile',
    titre: 'Mobile and field use',
    description: 'Work from a phone or a tablet and handle mobile payments.',
    niveau: 'Débutant',
    lecons: [
      { id: 'l-mob-1', titre: 'Using the ERP on a phone', resume: 'Responsive navigation and the limits of mobile data entry.', dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Know what works well on mobile'] },
      { id: 'l-mob-2', titre: 'Collecting field data', resume: 'Recording beneficiaries and attendance while on the move.', dureeMinutes: 12, niveau: 'Débutant', disponible: false, lienInterne: '/beneficiaires', objectifs: ['Avoid duplicate entries'] },
      { id: 'l-mob-3', titre: 'Reconciling mobile payments', resume: 'Match a transaction to a record and post it to the accounts.', dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, lienInterne: '/paiements', objectifs: ['Deal with unmatched transactions'] },
    ],
  },
  {
    id: 'p-securite',
    categorie: 'Sécurité',
    titre: 'Security and data protection',
    description: 'Protect access, personal data and the audit trail.',
    niveau: 'Intermédiaire',
    lecons: [
      { id: 'l-sec-1', titre: 'Password and session hygiene', resume: 'Named accounts, unique passwords, logging out.', dureeMinutes: 8, niveau: 'Débutant', disponible: false, objectifs: ['Never share an account'] },
      { id: 'l-sec-2', titre: 'Applying least privilege', resume: 'Design tightly scoped roles for each function.', dureeMinutes: 12, niveau: 'Intermédiaire', disponible: false, objectifs: ['Audit the rights granted'] },
      { id: 'l-sec-3', titre: 'Protecting personal data', resume: 'Data minimisation, restricted access and circulation of exports.', dureeMinutes: 14, niveau: 'Intermédiaire', disponible: false, objectifs: ['Collect only what is needed'] },
      { id: 'l-sec-4', titre: 'Responding to an incident', resume: 'Immediate reflexes, audit log and raising a ticket.', dureeMinutes: 10, niveau: 'Intermédiaire', disponible: false, lienInterne: '/tickets', objectifs: ['Document an incident usefully'] },
    ],
  },
];

/**
 * English resource library.
 * Resources flagged `disponible: false` are not published yet: the interface
 * offers no fictitious download.
 */
export const RESSOURCES_EN: Ressource[] = [
  { id: 'r-guide', titre: 'Full user guide', description: 'Objectives, procedures, common mistakes and permissions, module by module.', type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-faq', titre: 'Internal FAQ', description: 'Answers to the most frequent questions, sorted by topic.', type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-cas', titre: 'Step-by-step practical cases', description: 'Complete scenarios based on fictitious data, from membership to month-end close.', type: 'Guide en ligne', href: '/aide', disponible: true },
  { id: 'r-import', titre: 'Import file templates', description: 'The expected column templates are offered in the Data import module.', type: "Modèle d'import", href: '/import', disponible: true },
  { id: 'r-audit', titre: 'Audit log', description: 'A trace of the actions performed, useful for internal controls.', type: 'Page interne', href: '/audit', disponible: true },
  { id: 'r-support', titre: 'Raise a support ticket', description: 'Report an incident or request a change from IBIG SOFT.', type: 'Page interne', href: '/tickets', disponible: true },
  { id: 'r-video', titre: 'Training videos', description: 'No video has been published to date. Modules will be added here as soon as IBIG SOFT makes them available.', type: 'À venir', disponible: false },
  { id: 'r-certif', titre: 'Certification path', description: 'Assessment and certificate of completion: this feature is not available at this stage.', type: 'À venir', disponible: false },
];
