import type { CasPratique } from './types';

/**
 * English step-by-step practical cases.
 *
 * Same `id` values and same order as the French source (`cas-pratiques.ts`),
 * so both languages can be swapped one for the other at render time.
 *
 * `niveau` stays on the canonical FRENCH identifier (`NiveauDifficulte`):
 * it drives matching between languages, and only its DISPLAY is translated
 * by `libelleNiveau()`.
 *
 * All names, amounts and references quoted below are FICTITIOUS and serve
 * a purely illustrative purpose — exactly as in the French version.
 *
 * Navigation paths use the real English sidebar labels.
 */
export const CAS_PRATIQUES_EN: CasPratique[] = [
  {
    id: 'cas-demarrage',
    titre: 'Bringing the ERP into service for a new organisation',
    contexte:
      'The fictitious NGO "Espoir Communautaire" has just acquired ANOUANZÊ ERP. No data has been entered yet and five people need access.',
    objectif: 'Reach a usable installation: organisation identity, financial year, users and reference data.',
    niveau: 'Débutant',
    dureeMinutes: 60,
    modules: ['Settings', 'Accounting', 'Data import'],
    etapes: [
      { titre: 'Enter the organisation identity', detail: 'Name "Espoir Communautaire", acronym "ESCOM", address and logo.', chemin: 'Settings › Organisation' },
      { titre: 'Set the currency', detail: 'Choose the accounting currency before entering any financial data.', chemin: 'Settings › General' },
      { titre: 'Open the financial year', detail: 'Financial year running from 1 January to 31 December of the current year.', chemin: 'Accounting › Financial years' },
      { titre: 'Create the five users', detail: 'An accountant, a project officer, an HR manager, an administrative assistant and an administrator; assign a role to each of them.', chemin: 'Settings › Users' },
      { titre: 'Check the chart of accounts', detail: 'Make sure the accounts the organisation actually uses are present.', chemin: 'Accounting › Chart of accounts' },
      { titre: 'Import the existing members', detail: 'Test on 5 rows first, then run the full import.', chemin: 'Data import' },
    ],
    resultatAttendu: [
      'The logo and the name appear on exported documents.',
      'The five users can log in and only see the modules they are entitled to.',
      'The first journal entry can be recorded.',
    ],
    erreursPossibles: [
      { probleme: 'Users see no menu at all', cause: 'No role assigned', solution: 'Assign a role, then ask the user to log out and back in.' },
      { probleme: 'Bulk import partially rejected', cause: 'Column headers altered in the source file', solution: 'Start again from the template and re-import only the failed rows.' },
    ],
  },
  {
    id: 'cas-adhesion',
    titre: 'Recording the membership of a new member',
    contexte:
      'Ms Aya Konan (fictitious) wishes to join under the "Active member" category, with annual membership dues of 25,000 F paid in cash.',
    objectif: 'Create the member record, register the membership and collect the dues.',
    niveau: 'Débutant',
    dureeMinutes: 10,
    modules: ['Members', 'Treasury'],
    etapes: [
      { titre: 'Search before creating', detail: 'Type "Konan" in the search box to rule out a duplicate.', chemin: 'Members' },
      { titre: 'Create the record', detail: 'Surname, first name, phone number and email; the phone number makes payment matching easier.', chemin: 'Members › New member' },
      { titre: 'Register the membership', detail: 'Category "Active member", today\'s joining date, active status.' },
      { titre: 'Collect the membership dues', detail: 'Amount 25,000, period covered, cash payment method.' },
      { titre: 'Check the treasury', detail: 'Confirm that the cash account reflects the collection.', chemin: 'Treasury' },
    ],
    resultatAttendu: [
      "Ms Konan's record appears in the list of active members.",
      'The membership dues are linked to the member and to the period.',
      'The cash balance increases by 25,000.',
    ],
    erreursPossibles: [
      { probleme: 'Two records for the same person', cause: 'Record created without searching first', solution: 'Deactivate the duplicate and keep the record carrying the membership dues.' },
      { probleme: 'Amount recorded as 25', cause: 'Thousands separator typed into the field', solution: 'Enter the amount without spaces or symbols.' },
    ],
  },
  {
    id: 'cas-don',
    titre: 'Recording a donation earmarked for a project',
    contexte:
      'The fictitious company "Bâtir SARL" transfers 1,500,000 F by bank transfer for the fictitious project "Eau potable Bouaké" (code PRJ-2026-03).',
    objectif: 'Trace the donation, earmark it for the project and link it to the bank account.',
    niveau: 'Débutant',
    dureeMinutes: 15,
    modules: ['Donors', 'Projects', 'Treasury'],
    etapes: [
      { titre: 'Check that the project exists', detail: 'Project PRJ-2026-03 must be created before the donation can be earmarked.', chemin: 'Projects' },
      { titre: 'Create the donor', detail: 'Legal entity "Bâtir SARL", with a named contact person.', chemin: 'Donors › New' },
      { titre: 'Enter the donation', detail: 'Amount 1,500,000, transfer date, bank transfer payment method.' },
      { titre: 'Earmark it for the project', detail: 'Select PRJ-2026-03 in the allocation field.' },
      { titre: 'Issue the receipt', detail: 'The receipt carries the organisation identity, the amount and the date.' },
      { titre: 'Check the link', detail: 'The donation appears among the project resources.', chemin: 'Projects › PRJ-2026-03' },
    ],
    resultatAttendu: [
      "The donation appears in the donor's history.",
      'Project resources increase by 1,500,000.',
      'The receipt is available as a PDF.',
    ],
    erreursPossibles: [
      { probleme: 'Donation missing from the project', cause: 'Allocation left blank', solution: 'Edit the donation and select the project.' },
      { probleme: 'Double counting with treasury', cause: 'The receipt was also keyed in manually in Treasury', solution: 'Keep a single record of the incoming payment.' },
    ],
  },
  {
    id: 'cas-projet',
    titre: 'Creating a funded project and its budget',
    contexte:
      'The fictitious funder "Fonds Solidarité Régional" is providing 40,000,000 F over 18 months for the "Écoles rurales" project (PRJ-2026-05).',
    objectif: 'Create the project, record the grant agreement and build the reference budget.',
    niveau: 'Intermédiaire',
    dureeMinutes: 45,
    modules: ['Projects', 'Funders', 'Budget', 'Documents'],
    etapes: [
      { titre: 'Create the project', detail: 'Title, code PRJ-2026-05, start and end dates, intervention area and project manager.', chemin: 'Projects › New project' },
      { titre: 'Create the funder', detail: 'Record for "Fonds Solidarité Régional" with its contacts.', chemin: 'Funders › New' },
      { titre: 'Record the grant agreement', detail: 'Amount 40,000,000, dates, funded project PRJ-2026-05.' },
      { titre: 'Schedule the instalments', detail: 'Three expected disbursements, each with its own date.' },
      { titre: 'Build the budget', detail: 'One line per budget heading, aligned with the accounts actually used in data entry.', chemin: 'Budget › New' },
      { titre: 'Archive the signed agreement', detail: 'Upload the PDF and attach it to the project.', chemin: 'Documents' },
    ],
    resultatAttendu: [
      'The project displays its contracted funding and its due dates.',
      'The approved budget serves as the reference for variance analysis.',
      'The signed agreement can be retrieved from the project record.',
    ],
    erreursPossibles: [
      { probleme: 'Budget with no actuals', cause: 'Budget accounts differ from the accounts used in data entry', solution: 'Align the budget accounts with the accounts actually posted to.' },
      { probleme: 'Contracted total ≠ budgeted total', cause: 'Budget prepared independently of the grant agreement', solution: 'Rebuild the budget from the contractual funding plan.' },
    ],
  },
  {
    id: 'cas-ecriture',
    titre: 'Posting a journal entry charged to a project',
    contexte:
      'Fictitious purchase of supplies for 350,000 F paid from the bank account, to be charged to project PRJ-2026-03.',
    objectif: 'Record a balanced journal entry together with its analytical dimension.',
    niveau: 'Intermédiaire',
    dureeMinutes: 20,
    modules: ['Accounting', 'Projects'],
    etapes: [
      { titre: 'Check the financial year', detail: 'The transaction date must fall within an open financial year.', chemin: 'Accounting › Financial years' },
      { titre: 'Open a new journal entry', detail: 'Bank journal, transaction date, meaningful description.', chemin: 'Accounting › Journal entries › New entry' },
      { titre: 'Enter the debit line', detail: 'Relevant expense account, 350,000 on the debit side.' },
      { titre: 'Enter the credit line', detail: 'Bank account, 350,000 on the credit side.' },
      { titre: 'Charge it to the project', detail: 'Enter PRJ-2026-03 on the expense line.' },
      { titre: 'Save and check', detail: 'Review the entry in the general ledger, then check the project consumption rate.' },
    ],
    resultatAttendu: [
      'The entry is balanced and visible in the general ledger and the trial balance.',
      'Budget consumption for the project increases by 350,000.',
    ],
    erreursPossibles: [
      { probleme: 'Entry rejected on save', cause: 'Debits and credits do not match', solution: 'Correct the amounts before trying again.' },
      { probleme: 'Expense missing from project monitoring', cause: 'Analytical dimension left blank', solution: 'Reopen the entry and enter the project on the expense line.' },
      { probleme: 'Date outside the financial year', cause: 'Previous financial year already closed', solution: 'Correct the date or open the relevant financial year.' },
    ],
  },
  {
    id: 'cas-achat',
    titre: 'Handling a purchase from order to payment',
    contexte:
      'Fictitious order of 20 school kits at 12,500 F each from the supplier "Papeterie du Centre".',
    objectif: 'Follow the purchase order → goods receipt → invoice → payment cycle and update the stock.',
    niveau: 'Intermédiaire',
    dureeMinutes: 30,
    modules: ['Purchasing', 'Stock', 'Treasury', 'Accounting'],
    etapes: [
      { titre: 'Create the supplier', detail: 'Legal name and payment details.', chemin: 'Purchasing › Suppliers' },
      { titre: 'Issue the purchase order', detail: '20 kits at 12,500, i.e. 250,000, charged to the project concerned.' },
      { titre: 'Receive the goods', detail: 'The goods receipt updates the stock of the item "School kit".', chemin: 'Stock' },
      { titre: 'Record the invoice', detail: 'Match the invoice against the purchase order and the goods receipt.' },
      { titre: 'Pay the supplier', detail: 'The payment generates the corresponding treasury movement.', chemin: 'Treasury' },
    ],
    resultatAttendu: [
      'The stock of school kits increases by 20 units.',
      'The supplier payable is cleared once payment is made.',
      'The expense appears in the budget consumption of the project.',
    ],
    erreursPossibles: [
      { probleme: 'Stock unchanged', cause: 'Goods receipt not recorded', solution: 'Record the goods receipt before the invoice.' },
      { probleme: 'Invoice higher than the purchase order', cause: 'Price or delivered-quantity discrepancy', solution: 'Have the invoice corrected, or document the discrepancy before approval.' },
    ],
  },
  {
    id: 'cas-cloture',
    titre: 'Preparing a month-end close and its exports',
    contexte:
      'Month end: management is asking for the consolidated financial position and a report by project.',
    objectif: 'Make the month\'s data reliable, then produce the documents to be circulated.',
    niveau: 'Avancé',
    dureeMinutes: 90,
    modules: ['Accounting', 'Treasury', 'Budget', 'Reports & BI'],
    etapes: [
      { titre: "Review the month's data entry", detail: 'Check that no supporting document for the month is left unrecorded.', chemin: 'Accounting › Journal entries' },
      { titre: 'Reconcile the treasury accounts', detail: 'Compare each account with the statement for the period and clear the differences.', chemin: 'Treasury' },
      { titre: 'Check the project allocations', detail: 'Spot expenses with no analytical dimension and complete them.' },
      { titre: 'Review the budget variances', detail: 'Analyse over-consumed lines before circulating anything.', chemin: 'Budget' },
      { titre: 'Generate the reports', detail: 'Filter the period, then export to PDF for circulation and to spreadsheet for analysis.', chemin: 'Reports & BI' },
      { titre: 'Archive the documents produced', detail: "File the month's exports in the document library.", chemin: 'Documents' },
    ],
    resultatAttendu: [
      'Treasury balances match the bank statements.',
      'The reports circulated are based on reconciled data.',
      "The month's exports are archived and can be retrieved.",
    ],
    erreursPossibles: [
      { probleme: 'Discrepancy between two reports', cause: 'Different periods or filters', solution: 'Compare the filters applied before concluding that something is wrong.' },
      { probleme: 'Empty report', cause: 'Filters too restrictive', solution: 'Reset the filters and widen the period.' },
    ],
  },
  {
    id: 'cas-rapport-bailleur',
    titre: 'Putting together a financial report for a funder',
    contexte:
      '"Fonds Solidarité Régional" is expecting the half-yearly financial report for project PRJ-2026-05.',
    objectif: 'Produce a statement of expenditure consistent with the contracted budget and backed by supporting documents.',
    niveau: 'Avancé',
    dureeMinutes: 120,
    modules: ['Projects', 'Budget', 'Accounting', 'Documents', 'Reports & BI'],
    etapes: [
      { titre: 'Define the reporting period', detail: 'Use exactly the dates required by the grant agreement.' },
      { titre: 'Extract the project expenditure', detail: 'Filter the entries charged to PRJ-2026-05 over the period.', chemin: 'Accounting' },
      { titre: 'Compare with the contracted budget', detail: 'Line by line, measure the variances and prepare the explanations.', chemin: 'Budget' },
      { titre: 'Check the supporting documents', detail: 'Every material expense must have an archived supporting document.', chemin: 'Documents' },
      { titre: 'Generate and export the report', detail: 'PDF export for sending, spreadsheet export to match the funder\'s own format.', chemin: 'Reports & BI' },
      { titre: 'Archive the version sent', detail: 'Keep the exact version submitted to the funder.' },
    ],
    resultatAttendu: [
      'A statement of expenditure reconciled with the accounts.',
      'Material variances are explained.',
      'The version submitted is archived and time-stamped.',
    ],
    erreursPossibles: [
      { probleme: 'Expenses missing from the extraction', cause: 'Project allocation missing on some entries', solution: 'Complete the analytical dimensions before extracting.' },
      { probleme: 'Supporting document cannot be found', cause: 'Document not archived at the time of the expense', solution: 'Set up filing as data is entered, rather than after the fact.' },
    ],
  },
];
