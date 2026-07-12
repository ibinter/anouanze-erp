import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — ANOUANZÊ ERP',
  description: 'Conditions générales d\'utilisation de la plateforme ANOUANZÊ ERP éditée par IBIG SARL.',
};

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-16 flex items-center justify-between px-6 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-9 h-9" />
          <div>
            <span className="font-bold text-primary-600 text-base">ANOUANZÊ</span>
            <span className="font-bold text-accent-400 text-xs ml-1">ERP</span>
          </div>
        </Link>
        <Link href="/" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">← Retour à l'accueil</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026 — Version 1.0</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="font-semibold text-amber-800">En accédant à la plateforme ANOUANZÊ ERP et en l'utilisant, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Définitions</h2>
            <div className="space-y-2">
              {[
                ['Éditeur / Prestataire', 'IBIG SARL, société éditrice de la plateforme ANOUANZÊ ERP'],
                ['Plateforme', 'La solution logicielle ANOUANZÊ ERP accessible en mode SaaS'],
                ['Client', 'Toute organisation (association, ONG, fondation) souscrivant à un abonnement'],
                ['Utilisateur', 'Toute personne physique ayant accès à la plateforme pour le compte d\'un Client'],
                ['Données', 'Toutes les informations saisies et traitées dans la plateforme'],
              ].map(([term, def]) => (
                <div key={term} className="flex gap-3 p-3 bg-neutral-50 rounded-lg">
                  <strong className="text-neutral-800 shrink-0 min-w-[180px]">{term} :</strong>
                  <span>{def}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Objet</h2>
            <p>Les présentes CGU ont pour objet de définir les conditions d'accès et d'utilisation de la plateforme ANOUANZÊ ERP, solution de gestion intégrée (ERP) dédiée aux associations, ONG et organisations à but non lucratif.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Accès à la plateforme</h2>
            <p>L'accès à la plateforme est conditionné à :</p>
            <ul className="mt-3 space-y-2">
              <li>• La souscription à l'un des plans d'abonnement proposés</li>
              <li>• La création d'un compte administrateur par l'organisation Cliente</li>
              <li>• L'acceptation des présentes CGU et de la Politique de confidentialité</li>
            </ul>
            <p className="mt-4">La plateforme est accessible 24h/24, 7j/7, sous réserve des opérations de maintenance. IBIG SARL s'engage à informer les Clients des interruptions planifiées avec un préavis minimum de 24 heures.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Compte utilisateur et sécurité</h2>
            <p>Chaque Utilisateur est responsable de :</p>
            <ul className="mt-3 space-y-2">
              <li>• La confidentialité de ses identifiants de connexion</li>
              <li>• Toutes les actions effectuées depuis son compte</li>
              <li>• La notification immédiate à IBIG SARL de tout accès non autorisé</li>
            </ul>
            <p className="mt-3">Le partage de compte entre plusieurs personnes est interdit. Chaque utilisateur doit disposer de son propre compte.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Abonnements et facturation</h2>
            <div className="space-y-4">
              <p><strong>Plans disponibles :</strong> Essentiel (12 900 FCFA/mois), Starter (29 900 FCFA/mois), Pro (59 900 FCFA/mois), Enterprise (sur devis).</p>
              <p><strong>Facturation :</strong> Les abonnements sont facturés mensuellement ou annuellement selon le choix du Client. La facturation intervient en début de période.</p>
              <p><strong>Essai gratuit :</strong> Les plans Starter et Pro bénéficient d'une période d'essai gratuite de 30 jours. Le plan Essentiel dispose d'un essai de 14 jours. Aucune carte bancaire n'est requise pour l'essai.</p>
              <p><strong>Renouvellement :</strong> Les abonnements se renouvellent automatiquement sauf résiliation notifiée par email à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a> au moins 15 jours avant l'échéance.</p>
              <p><strong>Modifications tarifaires :</strong> IBIG SARL se réserve le droit de modifier ses tarifs avec un préavis minimum de 60 jours par email.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Propriété des données</h2>
            <p>Les données saisies par le Client dans la plateforme lui appartiennent exclusivement. IBIG SARL ne revendique aucun droit de propriété sur ces données et s'engage à :</p>
            <ul className="mt-3 space-y-2">
              <li>• Ne pas utiliser les données du Client à des fins autres que la fourniture du service</li>
              <li>• Permettre l'export des données à tout moment (formats CSV, Excel, PDF)</li>
              <li>• Restituer ou supprimer les données dans un délai de 3 mois après résiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Obligations du Client</h2>
            <p>Le Client s'engage à :</p>
            <ul className="mt-3 space-y-2">
              <li>• Utiliser la plateforme conformément aux lois et réglementations en vigueur</li>
              <li>• Ne pas tenter d'accéder à des zones de la plateforme non autorisées</li>
              <li>• Ne pas introduire de virus, malwares ou codes malveillants</li>
              <li>• Maintenir la confidentialité des accès de ses utilisateurs</li>
              <li>• Informer IBIG SARL de tout incident de sécurité</li>
              <li>• Ne pas sous-licencier, revendre ou transférer l'accès à des tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Disponibilité et SLA</h2>
            <div className="space-y-3">
              {[
                ['Plan Essentiel & Starter', '95% de disponibilité mensuelle'],
                ['Plan Pro', '99% de disponibilité mensuelle — support prioritaire 4h'],
                ['Plan Enterprise', '99,9% de disponibilité — SLA garanti contractuellement'],
              ].map(([plan, sla]) => (
                <div key={plan} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="font-medium text-neutral-700">{plan}</span>
                  <span className="text-primary-600 font-semibold text-xs">{sla}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Limitation de responsabilité</h2>
            <p>Dans les limites permises par la loi, la responsabilité de IBIG SARL est limitée au montant des abonnements payés par le Client au cours des 12 derniers mois précédant le sinistre.</p>
            <p className="mt-3">IBIG SARL ne saurait être responsable des pertes indirectes, du manque à gagner, de la perte de données due à une faute du Client ou d'un cas de force majeure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Résiliation</h2>
            <p><strong>Par le Client :</strong> Résiliation possible à tout moment, avec effet à la fin de la période en cours, par email à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a>.</p>
            <p className="mt-3"><strong>Par IBIG SARL :</strong> En cas de violation des présentes CGU, de non-paiement après mise en demeure restée sans suite, ou pour tout motif légitime avec un préavis de 30 jours.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">11. Modifications des CGU</h2>
            <p>IBIG SARL se réserve le droit de modifier les présentes CGU. Toute modification substantielle sera notifiée par email aux Clients actifs avec un préavis de 30 jours. La poursuite de l'utilisation de la plateforme après ce délai vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">12. Droit applicable et litiges</h2>
            <p>Les présentes CGU sont régies par le droit ivoirien. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux compétents d'Abidjan (Côte d'Ivoire) seront seuls compétents.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">13. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SARL</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2250778882592" className="text-primary-600 hover:underline">+225 07 78 88 25 92</a></p>
              <p>☎️ <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
            </div>
          </section>
        </div>
      </div>

      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SARL — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
