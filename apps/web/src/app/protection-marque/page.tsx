import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Protection de la marque — ANOUANZÊ ERP',
  description: 'Règles d\'usage et de protection des marques et signes distinctifs ANOUANZÊ ERP et IBIG SOFT (Intermark Business International Group).',
};

export default function ProtectionMarquePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Protection de la marque</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Signes distinctifs concernés</h2>
            <p>Les dénominations <strong>ANOUANZÊ</strong>, <strong>ANOUANZÊ ERP</strong>, <strong>IBIG SOFT</strong>, <strong>IBIG SARL</strong>, <strong>Intermark Business International Group</strong>, <strong>IBIG PARTNERS</strong>, ainsi que les logos, symboles graphiques, chartes de couleurs, slogans et noms de produits associés, constituent les signes distinctifs d'IBIG SOFT (Intermark Business International Group).</p>
            <p className="mt-3">Ces signes sont protégés au titre du droit des marques et du droit de la concurrence déloyale applicables. Ils demeurent la propriété exclusive de leur titulaire, quel que soit le contexte dans lequel ils apparaissent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Absence de cession de droits</h2>
            <p>La souscription d'un abonnement, l'utilisation de la plateforme ou la participation à un programme partenaire n'emportent aucune cession ni concession de droits sur les signes distinctifs d'IBIG SOFT (Intermark Business International Group), en dehors des usages expressément autorisés par écrit.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Usages autorisés sans accord préalable</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>La mention factuelle et loyale du nom « ANOUANZÊ ERP » pour désigner le logiciel effectivement utilisé, dans une documentation interne, un rapport d'activité ou une communication descriptive ;</li>
              <li>La citation du nom de l'éditeur dans un contexte informatif ou journalistique, sans suggérer une approbation ou un partenariat ;</li>
              <li>La reproduction du logo tel qu'il est fourni, sans modification, lorsqu'un usage a été expressément autorisé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Usages interdits</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>Utiliser un signe identique ou similaire à titre de dénomination sociale, nom commercial, enseigne, nom de domaine ou identifiant de réseau social ;</li>
              <li>Modifier, déformer, recolorer, recadrer ou intégrer le logo dans un autre signe ;</li>
              <li>Laisser croire à un partenariat, une certification, une affiliation ou une approbation qui n'existe pas ;</li>
              <li>Utiliser les signes distinctifs dans un contexte dénigrant, trompeur, illicite ou portant atteinte à l'image de l'éditeur ;</li>
              <li>Déposer ou tenter de faire enregistrer, dans quelque pays que ce soit, un signe identique ou similaire ;</li>
              <li>Employer les signes distinctifs dans des campagnes publicitaires, du référencement payant ou des méta-données visant à capter la clientèle de l'éditeur.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Partenaires et revendeurs</h2>
            <p>Les partenaires, intégrateurs et revendeurs peuvent être autorisés à utiliser certains signes distinctifs dans le cadre strict de leur contrat de partenariat. Cette autorisation est personnelle, non exclusive, non transférable et révocable. Elle prend fin de plein droit à la cessation du partenariat.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Demande d'autorisation</h2>
            <p>Toute demande d'usage non couverte par la section 3 doit être adressée par écrit à <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a>, en précisant la nature de l'usage envisagé, les supports concernés, la durée et le territoire. L'autorisation, lorsqu'elle est accordée, l'est par écrit et dans les limites qu'elle définit.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Signalement d'un usage abusif</h2>
            <p>Tout usage abusif, contrefaisant ou trompeur des signes distinctifs peut être signalé à <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a>. Le signalement gagne à comporter une description des faits, les liens ou supports concernés et, si possible, des captures d'écran datées.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Sanctions</h2>
            <p>Tout usage non autorisé peut faire l'objet d'une mise en demeure de cessation et, le cas échéant, de l'exercice par IBIG SOFT (Intermark Business International Group) de l'ensemble des voies de recours prévues par la loi applicable, notamment sur le fondement de la contrefaçon et de la concurrence déloyale.</p>
            <p className="mt-3">Voir également la page <Link href="/propriete-intellectuelle" className="text-primary-600 hover:underline">Propriété intellectuelle</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT (Intermark Business International Group)</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a></p>
              <p>🌐 <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.ibigsoft.com</a></p>
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
