import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ANOUANZÊ ERP — L\'ERP des associations et ONG d\'Afrique',
  description:
    'Pilotez votre impact. Gérez votre organisation avec excellence. ERP complet conforme SYCEBNL pour associations, ONG et organisations à but non lucratif.',
  robots: 'index, follow',
};

const FEATURES = [
  { icon: '🏛️', title: 'Gouvernance', desc: 'Assemblées générales, résolutions, mandats — tout votre appareil institutionnel en un clic.' },
  { icon: '👥', title: 'Membres & cotisations', desc: 'Registre des membres, suivi des cotisations, relances automatiques.' },
  { icon: '💼', title: 'Projets & MEAL', desc: 'Planification, suivi d\'avancement, indicateurs MEAL et rapports bailleurs.' },
  { icon: '📊', title: 'Comptabilité SYCEBNL', desc: 'Plan comptable OHADA, journal, balance, états financiers conformes.' },
  { icon: '💰', title: 'Budget & Trésorerie', desc: 'Planification budgétaire, suivi des réalisations, rapprochement bancaire.' },
  { icon: '🧑‍💼', title: 'Ressources humaines', desc: 'Salariés, volontaires, congés, fiches de paie — une RH simplifiée.' },
  { icon: '📦', title: 'Stocks & Achats', desc: 'Gestion des stocks de terrain, bons de commande, fournisseurs.' },
  { icon: '📈', title: 'Rapports & BI', desc: 'Tableaux de bord temps réel, exports Excel/PDF, rapports bailleurs.' },
  { icon: '🤖', title: 'Assistant IA', desc: 'Posez vos questions en langage naturel, obtenez des analyses instantanées.' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '25 000',
    period: 'FCFA / mois',
    desc: 'Idéal pour les petites associations',
    color: 'border-neutral-200',
    badge: null,
    features: [
      'Jusqu\'à 3 utilisateurs',
      'Membres & cotisations',
      'Comptabilité de base',
      'Trésorerie',
      '2 Go de stockage documents',
      'Support par email',
    ],
    cta: 'Démarrer gratuitement',
    href: '/demo',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '65 000',
    period: 'FCFA / mois',
    desc: 'Pour les ONG et associations actives',
    color: 'border-primary-600',
    badge: 'Recommandé',
    features: [
      'Jusqu\'à 15 utilisateurs',
      'Tous les modules',
      'Projets & MEAL',
      'RH & Paie',
      'Exports PDF / Excel illimités',
      '10 Go de stockage',
      'Support prioritaire',
      'Assistant IA inclus',
    ],
    cta: 'Essayer 30 jours gratuits',
    href: '/demo',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    desc: 'Réseaux et fédérations d\'ONG',
    color: 'border-neutral-200',
    badge: null,
    features: [
      'Utilisateurs illimités',
      'Multi-organisations',
      'Console superadmin',
      'Intégrations sur mesure',
      'Formation & déploiement',
      'SLA dédié & support 24/7',
      'Hébergement on-premise possible',
    ],
    cta: 'Nous contacter',
    href: '/contact',
  },
];

const TEMOIGNAGES = [
  {
    nom: 'Aminata Coulibaly',
    role: 'Directrice exécutive',
    org: 'ONG Espoir Côte d\'Ivoire',
    texte: 'ANOUANZÊ ERP a transformé notre façon de rendre compte à nos bailleurs. Les rapports financiers sont désormais générés en quelques minutes.',
    avatar: 'AC',
  },
  {
    nom: 'Kouassi Brou',
    role: 'Trésorier général',
    org: 'Association YMCA Abidjan',
    texte: 'La conformité SYCEBNL était notre principal défi. Avec ANOUANZÊ, notre comptabilité est parfaitement structurée dès le départ.',
    avatar: 'KB',
  },
  {
    nom: 'Fatou Diallo',
    role: 'Coordinatrice de projets',
    org: 'Réseau Femmes Leaders Mali',
    texte: 'Le module MEAL nous permet de suivre nos indicateurs en temps réel et de produire les rapports exigés par nos partenaires techniques.',
    avatar: 'FD',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-neutral-800 font-sans">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-100 h-16 flex items-center justify-between px-6 lg:px-16">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-8 h-8" />
          <span className="font-bold text-primary-600">ANOUANZÊ</span>
          <span className="font-semibold text-accent-400 text-sm">ERP</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-600">
          <a href="#fonctionnalites" className="hover:text-primary-600 transition-colors">Fonctionnalités</a>
          <a href="#tarifs" className="hover:text-primary-600 transition-colors">Tarifs</a>
          <a href="#temoignages" className="hover:text-primary-600 transition-colors">Témoignages</a>
          <a href="/contact" className="hover:text-primary-600 transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors hidden sm:block">
            Se connecter
          </Link>
          <Link
            href="/demo"
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-[#2E9E4F] text-white py-24 px-6 lg:px-16">
        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-12 right-1/3 w-32 h-32 bg-accent-400/20 rounded-full" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
            Conforme SYCEBNL · Norme OHADA · Adapté à l'Afrique
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Pilotez votre impact.<br />
            <span className="text-accent-400">Gérez votre organisation</span><br />
            avec excellence.
          </h1>
          <p className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            ANOUANZÊ ERP est la solution de gestion tout-en-un conçue pour les associations,
            ONG et organisations à but non lucratif d'Afrique francophone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="bg-accent-400 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Démarrer l'essai gratuit — 30 jours
            </Link>
            <a
              href="#fonctionnalites"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Voir les fonctionnalités
            </a>
          </div>

          <p className="text-sm text-white/50 mt-6">Sans carte bancaire · Résiliation à tout moment</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-neutral-50 py-12 border-b border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { val: '9+', label: 'Modules intégrés' },
            { val: '11', label: 'Niveaux de rôles' },
            { val: '100%', label: 'Conforme SYCEBNL' },
            { val: '24/7', label: 'Données sécurisées' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary-600">{s.val}</p>
              <p className="text-sm text-neutral-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ── */}
      <section id="fonctionnalites" className="py-20 px-6 lg:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            Tout ce dont votre organisation a besoin
          </h2>
          <p className="text-neutral-500 max-w-xl mx-auto text-base">
            Un écosystème complet de modules pensés pour la réalité des ONG et associations africaines.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group border border-neutral-100 rounded-2xl p-6 hover:border-primary-200 hover:shadow-md transition-all bg-white"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section id="tarifs" className="bg-neutral-50 py-20 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">Tarifs transparents</h2>
            <p className="text-neutral-500 max-w-lg mx-auto">
              Des plans adaptés à chaque taille d'organisation. Commencez gratuitement, évoluez sans contrainte.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 ${plan.color} p-8 flex flex-col ${plan.id === 'pro' ? 'shadow-xl' : 'shadow-sm'}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-neutral-800 mb-1">{plan.name}</h3>
                  <p className="text-sm text-neutral-500 mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold text-neutral-800">{plan.price}</span>
                    {plan.period && <span className="text-sm text-neutral-400 mb-1">{plan.period}</span>}
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-neutral-600">
                      <span className="text-primary-600 mt-0.5 shrink-0">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
                    plan.id === 'pro'
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" className="py-20 px-6 lg:px-16 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Des dizaines d'organisations en Afrique de l'Ouest utilisent déjà ANOUANZÊ ERP.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMOIGNAGES.map((t) => (
            <div key={t.nom} className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-neutral-600 leading-relaxed mb-5 italic">"{t.texte}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-700">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t.nom}</p>
                  <p className="text-xs text-neutral-400">{t.role} · {t.org}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-primary-600 py-20 px-6 text-white text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Ensemble pour mieux gérer,<br />ensemble pour plus d'impact.
        </h2>
        <p className="text-white/70 max-w-xl mx-auto mb-10 text-base">
          Rejoignez les organisations qui font confiance à ANOUANZÊ ERP pour piloter leur mission avec excellence.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            className="bg-accent-400 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg"
          >
            Demander une démonstration
          </Link>
          <Link
            href="/login"
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="" className="w-8 h-8" />
                <span className="font-bold text-white">ANOUANZÊ</span>
                <span className="text-accent-400 font-semibold text-sm">ERP</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                L'ERP des associations, ONG et organisations à but non lucratif d'Afrique.
                Conforme SYCEBNL · Norme OHADA.
              </p>
              <div className="mt-4 text-xs space-y-1">
                <p>📧 contact@anouanzeerp.com</p>
                <p>📞 +225 07 00 00 00 00</p>
                <p>🌐 www.anouanzeerp.com</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="/demo" className="hover:text-white transition-colors">Demande de démo</a></li>
                <li><a href="/aide" className="hover:text-white transition-colors">Centre d'aide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Éditeur</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://ibigsoft.com" className="hover:text-white transition-colors">IBIG SARL</a></li>
                <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row justify-between text-xs gap-2">
            <p>© {new Date().getFullYear()} IBIG SARL — L'excellence est notre passion.</p>
            <p>ANOUANZÊ ERP — Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
