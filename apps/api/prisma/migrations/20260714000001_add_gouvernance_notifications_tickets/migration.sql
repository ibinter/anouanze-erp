-- Migration: gouvernance, notifications, tickets support
-- Date: 2026-07-14

-- Enums gouvernance
DO $$ BEGIN
  CREATE TYPE "TypeOrgane" AS ENUM ('ASSEMBLEE_GENERALE', 'CONSEIL_ADMINISTRATION', 'BUREAU_EXECUTIF', 'COMITE_CONTROLE', 'COMMISSION', 'AUTRE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "StatutResolution" AS ENUM ('EN_ATTENTE', 'APPROUVEE', 'EN_COURS', 'APPLIQUEE', 'REJETEE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enum notifications
DO $$ BEGIN
  CREATE TYPE "TypeNotification" AS ENUM ('ALERTE', 'INFO', 'SUCCES', 'RAPPEL', 'AVERTISSEMENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enums tickets
DO $$ BEGIN
  CREATE TYPE "PrioriteTicket" AS ENUM ('BASSE', 'NORMALE', 'HAUTE', 'URGENTE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "StatutTicket" AS ENUM ('OUVERT', 'EN_COURS', 'EN_ATTENTE', 'RESOLU', 'FERME');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Table organes_gouvernance
CREATE TABLE IF NOT EXISTS "organes_gouvernance" (
  "id"             TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "nom"            TEXT NOT NULL,
  "type"           "TypeOrgane" NOT NULL DEFAULT 'AUTRE',
  "description"    TEXT,
  "nbMembres"      INTEGER NOT NULL DEFAULT 0,
  "statut"         TEXT NOT NULL DEFAULT 'actif',
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "organes_gouvernance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "organes_gouvernance_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table reunions
CREATE TABLE IF NOT EXISTS "reunions" (
  "id"          TEXT NOT NULL,
  "organeId"    TEXT NOT NULL,
  "titre"       TEXT NOT NULL,
  "dateReunion" TIMESTAMP(3) NOT NULL,
  "lieu"        TEXT,
  "ordre"       TEXT[] DEFAULT ARRAY[]::TEXT[],
  "statut"      TEXT NOT NULL DEFAULT 'PLANIFIEE',
  "procesVerbal" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reunions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "reunions_organeId_fkey"
    FOREIGN KEY ("organeId") REFERENCES "organes_gouvernance"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Table resolutions
CREATE TABLE IF NOT EXISTS "resolutions" (
  "id"             TEXT NOT NULL,
  "organisationId" TEXT NOT NULL,
  "organeId"       TEXT,
  "reunionId"      TEXT,
  "reference"      TEXT NOT NULL,
  "titre"          TEXT NOT NULL,
  "description"    TEXT,
  "statut"         "StatutResolution" NOT NULL DEFAULT 'EN_ATTENTE',
  "dateAdoption"   TIMESTAMP(3),
  "dateEcheance"   TIMESTAMP(3),
  "responsable"    TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "resolutions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "resolutions_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "resolutions_organeId_fkey"
    FOREIGN KEY ("organeId") REFERENCES "organes_gouvernance"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "resolutions_reunionId_fkey"
    FOREIGN KEY ("reunionId") REFERENCES "reunions"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"             TEXT NOT NULL,
  "organisationId" TEXT,
  "utilisateurId"  TEXT,
  "type"           "TypeNotification" NOT NULL DEFAULT 'INFO',
  "titre"          TEXT NOT NULL,
  "message"        TEXT NOT NULL,
  "lue"            BOOLEAN NOT NULL DEFAULT false,
  "lien"           TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notifications_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "notifications_utilisateurId_fkey"
    FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table tickets_support
CREATE TABLE IF NOT EXISTS "tickets_support" (
  "id"             TEXT NOT NULL,
  "organisationId" TEXT,
  "utilisateurId"  TEXT,
  "reference"      TEXT NOT NULL,
  "sujet"          TEXT NOT NULL,
  "description"    TEXT NOT NULL,
  "categorie"      TEXT NOT NULL DEFAULT 'GENERAL',
  "priorite"       "PrioriteTicket" NOT NULL DEFAULT 'NORMALE',
  "statut"         "StatutTicket" NOT NULL DEFAULT 'OUVERT',
  "reponse"        TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "tickets_support_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "tickets_support_reference_key" UNIQUE ("reference"),
  CONSTRAINT "tickets_support_organisationId_fkey"
    FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "tickets_support_utilisateurId_fkey"
    FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table messages_ticket
CREATE TABLE IF NOT EXISTS "messages_ticket" (
  "id"         TEXT NOT NULL,
  "ticketId"   TEXT NOT NULL,
  "auteur"     TEXT NOT NULL,
  "contenu"    TEXT NOT NULL,
  "estSupport" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "messages_ticket_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "messages_ticket_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "tickets_support"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
