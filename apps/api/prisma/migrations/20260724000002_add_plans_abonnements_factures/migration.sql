-- Migration: catalogue de plans, abonnements, factures et lignes de facture
-- Date: 2026-07-24
-- Idempotente : rejouable sans erreur.

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "PeriodiciteAbonnement" AS ENUM ('MENSUELLE', 'ANNUELLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "StatutFacture" AS ENUM ('BROUILLON', 'EMISE', 'PAYEE', 'ANNULEE', 'EN_RETARD');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- Table plans
-- ============================================================

CREATE TABLE IF NOT EXISTS "plans" (
  "id"              TEXT NOT NULL,
  "code"            TEXT NOT NULL,
  "nom"             TEXT NOT NULL,
  "description"     TEXT,
  "prixMensuel"     DECIMAL(15,2) NOT NULL DEFAULT 0,
  "prixAnnuel"      DECIMAL(15,2) NOT NULL DEFAULT 0,
  "devise"          "Devise" NOT NULL DEFAULT 'XOF',
  "maxUtilisateurs" INTEGER,
  "modulesInclus"   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "surDevis"        BOOLEAN NOT NULL DEFAULT false,
  "ordre"           INTEGER NOT NULL DEFAULT 0,
  "actif"           BOOLEAN NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "plans" ADD CONSTRAINT "plans_code_key" UNIQUE ("code");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "plans_actif_idx" ON "plans"("actif");

-- ============================================================
-- Table abonnements
-- ============================================================

CREATE TABLE IF NOT EXISTS "abonnements" (
  "id"                 TEXT NOT NULL,
  "organisationId"     TEXT NOT NULL,
  "planId"             TEXT NOT NULL,
  "periodicite"        "PeriodiciteAbonnement" NOT NULL DEFAULT 'MENSUELLE',
  "dateDebut"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateFin"            TIMESTAMP(3) NOT NULL,
  "statut"             "StatutAbonnement" NOT NULL DEFAULT 'ACTIF',
  "montant"            DECIMAL(15,2) NOT NULL,
  "devise"             "Devise" NOT NULL DEFAULT 'XOF',
  "renouvellementAuto" BOOLEAN NOT NULL DEFAULT true,
  "notes"              TEXT,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "abonnements"
    ADD CONSTRAINT "abonnements_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "abonnements"
    ADD CONSTRAINT "abonnements_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "abonnements_organisationId_idx" ON "abonnements"("organisationId");
CREATE INDEX IF NOT EXISTS "abonnements_statut_idx"         ON "abonnements"("statut");

-- ============================================================
-- Table factures
-- ============================================================

CREATE TABLE IF NOT EXISTS "factures" (
  "id"             TEXT NOT NULL,
  "numero"         TEXT NOT NULL,
  "abonnementId"   TEXT,
  "organisationId" TEXT NOT NULL,
  "montantHT"      DECIMAL(15,2) NOT NULL,
  "tauxTva"        DECIMAL(5,2) NOT NULL DEFAULT 0,
  "montantTTC"     DECIMAL(15,2) NOT NULL,
  "devise"         "Devise" NOT NULL DEFAULT 'XOF',
  "statut"         "StatutFacture" NOT NULL DEFAULT 'BROUILLON',
  "dateEmission"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dateEcheance"   TIMESTAMP(3) NOT NULL,
  "datePaiement"   TIMESTAMP(3),
  "modePaiement"   TEXT,
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "factures" ADD CONSTRAINT "factures_numero_key" UNIQUE ("numero");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "factures"
    ADD CONSTRAINT "factures_abonnementId_fkey"
    FOREIGN KEY ("abonnementId") REFERENCES "abonnements"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "factures"
    ADD CONSTRAINT "factures_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "factures_organisationId_idx" ON "factures"("organisationId");
CREATE INDEX IF NOT EXISTS "factures_statut_idx"         ON "factures"("statut");

-- ============================================================
-- Table lignes_facture
-- ============================================================

CREATE TABLE IF NOT EXISTS "lignes_facture" (
  "id"           TEXT NOT NULL,
  "factureId"    TEXT NOT NULL,
  "libelle"      TEXT NOT NULL,
  "quantite"     DECIMAL(15,2) NOT NULL DEFAULT 1,
  "prixUnitaire" DECIMAL(15,2) NOT NULL,
  "montant"      DECIMAL(15,2) NOT NULL,
  "ordre"        INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "lignes_facture_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "lignes_facture"
    ADD CONSTRAINT "lignes_facture_factureId_fkey"
    FOREIGN KEY ("factureId") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "lignes_facture_factureId_idx" ON "lignes_facture"("factureId");

-- ============================================================
-- Seed des 4 formules — prix identiques à la landing (page.tsx / conditions-commerciales)
-- Idempotent : ON CONFLICT DO NOTHING sur le code.
-- ============================================================

INSERT INTO "plans" ("id", "code", "nom", "description", "prixMensuel", "prixAnnuel", "devise", "maxUtilisateurs", "modulesInclus", "surDevis", "ordre", "actif", "createdAt", "updatedAt")
VALUES
  ('11111111-1111-4111-8111-000000000001', 'ESSENTIEL', 'Essentiel',
   'Pour les petits groupements et associations naissantes.',
   12900, 129000, 'XOF', 3,
   ARRAY['membres','tresorerie','comptabilite','documents']::TEXT[],
   false, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('11111111-1111-4111-8111-000000000002', 'STARTER', 'Starter',
   'Pour les associations structurées et ONG locales.',
   29900, 299000, 'XOF', 8,
   ARRAY['membres','comptabilite','budget','tresorerie','projets','documents','evenements']::TEXT[],
   false, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('11111111-1111-4111-8111-000000000003', 'PRO', 'Pro',
   'Pour les ONG actives avec projets et équipes.',
   59900, 599000, 'XOF', 15,
   ARRAY['membres','comptabilite','budget','tresorerie','projets','meal','rh','achats','stocks','immobilisations','documents','evenements','reporting','ia']::TEXT[],
   false, 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('11111111-1111-4111-8111-000000000004', 'ENTERPRISE', 'Enterprise',
   'Pour les réseaux, fédérations et grandes ONG. Tarif sur devis.',
   0, 0, 'XOF', NULL,
   ARRAY['*']::TEXT[],
   true, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
