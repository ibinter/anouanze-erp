import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de remboursement — ANOUANZÊ ERP',
  description: 'Conditions et modalités de remboursement des abonnements ANOUANZÊ ERP, édité par IBIG SOFT (Intermark Business International Group).',
};

export default function PolitiqueRemboursementPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de remboursement</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente politique précise les cas dans lesquels un remboursement total ou partiel peut être accordé par <strong>IBIG SOFT (Intermark Business International Group)</strong> au titre d'un abonnement à la plateforme <strong>ANOUANZÊ ERP</strong>, ainsi que la procédure à suivre pour en faire la demande.</p>
            <p className="mt-3">Elle complète les <Link href="/conditions-commerciales" className="text-primary-600 hover:underline">conditions commerciales</Link> et la <Link href="/politique-resiliation" className="text-primary-600 hover:underline">politique de résiliation</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Principe général</h2>
            <p>Les abonnements sont facturés d'avance pour une période déterminée. Sauf cas expressément prévus ci-après ou disposition légale impérative contraire, les sommes réglées au titre d'une période d'abonnement entamée ne donnent pas lieu à remboursement.</p>
            <p className="mt-3">La période d'essai gratuite permet au client d'évaluer la plateforme avant tout engagement financier. Les conditions applicables sont détaillées dans les <Link href="/conditions-essai" className="text-primary-600 hover:underline">conditions du programme d'essai</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Cas ouvrant droit à remboursement</h2>
            <p>Un remboursement peut être accordé, après examen de la demande, dans les situations suivantes :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li><strong>Double facturation ou erreur de facturation</strong> imputable à IBIG SOFT (Intermark Business International Group) : remboursement intégral du montant indûment perçu ;</li>
              <li><strong>Prélèvement postérieur à une résiliation régulièrement notifiée</strong> et prise en compte : remboursement intégral du montant concerné ;</li>
              <li><strong>Indisponibilité prolongée du service</strong> imputable à l'éditeur et non résolue malgré signalement : remboursement au prorata de la période d'indisponibilité constatée ;</li>
              <li><strong>Impossibilité de fournir le service souscrit</strong> pour un motif technique propre à l'éditeur : remboursement au prorata de la période non servie.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Cas exclus</h2>
            <p>Ne donnent pas lieu à remboursement, sauf accord commercial exprès :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>La sous-utilisation ou la non-utilisation du service par le client ;</li>
              <li>Le changement d'organisation, de projet ou de besoin du client en cours de période ;</li>
              <li>Le passage à une formule inférieure en cours de période, qui prend effet au renouvellement suivant ;</li>
              <li>Les interruptions liées au réseau, au matériel ou aux logiciels tiers du client ;</li>
              <li>Les interruptions résultant d'une maintenance planifiée ou d'un cas de force majeure ;</li>
              <li>La résiliation prononcée par l'éditeur pour manquement grave du client ;</li>
              <li>Les prestations de service déjà exécutées (paramétrage, reprise de données, formation, développement spécifique).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Procédure de demande</h2>
            <p>La demande doit être adressée par écrit à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a> par le contact administratif du client, dans un délai de trente (30) jours à compter du fait générateur, et comporter :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>L'identification de l'organisation et du compte concerné ;</li>
              <li>La référence de la facture ou du paiement visé ;</li>
              <li>Le motif détaillé de la demande et, le cas échéant, les pièces justificatives.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Instruction et délai de traitement</h2>
            <p>IBIG SOFT (Intermark Business International Group) accuse réception de la demande et l'instruit dans un délai raisonnable, généralement sous quinze (15) jours ouvrés. Une réponse motivée est adressée au client, qu'elle soit favorable ou défavorable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Modalités de remboursement</h2>
            <p>Le remboursement est effectué, au choix de l'éditeur et en accord avec le client, soit par avoir imputable sur les échéances suivantes, soit par virement sur le compte ayant servi au paiement initial. Les frais bancaires liés au transfert peuvent être déduits du montant remboursé.</p>
            <p className="mt-3">Aucun remboursement ne peut être effectué au profit d'un tiers ou sur un compte différent de celui du client, sauf justification écrite validée par l'éditeur.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Contestation</h2>
            <p>En cas de désaccord sur la décision rendue, le client peut engager la <Link href="/reclamations" className="text-primary-600 hover:underline">procédure de gestion des réclamations</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT (Intermark Business International Group)</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></p>
            </div>
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
