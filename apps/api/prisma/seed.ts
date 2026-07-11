import { PrismaClient, TypeOrganisation, RoleUtilisateur, TypeCompte, TypeJournal, StatutMembre, StatutProjet, TypeProjet, Devise } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed ANOUANZÊ ERP...');

  // 1. Organisation de démo
  console.log('📦 Création de l\'organisation de démo...');
  const organisation = await prisma.organisation.upsert({
    where: { slug: 'demo-ong' },
    update: {},
    create: {
      slug: 'demo-ong',
      nom: 'ONG Espoir Afrique',
      type: TypeOrganisation.ONG_NATIONALE,
      email: 'contact@espoir-afrique.org',
      paysPrincipal: 'CI',
      deviseDefaut: Devise.XOF,
    },
  });
  console.log(`  ✅ Organisation créée : ${organisation.nom} (${organisation.id})`);

  // 2. Utilisateur admin
  console.log('👤 Création de l\'utilisateur admin...');
  const motDePasseHash = bcrypt.hashSync('Admin1234!', 12);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@espoir-afrique.org' },
    update: {},
    create: {
      email: 'admin@espoir-afrique.org',
      motDePasseHash,
      nom: 'Admin',
      prenom: 'Demo',
      emailVerifie: true,
    },
  });
  console.log(`  ✅ Utilisateur créé : ${admin.prenom} ${admin.nom} (${admin.email})`);

  // 3. Lien utilisateur ↔ organisation avec rôle ADMIN_ORGANISATION
  console.log('🔗 Liaison utilisateur ↔ organisation...');
  await prisma.utilisateurOrganisation.upsert({
    where: {
      utilisateurId_organisationId: {
        utilisateurId: admin.id,
        organisationId: organisation.id,
      },
    },
    update: {},
    create: {
      utilisateurId: admin.id,
      organisationId: organisation.id,
      role: RoleUtilisateur.ADMIN_ORGANISATION,
      permissions: [],
      actif: true,
    },
  });
  console.log('  ✅ Rôle ADMIN_ORGANISATION assigné');

  // 4. Plan comptable SYCEBNL — 10 comptes basiques
  console.log('📒 Initialisation du plan comptable SYCEBNL...');
  const comptesData = [
    // Classe 1 — Fonds propres et emprunts
    { numero: '10', nom: 'Capital et fonds associatifs', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
    { numero: '16', nom: 'Emprunts et dettes assimilées', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
    // Classe 5 — Trésorerie
    { numero: '52', nom: 'Banques', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
    { numero: '57', nom: 'Caisse', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
    // Classe 6 — Charges
    { numero: '60', nom: 'Achats et variations de stocks', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '61', nom: 'Services extérieurs A', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '62', nom: 'Services extérieurs B', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '66', nom: 'Charges de personnel', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    // Classe 7 — Produits
    { numero: '71', nom: 'Subventions d\'exploitation', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
    { numero: '75', nom: 'Autres produits', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  ];

  for (const compte of comptesData) {
    await prisma.compteComptable.upsert({
      where: { organisationId_numero: { organisationId: organisation.id, numero: compte.numero } },
      update: {},
      create: {
        ...compte,
        organisationId: organisation.id,
        actif: true,
      },
    });
  }
  console.log(`  ✅ ${comptesData.length} comptes SYCEBNL initialisés`);

  // 5. Journaux comptables
  console.log('📓 Création des journaux comptables...');
  const journauxData = [
    { code: 'JG', nom: 'Journal Général', type: TypeJournal.JOURNAL_GENERAL },
    { code: 'JT', nom: 'Journal de Trésorerie', type: TypeJournal.JOURNAL_TRESORERIE },
  ];

  for (const journal of journauxData) {
    await prisma.journal.upsert({
      where: { organisationId_code: { organisationId: organisation.id, code: journal.code } },
      update: {},
      create: {
        ...journal,
        organisationId: organisation.id,
        actif: true,
      },
    });
  }
  console.log(`  ✅ ${journauxData.length} journaux créés (JG, JT)`);

  // 6. Membres de démo
  console.log('👥 Création des membres de démo...');
  const membresData = [
    { numero: 'MBR-00001', nom: 'Koné', prenom: 'Aminata', email: 'aminata.kone@example.com', telephone: '+225 07 00 00 01', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00002', nom: 'Touré', prenom: 'Mamadou', email: 'mamadou.toure@example.com', telephone: '+225 07 00 00 02', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00003', nom: 'Bamba', prenom: 'Fatou', email: 'fatou.bamba@example.com', telephone: '+225 07 00 00 03', statutMembre: StatutMembre.ACTIF },
  ];

  for (const membre of membresData) {
    await prisma.membre.upsert({
      where: { organisationId_numero: { organisationId: organisation.id, numero: membre.numero } },
      update: {},
      create: {
        ...membre,
        organisationId: organisation.id,
        dateAdhesion: new Date('2026-01-01'),
      },
    });
  }
  console.log(`  ✅ ${membresData.length} membres de démo créés`);

  // 7. Projet de démo
  console.log('🚀 Création du projet de démo...');
  const projet = await prisma.projet.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'PROJ-001' } },
    update: {},
    create: {
      organisationId: organisation.id,
      code: 'PROJ-001',
      nom: 'Accès à l\'Eau Potable',
      type: TypeProjet.PROJET,
      statut: StatutProjet.EN_COURS,
      budgetTotal: 15000000,
      devise: Devise.XOF,
      dateDebut: new Date('2026-01-01'),
      dateFin: new Date('2026-12-31'),
      description: 'Projet d\'amélioration de l\'accès à l\'eau potable dans les zones rurales',
      zones: ['Abidjan', 'Bouaké', 'San-Pédro'],
      secteurs: ['eau_assainissement', 'sante'],
    },
  });
  console.log(`  ✅ Projet créé : ${projet.nom} (budget : ${projet.budgetTotal?.toLocaleString()} XOF)`);

  // 8. Compte bancaire de démo
  console.log('🏦 Création du compte bancaire de démo...');
  const existingCompte = await prisma.compteBancaire.findFirst({
    where: { organisationId: organisation.id, numeroCompte: 'CI001-000-12345678901-23' },
  });

  if (!existingCompte) {
    await prisma.compteBancaire.create({
      data: {
        organisationId: organisation.id,
        nom: 'Compte Principal SGBCI',
        banque: 'SGBCI',
        numeroCompte: 'CI001-000-12345678901-23',
        devise: Devise.XOF,
        soldeInitial: 5000000,
        actif: true,
      },
    });
    console.log('  ✅ Compte bancaire créé : SGBCI — CI001-000-12345678901-23');
  } else {
    console.log('  ⏭️  Compte bancaire déjà existant');
  }

  console.log('\n✨ Seed terminé avec succès !');
  console.log('─────────────────────────────────────────');
  console.log('  Organisation : ONG Espoir Afrique (slug: demo-ong)');
  console.log('  Admin        : admin@espoir-afrique.org / Admin1234!');
  console.log('  Comptes      : 10 comptes SYCEBNL');
  console.log('  Journaux     : JG, JT');
  console.log('  Membres      : 3 membres de démo');
  console.log('  Projet       : PROJ-001 — Accès à l\'Eau Potable');
  console.log('  Banque       : SGBCI CI001-000-12345678901-23');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
