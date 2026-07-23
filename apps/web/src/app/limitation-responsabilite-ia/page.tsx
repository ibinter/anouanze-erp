import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Limitation de responsabilité de l\'IA — ANOUANZÊ ERP',
  description: 'Avertissement et limitation de responsabilité relatifs aux fonctionnalités d\'intelligence artificielle d\'ANOUANZÊ ERP, dont l\'assistant SARA. Éditeur : IBIG SOFT.',
};

export default function LimitationResponsabiliteIaPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Limitation de responsabilité de l'IA</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="font-semibold text-amber-900">Les réponses produites par les fonctionnalités d'intelligence artificielle d'ANOUANZÊ ERP, dont l'assistante SARA, sont générées automatiquement. Elles peuvent comporter des erreurs, des omissions ou des informations obsolètes et doivent toujours être vérifiées avant toute décision. Un conseiller humain d'IBIG SOFT reste disponible pour toute question importante.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente page précise le statut des contenus générés par les fonctionnalités d'intelligence artificielle intégrées à la plateforme <strong>ANOUANZÊ ERP</strong> et les limites de responsabilité d'<strong>IBIG SOFT (Intermark Business International Group)</strong> à leur égard.</p>
            <p className="mt-3">Elle complète les <Link href="/conditions-sara" className="text-primary-600 hover:underline">conditions d'utilisation de SARA</Link> et les <Link href="/cgu" className="text-primary-600 hover:underline">conditions générales d'utilisation</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Nature des contenus générés</h2>
            <p>Les fonctionnalités concernées reposent sur des modèles de langage produisant des réponses probabilistes à partir des informations disponibles. Elles ne raisonnent pas comme un professionnel humain, n'ont pas connaissance de la situation complète de l'organisation et peuvent produire des formulations plausibles mais inexactes.</p>
            <p className="mt-3">Les contenus générés constituent une aide à la compréhension et à la productivité. Ils ne sauraient être assimilés à une position officielle, à un engagement contractuel ou à une validation par IBIG SOFT (Intermark Business International Group).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Absence de conseil professionnel</h2>
            <p>Les réponses générées ne constituent en aucun cas un conseil juridique, comptable, fiscal, social, médical ou financier personnalisé. Elles ne remplacent pas l'intervention d'un professionnel qualifié, notamment pour :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>L'interprétation des référentiels comptables applicables, notamment SYCEBNL et OHADA ;</li>
              <li>L'établissement, la validation ou la certification des états financiers ;</li>
              <li>Les déclarations fiscales et sociales ;</li>
              <li>La rédaction ou l'interprétation de contrats et de conventions de financement ;</li>
              <li>Les obligations de reporting envers les bailleurs de fonds et les autorités de tutelle.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Vérification par l'utilisateur</h2>
            <p>L'utilisateur demeure seul responsable des vérifications, des arbitrages et des décisions qu'il prend. Toute information issue d'une fonctionnalité d'IA doit être recoupée avec les sources officielles, la documentation applicable et, le cas échéant, l'avis d'un professionnel.</p>
            <p className="mt-3">Les écritures, états et documents produits dans la plateforme relèvent de la responsabilité de l'organisation cliente et de ses mandataires, quelle que soit l'assistance apportée par l'IA lors de leur préparation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Limitation de responsabilité</h2>
            <p>Dans les limites permises par la loi applicable, IBIG SOFT (Intermark Business International Group) ne peut être tenu responsable des conséquences résultant de l'utilisation des contenus générés par l'IA, notamment des décisions prises sur leur fondement, des pertes financières, des sanctions administratives ou des litiges consécutifs.</p>
            <p className="mt-3">Les fonctionnalités d'IA sont fournies dans le cadre d'une obligation de moyens. Aucune garantie d'exactitude, d'exhaustivité ou d'adéquation à un besoin particulier n'est accordée.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Recours à des services tiers</h2>
            <p>La génération des réponses peut s'appuyer sur des fournisseurs de modèles tiers. Les indisponibilités, changements de comportement ou évolutions techniques de ces fournisseurs peuvent affecter les fonctionnalités d'IA sans que la responsabilité de l'éditeur puisse être engagée à ce titre.</p>
            <p className="mt-3">Les données transmises à ces services sont traitées conformément à la <Link href="/traitement-donnees" className="text-primary-600 hover:underline">politique de traitement des données</Link>. Il est recommandé de ne pas soumettre à l'IA d'informations confidentielles ou sensibles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Usages interdits</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>Utiliser l'IA pour produire des contenus illicites, trompeurs ou portant atteinte aux droits de tiers ;</li>
              <li>Tenter de contourner les garde-fous du système ou d'en extraire des informations confidentielles ;</li>
              <li>Présenter un contenu généré comme émanant d'un professionnel habilité ou comme une position officielle d'IBIG SOFT (Intermark Business International Group) ;</li>
              <li>Automatiser des décisions produisant des effets juridiques significatifs sans intervention humaine.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Signalement d'une réponse problématique</h2>
            <p>Toute réponse inexacte, inappropriée ou préjudiciable peut être signalée à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>. Ces signalements contribuent à l'amélioration continue du service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Intervention humaine</h2>
            <p>À tout moment, l'utilisateur peut solliciter un interlocuteur humain de l'équipe IBIG SOFT (Intermark Business International Group) plutôt que de s'appuyer sur l'assistant automatisé :</p>
            <ul className="mt-3 space-y-1">
              <li>📧 <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a></li>
              <li>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></li>
              <li>☎️ <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></li>
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
