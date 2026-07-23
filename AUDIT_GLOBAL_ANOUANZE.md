# AUDIT GLOBAL — ANOUANZÊ ERP
### Conformité au « Script Universel IBIG SOFT » (cahier des charges v. intégrale)
Date : 2026-07-23 · Éditeur : IBIG SOFT · Domaine : https://anouanze.ibigsoft.com

Légende : ✅ Conforme · 🟡 Partiel · 🔴 Absent · Priorité : P1 (bloquant commercial) / P2 (important) / P3 (confort)

---

## 0. Ce qui est SOLIDE (déjà livré et vérifié en prod)

- ✅ **Espace interne** : 28 pages/modules (membres, dons, bailleurs, projets, RH, compta SYCEBNL, budget, trésorerie, achats, stocks, GED, événements, gouvernance, MEAL, paiements, tickets, import, audit, IA…).
- ✅ **Auth** JWT 15 min + refresh 7 j automatique, NextAuth, multi-tenant (`organisationId`) + `OrganisationGuard` (anti-IDOR).
- ✅ **Corruption numérique corrigée à la racine** : intercepteur global Decimal→number (tout l'ERP).
- ✅ **Moteur d'export universel** (PDF/XLSX/CSV) adaptatif, police Unicode, 73 tests.
- ✅ **Landing commerciale** riche (hero slider, 12 modules, tarifs BDD, FAQ, IBIG PARTNERS, SARA, WhatsApp, cookies, PWA banner).
- ✅ **Design system** premium (sidebar sombre, cartes KPI, tokens Tailwind + `DEFAULT` couleurs).
- ✅ **Console Superadmin** : organisations, licences, prospects (CRM), SARA.
- ✅ **Écosystème IBIG** : section « Nos solutions » (16 produits) **ajoutée ce jour** via script universel.

---

## 1. AUDIT PAR DOMAINE — CE QUI RESTE

### A. Multilingue FR / EN — 🔴 P1
**Constat** : aucun système i18n (ni next-intl ni i18next). Tous les textes sont en français codés en dur.
**Exigence spec** : FR (défaut) **et** EN obligatoires sur TOUT (menus, landing, formulaires, FAQ, emails, PWA, erreurs, pages légales).
**Action** : installer `next-intl`, externaliser les chaînes en `fr.json`/`en.json`, sélecteur de langue mémorisé, SEO multilingue.
**Charge** : élevée (transversale).

### B. PWA hors-ligne / Service Worker — 🟡 P1
**Constat** : `manifest.json` présent + bannière d'installation. **Aucun service worker** (`sw.js` absent) → pas de cache versionné, pas de mode hors-ligne, pas de page offline.
**Action** : `next-pwa` ou SW manuel (cache versionné, page hors-connexion, notif de mise à jour SW).

### C. Pages légales — 🟡 P1
**Constat** : 6 pages présentes (mentions, confidentialité, cookies, CGU, licence, propriété intellectuelle).
**Exigence** : 18 pages, en FR + EN.
**Manquantes** : CGV/Conditions commerciales, Politique de sauvegarde, de support, de résiliation, de remboursement, traitement des données, protection de la marque, conditions d'essai, conditions SARA, limitation IA, gestion/suppression de compte, réclamations.

### D. Assistant SARA — 🟡 P2
**Constat** : fonctionne via Groq (mono-fournisseur, clé en dur/env).
**Exigence** : multi-fournisseur configurable **sans redéploiement** (Groq/OpenAI/Anthropic/…), clé chiffrée jamais envoyée au navigateur, quotas par user/société, **RAG** sur guide+FAQ+modules, garde-fous (18 règles), citation de source.
**Action** : table `ai_config` en BDD + admin console + fallback fournisseur + base de connaissances RAG.

### E. Données mockées restantes — 🟡 P2
**Constat** :
- `DashboardCharts.tsx` : dépenses 6 mois + répartition secteurs = **codées en dur**.
- `immobilisations/page.tsx` : tableau **statique** (module API existe pourtant).
**Action** : brancher sur `/reporting` et `/immobilisations`. (Rappel spec §9.4 : « aucune statistique codée en dur ».)

### F. Paiements mobiles — 🟡 P2
**Constat** : structure Orange Money/MTN/CinetPay/Wave présente ; statut réel d'intégration à confirmer (clés marchands + webhooks testés en prod ?).
**Exigence §7.17** : statuts explicites **Disponible / En intégration / Bientôt** — ne jamais afficher « disponible » si non testé.

### G. Centre d'aide / Guide / Académie — 🔴 P2
**Constat** : page `/aide` basique. **Absents** : guide utilisateur structuré (par module, PDF pro, recherchable/SARA), **100 FAQ internes**, cas pratiques, espace **Académie/Formation** (vidéos, quiz, ressources téléchargeables), aide contextuelle « ? » par page, état des services.

### H. Pages de détail dédiées — 🟡 P2
**Constat** : clic sur membre/projet/etc. ouvre des **modals** ; aucune route `/[id]` (sauf auth).
**Impact** : pas de lien profond partageable ni historique navigable.

### I. RBAC — écran de gestion — 🟡 P2
**Constat** : 11 rôles en base + guards backend OK. **Manque** l'UI d'attribution rôles/permissions par utilisateur, MFA, sessions/appareils, politiques mot de passe (spec §9.6 B).

### J. Espace Paramètres structuré — 🟡 P3
**Exigence §9.6** : 7 catégories (Organisation, Utilisateurs/sécurité, Documents, Notifications, Intégrations, Données, Abonnement) + recherche + journal des modifications. À vérifier/compléter.

### K. Navigation mobile (bottom-nav) — 🟡 P3
**Constat** : sidebar drawer mobile OK. **Manque** la bottom-navigation 4-5 accès + « Plus » (spec §9.3).

### L. Mode sombre — 🔴 P3
**Constat** : aucune classe `dark:`. Spec : clair obligatoire (OK), sombre **recommandé**.

### M. Onboarding / Visite guidée — 🟡 P3
**Constat** : tour guidé natif présent (déclenché au 1er login). **Manque** l'onboarding commercial post-inscription (checklist, choix structure, données d'exemple) et la prise en main support (impersonation tracée, spec §11.3).

### N. Tests & qualité — 🟡 P2
**Constat** : seuls les 73 tests du moteur d'export existent. Pas de suite de tests e2e/intégration sur les modules métier (spec §10.3 checklist bugs, RAPPORT_TESTS.md).

### O. Emails automatiques / CRM avancé — 🟡 P2
**Constat** : CRM prospects présent en superadmin. **À vérifier** : cycle d'emails automatiques (bienvenue, relances, offres, renouvellement), SLA tickets, notifications multi-canal (SMS/WhatsApp).

### P. SEO / Analytics — 🟡 P3
**À vérifier** : Open Graph, données structurées, sitemap, robots, canonical, page image sociale ; tableau de bord analytics marketing (visites, conversions, clics SARA/WhatsApp) dans la console.

---

## 2. PLAN DE FINALISATION PRIORISÉ

| # | Chantier | Priorité | Effort |
|---|----------|----------|--------|
| 1 | i18n FR/EN (transversal) | P1 | Élevé |
| 2 | Service Worker + offline PWA | P1 | Moyen |
| 3 | 12 pages légales manquantes (FR/EN) | P1 | Moyen |
| 4 | Brancher données mockées (dashboard charts, immobilisations) | P2 | Faible |
| 5 | SARA multi-fournisseur + RAG + garde-fous | P2 | Élevé |
| 6 | Centre d'aide : guide + 100 FAQ + académie | P2 | Élevé |
| 7 | RBAC UI + MFA + sessions | P2 | Moyen |
| 8 | Statuts intégrations paiements (Dispo/En cours/Bientôt) | P2 | Faible |
| 9 | Pages de détail `/[id]` | P2 | Moyen |
| 10 | Bottom-nav mobile + Paramètres structurés | P3 | Faible |
| 11 | Mode sombre | P3 | Moyen |
| 12 | Suite de tests métier + RAPPORT_TESTS | P2 | Élevé |

**Recommandation** : attaquer #4 (rapide, élimine les dernières données fausses), puis #2/#3/#8 (rapides, crédibilité commerciale), puis #1 (i18n, gros mais indispensable au marché international), enfin #5/#6.

---

## 3. FAIT CE JOUR
- ✅ Script universel IBIG SOFT intégré à la landing (`public/ibigsoft-universal.js` + section « Nos solutions » avant le footer, `data-solution="anouanze"`).
