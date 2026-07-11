-- Initialisation de la base de données ANOUANZÊ ERP
-- Création de l'extension UUID et autres utilitaires

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Schéma public utilisé par défaut (Prisma gère les schémas par tenant)
COMMENT ON DATABASE anouanze_erp IS 'ANOUANZÊ ERP - Base de données principale';
