import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de résiliation — ANOUANZÊ ERP',
  description: 'Modalités de résiliation de l\'abonnement ANOUANZÊ ERP, préavis, restitution des données et effets de la résiliation. Éditeur : IBIG SOFT (Intermark Business International Group).',
};

export default function PolitiqueResiliationPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de résiliation</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="prose prose-neutral max-w-none space-y-10 text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente politique précise les conditions dans lesquelles un abonnement à la plateforme <strong>ANOUANZÊ ERP</strong> peut prendre fin, à l'initiative du client ou d'<strong>IBIG SOFT (Intermark Business International Group)</strong>, ainsi que les conséquences de cette cessation.</p>
            <p className="mt-3">Elle complète les <Link href="/conditions-commerciales" className="text-primary-600 hover:underline">conditions commerciales</Link> et les <Link href="/cgu" className="text-primary-600 hover:underline">conditions générales d'utilisation</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Résiliation à l'initiative du client</h2>
            <p>Le client peut mettre fin à son abonnement à tout moment, pour l'échéance de la période en cours, en adressant une demande écrite à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a> depuis l'adresse du contact administratif enregistré, ou par le formulaire prévu à cet effet dans l'application lorsque celui-ci est disponible.</p>
            <p className="mt-3">Sauf stipulation contraire au contrat, la demande doit être formulée au plus tard trente (30) jours avant la date de reconduction pour les abonnements annuels, et au plus tard sept (7) jours avant la date de reconduction pour les abonnements mensuels.</p>
            <p className="mt-3">La résiliation prend effet au terme de la période d'abonnement en cours. Les sommes correspondant à la période déjà réglée demeurent acquises, sous réserve des cas prévus par la <Link href="/politique-remboursement" className="text-primary-600 hover:underline">politique de remboursement</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Résiliation à l'initiative de l'éditeur</h2>
            <p>IBIG SOFT (Intermark Business International Group) peut résilier un abonnement dans les cas suivants :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>Non-paiement persistant après relance écrite restée sans effet ;</li>
              <li>Manquement grave du client à ses obligations contractuelles, notamment usage frauduleux, atteinte à la sécurité de la plateforme ou violation de la licence ;</li>
              <li>Arrêt définitif du service, moyennant un préavis raisonnable adressé au client ;</li>
              <li>Impossibilité durable d'exécuter le contrat pour un motif légitime.</li>
            </ul>
            <p className="mt-3">Sauf manquement grave rendant impossible le maintien du service, une mise en demeure préalable est adressée au client, lui laissant un délai raisonnable pour régulariser sa situation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Suspension préalable</h2>
            <p>La résiliation peut être précédée d'une suspension d'accès, notamment en cas d'impayé ou d'incident de sécurité. La suspension n'entraîne pas la suppression des données et ne dispense pas le client du paiement des sommes échues.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Effets de la résiliation</h2>
            <p>À compter de la date d'effet de la résiliation :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>L'accès des utilisateurs du client à la plateforme est désactivé ;</li>
              <li>La licence d'utilisation concédée prend fin ;</li>
              <li>Les sommes restant dues deviennent immédiatement exigibles ;</li>
              <li>Les données du client entrent dans la phase de rétention décrite ci-après.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Récupération et restitution des données</h2>
            <p>Il appartient au client d'exporter ses données avant la date d'effet de la résiliation, au moyen des fonctions d'export intégrées à la plateforme.</p>
            <p className="mt-3">À titre de facilité, IBIG SOFT (Intermark Business International Group) conserve les données du client pendant une période de rétention post-résiliation, durant laquelle une demande d'export peut encore être adressée à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>. Les modalités et la durée exacte de cette rétention sont précisées dans la <Link href="/gestion-compte" className="text-primary-600 hover:underline">politique de gestion et suppression du compte</Link>.</p>
            <p className="mt-3">Une prestation d'extraction spécifique (format particulier, volume important, accompagnement à la migration) peut faire l'objet d'un devis préalable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Suppression définitive</h2>
            <p>À l'expiration de la période de rétention, les données du client sont supprimées des environnements de production, puis progressivement des jeux de sauvegarde selon le cycle de rotation applicable, sous réserve des données que la réglementation impose de conserver plus longtemps (notamment les documents de facturation).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Dispositions survivantes</h2>
            <p>Les stipulations relatives à la confidentialité, à la propriété intellectuelle, à la limitation de responsabilité, au droit applicable et au règlement des litiges survivent à la fin du contrat.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Contact</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></li>
              <li>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></li>
            </ul>
          </section>

          <p className="text-xs text-neutral-400 italic border-t border-neutral-100 pt-6">Ce document est fourni à titre informatif et doit être validé par un conseil juridique compétent.</p>
        </div>
      </div>

      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT (Intermark Business International Group) — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
