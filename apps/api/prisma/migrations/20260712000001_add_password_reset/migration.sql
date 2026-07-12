-- AlterTable: ajout des champs de réinitialisation de mot de passe sur Utilisateur
ALTER TABLE "utilisateurs" ADD COLUMN "tokenReinit" TEXT UNIQUE;
ALTER TABLE "utilisateurs" ADD COLUMN "tokenReinitExpire" TIMESTAMP(3);
