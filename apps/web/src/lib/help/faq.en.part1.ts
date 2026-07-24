import type { FaqItem } from './types';

/**
 * English FAQ — part 1: General, Login & security, Users & permissions, Settings.
 *
 * Same `id` values and same order as the French source (`faq.ts`), so both
 * languages can be swapped one for the other at render time.
 *
 * Editorial rule (inherited from the French version): describe only what the
 * software actually does. Anything that depends on the installation, the
 * hosting or the contract is explicitly sent back to the administrator or to
 * IBIG SOFT — no guarantee is invented here.
 *
 * Note: `CategorieFaq` in `./types` is a French-only union, so the English
 * labels are typed locally and the exported constant is re-typed as
 * `FaqItem[]` for the consumer. Items stay fully type-checked below.
 */

type CategoryEn = 'General' | 'Login & security' | 'Users & permissions' | 'Settings';

type FaqItemEn = Omit<FaqItem, 'categorie'> & { categorie: CategoryEn };

const ITEMS_EN: FaqItemEn[] = [
  // ── General ───────────────────────────────────────────────
  { id: 'gen-1', categorie: 'General', question: 'What is ANOUANZÊ ERP?', reponse: "An integrated management solution built for non-profit organisations: members, donations, funders, projects, human resources, SYCEBNL accounting, budget, treasury, procurement, inventory, documents and monitoring & evaluation.", motsCles: ['overview', 'about', 'what is', 'erp', 'anouanze', 'nonprofit software'] },
  { id: 'gen-2', categorie: 'General', question: 'Who is the solution designed for?', reponse: "Associations, NGOs, foundations, cooperatives and faith-based organisations that must keep SYCEBNL-type accounts and report to funders or to their own membership.", motsCles: ['audience', 'ngo', 'association', 'foundation', 'charity', 'cooperative'] },
  { id: 'gen-3', categorie: 'General', question: 'Do I need to install software on my computer?', reponse: "No. The ERP runs in a recent web browser (an up-to-date Chrome, Edge, Firefox or Safari). No installation is required.", motsCles: ['install', 'browser', 'web based', 'setup', 'cloud'] },
  { id: 'gen-4', categorie: 'General', question: 'Does the application work on a phone?', reponse: "The screens are responsive and usable on phones and tablets. Bulk data entry (accounting, imports) remains far more comfortable on a computer. There is no native mobile app to install.", motsCles: ['mobile', 'phone', 'tablet', 'responsive', 'app'] },
  { id: 'gen-5', categorie: 'General', question: 'Can I work offline?', reponse: "No. An internet connection is required: data is written to the server when you save.", motsCles: ['offline', 'no internet', 'connection', 'sync'] },
  { id: 'gen-6', categorie: 'General', question: 'Which languages is the interface available in?', reponse: "The interface is available in French and English. Use the language selector to switch: your choice is stored in your browser and applied on your next visits. French remains the default language when no choice has been made yet. No other language is available at this stage.", motsCles: ['language', 'english', 'french', 'bilingual', 'translation', 'switch language'] },
  { id: 'gen-7', categorie: 'General', question: 'How many users can work at the same time?', reponse: "Several users can work concurrently; the number of accounts allowed depends on your licence agreement. Check with your administrator or with IBIG SOFT.", motsCles: ['users', 'concurrent', 'simultaneous', 'licence', 'seats'] },
  { id: 'gen-8', categorie: 'General', question: 'Where can I find the installed version number?', reponse: "The deployed version is shown in Settings. If in doubt, mention the date and the screen concerned in your support ticket.", motsCles: ['version', 'build', 'release', 'about'] },

  // ── Login & security ──────────────────────────────────────
  { id: 'sec-1', categorie: 'Login & security', question: 'How do I reset my password?', reponse: "On the sign-in page, use « Forgot password » and enter your email address. If email sending is not configured on your installation, ask your administrator to reset the access from Settings › Users.", motsCles: ['password', 'forgot', 'reset', 'sign in', 'login'] },
  { id: 'sec-2', categorie: 'Login & security', question: 'Why am I signed out after a while?', reponse: "The authentication token has a limited lifetime. It is renewed automatically as long as your session stays valid; beyond that, you are asked to sign in again for security reasons.", motsCles: ['session', 'timeout', 'expired', 'signed out', 'token'] },
  { id: 'sec-3', categorie: 'Login & security', question: 'I am stuck on a loading screen when signing in.', reponse: "Clear the browser cache, close every tab of the application, then sign in again. If the problem persists, open a ticket stating the browser, the time and the screen concerned.", motsCles: ['loading', 'stuck', 'spinner', 'login issue', 'cache'] },
  { id: 'sec-4', categorie: 'Login & security', question: 'What should I do if my account is deactivated?', reponse: "Only an administrator can reactivate an account, from Settings › Users. Deactivating an account preserves the history of that user's actions.", motsCles: ['account', 'deactivated', 'disabled', 'locked out', 'access'] },
  { id: 'sec-5', categorie: 'Login & security', question: 'Can I share my account with a colleague?', reponse: "No. The audit log attributes every action to an account: sharing makes traceability worthless and leaves you accountable for someone else's actions. Ask for a dedicated account to be created.", motsCles: ['shared account', 'credentials', 'audit trail', 'accountability', 'security'] },
  { id: 'sec-6', categorie: 'Login & security', question: 'Is two-factor authentication available?', reponse: "Two-factor authentication is not enabled by default on every installation. Check whether it is available under Settings › Security, or ask IBIG SOFT to confirm before you commit to anything with an auditor.", motsCles: ['2fa', 'mfa', 'two factor', 'authentication', 'security'] },
  { id: 'sec-7', categorie: 'Login & security', question: 'How do I choose a strong password?', reponse: "At least 12 characters mixing upper case, lower case, digits and symbols, and unique to this application. Never reuse a password already used for an email account or a social network.", motsCles: ['password', 'strong', 'policy', 'passphrase', 'security'] },
  { id: 'sec-8', categorie: 'Login & security', question: 'Is traffic to the server encrypted?', reponse: "Yes, when the application is served over HTTPS, which is the recommended production setup. Check for the padlock in the address bar and report any certificate warning immediately.", motsCles: ['https', 'encryption', 'ssl', 'tls', 'certificate'] },
  { id: 'sec-9', categorie: 'Login & security', question: 'What should I do if I suspect unauthorised access?', reponse: "Change your password immediately, notify the administrator and request an extract of the audit log covering the period concerned.", motsCles: ['breach', 'unauthorised access', 'compromised', 'hacked', 'audit log'] },

  // ── Users & permissions ───────────────────────────────────
  { id: 'usr-1', categorie: 'Users & permissions', question: 'How do I create a new user?', reponse: "Settings › Users › New. Enter the person's identity and email address, then assign a role: without a role, the user has access to no module at all.", motsCles: ['create user', 'new account', 'onboarding', 'role', 'invite'] },
  { id: 'usr-2', categorie: 'Users & permissions', question: 'What is the difference between a role and a permission?', reponse: "A permission is a single right on a module (read, create, edit). A role is a set of permissions granted to a user as one package.", motsCles: ['role', 'permission', 'rights', 'access control', 'difference'] },
  { id: 'usr-3', categorie: 'Users & permissions', question: 'Can a user hold several roles?', reponse: "How roles are configured depends on your installation. In practice, define one role per job function rather than stacking roles, so that rights stay readable.", motsCles: ['multiple roles', 'stacking', 'rights', 'assignment'] },
  { id: 'usr-4', categorie: 'Users & permissions', question: 'A menu is missing from my sidebar. Why?', reponse: "Menu entries for modules your role does not allow are simply not shown. Ask your administrator to adjust your rights.", motsCles: ['menu missing', 'hidden', 'sidebar', 'navigation', 'permissions'] },
  { id: 'usr-5', categorie: 'Users & permissions', question: 'How do I revoke access for someone leaving the organisation?', reponse: "Deactivate the account rather than deleting it: the history and the traceability of the entries they posted are preserved.", motsCles: ['offboarding', 'leaver', 'deactivate', 'delete account', 'revoke access'] },
  { id: 'usr-6', categorie: 'Users & permissions', question: 'Who can view payroll data?', reponse: "Only profiles authorised on the Human resources module. Payroll data is sensitive: keep that role restricted to the people who genuinely need it.", motsCles: ['payroll', 'hr', 'confidential', 'salary', 'access'] },
  { id: 'usr-7', categorie: 'Users & permissions', question: 'How do I find out who changed a record?', reponse: "The Audit module lists actions with their author, timestamp and the record concerned. Filter by period and by user.", motsCles: ['audit', 'who changed', 'history', 'traceability', 'log'] },

  // ── Settings ──────────────────────────────────────────────
  { id: 'par-1', categorie: 'Settings', question: 'How do I change the logo shown on documents?', reponse: "Settings › Organisation: upload a logo. It is applied to exported documents generated after the change.", motsCles: ['logo', 'organisation', 'branding', 'letterhead', 'documents'] },
  { id: 'par-2', categorie: 'Settings', question: 'Can I change the currency once data entry has started?', reponse: "This is strongly discouraged: amounts already recorded are not converted. If a change is unavoidable, contact support before doing anything.", motsCles: ['currency', 'change currency', 'conversion', 'exchange rate'] },
  { id: 'par-3', categorie: 'Settings', question: 'How do I open a new financial year?', reponse: "Accounting › Financial years: create the year with its start and end dates. With no open financial year, no journal entry can be posted for that period.", motsCles: ['financial year', 'fiscal year', 'open period', 'accounting period'] },
  { id: 'par-4', categorie: 'Settings', question: 'Where are member categories or document types defined?', reponse: "In the reference data held in the settings. These lists feed the drop-down menus of the modules concerned.", motsCles: ['reference data', 'categories', 'lookup lists', 'dropdown', 'configuration'] },
  { id: 'par-5', categorie: 'Settings', question: 'A settings change is not taken into account.', reponse: "Values are sometimes kept for the duration of your session: sign out, sign back in, then reload the page.", motsCles: ['settings', 'cache', 'session', 'refresh', 'not applied'] },
];

export const FAQ_EN_PART1: FaqItem[] = ITEMS_EN as unknown as FaqItem[];
