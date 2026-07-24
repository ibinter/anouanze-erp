import type { FaqItem } from './types';

/**
 * English FAQ — part 3 of the ANOUANZÊ ERP help centre.
 * Categories: Documents & printing · Subscriptions & licences ·
 * Backup & data · SARA assistant · Support.
 *
 * Same `id` values and same order as the French source (`faq.ts`).
 *
 * Editorial rule (inherited from the French source): describe only what the
 * software actually does. Anything that depends on the hosting, the licence
 * agreement or the maintenance contract is explicitly referred back to
 * IBIG SOFT — no service commitment (backup frequency, retention, restore
 * guarantee, response time) is stated here that is not already stated in
 * French.
 *
 * Note: `FaqItem['categorie']` is typed with the French `CategorieFaq` union,
 * so the English labels below are outside that union. The single cast keeps
 * this file self-contained; widening the type belongs to the wiring step.
 */
const ITEMS = [
  // ── Documents & printing ──────────────────────────────────
  { id: 'doc-1', categorie: 'Documents & printing', question: 'Where are uploaded files stored?', reponse: "On the server that hosts your installation. They can be consulted from the Documents module, subject to your permissions.", motsCles: ['files', 'storage', 'document management', 'documents'] },
  { id: 'doc-2', categorie: 'Documents & printing', question: 'My upload is being rejected.', reponse: "The file is larger than the permitted size, or its format is not accepted. Compress the file or convert it to PDF, then try again.", motsCles: ['upload', 'rejected', 'file size', 'file format'] },
  { id: 'doc-3', categorie: 'Documents & printing', question: 'How can I find a document quickly?', reponse: "Apply a consistent naming convention (type_entity_date) and link each document to the project, member or funding agreement it relates to: the search relies on exactly that information.", motsCles: ['search', 'document', 'naming convention', 'filing'] },
  { id: 'doc-4', categorie: 'Documents & printing', question: 'How do I print a financial statement?', reponse: "Generate the PDF export from Reports & BI or from the module concerned, then print the file you obtain.", motsCles: ['printing', 'pdf', 'financial statement', 'report'] },
  { id: 'doc-5', categorie: 'Documents & printing', question: 'The generated PDF is poorly laid out or cut off.', reponse: "Check the orientation and the width of the exported table; reduce the number of columns displayed before exporting, then run the generation again.", motsCles: ['pdf', 'layout', 'cut off', 'export'] },
  { id: 'doc-6', categorie: 'Documents & printing', question: 'Can a document template be customised?', reponse: "The header picks up the organisation details and the logo entered in the settings. Detailed customisation of the templates is not exposed in the interface: send the request to IBIG SOFT.", motsCles: ['template', 'customisation', 'letterhead', 'branding'] },
  { id: 'doc-7', categorie: 'Documents & printing', question: 'Can a deleted document be recovered?', reponse: "Do not count on it: treat every deletion as permanent. Keep a copy of important contractual records outside the application.", motsCles: ['deletion', 'recovery', 'document', 'recycle bin'] },

  // ── Subscriptions & licences ──────────────────────────────
  { id: 'lic-1', categorie: 'Subscriptions & licences', question: 'How do I find out the terms of my licence?', reponse: "The terms (number of users, modules opened, duration) are set out in your agreement with IBIG SOFT. The application does not display the contractual details.", motsCles: ['licence', 'agreement', 'terms', 'subscription'] },
  { id: 'lic-2', categorie: 'Subscriptions & licences', question: 'What happens if my subscription expires?', reponse: "Access may be suspended in accordance with your agreement. Plan the renewal with IBIG SOFT ahead of time to avoid any interruption to your operations.", motsCles: ['expiry', 'subscription', 'suspension', 'renewal'] },
  { id: 'lic-3', categorie: 'Subscriptions & licences', question: 'How do I add extra users?', reponse: "If your quota has been reached, adding users requires a licence extension: contact IBIG SOFT.", motsCles: ['users', 'quota', 'extension', 'licence'] },
  { id: 'lic-4', categorie: 'Subscriptions & licences', question: 'Can I enable an additional module?', reponse: "Opening a module depends on your agreement. Send the request to IBIG SOFT, who carry out the activation on the installation side.", motsCles: ['module', 'activation', 'add-on', 'licence'] },
  { id: 'lic-5', categorie: 'Subscriptions & licences', question: 'Are updates included?', reponse: "The terms governing updates are defined by your maintenance contract. Deployments are carried out by IBIG SOFT.", motsCles: ['update', 'maintenance', 'version', 'contract'] },

  // ── Backup & data ─────────────────────────────────────────
  { id: 'sav-1', categorie: 'Backup & data', question: 'Who performs the backups?', reponse: "Backups are part of the hosting of your installation, operated by IBIG SOFT or by your own provider. Ask for written confirmation of the frequency and of the retention period.", motsCles: ['backup', 'hosting', 'retention', 'frequency'] },
  { id: 'sav-2', categorie: 'Backup & data', question: 'Can I trigger a backup from the interface?', reponse: "No. No manual backup button is exposed to users. You can, however, export your lists to keep a working copy.", motsCles: ['manual backup', 'button', 'export', 'copy'] },
  { id: 'sav-3', categorie: 'Backup & data', question: 'How do I recover data deleted by mistake?', reponse: "First consult the audit log to identify the action and who performed it, then open a ticket: whether a restore is possible depends on the backup policy applying to your hosting.", motsCles: ['deletion', 'restore', 'mistake', 'audit log'] },
  { id: 'sav-4', categorie: 'Backup & data', question: 'How do I retrieve my data if I move to another solution?', reponse: "Use the exports available module by module. A full extraction of the database has to be requested from IBIG SOFT.", motsCles: ['data portability', 'export', 'migration', 'data'] },
  { id: 'sav-5', categorie: 'Backup & data', question: 'How do I protect the personal data we collect?', reponse: "Keep collection to what is strictly necessary, restrict access through roles, and do not circulate exports containing names outside the organisation without a legal basis.", motsCles: ['personal data', 'data protection', 'confidentiality', 'data minimisation'] },

  // ── SARA assistant ────────────────────────────────────────
  { id: 'sara-1', categorie: 'SARA assistant', question: 'How do I use SARA?', reponse: "Open the AI Assistant menu and ask your question, stating which module and which action you are dealing with.", motsCles: ['sara', 'assistant', 'ai', 'how to use'] },
  { id: 'sara-2', categorie: 'SARA assistant', question: 'Can SARA modify my data?', reponse: "No. SARA explains and points you in the right direction; creating and modifying records remains something you do yourself in the relevant screens.", motsCles: ['sara', 'modify', 'data', 'safety'] },
  { id: 'sara-3', categorie: 'SARA assistant', question: 'Are SARA answers always accurate?', reponse: "No. A conversational assistant can get things wrong: check any sensitive information (accounting, legal, regulatory) against the user guide or with support before acting on it.", motsCles: ['reliability', 'error', 'sara', 'verification'] },
  { id: 'sara-4', categorie: 'SARA assistant', question: 'Can I type confidential information to SARA?', reponse: "Avoid it. Never enter passwords, bank details or sensitive personal data in the conversation.", motsCles: ['confidentiality', 'sara', 'sensitive data'] },
  { id: 'sara-5', categorie: 'SARA assistant', question: 'SARA does not answer, or returns an error.', reponse: "The conversational assistance service may be unavailable. Consult the Help Centre, then open a ticket if you are still blocked.", motsCles: ['sara', 'outage', 'error', 'unavailable'] },

  // ── Support ───────────────────────────────────────────────
  { id: 'sup-1', categorie: 'Support', question: 'How do I open a support ticket?', reponse: "From the Support menu, create a ticket describing the module, the action you performed, the result you expected and the exact error message.", motsCles: ['ticket', 'support', 'assistance', 'incident'] },
  { id: 'sup-2', categorie: 'Support', question: 'What information should I attach to a ticket?', reponse: "The screen concerned, the date and time of the incident, the account used, the steps to reproduce it, a screenshot and the error message word for word. These elements considerably shorten the handling time.", motsCles: ['ticket', 'information', 'steps to reproduce', 'screenshot'] },
  { id: 'sup-3', categorie: 'Support', question: 'What is the support response time?', reponse: "The response time depends on your maintenance contract with IBIG SOFT. The Help Centre does not state any response-time commitment.", motsCles: ['response time', 'sla', 'support', 'turnaround'] },
  { id: 'sup-4', categorie: 'Support', question: 'How do I follow the progress of my ticket?', reponse: "The Support module lists your tickets with their status and the related exchanges.", motsCles: ['ticket', 'status', 'tracking', 'progress'] },
  { id: 'sup-5', categorie: 'Support', question: 'How do I restart the guided tour of the application?', reponse: "From the Help Centre, use the button that restarts the guided tour: it plays again when you return to the dashboard.", motsCles: ['guided tour', 'onboarding', 'walkthrough', 'restart'] },
  { id: 'sup-6', categorie: 'Support', question: 'Do you offer training for teams?', reponse: "The Academy area brings together the training paths that are planned. The video content has not been published yet; facilitated sessions are requested from IBIG SOFT.", motsCles: ['training', 'academy', 'session', 'team'] },
  { id: 'sup-7', categorie: 'Support', question: 'How do I report a calculation discrepancy?', reponse: "Open a ticket attaching the export concerned, the expected value, the value obtained and the filters applied: without these elements the discrepancy cannot be reproduced.", motsCles: ['discrepancy', 'calculation', 'bug', 'ticket'] },
  { id: 'sup-8', categorie: 'Support', question: 'How do I request a new feature?', reponse: "Open an enhancement ticket describing the business need and the intended use. Prioritisation is a matter for IBIG SOFT.", motsCles: ['enhancement', 'feature', 'request', 'roadmap'] },
] as const;

export const FAQ_EN_PART3 = ITEMS as unknown as FaqItem[];
