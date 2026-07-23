import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions du programme d\'essai — ANOUANZÊ ERP',
  description: 'Conditions applicables à la période d\'essai gratuite de la plateforme ANOUANZÊ ERP, éditée par IBIG SOFT (Intermark Business International Group).',
};

export default function ConditionsEssaiPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Conditions du programme d'essai</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section className="p-5 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="font-semibold text-primary-800">La période d'essai permet d'évaluer ANOUANZÊ ERP sans engagement. Sa durée standard est de 30 jours pour les formules concernées ; elle est de 14 jours pour la formule Essentiel et fixée sur devis pour la formule Enterprise.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>Les présentes conditions régissent l'accès au programme d'essai gratuit de la plateforme <strong>ANOUANZÊ ERP</strong>, proposé par <strong>IBIG SOFT (Intermark Business International Group)</strong>. Elles complètent les <Link href="/cgu" className="text-primary-600 hover:underline">conditions générales d'utilisation</Link> et les <Link href="/conditions-commerciales" className="text-primary-600 hover:underline">conditions commerciales</Link>, qui demeurent applicables pendant l'essai.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Éligibilité</h2>
            <p>Le programme d'essai est réservé aux organisations n'ayant pas déjà bénéficié d'un essai pour la même entité. Il est ouvert aux associations, ONG, fondations, coopératives, projets et entreprises souhaitant évaluer la plateforme dans un contexte réel.</p>
            <p className="mt-3">IBIG SOFT (Intermark Business International Group) se réserve le droit de refuser ou d'interrompre un essai en cas d'inscriptions multiples manifestement destinées à contourner cette limitation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Durée et point de départ</h2>
            <p>La période d'essai débute à la date d'activation du compte et court sans interruption jusqu'à son terme, exprimé en jours calendaires. La date d'expiration est consultable depuis l'espace d'administration du compte.</p>
            <p className="mt-3">Une prolongation exceptionnelle peut être accordée sur demande motivée adressée à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a>. Elle relève de la seule appréciation de l'éditeur et fait l'objet d'une confirmation écrite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Absence d'engagement et de moyen de paiement</h2>
            <p>La souscription à l'essai n'exige pas la communication d'un moyen de paiement et n'entraîne aucun prélèvement automatique. Aucune conversion en abonnement payant ne peut intervenir sans une action explicite du client.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Périmètre fonctionnel</h2>
            <p>L'essai donne accès aux fonctionnalités de la formule évaluée, sous réserve d'éventuelles limitations techniques signalées dans l'application (nombre d'utilisateurs, volume de données, modules optionnels, prestations d'accompagnement).</p>
            <p className="mt-3">Les prestations de paramétrage avancé, de reprise de données et de formation ne sont pas incluses dans l'essai et font l'objet d'un devis séparé.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Support pendant l'essai</h2>
            <p>Pendant l'essai, l'assistance est fournie selon le niveau « Essai » décrit dans la <Link href="/politique-support" className="text-primary-600 hover:underline">politique de support</Link>, principalement par e-mail et via l'assistant SARA.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Statut des données saisies</h2>
            <p>Les données saisies pendant l'essai appartiennent au client et sont traitées conformément à la <Link href="/traitement-donnees" className="text-primary-600 hover:underline">politique de traitement des données</Link>. En cas de conversion en abonnement payant, elles sont conservées sans nouvelle saisie.</p>
            <p className="mt-3">Il est vivement recommandé d'exporter les données avant l'expiration de l'essai si aucune souscription n'est envisagée.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Fin de l'essai</h2>
            <p>À l'expiration de la période d'essai et en l'absence de souscription, l'accès au compte est désactivé. Les données sont conservées pendant une période de rétention, puis supprimées dans les conditions décrites par la <Link href="/gestion-compte" className="text-primary-600 hover:underline">politique de gestion et suppression du compte</Link>.</p>
            <p className="mt-3">Le client peut mettre fin à son essai à tout moment, sans frais ni justification, en écrivant à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Usage loyal</h2>
            <p>L'essai doit être utilisé de bonne foi, à des fins d'évaluation. Sont notamment prohibés : les tests de charge non autorisés, les tentatives d'accès non autorisé, l'extraction massive de données à des fins de reproduction du service, et l'usage productif prolongé destiné à éviter la souscription.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Fourniture « en l'état »</h2>
            <p>La plateforme est mise à disposition pendant l'essai en l'état, à titre gratuit. Aucun engagement de disponibilité, de performance ou de résultat n'est souscrit au titre de l'essai, dans les limites permises par la loi applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">11. Contact</h2>
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
