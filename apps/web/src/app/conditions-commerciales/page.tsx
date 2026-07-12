import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions commerciales — ANOUANZÊ ERP',
  description: 'Conditions commerciales de souscription aux plans ANOUANZÊ ERP édité par IBIG SOFT.',
};

const PLANS = [
  { name: 'Essentiel', price: '12 900 FCFA HT/mois', annuel: '129 000 FCFA HT/an', users: '3', essai: '14 jours' },
  { name: 'Starter', price: '29 900 FCFA HT/mois', annuel: '299 000 FCFA HT/an', users: '8', essai: '30 jours' },
  { name: 'Pro', price: '59 900 FCFA HT/mois', annuel: '599 000 FCFA HT/an', users: '15', essai: '30 jours' },
  { name: 'Enterprise', price: 'Sur devis', annuel: 'Sur devis', users: 'Illimités', essai: 'Sur devis' },
];

export default function ConditionsCommercialesPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-16 flex items-center justify-between px-6 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-9 h-9" />
          <div><span className="font-bold text-primary-600 text-base">ANOUANZÊ</span><span className="font-bold text-accent-400 text-xs ml-1">ERP</span></div>
        </Link>
        <Link href="/" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">← Retour à l'accueil</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Conditions commerciales</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>
        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Offres disponibles</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-neutral-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 border-b border-neutral-200">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 border-b border-neutral-200">Mensuel</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 border-b border-neutral-200">Annuel</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 border-b border-neutral-200">Utilisateurs</th>
                    <th className="text-left px-4 py-3 font-semibold text-neutral-700 border-b border-neutral-200">Essai gratuit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {PLANS.map(p => (
                    <tr key={p.name} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-semibold text-neutral-800">{p.name}</td>
                      <td className="px-4 py-3 text-primary-600 font-medium">{p.price}</td>
                      <td className="px-4 py-3">{p.annuel}</td>
                      <td className="px-4 py-3">{p.users}</td>
                      <td className="px-4 py-3">{p.essai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-neutral-500">Tous les prix s'entendent hors taxes. La TVA applicable est celle en vigueur dans le pays du Client au moment de la facturation.</p>
          </section>
          {[
            { title: '2. Modalités de paiement', content: 'Le paiement est effectué mensuellement ou annuellement par anticipation, selon l\'option choisie lors de la souscription. Les moyens de paiement acceptés sont définis dans l\'espace client. En cas de non-paiement à l\'échéance, l\'accès au service peut être suspendu après une mise en demeure restée sans effet sous 7 jours.' },
            { title: '3. Période d\'essai gratuit', content: 'Une période d\'essai gratuit est offerte sans engagement et sans carte bancaire pour les plans Starter (30 jours) et Pro (30 jours). Pour le plan Essentiel, l\'essai est de 14 jours. À l\'issue de la période d\'essai, la souscription devient payante uniquement si l\'Utilisateur choisit de continuer.' },
            { title: '4. Changement de plan', content: 'Un passage à un plan supérieur est effectif immédiatement avec facturation au prorata du temps restant dans la période en cours. Un passage à un plan inférieur prend effet à la prochaine date de renouvellement.' },
            { title: '5. Résiliation', content: 'L\'Utilisateur peut résilier son abonnement à tout moment depuis son espace client avec un préavis de 30 jours. Les sommes déjà versées ne sont pas remboursables sauf dispositions spécifiques prévues à la politique de remboursement.' },
            { title: '6. Modification des tarifs', content: 'L\'Éditeur se réserve le droit de modifier ses tarifs avec un préavis de 60 jours. Les modifications tarifaires ne s\'appliquent pas aux abonnements annuels en cours jusqu\'à leur renouvellement.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Contact commercial</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></p>
            </div>
          </section>
        </div>
      </div>
      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link> &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
        </p>
      </footer>
    </div>
  );
}
