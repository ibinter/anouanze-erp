-- Migration: table de configuration applicative (clés d'intégration éditables en ligne)
-- Date: 2026-07-24
-- Idempotente : rejouable sans erreur.

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "CategorieConfiguration" AS ENUM ('PAIEMENT', 'EMAIL', 'IA', 'GENERAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- Table configurations
-- ============================================================

CREATE TABLE IF NOT EXISTS "configurations" (
  "id"          TEXT NOT NULL,
  "cle"         TEXT NOT NULL,
  "valeur"      TEXT NOT NULL,
  "categorie"   "CategorieConfiguration" NOT NULL DEFAULT 'GENERAL',
  "secret"      BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "modifieLe"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modifiePar"  TEXT,

  CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "configurations" ADD CONSTRAINT "configurations_cle_key" UNIQUE ("cle");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "configurations_categorie_idx" ON "configurations"("categorie");
