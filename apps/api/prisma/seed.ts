import {
  PrismaClient,
  TypeOrganisation,
  RoleUtilisateur,
  TypeCompte,
  TypeJournal,
  StatutMembre,
  StatutProjet,
  TypeProjet,
  Devise,
  TypeDon,
  TypeContrat,
  StatutPaiement,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed ANOUANZÊ ERP...');

  // 1. Organisation
  console.log('📦 Organisation...');
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
  console.log(`  ✅ ${organisation.nom}`);

  // 2. Admin
  console.log('👤 Utilisateur admin...');
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
  await prisma.utilisateurOrganisation.upsert({
    where: { utilisateurId_organisationId: { utilisateurId: admin.id, organisationId: organisation.id } },
    update: {},
    create: {
      utilisateurId: admin.id,
      organisationId: organisation.id,
      role: RoleUtilisateur.ADMIN_ORGANISATION,
      permissions: [],
      actif: true,
    },
  });
  console.log(`  ✅ ${admin.email}`);

  // 3. Plan comptable SYCEBNL
  console.log('📒 Plan comptable...');
  const comptesData = [
    { numero: '10', nom: 'Capital et fonds associatifs', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
    { numero: '16', nom: 'Emprunts et dettes assimilées', typeCompte: TypeCompte.CLASSE_1, sens: 'CREDITEUR' },
    { numero: '40', nom: 'Fournisseurs', typeCompte: TypeCompte.CLASSE_4, sens: 'CREDITEUR' },
    { numero: '41', nom: 'Clients et comptes rattachés', typeCompte: TypeCompte.CLASSE_4, sens: 'DEBITEUR' },
    { numero: '52', nom: 'Banques', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
    { numero: '57', nom: 'Caisse', typeCompte: TypeCompte.CLASSE_5, sens: 'DEBITEUR' },
    { numero: '60', nom: 'Achats et variations de stocks', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '61', nom: 'Services extérieurs A', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '62', nom: 'Services extérieurs B', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '66', nom: 'Charges de personnel', typeCompte: TypeCompte.CLASSE_6, sens: 'DEBITEUR' },
    { numero: '71', nom: "Subventions d'exploitation", typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
    { numero: '73', nom: 'Dons et libéralités reçus', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
    { numero: '75', nom: 'Autres produits', typeCompte: TypeCompte.CLASSE_7, sens: 'CREDITEUR' },
  ];
  for (const compte of comptesData) {
    await prisma.compteComptable.upsert({
      where: { organisationId_numero: { organisationId: organisation.id, numero: compte.numero } },
      update: {},
      create: { ...compte, organisationId: organisation.id, actif: true },
    });
  }
  console.log(`  ✅ ${comptesData.length} comptes SYCEBNL`);

  // 4. Journaux
  console.log('📓 Journaux...');
  const journauxData = [
    { code: 'JG', nom: 'Journal Général', type: TypeJournal.JOURNAL_GENERAL },
    { code: 'JT', nom: 'Journal de Trésorerie', type: TypeJournal.JOURNAL_TRESORERIE },
    { code: 'JA', nom: "Journal d'Achats", type: TypeJournal.JOURNAL_ACHATS },
    { code: 'JP', nom: 'Journal de Paie', type: TypeJournal.JOURNAL_PAIE },
  ];
  for (const journal of journauxData) {
    await prisma.journal.upsert({
      where: { organisationId_code: { organisationId: organisation.id, code: journal.code } },
      update: {},
      create: { ...journal, organisationId: organisation.id, actif: true },
    });
  }
  console.log(`  ✅ ${journauxData.length} journaux`);

  // 5. Membres
  console.log('👥 Membres...');
  const membresData = [
    { numero: 'MBR-00001', nom: 'Koné', prenom: 'Aminata', email: 'aminata.kone@example.com', telephone: '+225 07 00 00 01', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00002', nom: 'Touré', prenom: 'Mamadou', email: 'mamadou.toure@example.com', telephone: '+225 07 00 00 02', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00003', nom: 'Bamba', prenom: 'Fatou', email: 'fatou.bamba@example.com', telephone: '+225 07 00 00 03', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00004', nom: 'Coulibaly', prenom: 'Ibrahim', email: 'ibrahim.coulibaly@example.com', telephone: '+225 07 00 00 04', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00005', nom: 'Diallo', prenom: 'Mariam', email: 'mariam.diallo@example.com', telephone: '+225 07 00 00 05', statutMembre: StatutMembre.INACTIF },
    { numero: 'MBR-00006', nom: 'Traoré', prenom: 'Oumar', email: 'oumar.traore@example.com', telephone: '+225 07 00 00 06', statutMembre: StatutMembre.ACTIF },
    { numero: 'MBR-00007', nom: 'Sanogo', prenom: 'Aïcha', email: 'aicha.sanogo@example.com', telephone: '+225 07 00 00 07', statutMembre: StatutMembre.SUSPENDU },
  ];
  for (const membre of membresData) {
    await prisma.membre.upsert({
      where: { organisationId_numero: { organisationId: organisation.id, numero: membre.numero } },
      update: {},
      create: { ...membre, organisationId: organisation.id, dateAdhesion: new Date('2025-01-01') },
    });
  }
  console.log(`  ✅ ${membresData.length} membres`);

  // 6. Projets
  console.log('🚀 Projets...');
  const projet1 = await prisma.projet.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'PROJ-001' } },
    update: {},
    create: {
      organisationId: organisation.id,
      code: 'PROJ-001',
      nom: "Accès à l'Eau Potable",
      type: TypeProjet.PROJET,
      statut: StatutProjet.EN_COURS,
      budgetTotal: 15000000,
      devise: Devise.XOF,
      dateDebut: new Date('2026-01-01'),
      dateFin: new Date('2026-12-31'),
      description: "Amélioration de l'accès à l'eau potable dans les zones rurales de Côte d'Ivoire",
      zones: ['Bouaké', 'Korhogo', 'Man'],
      secteurs: ['eau_assainissement', 'sante'],
      objectifs: 'Fournir un accès à l\'eau potable à 5 000 ménages d\'ici fin 2026',
    },
  });
  const projet2 = await prisma.projet.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'PROJ-002' } },
    update: {},
    create: {
      organisationId: organisation.id,
      code: 'PROJ-002',
      nom: 'Éducation des Filles en Milieu Rural',
      type: TypeProjet.PROJET,
      statut: StatutProjet.APPROUVE,
      budgetTotal: 8500000,
      devise: Devise.XOF,
      dateDebut: new Date('2026-03-01'),
      dateFin: new Date('2027-02-28'),
      description: 'Programme de maintien des filles à l\'école dans 3 régions',
      zones: ['Daloa', 'Yamoussoukro', 'Bondoukou'],
      secteurs: ['education', 'genre'],
    },
  });
  const projet3 = await prisma.projet.upsert({
    where: { organisationId_code: { organisationId: organisation.id, code: 'PROJ-003' } },
    update: {},
    create: {
      organisationId: organisation.id,
      code: 'PROJ-003',
      nom: 'Agriculture Durable & Sécurité Alimentaire',
      type: TypeProjet.PROGRAMME,
      statut: StatutProjet.CLOTURE,
      budgetTotal: 22000000,
      devise: Devise.XOF,
      dateDebut: new Date('2024-01-01'),
      dateFin: new Date('2025-12-31'),
      description: 'Renforcement des capacités agricoles des communautés rurales',
      zones: ['Abidjan', 'San-Pédro', 'Grand-Bassam'],
      secteurs: ['agriculture', 'securite_alimentaire'],
    },
  });
  console.log('  ✅ 3 projets créés');

  // 7. Compte bancaire
  console.log('🏦 Comptes bancaires...');
  const existingCompte = await prisma.compteBancaire.findFirst({
    where: { organisationId: organisation.id, numeroCompte: 'CI001-000-12345678901-23' },
  });
  let comptePrincipal: any;
  if (!existingCompte) {
    comptePrincipal = await prisma.compteBancaire.create({
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
  } else {
    comptePrincipal = existingCompte;
  }

  const existingCompte2 = await prisma.compteBancaire.findFirst({
    where: { organisationId: organisation.id, numeroCompte: 'CI002-000-98765432100-01' },
  });
  let compteSecondaire: any;
  if (!existingCompte2) {
    compteSecondaire = await prisma.compteBancaire.create({
      data: {
        organisationId: organisation.id,
        nom: 'Compte Projet ECOBANK',
        banque: 'ECOBANK',
        numeroCompte: 'CI002-000-98765432100-01',
        devise: Devise.XOF,
        soldeInitial: 2000000,
        actif: true,
      },
    });
  } else {
    compteSecondaire = existingCompte2;
  }
  console.log('  ✅ 2 comptes bancaires');

  // 8. Mouvements bancaires
  console.log('💸 Mouvements bancaires...');
  const nbMouvements = await prisma.mouvementBancaire.count({ where: { compteId: comptePrincipal.id } });
  if (nbMouvements === 0) {
    await prisma.mouvementBancaire.createMany({
      data: [
        { compteId: comptePrincipal.id, date: new Date('2026-01-05'), libelle: 'Virement USAID — Tranche 1', credit: 3500000, debit: 0, reference: 'VIR-2026-001' },
        { compteId: comptePrincipal.id, date: new Date('2026-01-15'), libelle: 'Salaires janvier 2026', credit: 0, debit: 850000, reference: 'PAI-2026-01' },
        { compteId: comptePrincipal.id, date: new Date('2026-02-03'), libelle: 'Achat matériaux construction puits', credit: 0, debit: 420000, reference: 'ACH-2026-001' },
        { compteId: comptePrincipal.id, date: new Date('2026-02-12'), libelle: 'Don Fondation Bolloré', credit: 1200000, debit: 0, reference: 'DON-2026-001' },
        { compteId: comptePrincipal.id, date: new Date('2026-03-01'), libelle: 'Location véhicules mission terrain', credit: 0, debit: 180000, reference: 'DEP-2026-001' },
        { compteId: comptePrincipal.id, date: new Date('2026-03-15'), libelle: 'Salaires février/mars 2026', credit: 0, debit: 850000, reference: 'PAI-2026-02' },
        { compteId: compteSecondaire.id, date: new Date('2026-01-10'), libelle: 'Virement UNICEF — Convention EAU-2026', credit: 2000000, debit: 0, reference: 'VIR-2026-002' },
        { compteId: compteSecondaire.id, date: new Date('2026-02-20'), libelle: 'Frais formation bénéficiaires', credit: 0, debit: 350000, reference: 'DEP-2026-002' },
      ],
    });
    console.log('  ✅ 8 mouvements bancaires');
  } else {
    console.log('  ⏭️  Mouvements déjà existants');
  }

  // 9. Donateurs
  console.log('❤️  Donateurs...');
  const donateursData = [
    { nom: 'Fondation Bolloré', prenom: undefined, type: 'MORAL', email: 'contact@fondation-bollore.com', telephone: '+33 1 46 96 44 33', pays: 'FR' },
    { nom: 'Diabaté', prenom: 'Cheick', type: 'PHYSIQUE', email: 'cheick.diabate@example.com', telephone: '+225 05 01 00 01', pays: 'CI' },
    { nom: 'Société Générale CI', prenom: undefined, type: 'MORAL', email: 'rse@sgci.com', telephone: '+225 27 20 00 00', pays: 'CI' },
    { nom: 'Ouattara', prenom: 'Fatoumata', type: 'PHYSIQUE', email: 'fatoumata.ouattara@example.com', telephone: '+225 05 02 00 02', pays: 'CI' },
    { nom: 'Compagnie RSE Afrique', prenom: undefined, type: 'MORAL', email: 'dons@rse-afrique.org', telephone: '+225 27 30 00 00', pays: 'CI' },
    { nom: 'Keita', prenom: 'Modibo', type: 'PHYSIQUE', email: 'modibo.keita@example.com', telephone: '+223 76 00 00 01', pays: 'ML' },
  ];

  const donateurs: any[] = [];
  for (const d of donateursData) {
    const existing = await prisma.donateur.findFirst({ where: { organisationId: organisation.id, nom: d.nom, prenom: d.prenom ?? null } });
    if (!existing) {
      const donateur = await prisma.donateur.create({
        data: { ...d, organisationId: organisation.id },
      });
      donateurs.push(donateur);
    } else {
      donateurs.push(existing);
    }
  }
  console.log(`  ✅ ${donateurs.length} donateurs`);

  // 10. Dons
  console.log('💝 Dons...');
  const nbDons = await prisma.don.count({ where: { donateur: { organisationId: organisation.id } } });
  if (nbDons === 0) {
    await prisma.don.createMany({
      data: [
        { donateurId: donateurs[0].id, type: TypeDon.NUMERAIRE, montant: 1200000, devise: Devise.XOF, dateDon: new Date('2026-02-12'), statut: StatutPaiement.PAYE, projetId: projet1.id },
        { donateurId: donateurs[0].id, type: TypeDon.NUMERAIRE, montant: 800000, devise: Devise.XOF, dateDon: new Date('2025-11-01'), statut: StatutPaiement.PAYE },
        { donateurId: donateurs[1].id, type: TypeDon.NUMERAIRE, montant: 150000, devise: Devise.XOF, dateDon: new Date('2026-01-20'), statut: StatutPaiement.PAYE, projetId: projet1.id },
        { donateurId: donateurs[2].id, type: TypeDon.NUMERAIRE, montant: 2500000, devise: Devise.XOF, dateDon: new Date('2026-01-05'), statut: StatutPaiement.PAYE, projetId: projet2.id },
        { donateurId: donateurs[3].id, type: TypeDon.NUMERAIRE, montant: 75000, devise: Devise.XOF, dateDon: new Date('2026-03-01'), statut: StatutPaiement.EN_ATTENTE },
        { donateurId: donateurs[4].id, type: TypeDon.EN_NATURE, montant: 0, valeurEstimee: 500000, descriptionNature: '50 sacs de ciment 50 kg', devise: Devise.XOF, dateDon: new Date('2025-12-15'), statut: StatutPaiement.PAYE, projetId: projet1.id },
        { donateurId: donateurs[5].id, type: TypeDon.NUMERAIRE, montant: 200000, devise: Devise.XOF, dateDon: new Date('2026-02-28'), statut: StatutPaiement.PAYE, projetId: projet2.id },
      ],
    });
    console.log('  ✅ 7 dons');
  } else {
    console.log('  ⏭️  Dons déjà existants');
  }

  // 11. Bailleurs
  console.log('🏛️  Bailleurs...');
  const bailleur1Data = { organisationId: organisation.id, nom: 'USAID', sigle: 'USAID', type: 'BILATERAL', pays: 'US', contactNom: 'John Smith', contactEmail: 'jsmith@usaid.gov' };
  const bailleur2Data = { organisationId: organisation.id, nom: 'UNICEF Côte d\'Ivoire', sigle: 'UNICEF-CI', type: 'MULTILATERAL', pays: 'CI', contactNom: 'Marie Dupont', contactEmail: 'mdupont@unicef.org' };
  const bailleur3Data = { organisationId: organisation.id, nom: 'Union Européenne', sigle: 'UE', type: 'MULTILATERAL', pays: 'BE', contactNom: 'Hans Müller', contactEmail: 'hmuller@ec.europa.eu' };

  let bailleur1: any = await prisma.bailleur.findFirst({ where: { organisationId: organisation.id, sigle: 'USAID' } });
  if (!bailleur1) bailleur1 = await prisma.bailleur.create({ data: bailleur1Data });

  let bailleur2: any = await prisma.bailleur.findFirst({ where: { organisationId: organisation.id, sigle: 'UNICEF-CI' } });
  if (!bailleur2) bailleur2 = await prisma.bailleur.create({ data: bailleur2Data });

  let bailleur3: any = await prisma.bailleur.findFirst({ where: { organisationId: organisation.id, sigle: 'UE' } });
  if (!bailleur3) bailleur3 = await prisma.bailleur.create({ data: bailleur3Data });

  console.log('  ✅ 3 bailleurs');

  // 12. Conventions
  console.log('📜 Conventions...');
  const nbConventions = await prisma.convention.count({ where: { bailleur: { organisationId: organisation.id } } });
  if (nbConventions === 0) {
    await prisma.convention.createMany({
      data: [
        {
          bailleurId: bailleur1.id,
          projetId: projet1.id,
          reference: 'USAID-2026-EAU-001',
          titre: "Financement Accès à l'Eau Potable Rurale",
          montantTotal: 10000000,
          devise: Devise.XOF,
          dateSignature: new Date('2025-12-01'),
          dateDebut: new Date('2026-01-01'),
          dateFin: new Date('2026-12-31'),
          statut: 'ACTIVE',
        },
        {
          bailleurId: bailleur2.id,
          projetId: projet2.id,
          reference: 'UNICEF-2026-EDU-001',
          titre: 'Programme Éducation des Filles',
          montantTotal: 6000000,
          devise: Devise.XOF,
          dateSignature: new Date('2026-01-15'),
          dateDebut: new Date('2026-03-01'),
          dateFin: new Date('2027-02-28'),
          statut: 'ACTIVE',
        },
        {
          bailleurId: bailleur3.id,
          projetId: projet3.id,
          reference: 'UE-2024-AGR-001',
          titre: 'Agriculture Durable & Résilience Climatique',
          montantTotal: 18000000,
          devise: Devise.XOF,
          dateSignature: new Date('2023-11-30'),
          dateDebut: new Date('2024-01-01'),
          dateFin: new Date('2025-12-31'),
          statut: 'CLOTUREE',
        },
      ],
    });
    console.log('  ✅ 3 conventions');
  } else {
    console.log('  ⏭️  Conventions déjà existantes');
  }

  // 13. Employés
  console.log('👔 Employés...');
  const employesData = [
    { nom: 'Diomandé', prenom: 'Kadiatou', poste: 'Directrice Exécutive', departement: 'Direction', typeContrat: TypeContrat.CDI, dateEmbauche: new Date('2023-01-01'), salaireBase: 450000 },
    { nom: 'Konan', prenom: 'Yves', poste: 'Responsable Finances', departement: 'Finance', typeContrat: TypeContrat.CDI, dateEmbauche: new Date('2023-06-01'), salaireBase: 320000 },
    { nom: 'Gbané', prenom: 'Nadia', poste: 'Coordinatrice Projets', departement: 'Programmes', typeContrat: TypeContrat.CDI, dateEmbauche: new Date('2024-01-15'), salaireBase: 280000 },
    { nom: 'Soro', prenom: 'Drissa', poste: 'Chargé de Communication', departement: 'Communication', typeContrat: TypeContrat.CDD, dateEmbauche: new Date('2025-03-01'), dateFinContrat: new Date('2026-08-31'), salaireBase: 210000 },
    { nom: 'Cissé', prenom: 'Aminata', poste: 'Assistante Administrative', departement: 'Administration', typeContrat: TypeContrat.CDI, dateEmbauche: new Date('2024-09-01'), salaireBase: 190000 },
    { nom: 'Meité', prenom: 'Joël', poste: 'Stagiaire Comptabilité', departement: 'Finance', typeContrat: TypeContrat.STAGE, dateEmbauche: new Date('2026-01-06'), dateFinContrat: new Date('2026-06-30'), salaireBase: 80000 },
  ];

  const employes: any[] = [];
  for (const e of employesData) {
    const existing = await prisma.employe.findFirst({ where: { organisationId: organisation.id, nom: e.nom, prenom: e.prenom } });
    if (!existing) {
      const employe = await prisma.employe.create({ data: { ...e, organisationId: organisation.id, devise: Devise.XOF } });
      employes.push(employe);
    } else {
      employes.push(existing);
    }
  }
  console.log(`  ✅ ${employes.length} employés`);

  // 14. Volontaires
  console.log('🙋 Volontaires...');
  const volontairesData = [
    { nom: 'Barry', prenom: 'Sekou', telephone: '+224 62 00 00 01', email: 'sekou.barry@example.com', competences: ['plomberie', 'construction', 'génie_civil'] },
    { nom: 'N\'Goran', prenom: 'Sylvie', telephone: '+225 07 55 00 01', email: 'sylvie.ngoran@example.com', competences: ['enseignement', 'alphabétisation', 'formation'] },
    { nom: 'Zan', prenom: 'Arnaud', telephone: '+225 07 55 00 02', email: 'arnaud.zan@example.com', competences: ['informatique', 'réseaux', 'bureautique'] },
  ];

  for (const v of volontairesData) {
    const existing = await prisma.volontaire.findFirst({ where: { organisationId: organisation.id, nom: v.nom, prenom: v.prenom } });
    if (!existing) {
      await prisma.volontaire.create({ data: { ...v, organisationId: organisation.id } });
    }
  }
  console.log(`  ✅ ${volontairesData.length} volontaires`);

  // 15. Bénéficiaires
  console.log('🤝 Bénéficiaires...');
  const beneficiairesData = [
    { code: 'BEN-001', nom: 'Coulibaly', prenom: 'Aminata', genre: 'F', vulnerabilites: ['femme_chef_menage', 'pauvrete_extreme'] },
    { code: 'BEN-002', nom: 'Ouédraogo', prenom: 'Dramane', genre: 'M', vulnerabilites: ['handicap_physique', 'pauvrete_extreme'] },
    { code: 'BEN-003', nom: 'Dosso', prenom: 'Hawa', genre: 'F', vulnerabilites: ['veuve', 'enfants_a_charge'] },
    { code: 'BEN-004', nom: 'Fofana', prenom: 'Moussa', genre: 'M', vulnerabilites: ['jeune_sans_emploi'] },
    { code: 'BEN-005', nom: 'Diabaté', prenom: 'Mariama', genre: 'F', vulnerabilites: ['femme_chef_menage', 'analphabetisme'] },
    { code: 'BEN-006', nom: 'Touré', prenom: 'Boua', genre: 'M', vulnerabilites: ['paysan_vulnerable', 'zone_reculee'] },
    { code: 'BEN-007', nom: 'Camara', prenom: 'Adja', genre: 'F', vulnerabilites: ['enfant_orphelin'] },
  ];

  for (const b of beneficiairesData) {
    const existing = await prisma.beneficiaire.findFirst({ where: { organisationId: organisation.id, code: b.code } });
    if (!existing) {
      await prisma.beneficiaire.create({ data: { ...b, organisationId: organisation.id } });
    }
  }
  console.log(`  ✅ ${beneficiairesData.length} bénéficiaires`);

  // 16. Fournisseurs
  console.log('🏪 Fournisseurs...');
  const fournisseursData = [
    { nom: 'SODECI Matériaux', telephone: '+225 27 21 00 01', email: 'contact@sodeci-mat.ci', pays: 'CI' },
    { nom: 'Bureau Direct CI', telephone: '+225 27 22 00 02', email: 'ventes@bureaudirect.ci', pays: 'CI' },
    { nom: 'Garage Auto Abidjan', telephone: '+225 27 23 00 03', email: 'garage@auto-abidjan.ci', pays: 'CI' },
    { nom: 'Imprimerie Numérique CI', telephone: '+225 27 24 00 04', email: 'impr@numerique-ci.com', pays: 'CI' },
  ];

  const fournisseurs: any[] = [];
  for (const f of fournisseursData) {
    const existing = await prisma.fournisseur.findFirst({ where: { organisationId: organisation.id, nom: f.nom } });
    if (!existing) {
      const fournisseur = await prisma.fournisseur.create({ data: { ...f, organisationId: organisation.id } });
      fournisseurs.push(fournisseur);
    } else {
      fournisseurs.push(existing);
    }
  }
  console.log(`  ✅ ${fournisseurs.length} fournisseurs`);

  // 17. Commandes d'achat
  console.log('📦 Commandes...');
  const nbCommandes = await prisma.commandeAchat.count({ where: { fournisseur: { organisationId: organisation.id } } });
  if (nbCommandes === 0) {
    await prisma.commandeAchat.createMany({
      data: [
        { fournisseurId: fournisseurs[0].id, numero: 'BC-2026-001', dateCommande: new Date('2026-01-20'), montantTotal: 420000, devise: Devise.XOF, statut: 'RECUE', notes: 'Matériaux construction puits — PROJ-001' },
        { fournisseurId: fournisseurs[1].id, numero: 'BC-2026-002', dateCommande: new Date('2026-02-01'), montantTotal: 85000, devise: Devise.XOF, statut: 'RECUE', notes: 'Fournitures bureau Q1 2026' },
        { fournisseurId: fournisseurs[2].id, numero: 'BC-2026-003', dateCommande: new Date('2026-03-05'), dateLivraison: new Date('2026-03-20'), montantTotal: 180000, devise: Devise.XOF, statut: 'VALIDEE', notes: 'Location véhicule mission terrain mars' },
        { fournisseurId: fournisseurs[3].id, numero: 'BC-2026-004', dateCommande: new Date('2026-03-10'), montantTotal: 35000, devise: Devise.XOF, statut: 'BROUILLON', notes: 'Impression rapports annuels 2025' },
      ],
    });
    console.log('  ✅ 4 commandes');
  } else {
    console.log('  ⏭️  Commandes déjà existantes');
  }

  // 18. Stocks
  console.log('📦 Stocks...');
  const stocksData = [
    { reference: 'MAT-CIM-001', designation: 'Ciment Portland CPA 42.5', categorie: 'Matériaux construction', unite: 'sac 50kg', stockMinimum: 20, prixUnitaire: 6500, localisation: 'Entrepôt Bouaké' },
    { reference: 'MAT-FER-001', designation: 'Fer à béton 12mm', categorie: 'Matériaux construction', unite: 'barre 6m', stockMinimum: 50, prixUnitaire: 4200, localisation: 'Entrepôt Bouaké' },
    { reference: 'INF-ORD-001', designation: 'Ordinateur portable Dell', categorie: 'Informatique', unite: 'unité', stockMinimum: 2, prixUnitaire: 450000, localisation: 'Siège Abidjan' },
    { reference: 'BUR-PAP-001', designation: 'Ramette papier A4 80g', categorie: 'Fournitures bureau', unite: 'ramette', stockMinimum: 10, prixUnitaire: 3500, localisation: 'Siège Abidjan' },
    { reference: 'HYG-SAV-001', designation: 'Savon hygiène 100g', categorie: 'Hygiène', unite: 'boîte 72 unités', stockMinimum: 5, prixUnitaire: 12000, localisation: 'Entrepôt Bouaké' },
    { reference: 'LOG-TAB-001', designation: 'Tablette Android 10"', categorie: 'Informatique', unite: 'unité', stockMinimum: 3, prixUnitaire: 180000, localisation: 'Siège Abidjan' },
  ];

  for (const s of stocksData) {
    const existing = await prisma.stock.findFirst({ where: { organisationId: organisation.id, reference: s.reference } });
    if (!existing) {
      await prisma.stock.create({
        data: { ...s, organisationId: organisation.id, stockActuel: s.stockMinimum * 3 },
      });
    }
  }
  console.log(`  ✅ ${stocksData.length} articles en stock`);

  // 19. Événements
  console.log('📅 Événements...');
  const evenementsData = [
    { titre: "Assemblée Générale Ordinaire 2026", type: "AG", dateDebut: new Date('2026-04-15T09:00:00'), dateFin: new Date('2026-04-15T17:00:00'), lieu: "Salle de conférence — Siège Abidjan", capaciteMax: 100, inscription: true },
    { titre: "Formation SYCEBNL — Comptabilité associative", type: "FORMATION", dateDebut: new Date('2026-03-20T08:00:00'), dateFin: new Date('2026-03-22T17:00:00'), lieu: "Centre de formation CGECI, Abidjan", capaciteMax: 30, inscription: true },
    { titre: "Réunion coordination projets Q1", type: "REUNION", dateDebut: new Date('2026-04-02T10:00:00'), dateFin: new Date('2026-04-02T12:00:00'), lieu: "Salle de réunion — Siège Abidjan", capaciteMax: 15 },
    { titre: "Atelier MEAL & Suivi-Évaluation", type: "ATELIER", dateDebut: new Date('2026-05-05T09:00:00'), dateFin: new Date('2026-05-06T17:00:00'), lieu: "Hôtel Tiama, Abidjan", capaciteMax: 25, inscription: true },
  ];

  for (const e of evenementsData) {
    const existing = await prisma.evenement.findFirst({ where: { organisationId: organisation.id, titre: e.titre } });
    if (!existing) {
      await prisma.evenement.create({ data: { ...e, organisationId: organisation.id } });
    }
  }
  console.log(`  ✅ ${evenementsData.length} événements`);

  // 20. Écritures comptables de démonstration
  console.log('📊 Écritures comptables...');
  const journalGeneral = await prisma.journal.findFirst({ where: { organisationId: organisation.id, code: 'JG' } });
  const journalTresorerie = await prisma.journal.findFirst({ where: { organisationId: organisation.id, code: 'JT' } });
  const compte52 = await prisma.compteComptable.findFirst({ where: { organisationId: organisation.id, numero: '52' } });
  const compte71 = await prisma.compteComptable.findFirst({ where: { organisationId: organisation.id, numero: '71' } });
  const compte66 = await prisma.compteComptable.findFirst({ where: { organisationId: organisation.id, numero: '66' } });
  const compte60 = await prisma.compteComptable.findFirst({ where: { organisationId: organisation.id, numero: '60' } });

  const nbEcritures = await prisma.ecritureComptable.count({ where: { journal: { organisationId: organisation.id } } });
  if (nbEcritures === 0 && journalGeneral && journalTresorerie && compte52 && compte71 && compte66 && compte60) {
    const createEcriture = (data: any) => prisma.ecritureComptable.create({ data });

    // Écriture 1 — Réception subvention USAID
    await createEcriture({
      organisationId: organisation.id,
      journalId: journalTresorerie.id,
      numero: 'JT-2026-001',
      libelle: 'Réception subvention USAID — Tranche 1',
      dateEcriture: new Date('2026-01-05'),
      exercice: 2026,
      periode: '2026-01',
      totalDebit: 3500000,
      totalCredit: 3500000,
      lignes: {
        create: [
          { compteId: compte52.id, libelle: 'Virement USAID reçu', debit: 3500000, credit: 0, ordre: 1 },
          { compteId: compte71.id, libelle: 'Subvention exploitation USAID', debit: 0, credit: 3500000, ordre: 2 },
        ],
      },
    });

    // Écriture 2 — Salaires
    await createEcriture({
      organisationId: organisation.id,
      journalId: journalGeneral.id,
      numero: 'JG-2026-001',
      libelle: 'Salaires personnel janvier 2026',
      dateEcriture: new Date('2026-01-31'),
      exercice: 2026,
      periode: '2026-01',
      totalDebit: 850000,
      totalCredit: 850000,
      lignes: {
        create: [
          { compteId: compte66.id, libelle: 'Charges salariales janvier', debit: 850000, credit: 0, ordre: 1 },
          { compteId: compte52.id, libelle: 'Paiement salaires — SGBCI', debit: 0, credit: 850000, ordre: 2 },
        ],
      },
    });

    // Écriture 3 — Achat matériaux
    await createEcriture({
      organisationId: organisation.id,
      journalId: journalGeneral.id,
      numero: 'JG-2026-002',
      libelle: 'Achat matériaux construction puits PROJ-001',
      dateEcriture: new Date('2026-02-03'),
      exercice: 2026,
      periode: '2026-02',
      totalDebit: 420000,
      totalCredit: 420000,
      lignes: {
        create: [
          { compteId: compte60.id, libelle: 'Ciment + fer à béton SODECI', debit: 420000, credit: 0, ordre: 1 },
          { compteId: compte52.id, libelle: 'Règlement fournisseur SODECI', debit: 0, credit: 420000, ordre: 2 },
        ],
      },
    });
    console.log('  ✅ 3 écritures comptables');
  } else {
    console.log('  ⏭️  Écritures déjà existantes');
  }

  console.log('\n✨ Seed enrichi terminé avec succès !');
  console.log('─────────────────────────────────────────────────────');
  console.log('  Organisation : ONG Espoir Afrique (slug: demo-ong)');
  console.log('  Admin        : admin@espoir-afrique.org / Admin1234!');
  console.log('  Membres      : 7 membres');
  console.log('  Projets      : 3 projets (EN_COURS, APPROUVE, CLOTURE)');
  console.log('  Donateurs    : 6 donateurs + 7 dons');
  console.log('  Bailleurs    : 3 bailleurs + 3 conventions');
  console.log('  Employés     : 6 employés + 3 volontaires');
  console.log('  Bénéficiaires: 7 bénéficiaires');
  console.log('  Fournisseurs : 4 fournisseurs + 4 commandes');
  console.log('  Stocks       : 6 articles');
  console.log('  Événements   : 4 événements');
  console.log('  Banque       : 2 comptes + 8 mouvements');
  console.log('  Comptabilité : 13 comptes + 4 journaux + 3 écritures');
  console.log('─────────────────────────────────────────────────────');
}

main()
  .catch((error) => {
    console.error('❌ Erreur lors du seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
