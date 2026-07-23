import type { CasPratique } from './types';

/**
 * Cas pratiques pas à pas.
 * Toutes les données citées (noms, montants, références) sont FICTIVES
 * et servent uniquement d'illustration pédagogique.
 */
export const CAS_PRATIQUES: CasPratique[] = [
  {
    id: 'cas-demarrage',
    titre: 'Mettre en service l\'ERP pour une nouvelle organisation',
    contexte:
      "L'ONG fictive « Espoir Communautaire » vient d'acquérir ANOUANZÊ ERP. Aucune donnée n'a encore été saisie et cinq personnes doivent y accéder.",
    objectif: "Disposer d'une installation utilisable : identité, exercice, utilisateurs et données de référence.",
    niveau: 'Débutant',
    dureeMinutes: 60,
    modules: ['Paramètres', 'Comptabilité', 'Import de données'],
    etapes: [
      { titre: "Renseigner l'identité", detail: "Nom « Espoir Communautaire », sigle « ESCOM », adresse et logo.", chemin: 'Paramètres › Organisation' },
      { titre: 'Fixer la devise', detail: "Choisissez la devise de tenue de compte avant toute saisie financière.", chemin: 'Paramètres › Général' },
      { titre: "Ouvrir l'exercice", detail: "Exercice du 1er janvier au 31 décembre de l'année en cours.", chemin: 'Comptabilité › Exercices' },
      { titre: 'Créer les cinq utilisateurs', detail: "Un comptable, un chargé de projets, un responsable RH, un secrétariat et un administrateur ; attribuez un rôle à chacun.", chemin: 'Paramètres › Utilisateurs' },
      { titre: 'Vérifier le plan comptable', detail: "Contrôlez la présence des comptes réellement utilisés par l'organisation.", chemin: 'Comptabilité › Plan comptable' },
      { titre: 'Importer les membres existants', detail: "Testez d'abord sur 5 lignes, puis lancez l'import complet.", chemin: 'Import de données' },
    ],
    resultatAttendu: [
      "Le logo et le nom apparaissent sur les documents exportés.",
      "Les cinq utilisateurs se connectent et voient uniquement leurs modules.",
      "La première écriture comptable peut être enregistrée.",
    ],
    erreursPossibles: [
      { probleme: "Les utilisateurs ne voient aucun menu", cause: 'Aucun rôle attribué', solution: 'Attribuez un rôle puis demandez une reconnexion.' },
      { probleme: 'Import massif partiellement rejeté', cause: 'En-têtes modifiés dans le fichier source', solution: "Repartez du modèle et ne réimportez que les lignes en erreur." },
    ],
  },
  {
    id: 'cas-adhesion',
    titre: 'Enregistrer l\'adhésion d\'un nouveau membre',
    contexte:
      "Mme Aya Konan (fictive) souhaite adhérer en catégorie « Membre actif », avec une cotisation annuelle de 25 000 F réglée en espèces.",
    objectif: "Créer la fiche membre, enregistrer l'adhésion et encaisser la cotisation.",
    niveau: 'Débutant',
    dureeMinutes: 10,
    modules: ['Membres', 'Trésorerie'],
    etapes: [
      { titre: 'Rechercher avant de créer', detail: "Saisissez « Konan » dans la recherche pour écarter un doublon.", chemin: 'Membres' },
      { titre: 'Créer la fiche', detail: "Nom, prénom, téléphone et email ; le téléphone facilite les rapprochements de paiements.", chemin: 'Membres › Nouveau membre' },
      { titre: "Enregistrer l'adhésion", detail: "Catégorie « Membre actif », date d'adhésion du jour, statut actif." },
      { titre: 'Encaisser la cotisation', detail: "Montant 25 000, période concernée, mode de règlement espèces." },
      { titre: 'Contrôler la trésorerie', detail: "Vérifiez que le compte caisse reflète l'encaissement.", chemin: 'Trésorerie' },
    ],
    resultatAttendu: [
      "La fiche de Mme Konan apparaît dans la liste des membres actifs.",
      "La cotisation est rattachée au membre et à la période.",
      "Le solde de la caisse augmente de 25 000.",
    ],
    erreursPossibles: [
      { probleme: 'Deux fiches pour la même personne', cause: 'Création sans recherche préalable', solution: 'Désactivez le doublon et conservez la fiche portant la cotisation.' },
      { probleme: 'Montant enregistré à 25', cause: 'Séparateur de milliers saisi dans le champ', solution: 'Saisissez le montant sans espace ni symbole.' },
    ],
  },
  {
    id: 'cas-don',
    titre: 'Enregistrer un don affecté à un projet',
    contexte:
      "La société fictive « Bâtir SARL » verse 1 500 000 F par virement bancaire pour le projet fictif « Eau potable Bouaké » (code PRJ-2026-03).",
    objectif: "Tracer le don, l'affecter au projet et le rattacher au compte bancaire.",
    niveau: 'Débutant',
    dureeMinutes: 15,
    modules: ['Donateurs', 'Projets', 'Trésorerie'],
    etapes: [
      { titre: 'Vérifier que le projet existe', detail: "Le projet PRJ-2026-03 doit être créé avant l'affectation.", chemin: 'Projets' },
      { titre: 'Créer le donateur', detail: "Personne morale « Bâtir SARL », avec contact référent.", chemin: 'Donateurs › Nouveau' },
      { titre: 'Saisir le don', detail: "Montant 1 500 000, date du virement, mode de règlement virement bancaire." },
      { titre: 'Affecter au projet', detail: "Sélectionnez PRJ-2026-03 dans le champ d'affectation." },
      { titre: 'Éditer le reçu', detail: "Le reçu reprend l'identité de l'organisation, le montant et la date." },
      { titre: 'Contrôler le rattachement', detail: "Le don apparaît dans les ressources du projet.", chemin: 'Projets › PRJ-2026-03' },
    ],
    resultatAttendu: [
      "Le don figure dans l'historique du donateur.",
      "Les ressources du projet augmentent de 1 500 000.",
      "Le reçu est disponible en PDF.",
    ],
    erreursPossibles: [
      { probleme: 'Don absent du projet', cause: 'Affectation non renseignée', solution: 'Modifiez le don et sélectionnez le projet.' },
      { probleme: 'Double comptage avec la trésorerie', cause: 'Encaissement également saisi à la main en trésorerie', solution: 'Ne conservez qu\'un seul enregistrement de l\'encaissement.' },
    ],
  },
  {
    id: 'cas-projet',
    titre: 'Créer un projet financé et son budget',
    contexte:
      "Le bailleur fictif « Fonds Solidarité Régional » finance 40 000 000 F sur 18 mois pour le projet « Écoles rurales » (PRJ-2026-05).",
    objectif: "Créer le projet, enregistrer la convention et bâtir le budget de référence.",
    niveau: 'Intermédiaire',
    dureeMinutes: 45,
    modules: ['Projets', 'Bailleurs', 'Budget', 'Documents'],
    etapes: [
      { titre: 'Créer le projet', detail: "Intitulé, code PRJ-2026-05, dates de début et de fin, zone et responsable.", chemin: 'Projets › Nouveau projet' },
      { titre: 'Créer le bailleur', detail: "Fiche « Fonds Solidarité Régional » avec ses contacts.", chemin: 'Bailleurs › Nouveau' },
      { titre: 'Enregistrer la convention', detail: "Montant 40 000 000, dates, projet financé PRJ-2026-05." },
      { titre: 'Planifier les tranches', detail: "Trois versements attendus, chacun daté." },
      { titre: 'Construire le budget', detail: "Une ligne par poste, alignée sur les comptes réellement mouvementés.", chemin: 'Budget › Nouveau' },
      { titre: 'Archiver la convention signée', detail: "Téléversez le PDF et rattachez-le au projet.", chemin: 'Documents' },
    ],
    resultatAttendu: [
      "Le projet affiche son financement conventionné et ses échéances.",
      "Le budget validé sert de référence au calcul des écarts.",
      "La convention signée est retrouvable depuis la fiche projet.",
    ],
    erreursPossibles: [
      { probleme: 'Budget sans réalisé', cause: 'Comptes du budget différents de ceux utilisés en saisie', solution: 'Alignez les comptes budgétaires sur les comptes mouvementés.' },
      { probleme: 'Total conventionné ≠ total budgété', cause: 'Budget saisi indépendamment de la convention', solution: 'Reprenez le budget à partir du plan de financement contractuel.' },
    ],
  },
  {
    id: 'cas-ecriture',
    titre: 'Saisir une écriture comptable imputée à un projet',
    contexte:
      "Achat fictif de fournitures pour 350 000 F réglé par banque, à imputer au projet PRJ-2026-03.",
    objectif: "Enregistrer une écriture équilibrée avec son axe analytique.",
    niveau: 'Intermédiaire',
    dureeMinutes: 20,
    modules: ['Comptabilité', 'Projets'],
    etapes: [
      { titre: "Vérifier l'exercice", detail: "La date de l'opération doit tomber dans un exercice ouvert.", chemin: 'Comptabilité › Exercices' },
      { titre: 'Ouvrir une nouvelle écriture', detail: "Journal banque, date de l'opération, libellé explicite.", chemin: 'Comptabilité › Écritures › Nouvelle écriture' },
      { titre: 'Saisir la ligne de débit', detail: "Compte de charge concerné, 350 000 au débit." },
      { titre: 'Saisir la ligne de crédit', detail: "Compte de banque, 350 000 au crédit." },
      { titre: 'Imputer le projet', detail: "Renseignez PRJ-2026-03 sur la ligne de charge." },
      { titre: 'Enregistrer et contrôler', detail: "Vérifiez l'écriture au grand livre puis le taux de consommation du projet." },
    ],
    resultatAttendu: [
      "L'écriture est équilibrée et visible au grand livre et à la balance.",
      "La consommation budgétaire du projet augmente de 350 000.",
    ],
    erreursPossibles: [
      { probleme: 'Enregistrement refusé', cause: 'Débit et crédit inégaux', solution: 'Corrigez les montants avant de réessayer.' },
      { probleme: 'Dépense absente du suivi projet', cause: 'Axe analytique non renseigné', solution: "Rouvrez l'écriture et renseignez le projet sur la ligne de charge." },
      { probleme: 'Date hors exercice', cause: "Exercice de l'année précédente clôturé", solution: "Corrigez la date ou ouvrez l'exercice concerné." },
    ],
  },
  {
    id: 'cas-achat',
    titre: 'Traiter un achat de la commande au règlement',
    contexte:
      "Commande fictive de 20 kits scolaires à 12 500 F l'unité auprès du fournisseur « Papeterie du Centre ».",
    objectif: "Respecter le circuit commande → réception → facture → règlement et mettre à jour le stock.",
    niveau: 'Intermédiaire',
    dureeMinutes: 30,
    modules: ['Achats', 'Stocks', 'Trésorerie', 'Comptabilité'],
    etapes: [
      { titre: 'Créer le fournisseur', detail: "Raison sociale et coordonnées de règlement.", chemin: 'Achats › Fournisseurs' },
      { titre: 'Émettre la commande', detail: "20 kits à 12 500, soit 250 000, imputés au projet porteur." },
      { titre: 'Réceptionner la marchandise', detail: "La réception met à jour le stock de l'article « Kit scolaire ».", chemin: 'Stocks' },
      { titre: 'Enregistrer la facture', detail: "Rapprochez la facture de la commande et de la réception." },
      { titre: 'Régler le fournisseur', detail: "Le règlement génère le mouvement de trésorerie correspondant.", chemin: 'Trésorerie' },
    ],
    resultatAttendu: [
      "Le stock de kits scolaires augmente de 20 unités.",
      "La dette fournisseur est soldée après règlement.",
      "La dépense apparaît dans la consommation budgétaire du projet.",
    ],
    erreursPossibles: [
      { probleme: 'Stock inchangé', cause: 'Réception non saisie', solution: 'Enregistrez la réception avant la facture.' },
      { probleme: 'Facture supérieure à la commande', cause: 'Écart de prix ou de quantité livrée', solution: "Faites corriger la facture ou documentez l'écart avant validation." },
    ],
  },
  {
    id: 'cas-cloture',
    titre: 'Préparer une clôture mensuelle et son export',
    contexte:
      "Fin de mois : la direction demande la situation financière consolidée et un rapport par projet.",
    objectif: "Fiabiliser les données du mois puis produire les documents à diffuser.",
    niveau: 'Avancé',
    dureeMinutes: 90,
    modules: ['Comptabilité', 'Trésorerie', 'Budget', 'Rapports & BI'],
    etapes: [
      { titre: 'Contrôler les saisies du mois', detail: "Vérifiez qu'aucune pièce du mois ne reste non saisie.", chemin: 'Comptabilité › Écritures' },
      { titre: 'Rapprocher les comptes de trésorerie', detail: "Comparez chaque compte au relevé de la période et corrigez les écarts.", chemin: 'Trésorerie' },
      { titre: 'Vérifier les imputations projet', detail: "Repérez les charges sans axe analytique et complétez-les." },
      { titre: 'Contrôler les écarts budgétaires', detail: "Analysez les lignes sur-consommées avant diffusion.", chemin: 'Budget' },
      { titre: 'Générer les rapports', detail: "Filtrez la période puis exportez en PDF pour la diffusion et en tableur pour l'analyse.", chemin: 'Rapports & BI' },
      { titre: 'Archiver les documents produits', detail: "Classez les exports du mois dans la GED.", chemin: 'Documents' },
    ],
    resultatAttendu: [
      "Les soldes de trésorerie correspondent aux relevés.",
      "Les rapports diffusés reposent sur des données rapprochées.",
      "Les exports du mois sont archivés et retrouvables.",
    ],
    erreursPossibles: [
      { probleme: 'Écart entre deux rapports', cause: 'Périodes ou filtres différents', solution: 'Comparez les filtres appliqués avant de conclure à une anomalie.' },
      { probleme: 'Rapport vide', cause: 'Filtres trop restrictifs', solution: 'Réinitialisez les filtres et élargissez la période.' },
    ],
  },
  {
    id: 'cas-rapport-bailleur',
    titre: 'Constituer un rapport financier pour un bailleur',
    contexte:
      "Le « Fonds Solidarité Régional » attend le rapport financier semestriel du projet PRJ-2026-05.",
    objectif: "Produire un état des dépenses conforme au budget conventionné et justifié par des pièces.",
    niveau: 'Avancé',
    dureeMinutes: 120,
    modules: ['Projets', 'Budget', 'Comptabilité', 'Documents', 'Rapports & BI'],
    etapes: [
      { titre: "Délimiter la période", detail: "Reprenez exactement les dates exigées par la convention." },
      { titre: 'Extraire les dépenses du projet', detail: "Filtrez les écritures imputées à PRJ-2026-05 sur la période.", chemin: 'Comptabilité' },
      { titre: 'Comparer au budget conventionné', detail: "Ligne à ligne, mesurez les écarts et préparez leur justification.", chemin: 'Budget' },
      { titre: 'Vérifier les pièces justificatives', detail: "Chaque dépense significative doit disposer d'une pièce archivée.", chemin: 'Documents' },
      { titre: 'Générer et exporter le rapport', detail: "Export PDF pour l'envoi, tableur pour la mise au format du bailleur.", chemin: 'Rapports & BI' },
      { titre: 'Archiver la version transmise', detail: "Conservez la version exacte envoyée au bailleur." },
    ],
    resultatAttendu: [
      "Un état de dépenses réconcilié avec la comptabilité.",
      "Les écarts significatifs sont expliqués.",
      "La version transmise est archivée et horodatée.",
    ],
    erreursPossibles: [
      { probleme: 'Dépenses manquantes dans l\'extraction', cause: 'Imputation projet absente sur certaines écritures', solution: "Complétez les axes analytiques avant l'extraction." },
      { probleme: 'Pièce justificative introuvable', cause: 'Document non archivé au moment de la dépense', solution: 'Instaurez le classement au fil de la saisie plutôt qu\'a posteriori.' },
    ],
  },
];
