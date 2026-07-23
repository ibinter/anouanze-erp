-- Migration: prospects, invitations, abonnement/essai, préférences de notification, journal des emails
-- Date: 2026-07-24
-- Idempotente : rejouable sans erreur.

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE "StatutProspect" AS ENUM ('NOUVEAU', 'A_CONTACTER', 'CONTACTE', 'QUALIFIE', 'DEMO_PREVUE', 'DEMO_REALISEE', 'OFFRE_ENVOYEE', 'NEGOCIATION', 'GAGNE', 'PERDU');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "StatutAbonnement" AS ENUM ('ESSAI', 'ACTIF', 'SUSPENDU', 'EXPIRE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "CanalNotification" AS ENUM ('EMAIL', 'APPLICATION');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- Organisation : cycle d'essai / abonnement
-- ============================================================

ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "dateDebutEssai"          TIMESTAMP(3);
ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "dateFinEssai"            TIMESTAMP(3);
ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "statutAbonnement"        "StatutAbonnement" NOT NULL DEFAULT 'ESSAI';
ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "relanceEssaiJ7EnvoyeeLe" TIMESTAMP(3);
ALTER TABLE "organisations" ADD COLUMN IF NOT EXISTS "relanceEssaiJ1EnvoyeeLe" TIMESTAMP(3);

-- ============================================================
-- Table prospects
-- ============================================================

CREATE TABLE IF NOT EXISTS "prospects" (
  "id"                 TEXT NOT NULL,
  "nom"                TEXT NOT NULL,
  "prenom"             TEXT,
  "email"              TEXT NOT NULL,
  "telephone"          TEXT,
  "organisation"       TEXT,
  "fonction"           TEXT,
  "pays"               TEXT,
  "secteur"            TEXT,
  "tailleStructure"    TEXT,
  "besoin"             TEXT,
  "nbUtilisateurs"     INTEGER,
  "dateSouhaitee"      TIMESTAMP(3),
  "source"             TEXT DEFAULT 'site-web',
  "statut"             "StatutProspect" NOT NULL DEFAULT 'NOUVEAU',
  "consentement"       BOOLEAN NOT NULL DEFAULT false,
  "notes"              TEXT,
  "relanceJ3EnvoyeeLe" TIMESTAMP(3),
  "relanceJ7EnvoyeeLe" TIMESTAMP(3),
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "prospects_statut_idx" ON "prospects"("statut");
CREATE INDEX IF NOT EXISTS "prospects_email_idx"  ON "prospects"("email");

-- ============================================================
-- Table invitations
-- ============================================================

CREATE TABLE IF NOT EXISTS "invitations" (
  "id"             TEXT NOT NULL,
  "email"          TEXT NOT NULL,
  "token"          TEXT NOT NULL,
  "role"           "RoleUtilisateur" NOT NULL DEFAULT 'LECTEUR',
  "organisationId" TEXT NOT NULL,
  "expireLe"       TIMESTAMP(3) NOT NULL,
  "accepteeLe"     TIMESTAMP(3),
  "statut"         TEXT NOT NULL DEFAULT 'EN_ATTENTE',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "invitations"
    ADD CONSTRAINT "invitations_token_key" UNIQUE ("token");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "invitations"
    ADD CONSTRAINT "invitations_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "invitations_organisationId_idx" ON "invitations"("organisationId");
CREATE INDEX IF NOT EXISTS "invitations_email_idx"          ON "invitations"("email");

-- ============================================================
-- Table preferences_notification
-- ============================================================

CREATE TABLE IF NOT EXISTS "preferences_notification" (
  "id"            TEXT NOT NULL,
  "utilisateurId" TEXT NOT NULL,
  "canal"         "CanalNotification" NOT NULL,
  "typeEvenement" TEXT NOT NULL,
  "actif"         BOOLEAN NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "preferences_notification_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "preferences_notification"
    ADD CONSTRAINT "preferences_notification_utilisateurId_canal_typeEvenement_key"
    UNIQUE ("utilisateurId", "canal", "typeEvenement");
EXCEPTION WHEN duplicate_table THEN null; WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE "preferences_notification"
    ADD CONSTRAINT "preferences_notification_utilisateurId_fkey"
    FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- Table email_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS "email_logs" (
  "id"             TEXT NOT NULL,
  "destinataire"   TEXT NOT NULL,
  "sujet"          TEXT NOT NULL,
  "template"       TEXT NOT NULL,
  "statut"         TEXT NOT NULL DEFAULT 'ENVOYE',
  "erreur"         TEXT,
  "organisationId" TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "email_logs"
    ADD CONSTRAINT "email_logs_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS "email_logs_destinataire_idx" ON "email_logs"("destinataire");
CREATE INDEX IF NOT EXISTS "email_logs_template_idx"     ON "email_logs"("template");
