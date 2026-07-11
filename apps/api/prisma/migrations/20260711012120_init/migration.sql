-- CreateEnum
CREATE TYPE "TypeOrganisation" AS ENUM ('ASSOCIATION', 'ONG_NATIONALE', 'ONG_INTERNATIONALE', 'FONDATION', 'COOPERATIVE', 'MUTUELLE', 'CONFESSIONNELLE', 'RESEAU_FEDERATION', 'COMMUNAUTAIRE', 'PROGRAMME_DEVELOPPEMENT');

-- CreateEnum
CREATE TYPE "StatutMembre" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'HONNEUR', 'FONDATEUR');

-- CreateEnum
CREATE TYPE "TypeCotisation" AS ENUM ('MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE', 'UNIQUE');

-- CreateEnum
CREATE TYPE "StatutPaiement" AS ENUM ('EN_ATTENTE', 'PAYE', 'PARTIEL', 'EN_RETARD', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeProjet" AS ENUM ('PROJET', 'PROGRAMME', 'ACTIVITE');

-- CreateEnum
CREATE TYPE "StatutProjet" AS ENUM ('BROUILLON', 'SOUMIS', 'APPROUVE', 'EN_COURS', 'SUSPENDU', 'CLOTURE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeJournal" AS ENUM ('JOURNAL_GENERAL', 'JOURNAL_ACHATS', 'JOURNAL_VENTES', 'JOURNAL_TRESORERIE', 'JOURNAL_OPERATIONS_DIVERSES', 'JOURNAL_PAIE');

-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('CLASSE_1', 'CLASSE_2', 'CLASSE_3', 'CLASSE_4', 'CLASSE_5', 'CLASSE_6', 'CLASSE_7', 'CLASSE_8', 'CLASSE_9');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'STAGE', 'CONSULTANT', 'VOLONTAIRE', 'BENEVOLE');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('BROUILLON', 'EN_ATTENTE_VALIDATION', 'VALIDE', 'REJETE', 'ARCHIVE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "TypeDon" AS ENUM ('NUMERAIRE', 'EN_NATURE', 'COMPETENCES', 'FONCIER');

-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('SUPER_ADMIN', 'ADMIN_ORGANISATION', 'DIRECTEUR', 'COMPTABLE', 'GESTIONNAIRE_PROJET', 'CHARGE_RH', 'AUDITEUR', 'MEMBRE', 'DONATEUR', 'BAILLEUR', 'LECTEUR');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('XOF', 'XAF', 'USD', 'EUR', 'GBP', 'CAD', 'CHF', 'GHS', 'NGN', 'KES');

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "sigle" TEXT,
    "type" "TypeOrganisation" NOT NULL,
    "dateCreation" TIMESTAMP(3),
    "numeroRecepisse" TEXT,
    "numeroImmatriculation" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "valeurs" TEXT,
    "siege" TEXT,
    "adresseComplete" JSONB,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "logo" TEXT,
    "couleurPrimaire" TEXT DEFAULT '#146C43',
    "couleurSecondaire" TEXT DEFAULT '#F28C25',
    "secteurs" TEXT[],
    "paysPrincipal" TEXT DEFAULT 'CI',
    "paysIntervention" TEXT[],
    "deviseDefaut" "Devise" NOT NULL DEFAULT 'XOF',
    "languesActives" TEXT[] DEFAULT ARRAY['fr']::TEXT[],
    "exerciceComptableDebut" INTEGER NOT NULL DEFAULT 1,
    "exerciceComptableFin" INTEGER NOT NULL DEFAULT 12,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "avatar" TEXT,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "deuxFacteurs" BOOLEAN NOT NULL DEFAULT false,
    "deuxFacteursSecret" TEXT,
    "dernierLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateur_organisations" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL DEFAULT 'LECTEUR',
    "permissions" TEXT[],
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateur_organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "refreshToken" TEXT,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membres" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "numero" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "genre" TEXT,
    "nationalite" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" JSONB,
    "photo" TEXT,
    "statutMembre" "StatutMembre" NOT NULL DEFAULT 'ACTIF',
    "dateAdhesion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpiration" TIMESTAMP(3),
    "fonctions" TEXT[],
    "competences" TEXT[],
    "groupes" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisations" (
    "id" TEXT NOT NULL,
    "membreId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "typeCotisation" "TypeCotisation" NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "datePaiement" TIMESTAMP(3),
    "modePaiement" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donateurs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PHYSIQUE',
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "adresse" JSONB,
    "pays" TEXT,
    "notes" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dons" (
    "id" TEXT NOT NULL,
    "donateurId" TEXT NOT NULL,
    "type" "TypeDon" NOT NULL DEFAULT 'NUMERAIRE',
    "montant" DECIMAL(15,2),
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "descriptionNature" TEXT,
    "valeurEstimee" DECIMAL(15,2),
    "dateDon" TIMESTAMP(3) NOT NULL,
    "statut" "StatutPaiement" NOT NULL DEFAULT 'PAYE',
    "projetId" TEXT,
    "recu" BOOLEAN NOT NULL DEFAULT false,
    "numeroRecu" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bailleurs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "sigle" TEXT,
    "type" TEXT,
    "pays" TEXT,
    "siteWeb" TEXT,
    "contactNom" TEXT,
    "contactEmail" TEXT,
    "contactTel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bailleurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conventions" (
    "id" TEXT NOT NULL,
    "bailleurId" TEXT NOT NULL,
    "projetId" TEXT,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "dateSignature" TIMESTAMP(3) NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'ACTIVE',
    "conditions" TEXT,
    "rapportsPrevus" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decaissements" (
    "id" TEXT NOT NULL,
    "conventionId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "dateReception" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decaissements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" TEXT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "type" "TypeProjet" NOT NULL DEFAULT 'PROJET',
    "statut" "StatutProjet" NOT NULL DEFAULT 'BROUILLON',
    "projetParentId" TEXT,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "budgetTotal" DECIMAL(15,2),
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "zones" TEXT[],
    "secteurs" TEXT[],
    "objectifs" TEXT,
    "indicateurs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activites" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIEE',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "lieu" TEXT,
    "responsableId" TEXT,
    "budget" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiaires" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "genre" TEXT,
    "telephone" TEXT,
    "adresse" JSONB,
    "vulnerabilites" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projet_beneficiaires" (
    "projetId" TEXT NOT NULL,
    "beneficiaireId" TEXT NOT NULL,
    "dateEntree" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateSortie" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "services" TEXT[],
    "notes" TEXT,

    CONSTRAINT "projet_beneficiaires_pkey" PRIMARY KEY ("projetId","beneficiaireId")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "matricule" TEXT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3),
    "genre" TEXT,
    "nationalite" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" JSONB,
    "photo" TEXT,
    "poste" TEXT NOT NULL,
    "departement" TEXT,
    "typeContrat" "TypeContrat" NOT NULL DEFAULT 'CDI',
    "dateEmbauche" TIMESTAMP(3) NOT NULL,
    "dateFinContrat" TIMESTAMP(3),
    "salaireBase" DECIMAL(15,2),
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiches_paie" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "salaireBase" DECIMAL(15,2) NOT NULL,
    "primes" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "cotisationsSociales" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "impots" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salaireNet" DECIMAL(15,2) NOT NULL,
    "datePaiement" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fiches_paie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conges" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "nombreJours" INTEGER NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volontaires" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "competences" TEXT[],
    "disponibilites" JSONB,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volontaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_comptables" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "typeCompte" "TypeCompte" NOT NULL,
    "sens" TEXT NOT NULL DEFAULT 'DEBITEUR',
    "compteParentId" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comptes_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journaux" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeJournal" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "projetId" TEXT,
    "numero" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "dateEcriture" TIMESTAMP(3) NOT NULL,
    "dateValeur" TIMESTAMP(3),
    "exercice" INTEGER NOT NULL,
    "periode" TEXT NOT NULL,
    "totalDebit" DECIMAL(15,2) NOT NULL,
    "totalCredit" DECIMAL(15,2) NOT NULL,
    "valide" BOOLEAN NOT NULL DEFAULT false,
    "dateValidation" TIMESTAMP(3),
    "pieceJointe" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_ecritures" (
    "id" TEXT NOT NULL,
    "ecritureId" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "libelle" TEXT,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ordre" INTEGER NOT NULL,

    CONSTRAINT "lignes_ecritures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "projetId" TEXT,
    "exercice" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "dateApprobation" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_budget" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "description" TEXT,
    "montantPrevu" DECIMAL(15,2) NOT NULL,
    "montantRealise" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lignes_budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_bancaires" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "numeroCompte" TEXT NOT NULL,
    "iban" TEXT,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "soldeInitial" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comptes_bancaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_bancaires" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "reference" TEXT,
    "rapproche" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_bancaires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "numeroFiscal" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" JSONB,
    "pays" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes_achat" (
    "id" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dateCommande" TIMESTAMP(3) NOT NULL,
    "dateLivraison" TIMESTAMP(3),
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "devise" "Devise" NOT NULL DEFAULT 'XOF',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT,
    "unite" TEXT,
    "stockActuel" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "stockMinimum" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(15,2),
    "localisation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantite" DECIMAL(15,4) NOT NULL,
    "dateOperation" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "immobilisations" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "dateAcquisition" TIMESTAMP(3) NOT NULL,
    "valeurAcquisition" DECIMAL(15,2) NOT NULL,
    "dureeVie" INTEGER,
    "tauxAmortissement" DECIMAL(5,2),
    "valeurResiduelle" DECIMAL(15,2),
    "localisation" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_SERVICE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "immobilisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT,
    "tags" TEXT[],
    "statut" "StatutDocument" NOT NULL DEFAULT 'VALIDE',
    "fichierUrl" TEXT NOT NULL,
    "fichierNom" TEXT NOT NULL,
    "fichierTaille" INTEGER,
    "mimeType" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "documentParentId" TEXT,
    "dateExpiration" TIMESTAMP(3),
    "createurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evenements" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "lieu" TEXT,
    "lienVisio" TEXT,
    "capaciteMax" INTEGER,
    "inscription" BOOLEAN NOT NULL DEFAULT false,
    "statut" TEXT NOT NULL DEFAULT 'PLANIFIE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evenements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_audit" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT,
    "utilisateurId" TEXT,
    "action" TEXT NOT NULL,
    "ressource" TEXT NOT NULL,
    "ressourceId" TEXT,
    "avant" JSONB,
    "apres" JSONB,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametres_organisation" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametres_organisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_organisations_utilisateurId_organisationId_key" ON "utilisateur_organisations"("utilisateurId", "organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "membres_organisationId_numero_key" ON "membres"("organisationId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "projets_organisationId_code_key" ON "projets"("organisationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employes_organisationId_matricule_key" ON "employes"("organisationId", "matricule");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_paie_employeId_periode_key" ON "fiches_paie"("employeId", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_comptables_organisationId_numero_key" ON "comptes_comptables"("organisationId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "journaux_organisationId_code_key" ON "journaux"("organisationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ecritures_comptables_organisationId_journalId_numero_key" ON "ecritures_comptables"("organisationId", "journalId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_organisationId_reference_key" ON "stocks"("organisationId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "immobilisations_organisationId_reference_key" ON "immobilisations"("organisationId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "parametres_organisation_organisationId_cle_key" ON "parametres_organisation"("organisationId", "cle");

-- AddForeignKey
ALTER TABLE "utilisateur_organisations" ADD CONSTRAINT "utilisateur_organisations_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilisateur_organisations" ADD CONSTRAINT "utilisateur_organisations_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membres" ADD CONSTRAINT "membres_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations" ADD CONSTRAINT "cotisations_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "membres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donateurs" ADD CONSTRAINT "donateurs_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dons" ADD CONSTRAINT "dons_donateurId_fkey" FOREIGN KEY ("donateurId") REFERENCES "donateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dons" ADD CONSTRAINT "dons_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bailleurs" ADD CONSTRAINT "bailleurs_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conventions" ADD CONSTRAINT "conventions_bailleurId_fkey" FOREIGN KEY ("bailleurId") REFERENCES "bailleurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conventions" ADD CONSTRAINT "conventions_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decaissements" ADD CONSTRAINT "decaissements_conventionId_fkey" FOREIGN KEY ("conventionId") REFERENCES "conventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_projetParentId_fkey" FOREIGN KEY ("projetParentId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activites" ADD CONSTRAINT "activites_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_beneficiaires" ADD CONSTRAINT "projet_beneficiaires_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projet_beneficiaires" ADD CONSTRAINT "projet_beneficiaires_beneficiaireId_fkey" FOREIGN KEY ("beneficiaireId") REFERENCES "beneficiaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_paie" ADD CONSTRAINT "fiches_paie_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volontaires" ADD CONSTRAINT "volontaires_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes_comptables" ADD CONSTRAINT "comptes_comptables_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes_comptables" ADD CONSTRAINT "comptes_comptables_compteParentId_fkey" FOREIGN KEY ("compteParentId") REFERENCES "comptes_comptables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journaux" ADD CONSTRAINT "journaux_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "journaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ecritures" ADD CONSTRAINT "lignes_ecritures_ecritureId_fkey" FOREIGN KEY ("ecritureId") REFERENCES "ecritures_comptables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_ecritures" ADD CONSTRAINT "lignes_ecritures_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_budget" ADD CONSTRAINT "lignes_budget_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes_bancaires" ADD CONSTRAINT "comptes_bancaires_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_bancaires" ADD CONSTRAINT "mouvements_bancaires_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes_bancaires"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_achat" ADD CONSTRAINT "commandes_achat_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "immobilisations" ADD CONSTRAINT "immobilisations_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_createurId_fkey" FOREIGN KEY ("createurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_documentParentId_fkey" FOREIGN KEY ("documentParentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenements" ADD CONSTRAINT "evenements_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_audit" ADD CONSTRAINT "logs_audit_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_audit" ADD CONSTRAINT "logs_audit_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametres_organisation" ADD CONSTRAINT "parametres_organisation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
