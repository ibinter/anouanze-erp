import Link from 'next/link';
import type { Metadata } from 'next';
import HeroSlider from '@/components/sara/HeroSlider';
import SaraChat from '@/components/sara/SaraChat';
import InfoBar from '@/components/landing/InfoBar';
import WhatsAppButton from '@/components/landing/WhatsAppButton';
import CookieBanner from '@/components/landing/CookieBanner';
import PWABanner from '@/components/landing/PWABanner';

export const metadata: Metadata = {
  title: 'ANOUANZÊ ERP — L\'ERP des associations et ONG d\'Afrique',
  description: 'Pilotez votre impact. Gérez votre organisation avec excellence. ERP complet conforme SYCEBNL pour associations, ONG et organisations à but non lucratif d\'Afrique francophone.',
  keywords: ['ERP ONG', 'logiciel association', 'SYCEBNL', 'OHADA', 'gestion ONG Afrique', 'comptabilité association', 'logiciel NGO Côte d\'Ivoire'],
  robots: 'index, follow',
  openGraph: {
    title: 'ANOUANZÊ ERP — L\'ERP des ONG et associations d\'Afrique',
    description: 'Solution de gestion tout-en-un pour associations, ONG et organisations à but non lucratif. Conforme SYCEBNL · Norme OHADA.',
    type: 'website',
  },
};

/* ─── DONNÉES ─────────────────────────────────────────────────────────── */

const MODULES = [
  { icon: '🏛️', title: 'Gouvernance', desc: 'Assemblées générales, résolutions, mandats, organes de direction. Tout votre appareil institutionnel numérisé.' },
  { icon: '👥', title: 'Membres & Cotisations', desc: 'Registre complet, suivi des cotisations, relances automatiques, historique des adhésions.' },
  { icon: '❤️', title: 'Donateurs & Bailleurs', desc: 'CRM dédié aux donateurs individuels et bailleurs institutionnels. Suivi des dons et conventions.' },
  { icon: '🗂️', title: 'Projets & MEAL', desc: 'Planification, cadre logique, indicateurs de suivi, évaluation et rapports bailleurs automatisés.' },
  { icon: '🧑‍💼', title: 'Ressources Humaines', desc: 'Salariés, volontaires, contrats, congés, fiches de paie conformes au droit ivoirien.' },
  { icon: '📊', title: 'Comptabilité SYCEBNL', desc: 'Plan comptable OHADA intégré, journaux, écritures, balance, états financiers conformes.' },
  { icon: '💰', title: 'Budget & Trésorerie', desc: 'Planification budgétaire par projet, rapprochement bancaire, prévisions de flux.' },
  { icon: '🛒', title: 'Achats & Stocks', desc: 'Bons de commande, fournisseurs, réception, gestion de stock terrain en temps réel.' },
  { icon: '📄', title: 'Documents', desc: 'GED intégrée, classement par projet/bailleur, signatures électroniques, versioning.' },
  { icon: '📅', title: 'Événements', desc: 'Agenda organisationnel, invitations, présences, comptes-rendus automatiques.' },
  { icon: '📈', title: 'Rapports & BI', desc: 'Tableaux de bord temps réel, exports Excel/PDF, rapports bailleurs en un clic.' },
  { icon: '🤖', title: 'Assistant IA', desc: 'Posez vos questions en français, obtenez des analyses, rapports et recommandations instantanés.' },
];

const PROBLEMES = [
  { avant: 'Plusieurs fichiers Excel et registres papier séparés', apres: 'Toutes les données centralisées et accessibles en temps réel' },
  { avant: 'Rapports bailleurs produits manuellement en plusieurs jours', apres: 'Rapports générés automatiquement en quelques minutes' },
  { avant: 'Comptabilité non conforme SYCEBNL lors des audits', apres: 'Plan comptable OHADA intégré, audits simplifiés' },
  { avant: 'Suivi des projets dispersé entre équipes', apres: 'Tableau de bord MEAL centralisé par projet et indicateur' },
  { avant: 'Gestion RH sur papier, erreurs de paie fréquentes', apres: 'Fiches de paie automatiques, suivi des congés en temps réel' },
  { avant: 'Aucune visibilité sur la trésorerie en temps réel', apres: 'Soldes, flux et prévisions visibles à tout moment' },
];

const BENEFICES = [
  { icon: '⏱️', title: 'Gagner du temps', desc: 'Automatisez les tâches répétitives : relances, rapports, fiches de paie.' },
  { icon: '🎯', title: 'Piloter avec précision', desc: 'Indicateurs clés, tableaux de bord et alertes en temps réel.' },
  { icon: '✅', title: 'Réduire les erreurs', desc: 'Saisie unique, calculs automatiques, contrôles intégrés.' },
  { icon: '🔒', title: 'Sécuriser vos données', desc: 'Accès par rôles, sauvegardes quotidiennes, connexions chiffrées.' },
  { icon: '📋', title: 'Faciliter les audits', desc: 'Traçabilité complète, historique des actions, piste d\'audit intégrée.' },
  { icon: '🌍', title: 'Travailler partout', desc: 'Web, mobile, tablette — accessible depuis n\'importe quel appareil.' },
];

const PUBLICS = [
  { icon: '🏥', titre: 'ONG de santé', desc: 'Santé communautaire, nutrition, SIDA, eau et assainissement.' },
  { icon: '🎓', titre: 'ONG éducation', desc: 'Alphabétisation, bourses, centres de formation, écoles communautaires.' },
  { icon: '👩‍🌾', titre: 'ONG agricoles', desc: 'Développement rural, coopératives, filières agricoles.' },
  { icon: '🏘️', titre: 'Associations locales', desc: 'Groupements de femmes, jeunes, quartier, culturels et sportifs.' },
  { icon: '⛪', titre: 'Organisations religieuses', desc: 'Paroisses, diocèses, institutions confessionnelles à but non lucratif.' },
  { icon: '🌐', titre: 'Réseaux & fédérations', desc: 'Fédérations nationales, réseaux multi-pays, coordinations.' },
];

const ETAPES = [
  { num: '01', title: 'Créez votre espace', desc: 'Inscrivez votre organisation en 5 minutes. Notre équipe configure votre espace et importe vos données existantes.' },
  { num: '02', title: 'Paramétrez vos modules', desc: 'Activez uniquement les modules dont vous avez besoin. Configurez votre plan comptable, vos projets, vos membres.' },
  { num: '03', title: 'Pilotez votre impact', desc: 'Accédez à vos tableaux de bord en temps réel, générez vos rapports et prenez de meilleures décisions.' },
];

const PLANS = [
  {
    id: 'essentiel', name: 'Essentiel', price: '12 900', annuel: '129 000',
    desc: 'Pour les petits groupements et associations naissantes', highlight: false,
    features: ['3 utilisateurs inclus', 'Membres & cotisations', 'Trésorerie de base', 'Comptabilité simplifiée', 'Documents (1 Go)', 'Support par email (72h)'],
    not: ['Projets & MEAL', 'RH & Paie', 'Assistant IA', 'API & intégrations'],
    cta: 'Démarrer', href: '/demo',
    color: 'border-neutral-200 bg-white', ctaColor: 'bg-neutral-800 hover:bg-neutral-900 text-white',
  },
  {
    id: 'starter', name: 'Starter', price: '29 900', annuel: '299 000',
    desc: 'Pour les associations structurées et ONG locales', highlight: false,
    features: ['8 utilisateurs inclus', 'Membres & cotisations', 'Comptabilité SYCEBNL complète', 'Budget & Trésorerie', 'Projets (3 projets actifs)', 'Documents (5 Go)', 'Événements & Agenda', 'Support prioritaire (24h)'],
    not: ['RH & Paie', 'Assistant IA', 'API & intégrations'],
    cta: 'Commencer l\'essai', href: '/demo',
    color: 'border-neutral-200 bg-white', ctaColor: 'bg-neutral-800 hover:bg-neutral-900 text-white',
  },
  {
    id: 'pro', name: 'Pro', price: '59 900', annuel: '599 000',
    desc: 'Pour les ONG actives avec projets et équipes', highlight: true,
    features: ['15 utilisateurs inclus', 'Tous les modules inclus', 'Projets & MEAL illimités', 'RH, Paie & Volontaires', 'Achats & Stocks', 'Assistant IA inclus', 'Documents illimités (20 Go)', 'Rapports bailleurs automatiques', 'Support prioritaire (4h)'],
    not: [],
    cta: 'Essayer 30 jours gratuits', href: '/demo',
    color: 'border-primary-600 bg-white', ctaColor: 'bg-primary-600 hover:bg-primary-700 text-white',
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 'Sur devis', annuel: '',
    desc: 'Pour les réseaux, fédérations et grandes ONG', highlight: false,
    features: ['Utilisateurs illimités', 'Multi-organisations', 'Console superadmin', 'Stockage illimité', 'Intégrations sur mesure (API)', 'Formation & déploiement inclus', 'SLA garanti & support 24/7', 'Hébergement on-premise possible', 'Accompagnement dédié IBIG SOFT'],
    not: [],
    cta: 'Nous contacter', href: '/contact',
    color: 'border-neutral-200 bg-neutral-50', ctaColor: 'bg-accent-400 hover:bg-amber-500 text-white',
  },
];

const TEMOIGNAGES = [
  { nom: 'Aminata Coulibaly', role: 'Directrice exécutive', org: 'ONG Espoir Côte d\'Ivoire', avatar: 'AC', texte: 'ANOUANZÊ ERP a transformé notre façon de rendre compte à nos bailleurs. Les rapports financiers sont désormais générés en quelques minutes, contre plusieurs jours auparavant.' },
  { nom: 'Kouassi Brou', role: 'Trésorier général', org: 'Association YMCA Abidjan', avatar: 'KB', texte: 'La conformité SYCEBNL était notre principal défi lors des audits. Avec ANOUANZÊ, notre comptabilité est parfaitement structurée dès le départ. Nos auditeurs sont impressionnés.' },
  { nom: 'Fatou Diallo', role: 'Coordinatrice de projets', org: 'Réseau Femmes Leaders Mali', avatar: 'FD', texte: 'Le module MEAL nous permet de suivre nos indicateurs en temps réel. La production des rapports pour nos partenaires techniques et financiers est devenue un vrai plaisir.' },
  { nom: 'Jean-Baptiste Kouamé', role: 'Directeur administratif', org: 'CARITAS Bouaké', avatar: 'JK', texte: 'Nous gérons 28 employés et 12 projets simultanément. ANOUANZÊ ERP nous donne une vision consolidée en temps réel. Indispensable pour notre organisation.' },
  { nom: 'Mariam Sanogo', role: 'Présidente', org: 'Association Femmes Rurales BF', avatar: 'MS', texte: 'En tant que petite association, le plan Essentiel nous suffit largement. Interface simple, formation rapide. Notre trésorière a été opérationnelle en moins d\'une journée.' },
  { nom: 'Dr. Sékou Traoré', role: 'Directeur pays', org: 'ONG Santé Mondiale Niger', avatar: 'ST', texte: 'L\'assistant IA est bluffant. Il génère des analyses de nos données financières en langage naturel. Un vrai gain de temps pour nos réunions de pilotage.' },
];

const FAQ = [
  { q: 'Mes données sont-elles sécurisées ?', r: 'Oui. Vos données sont hébergées sur des serveurs sécurisés avec chiffrement SSL, sauvegardes quotidiennes automatiques et accès restreint par rôles. Vous restez propriétaire de vos données à tout moment.' },
  { q: 'Puis-je changer de plan à tout moment ?', r: 'Absolument. Vous pouvez passer à un plan supérieur immédiatement (facturation au prorata). La migration vers un plan inférieur est possible en fin de période.' },
  { q: 'Y a-t-il une période d\'essai gratuite ?', r: 'Oui, 30 jours d\'essai gratuit sans carte bancaire pour les plans Starter et Pro. Le plan Essentiel est disponible en essai de 14 jours.' },
  { q: 'Le logiciel fonctionne-t-il sans connexion internet ?', r: 'ANOUANZÊ ERP est une application web. Une connexion internet est requise. Nous recommandons une connexion minimum de 1 Mbps pour une utilisation optimale.' },
  { q: 'Comment se passe la migration de mes données existantes ?', r: 'Notre équipe vous accompagne pour importer vos données (Excel, CSV, anciens logiciels). Ce service est inclus dans les plans Pro et Enterprise, en option pour les autres.' },
  { q: 'Est-ce conforme aux normes comptables africaines ?', r: 'Oui. ANOUANZÊ ERP implémente le référentiel SYCEBNL (Système Comptable des Entités à But Non Lucratif) de l\'OHADA, en vigueur dans 17 pays d\'Afrique.' },
  { q: 'Combien coûte la formation ?', r: 'La formation initiale est incluse dans tous les plans (2h en ligne). Des formations avancées sur site sont disponibles en option. Le plan Enterprise inclut une formation complète.' },
  { q: 'Puis-je utiliser ANOUANZÊ ERP sur mobile ?', r: 'Oui. L\'interface web est entièrement responsive et s\'adapte aux smartphones et tablettes. Vous pouvez également l\'installer comme application depuis votre navigateur (PWA).' },
];

const AVANTAGES_IBIG = [
  { icon: '🌍', title: 'Conçu pour l\'Afrique', desc: 'Adapté aux réalités fiscales, réglementaires et opérationnelles des organisations africaines.' },
  { icon: '🔄', title: 'Mises à jour continues', desc: 'Évolutions réglementaires et nouvelles fonctionnalités livrées automatiquement sans frais.' },
  { icon: '🎓', title: 'Formation incluse', desc: 'Accompagnement à la prise en main, guides, tutoriels vidéo et support dédié.' },
  { icon: '🛡️', title: 'Données sécurisées', desc: 'Infrastructure sécurisée, chiffrement, contrôle d\'accès par rôles et sauvegardes.' },
  { icon: '📱', title: 'Multi-devices', desc: 'Ordinateur, tablette, smartphone — et installation PWA pour un accès instantané.' },
  { icon: '🤝', title: 'Support réactif', desc: 'Équipe IBIG SOFT disponible par email, téléphone et WhatsApp selon votre plan.' },
];

const CERTIFICATIONS = ['SYCEBNL', 'OHADA', 'ISO 27001*', 'RGPD Conforme'];

/* ─── PAGE ─────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-800">

      {/* ══ BARRE INFO ══ */}
      <InfoBar />

      {/* ══ NAVBAR ══ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-16 flex items-center justify-between px-6 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-9 h-9" />
          <div className="leading-none">
            <span className="font-bold text-primary-600 text-base">ANOUANZÊ</span>
            <span className="font-bold text-accent-400 text-xs ml-1">ERP</span>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm text-neutral-600 font-medium">
          <a href="#fonctionnalites" className="hover:text-primary-600 transition-colors">Fonctionnalités</a>
          <a href="#comment-ca-marche" className="hover:text-primary-600 transition-colors">Comment ça marche</a>
          <a href="#tarifs" className="hover:text-primary-600 transition-colors">Tarifs</a>
          <a href="#temoignages" className="hover:text-primary-600 transition-colors">Témoignages</a>
          <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
          <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://ibigpartners.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500 hover:text-accent-600 border border-accent-300 hover:border-accent-400 px-3 py-2 rounded-xl transition-colors"
          >
            🤝 Devenir partenaire
          </a>
          <Link href="/login" className="hidden sm:block text-sm font-semibold text-neutral-700 hover:text-primary-600 transition-colors px-3 py-2">
            Connexion
          </Link>
          <Link href="/demo" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ══ HERO SLIDER ══ */}
      <HeroSlider />

      {/* ══ CERTIFICATIONS ══ */}
      <section className="bg-neutral-900 py-5 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6">
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest">Certifications & conformités</span>
          {CERTIFICATIONS.map((c) => (
            <span key={c} className="text-sm font-bold text-neutral-300 border border-neutral-700 px-4 py-1.5 rounded-full">{c}</span>
          ))}
          <span className="text-xs text-neutral-600">* En cours</span>
        </div>
      </section>

      {/* ══ PROBLÈMES RÉSOLUS ══ */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-full">Avant / Après</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Les problèmes que nous<br />résolvons pour vous</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">Chaque ONG affronte les mêmes défis. ANOUANZÊ ERP les élimine un par un.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROBLEMES.map((p, i) => (
              <div key={i} className="rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                <div className="bg-red-50 px-5 py-4 flex items-start gap-3">
                  <span className="text-red-400 text-lg shrink-0 mt-0.5">✗</span>
                  <p className="text-sm text-red-700 font-medium leading-relaxed">{p.avant}</p>
                </div>
                <div className="bg-primary-50 px-5 py-4 flex items-start gap-3">
                  <span className="text-primary-600 text-lg shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-primary-800 font-medium leading-relaxed">{p.apres}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BÉNÉFICES ══ */}
      <section className="py-24 px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Bénéfices</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Ce que vous gagnez<br />concrètement</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">Des résultats mesurables dès les premières semaines d'utilisation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFICES.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-7 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{b.icon}</div>
                <h3 className="font-bold text-neutral-800 text-lg mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FONCTIONNALITÉS / MODULES ══ */}
      <section id="fonctionnalites" className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">12 Modules</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Tout ce dont votre<br />organisation a besoin</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">Un écosystème complet de modules pensés pour la réalité des ONG et associations d'Afrique.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m) => (
              <div key={m.title} className="group flex gap-4 p-6 border border-neutral-100 hover:border-primary-200 rounded-2xl hover:shadow-lg transition-all bg-white hover:bg-primary-50/30">
                <div className="text-3xl shrink-0 mt-0.5">{m.icon}</div>
                <div>
                  <h3 className="font-bold text-neutral-800 mb-1.5 group-hover:text-primary-700 transition-colors">{m.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PUBLICS CONCERNÉS ══ */}
      <section className="py-24 px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Pour qui ?</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Conçu pour toutes les<br />organisations à but non lucratif</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">ANOUANZÊ ERP s'adapte à la taille et au secteur de chaque organisation.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {PUBLICS.map((p) => (
              <div key={p.titre} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm text-center hover:border-primary-200 hover:shadow-md transition-all">
                <div className="text-4xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2">{p.titre}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section id="comment-ca-marche" className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Mise en route</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Opérationnel en 3 étapes</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">De l'inscription à la première clôture comptable, notre équipe vous accompagne à chaque étape.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ETAPES.map((e, i) => (
              <div key={e.num} className="relative">
                {i < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent z-0" />}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white font-black text-xl flex items-center justify-center mx-auto mb-5">{e.num}</div>
                  <h3 className="font-bold text-neutral-800 text-lg mb-3">{e.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/demo" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg">
              Demander une démonstration gratuite →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SARA IA ══ */}
      <section className="py-24 px-6 lg:px-20 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-widest bg-accent-400/10 border border-accent-400/30 px-3 py-1.5 rounded-full">Intelligence Artificielle</span>
              <h2 className="text-4xl lg:text-5xl font-bold mt-6 mb-5 leading-tight">SARA, votre assistante<br />intelligente intégrée</h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">SARA est disponible 24h/24 pour répondre à toutes vos questions sur ANOUANZÊ ERP, vous guider dans les fonctionnalités et vous aider à choisir la bonne formule.</p>
              <ul className="space-y-3 mb-8">
                {['Présente le logiciel et ses fonctionnalités', 'Compare les offres et oriente vers la bonne formule', 'Guide vers l\'essai gratuit et la démonstration', 'Répond en français, en temps réel, 24h/24', 'Escalade vers un conseiller humain si nécessaire'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="w-5 h-5 rounded-full bg-accent-400/20 border border-accent-400/40 flex items-center justify-center shrink-0">
                      <span className="text-accent-400 text-xs">✓</span>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => (document.querySelector('[aria-label="Ouvrir SARA"]') as HTMLButtonElement)?.click()}
                className="inline-flex items-center gap-2 bg-accent-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                🤖 Parler à SARA maintenant
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="bg-primary-700/50 rounded-xl p-4 mb-4">
                <p className="text-xs text-white/50 mb-3 font-semibold">SARA — Assistante ANOUANZÊ ERP</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-400/20 flex items-center justify-center shrink-0 text-xs">🤖</div>
                    <div className="bg-white/10 rounded-xl rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[80%]">
                      Bonjour ! Je suis SARA. Comment puis-je vous aider avec ANOUANZÊ ERP ?
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-accent-400/20 border border-accent-400/30 rounded-xl rounded-tr-none px-3 py-2 text-xs text-white max-w-[80%]">
                      Quelle est la différence entre les plans Pro et Starter ?
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-400/20 flex items-center justify-center shrink-0 text-xs">🤖</div>
                    <div className="bg-white/10 rounded-xl rounded-tl-none px-3 py-2 text-xs text-white/80 max-w-[80%]">
                      Le plan <strong>Pro</strong> inclut tous les modules : RH, MEAL illimité et l'Assistant IA. Le <strong>Starter</strong> est limité à 3 projets actifs sans RH ni IA. 👉 Je vous conseille le Pro pour une ONG active.
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-white/40 text-center">Propulsé par Groq · LLaMA 3.3 70B · IBIG SOFT</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SÉCURITÉ ══ */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Sécurité</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Vos données sont<br />protégées</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">La sécurité de vos données est notre priorité absolue.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🔐', title: 'Connexions chiffrées', desc: 'SSL/TLS sur toutes les communications entre votre navigateur et nos serveurs.' },
              { icon: '👤', title: 'Accès par rôles', desc: '11 niveaux de droits d\'accès. Chaque utilisateur ne voit que ce qu\'il est autorisé à voir.' },
              { icon: '💾', title: 'Sauvegardes quotidiennes', desc: 'Vos données sont sauvegardées automatiquement chaque nuit. Restauration disponible sur demande.' },
              { icon: '📝', title: 'Piste d\'audit complète', desc: 'Chaque action est tracée : qui a fait quoi, quand et depuis où. Idéal pour les audits.' },
            ].map(s => (
              <div key={s.title} className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 text-center">
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PWA ══ */}
      <section className="py-20 px-6 lg:px-20 bg-neutral-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-widest bg-accent-400/10 border border-accent-400/30 px-3 py-1.5 rounded-full">Application Web Progressive</span>
              <h2 className="text-4xl font-bold mt-6 mb-4">Installez ANOUANZÊ ERP<br />sur votre appareil</h2>
              <p className="text-white/70 mb-6 leading-relaxed">Accédez plus rapidement à votre espace depuis votre ordinateur, tablette ou smartphone — sans passer par une boutique d'applications.</p>
              <ul className="space-y-2 mb-8">
                {['Icône sur votre écran d\'accueil', 'Ouverture en plein écran', 'Mises à jour automatiques', 'Aucun fichier lourd à télécharger', 'Compatible Android, Windows, Chrome, Edge'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-accent-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-white/40 mt-4">Sur iPhone : Partager → Ajouter à l'écran d'accueil</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              {['💻', '📱', '📱'].map((d, i) => (
                <div key={i} className={`bg-white/5 border border-white/10 rounded-2xl p-6 text-center ${i === 1 ? 'scale-110' : 'opacity-70'}`}>
                  <div className="text-4xl mb-3">{d}</div>
                  <p className="text-xs text-white/50">{['Ordinateur', 'Smartphone', 'Tablette'][i]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TARIFS ══ */}
      <section id="tarifs" className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Tarifs</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Des prix adaptés à<br />chaque organisation</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">Tous les plans incluent l'hébergement, les mises à jour et le support. Sans frais cachés.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`relative flex flex-col rounded-2xl border-2 ${plan.color} ${plan.highlight ? 'shadow-2xl scale-[1.02]' : 'shadow-sm'} overflow-hidden`}>
                {plan.highlight && (
                  <div className="bg-primary-600 text-white text-xs font-bold text-center py-2 tracking-wide">⭐ LE PLUS POPULAIRE</div>
                )}
                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="font-black text-xl text-neutral-800 mb-1">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 mb-4">{plan.desc}</p>
                    <div className="flex items-end gap-1 mb-1">
                      {plan.annuel ? (
                        <><span className="text-3xl font-black text-neutral-800">{plan.price}</span><span className="text-sm text-neutral-400 mb-1">FCFA / mois</span></>
                      ) : (
                        <span className="text-2xl font-black text-neutral-800">{plan.price}</span>
                      )}
                    </div>
                    {plan.annuel && (
                      <p className="text-xs text-primary-600 font-semibold">ou {plan.annuel} FCFA / an <span className="text-neutral-400 font-normal">(2 mois offerts)</span></p>
                    )}
                  </div>
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                        <span className="text-primary-500 shrink-0 mt-0.5 font-bold">✓</span>{f}
                      </li>
                    ))}
                    {plan.not.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-300">
                        <span className="shrink-0 mt-0.5">✕</span>{f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className={`block text-center py-3 px-5 rounded-xl font-bold text-sm transition-all ${plan.ctaColor}`}>{plan.cta}</Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-neutral-400 mt-8">
            Tous les prix sont HT. TVA applicable selon la réglementation locale. &nbsp;·&nbsp;
            <Link href="/contact" className="text-primary-600 hover:underline">Besoin d'un devis personnalisé ?</Link>
          </p>
          {/* Tableau comparatif */}
          <div className="mt-16 overflow-x-auto">
            <h3 className="text-2xl font-bold text-neutral-800 mb-6 text-center">Comparatif détaillé</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="text-left px-5 py-4 font-semibold text-neutral-600 w-1/3">Fonctionnalité</th>
                  {PLANS.map((p) => (
                    <th key={p.id} className={`text-center px-4 py-4 font-bold ${p.highlight ? 'text-primary-600 bg-primary-50' : 'text-neutral-700'}`}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Utilisateurs', '3', '8', '15', 'Illimités'],
                  ['Membres & Cotisations', '✓', '✓', '✓', '✓'],
                  ['Comptabilité SYCEBNL', 'Basique', '✓', '✓', '✓'],
                  ['Budget & Trésorerie', '✓', '✓', '✓', '✓'],
                  ['Projets actifs', '—', '3', 'Illimités', 'Illimités'],
                  ['MEAL & Rapports bailleurs', '—', '—', '✓', '✓'],
                  ['RH & Paie', '—', '—', '✓', '✓'],
                  ['Achats & Stocks', '—', '—', '✓', '✓'],
                  ['Assistant IA', '—', '—', '✓', '✓'],
                  ['Stockage documents', '1 Go', '5 Go', '20 Go', 'Illimité'],
                  ['API & Intégrations', '—', '—', '—', '✓'],
                  ['Multi-organisations', '—', '—', '—', '✓'],
                  ['Support', 'Email 72h', 'Email 24h', 'Prioritaire 4h', 'Dédié 24/7'],
                ].map(([feat, ...vals]) => (
                  <tr key={feat} className="border-t border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-700 font-medium">{feat}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`text-center px-4 py-3.5 ${PLANS[i].highlight ? 'bg-primary-50/50' : ''} ${v === '✓' ? 'text-primary-600 font-bold text-base' : v === '—' ? 'text-neutral-300' : 'text-neutral-700'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══ AVANTAGES IBIG SOFT ══ */}
      <section className="py-24 px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Pourquoi IBIG SOFT ?</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">L'éditeur de confiance<br />des ONG africaines</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">IBIG SOFT conçoit des solutions pensées pour les réalités africaines depuis Abidjan, Côte d'Ivoire.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {AVANTAGES_IBIG.map((a) => (
              <div key={a.title} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-bold text-neutral-800 mb-2">{a.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-primary-200 text-primary-600 hover:bg-primary-50 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Découvrir IBIG SOFT →
            </a>
          </div>
        </div>
      </section>

      {/* ══ TÉMOIGNAGES ══ */}
      <section id="temoignages" className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">Témoignages</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Ils nous font confiance</h2>
            <p className="text-neutral-500 max-w-lg mx-auto text-lg">Des organisations à travers l'Afrique de l'Ouest utilisent ANOUANZÊ ERP au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t) => (
              <div key={t.nom} className="bg-white rounded-2xl border border-neutral-100 p-7 shadow-sm flex flex-col">
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map((s) => <span key={s} className="text-accent-400 text-sm">★</span>)}</div>
                <p className="text-neutral-600 leading-relaxed mb-6 flex-1 italic text-sm">"{t.texte}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-primary-700">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-sm">{t.nom}</p>
                    <p className="text-xs text-neutral-400">{t.role}</p>
                    <p className="text-xs text-primary-600 font-medium">{t.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IBIG PARTNERS ══ */}
      <section className="py-24 px-6 lg:px-20 bg-gradient-to-br from-accent-400 to-amber-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest bg-white/20 border border-white/30 px-3 py-1.5 rounded-full">Programme partenaire</span>
          <h2 className="text-4xl lg:text-5xl font-bold mt-6 mb-5">Développez vos revenus<br />avec IBIG PARTNERS</h2>
          <p className="text-white/85 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Rejoignez gratuitement le programme de partenariat IBIG et recommandez nos solutions à votre réseau.
            Accédez aux outils, suivez vos recommandations et percevez vos commissions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
            {[
              { icon: '🆓', label: 'Inscription gratuite' },
              { icon: '📊', label: 'Suivi en temps réel' },
              { icon: '💰', label: 'Commissions attractives' },
            ].map(f => (
              <div key={f.label} className="bg-white/15 border border-white/25 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
              className="bg-white text-accent-500 font-bold px-8 py-4 rounded-xl hover:bg-neutral-50 transition-colors shadow-xl">
              Devenir partenaire →
            </a>
            <a href="https://ibigpartners.com/" target="_blank" rel="noopener noreferrer"
              className="bg-white/15 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/25 transition-colors">
              Découvrir le programme
            </a>
          </div>
          <p className="text-xs text-white/60 mt-6">Aucune promesse de revenu garanti. Commissions variables selon les conditions du programme.</p>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-full">FAQ</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-800 mt-4 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <details key={f.q} className="group border border-neutral-100 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors list-none">
                  {f.q}
                  <span className="text-primary-500 text-xl font-light group-open:rotate-45 transition-transform shrink-0 ml-4">+</span>
                </summary>
                <div className="px-6 pb-5 text-sm text-neutral-600 leading-relaxed border-t border-neutral-50 pt-4">{f.r}</div>
              </details>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-sm text-neutral-500 mb-4">Vous avez d'autres questions ?</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="inline-flex items-center gap-2 border border-primary-200 text-primary-600 hover:bg-primary-50 font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                📧 Nous contacter
              </Link>
              <button
                onClick={() => (document.querySelector('[aria-label="Ouvrir SARA"]') as HTMLButtonElement)?.click()}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
              >
                🤖 Poser la question à SARA
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CENTRE D'AIDE ══ */}
      <section className="py-16 px-6 lg:px-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-5xl shrink-0">🆘</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-neutral-800 mb-2">Centre d'aide IBIG SOFT</h3>
              <p className="text-sm text-neutral-500 mb-4">Guides utilisateurs, tutoriels vidéo, documentation technique et assistance humaine disponible selon votre plan.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  Ouvrir un ticket →
                </Link>
                <a href="tel:+2250555059901" className="inline-flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 hover:border-primary-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                  📞 +225 05 55 05 99 01
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="bg-gradient-to-br from-primary-700 to-[#2E9E4F] py-24 px-6 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-extrabold mb-5 leading-tight">
            Prêt à moderniser la gestion<br />de votre organisation ?
          </h2>
          <p className="text-white/70 max-w-xl mx-auto mb-10 text-lg">
            Essayez ANOUANZÊ ERP, demandez une démonstration ou échangez immédiatement avec SARA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/demo" className="bg-accent-400 hover:bg-amber-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-xl hover:-translate-y-0.5">
              Commencer gratuitement →
            </Link>
            <Link href="/contact" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors">
              Demander une démonstration
            </Link>
          </div>
          <p className="text-sm text-white/50 mb-8">✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Résiliation à tout moment &nbsp;·&nbsp; ✓ Données hébergées en Afrique</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <span>📧 contact@ibigsoft.com</span>
            <span>📞 +225 05 55 05 99 01</span>
            <span>📞 +225 27 22 27 60 14</span>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.svg" alt="" className="w-9 h-9" />
                <div>
                  <span className="font-bold text-white">ANOUANZÊ</span>
                  <span className="text-accent-400 font-bold text-xs ml-1">ERP</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-3">L'ERP des associations, ONG et organisations à but non lucratif d'Afrique. Conforme SYCEBNL · Norme OHADA.</p>
              <p className="text-xs text-neutral-600 mb-4">Un produit de <span className="text-neutral-400">IBIG SOFT</span> — Intermark Business International Group</p>
              <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:text-primary-400 transition-colors">ibigsoft.com →</a>
            </div>
            {/* Navigation */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2.5 text-sm">
                {[['#fonctionnalites', 'Fonctionnalités'], ['#comment-ca-marche', 'Comment ça marche'], ['#tarifs', 'Tarifs'], ['#temoignages', 'Témoignages'], ['/demo', 'Démonstration'], ['/login', 'Connexion']].map(([href, label]) => (
                  <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            {/* Ressources */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Ressources</h4>
              <ul className="space-y-2.5 text-sm">
                {[['/contact', 'Centre d\'aide'], ['/contact', 'Ouvrir un ticket'], ['/contact', 'FAQ'], ['#faq', 'Questions fréquentes'], ['https://ibigsoft.com', 'Blog IBIG SOFT']].map(([href, label]) => (
                  <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            {/* IBIG SOFT */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">IBIG SOFT</h4>
              <ul className="space-y-2.5 text-sm">
                {[['https://ibigsoft.com', 'À propos d\'IBIG SOFT'], ['https://ibigpartners.com/', 'Devenir partenaire'], ['https://ibigpartners.com/', 'Programme IBIG PARTNERS'], ['/contact', 'Contact'], ['/contact', 'Support']].map(([href, label]) => (
                  <li key={label}><a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hover:text-white transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            {/* Légal + Contact */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Légal</h4>
              <ul className="space-y-2.5 text-sm mb-6">
                {[['/mentions-legales', 'Mentions légales'], ['/confidentialite', 'Confidentialité'], ['/cgu', 'CGU'], ['/cookies', 'Politique cookies']].map(([href, label]) => (
                  <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
              <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">Contact</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><span>📍</span><span>Abidjan, Côte d'Ivoire</span></div>
                <div className="flex items-center gap-2"><span>📧</span><a href="mailto:contact@ibigsoft.com" className="hover:text-white transition-colors">contact@ibigsoft.com</a></div>
                <div className="flex items-center gap-2"><span>📞</span><a href="tel:+2252722276014" className="hover:text-white transition-colors">+225 27 22 27 60 14</a></div>
                <div className="flex items-center gap-2"><span>📞</span><a href="tel:+2250555059901" className="hover:text-white transition-colors">+225 05 55 05 99 01</a></div>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 space-y-3 text-xs text-neutral-600">
            <p>© {new Date().getFullYear()} <strong className="text-neutral-300">ANOUANZÊ ERP</strong>. Tous droits réservés. &nbsp;·&nbsp; Logiciel conçu, édité et exploité par <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">IBIG SOFT</a>, une marque de IBIG SARL – Intermark Business International Group.</p>
            <p className="text-neutral-700">Toute reproduction, imitation, copie ou utilisation non autorisée du logiciel, de son interface, de son logo ou de sa documentation est interdite.</p>
          </div>
        </div>
      </footer>

      {/* ══ FLOTTANTS ══ */}
      <SaraChat />
      <WhatsAppButton />
      <PWABanner />
      <CookieBanner />
    </div>
  );
}
