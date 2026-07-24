import type { GuideModule } from './types';

/**
 * English user guide — part 1: Getting started, Relationships, Activities.
 *
 * Same `id` values and same order as the French source (`guide.ts`), so both
 * languages can be swapped one for the other at render time.
 *
 * `categorie` keeps its canonical FRENCH identifier: it drives the category
 * filter and the matching between languages. Only the display is translated,
 * by `libelleCategorieGuide()`.
 *
 * Navigation paths use the real English sidebar labels.
 *
 * Editorial rule (inherited from the French version): describe only what the
 * software actually does.
 */
export const GUIDE_EN_PART1: GuideModule[] = [
  {
    id: 'demarrage',
    titre: 'Getting started & initial setup',
    href: '/dashboard',
    categorie: 'Démarrage',
    objectif:
      'Make the ERP usable by the organisation: identity, financial year, users and reference data.',
    utilisateurs: ['Administrator', 'Management'],
    prerequis: [
      'Administrator account created and password changed from the default',
      'Legal details of the organisation (registered name, address, contacts)',
      'Decision on the current financial year',
    ],
    procedure: [
      { titre: 'Enter the organisation identity', detail: 'Name, acronym, address, phone, email and the logo shown on exported documents.', chemin: 'Settings › Organisation' },
      { titre: 'Set the currency and amount format', detail: 'The currency is the reference for every financial module; changing it once entries exist is strongly discouraged.', chemin: 'Settings › General' },
      { titre: 'Open the financial year', detail: 'Create the current financial year before any entry, otherwise the journals will refuse the posting.', chemin: 'Accounting › Financial years' },
      { titre: 'Create the users and assign roles', detail: 'One role per function: each user only sees the modules they are entitled to.', chemin: 'Settings › Users' },
      { titre: 'Import the existing data', detail: 'Members, donors and the chart of accounts can be loaded from a file before going live.', chemin: 'Data import' },
      { titre: 'Take the guided tour', detail: 'The guided tour presents the key areas of the dashboard; it can be relaunched from the Support centre.' },
    ],
    erreurs: [
      { probleme: 'A journal entry cannot be saved', cause: 'No financial year is open', solution: 'Create the financial year in Accounting › Financial years, then try again.' },
      { probleme: 'Exported documents carry no logo', cause: 'Logo not uploaded in the organisation settings', solution: 'Add the logo in Settings › Organisation.' },
    ],
    conseils: [
      'Configure the settings first, then import, then open access to end users.',
      'Run a test import on a few rows before any bulk import.',
    ],
    permissions: ['Administrator role'],
  },
  {
    id: 'membres',
    titre: 'Members',
    href: '/membres',
    categorie: 'Relations',
    objectif: 'Keep the register of members and track memberships and membership dues.',
    utilisateurs: ['Administrative office', 'Administrator', 'Management'],
    prerequis: ['Member categories and dues amounts defined in the settings'],
    procedure: [
      { titre: 'Open the list of members', detail: 'The list shows name, category, status and joining date, with search and filters.', chemin: 'Members' },
      { titre: 'Create a member', detail: 'Enter at least a surname, a first name and one contact detail. Mandatory fields are flagged.', chemin: 'Members › New member' },
      { titre: 'Register the membership', detail: 'Select the category and the joining date; the status switches to active.' },
      { titre: 'Track membership dues', detail: 'Every payment collected is linked to the member and to the period covered.' },
      { titre: 'Export the register', detail: 'The export button produces the filtered list as a PDF or a spreadsheet.' },
    ],
    erreurs: [
      { probleme: 'Duplicate member', cause: 'Record created repeatedly without searching first', solution: 'Search for the name before creating anything; merge or deactivate the duplicate.' },
      { probleme: 'Member missing from the lists', cause: 'The active-status filter is applied', solution: 'Reset the filters to show inactive members as well.' },
    ],
    conseils: [
      'Standardise the way names are entered (capitals, accents) to make searches reliable.',
      'Record the phone number: it is used to match mobile payments.',
    ],
    permissions: ['Members read access to view', 'Members write access to create or edit'],
  },
  {
    id: 'donateurs',
    titre: 'Donors & donations',
    href: '/donateurs',
    categorie: 'Relations',
    objectif: 'Record donations, track donors and issue receipts.',
    utilisateurs: ['Fundraising', 'Accounting'],
    prerequis: ['Treasury accounts created', 'Financial year open'],
    procedure: [
      { titre: 'Create the donor record', detail: 'Individual or legal entity, with contact details and any preferred allocation.', chemin: 'Donors › New' },
      { titre: 'Record a donation', detail: 'Amount, date, nature (cash or in kind), payment method and any allocation to a project.' },
      { titre: 'Earmark the donation', detail: 'An earmarked donation is linked to a project: it appears in that project\'s budget monitoring.' },
      { titre: 'Issue the receipt', detail: 'The receipt carries the organisation identity, the amount and the date.' },
      { titre: 'Analyse fundraising', detail: 'Totals by period and by donor are visible in the module and in Reports & BI.' },
    ],
    erreurs: [
      { probleme: 'Donation not visible in the project', cause: 'Donation recorded with no allocation', solution: 'Edit the donation and select the relevant project.' },
      { probleme: 'Inconsistent amount after entry', cause: 'Decimal separator or spaces typed into the amount field', solution: 'Enter the amount without spaces or currency symbols.' },
    ],
    conseils: [
      'Distinguish earmarked from unrestricted donations at the point of entry: the distinction is structural under SYCEBNL.',
      'Record in-kind donations with a justified and documented valuation.',
    ],
    permissions: ['Donations write access', 'Accounting read access for reconciliation'],
  },
  {
    id: 'bailleurs',
    titre: 'Funders & grant agreements',
    href: '/bailleurs',
    categorie: 'Relations',
    objectif: 'Manage institutional funders, their grant agreements and the reporting deadlines.',
    utilisateurs: ['Management', 'Programme officer', 'Accounting'],
    prerequis: ['Projects created so that agreements can be attached to them'],
    procedure: [
      { titre: 'Create the funder', detail: 'Name, type, country and named contacts.', chemin: 'Funders › New' },
      { titre: 'Record the grant agreement', detail: 'Amount, currency, start and end dates, funded project.' },
      { titre: 'Track the funding instalments', detail: 'Every expected or received disbursement is dated and linked to the agreement.' },
      { titre: 'Track the reporting obligations', detail: 'Narrative and financial reporting deadlines are listed with their status.' },
    ],
    erreurs: [
      { probleme: 'Contracted total differs from the project budget', cause: 'Project budget prepared independently of the agreement', solution: 'Align the project budget with the contracted amount.' },
      { probleme: 'Agreement with no project', cause: 'Project not created at the time of entry', solution: 'Create the project, then attach the agreement to it.' },
    ],
    conseils: [
      'Archive the signed agreement in the document library and reference it from the record.',
      'Anticipate reporting deadlines by 15 days to allow for data consolidation.',
    ],
    permissions: ['Funders read/write access', 'Projects read access'],
  },
  {
    id: 'beneficiaires',
    titre: 'Beneficiaries',
    href: '/beneficiaires',
    categorie: 'Relations',
    objectif: 'List the people and groups reached by the activities and avoid double counting.',
    utilisateurs: ['Field teams', 'MEAL'],
    prerequis: ['Projects and activities created'],
    procedure: [
      { titre: 'Record a beneficiary', detail: 'Identity, location, category and the project they are attached to.', chemin: 'Beneficiaries › New' },
      { titre: 'Link to the activities', detail: 'Linking makes it possible to consolidate the numbers reached by project.' },
      { titre: 'Consolidate the numbers', detail: 'Disaggregated totals feed the MEAL indicators.' },
    ],
    erreurs: [
      { probleme: 'Numbers reached are overstated', cause: 'The same person recorded under several activities with no shared identifier', solution: 'Search for the person before creating a record and reuse the existing one.' },
    ],
    conseils: [
      'Limit collection to the data genuinely needed (personal-data minimisation).',
      'Document the legal basis for collection, or the consent obtained, where this is required.',
    ],
    permissions: ['Beneficiaries write access'],
  },
  {
    id: 'projets',
    titre: 'Projects',
    href: '/projets',
    categorie: 'Activités',
    objectif: 'Steer the project life cycle: scoping, budget, activities and progress.',
    utilisateurs: ['Project officer', 'Management', 'MEAL'],
    prerequis: ['Funder or funding source identified', 'Financial year open for financial monitoring'],
    procedure: [
      { titre: 'Create the project', detail: 'Title, dates, intervention area, project manager and status.', chemin: 'Projects › New project' },
      { titre: 'Define the budget', detail: 'The line-by-line budget is the reference for consumption monitoring.', chemin: 'Budget' },
      { titre: 'Plan the activities', detail: 'Each activity carries a period, a person responsible and a progress status.' },
      { titre: 'Attach the funding', detail: 'Grant agreements and earmarked donations feed into the project.' },
      { titre: 'Monitor consumption', detail: 'Expenses charged to the project feed the budget consumption rate.' },
    ],
    erreurs: [
      { probleme: 'Consumption rate stuck at 0%', cause: 'Expenses posted without a project allocation', solution: 'Go back over the entries and fill in the project analytical dimension.' },
      { probleme: 'Closed project can still be edited', cause: 'Status not updated', solution: 'Set the project status to closed once final approval is given.' },
    ],
    conseils: [
      'Create the project before the first expenses: retroactive allocation is time-consuming.',
      'Name projects with a short, stable code (e.g. PRJ-2026-01) reused everywhere.',
    ],
    permissions: ['Projects write access', 'Budget and Accounting read access for financial monitoring'],
  },
  {
    id: 'rh',
    titre: 'Human resources',
    href: '/rh',
    categorie: 'Activités',
    objectif: 'Manage personnel files, contracts, leave and payroll items.',
    utilisateurs: ['HR manager', 'Management'],
    prerequis: ['HR settings completed (contract types, payroll items)'],
    procedure: [
      { titre: 'Create the employee file', detail: 'Identity, position, department, start date and contact details.', chemin: 'Human resources › Employees' },
      { titre: 'Record the contract', detail: 'Type, duration, base salary and, where relevant, the project it is charged to.' },
      { titre: 'Track absence and leave', detail: 'Requests are recorded, then approved by the manager.' },
      { titre: 'Prepare the payroll', detail: 'Select the period, check the variable items, then generate the payslips.' },
      { titre: 'Post the payroll to the accounts', detail: 'Staff costs are carried into the accounts according to the configuration.' },
    ],
    erreurs: [
      { probleme: 'Payslip not generated', cause: 'No contract, or period already processed', solution: 'Check that an active contract exists for the period.' },
      { probleme: 'Staff costs not split by project', cause: 'No allocation key entered', solution: 'Enter the project allocation on the contract or on the journal entry.' },
    ],
    conseils: [
      'Lock a payroll period once the payslips have been approved.',
      'Keep the supporting documents (contracts, amendments) in the document library.',
    ],
    permissions: ['HR or Administrator role', 'Restricted access: payroll data is sensitive'],
  },
  {
    id: 'evenements',
    titre: 'Events',
    href: '/evenements',
    categorie: 'Activités',
    objectif: 'Organise assemblies, training sessions and public activities, with participants and a budget.',
    utilisateurs: ['Administrative office', 'Communications officer'],
    prerequis: ['Members or beneficiaries recorded, to build the participant list'],
    procedure: [
      { titre: 'Create the event', detail: 'Title, type, dates, venue and person responsible.', chemin: 'Events › New' },
      { titre: 'Manage the participants', detail: 'Add the registered participants and record attendance.' },
      { titre: 'Monitor the budget', detail: 'Related expenses can be charged to the event or to the project hosting it.' },
      { titre: 'Close and archive', detail: 'Minutes and attachments are kept in the document library.' },
    ],
    erreurs: [
      { probleme: 'Incomplete attendance list', cause: 'Participants added after the event took place', solution: 'Record attendance on the day; the export reflects the latest data entered.' },
    ],
    conseils: ['For a general assembly, link the event to the Governance module so that the decisions are kept.'],
    permissions: ['Events write access'],
  },
  {
    id: 'gouvernance',
    titre: 'Governance',
    href: '/gouvernance',
    categorie: 'Activités',
    objectif: 'Document the governing bodies, terms of office, statutory meetings and decisions.',
    utilisateurs: ['Management', 'Executive secretariat', 'Board members'],
    prerequis: ['Bodies and terms of office defined in the statutes'],
    procedure: [
      { titre: 'Declare the governing bodies', detail: 'General assembly, board of directors, executive committee, sub-committees.', chemin: 'Governance' },
      { titre: 'Record the terms of office', detail: 'Holder, position, start and end date of the term.' },
      { titre: 'Record the meetings', detail: 'Date, agenda, attendees and minutes.' },
      { titre: 'Track the decisions', detail: 'Every decision carries an owner and an implementation status.' },
    ],
    erreurs: [
      { probleme: 'Expired term of office still shown as active', cause: 'End date left blank', solution: 'Fill in the end date or renew the term of office.' },
    ],
    conseils: ['Always attach the signed minutes (document library) to the corresponding meeting.'],
    permissions: ['Governance read access for members, write access for the secretariat'],
  },
];
