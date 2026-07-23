import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gestion des réclamations — ANOUANZÊ ERP',
  description: 'Procédure de dépôt, d\'instruction et de suivi des réclamations relatives à la plateforme ANOUANZÊ ERP, éditée par IBIG SOFT (Intermark Business International Group).',
};

export default function ReclamationsPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Gestion des réclamations</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente procédure décrit la manière dont <strong>IBIG SOFT (Intermark Business International Group)</strong> reçoit, instruit et traite les réclamations relatives à la plateforme <strong>ANOUANZÊ ERP</strong> et aux prestations associées.</p>
            <p className="mt-3">Elle vise à garantir un traitement équitable, tracé et documenté de chaque réclamation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Distinction avec le support</h2>
            <p>Une demande d'assistance technique ou fonctionnelle relève de la <Link href="/politique-support" className="text-primary-600 hover:underline">politique de support</Link> et doit être adressée à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>.</p>
            <p className="mt-3">La procédure de réclamation s'applique lorsqu'un client estime que la qualité du service, une facturation, un engagement contractuel ou le traitement d'une demande antérieure n'a pas été satisfaisant.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Qui peut réclamer</h2>
            <p>Peut déposer une réclamation tout client de la plateforme, représenté par son contact administratif ou son représentant légal, ainsi que toute personne concernée par un traitement de données réalisé par l'éditeur en qualité de responsable de traitement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Canal de dépôt</h2>
            <div className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p>Réclamations générales : <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>Réclamations relatives aux données personnelles ou à un point juridique : <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a></p>
              <p>Voie postale : IBIG SOFT (Intermark Business International Group) — Abidjan, Côte d'Ivoire</p>
              <p>Téléphone : <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
            </div>
            <p className="mt-3">L'écrit est privilégié afin de permettre l'horodatage et le suivi de la réclamation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Contenu attendu</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>Identification de l'organisation et du déclarant (nom, fonction, coordonnées) ;</li>
              <li>Objet de la réclamation et date des faits ;</li>
              <li>Exposé circonstancié de la situation ;</li>
              <li>Références utiles : numéro de facture, identifiant de ticket, captures d'écran ;</li>
              <li>Attente exprimée par le déclarant.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Étapes du traitement</h2>
            <ol className="mt-3 space-y-2 list-decimal pl-5">
              <li><strong>Accusé de réception</strong> — la réclamation est enregistrée et un accusé de réception est adressé au déclarant, en principe sous cinq (5) jours ouvrés.</li>
              <li><strong>Instruction</strong> — les faits sont analysés, les journaux et échanges pertinents sont examinés, et des informations complémentaires peuvent être demandées.</li>
              <li><strong>Réponse motivée</strong> — une réponse écrite est adressée au déclarant, en principe dans un délai de trente (30) jours à compter de l'accusé de réception. Si l'instruction requiert un délai supplémentaire, le déclarant en est informé avec indication du nouveau délai prévisionnel.</li>
              <li><strong>Mesures correctives</strong> — le cas échéant, les actions retenues (correction technique, geste commercial, ajustement de facturation, évolution de procédure) sont mises en œuvre et leur suivi est communiqué.</li>
              <li><strong>Clôture</strong> — la réclamation est clôturée après réponse, et le dossier est conservé à des fins de traçabilité et d'amélioration continue.</li>
            </ol>
            <p className="mt-3 text-neutral-500">Les délais mentionnés constituent des objectifs de traitement et relèvent d'une obligation de moyens.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Escalade</h2>
            <p>Si la réponse apportée ne satisfait pas le déclarant, celui-ci peut demander par écrit un réexamen du dossier par la direction d'IBIG SOFT (Intermark Business International Group), en rappelant la référence de la réclamation initiale.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Recours amiable et juridictionnel</h2>
            <p>Les parties privilégient la résolution amiable de tout différend. À défaut d'accord, les litiges relèvent des tribunaux compétents d'Abidjan (Côte d'Ivoire), conformément aux <Link href="/conditions-commerciales" className="text-primary-600 hover:underline">conditions commerciales</Link> et aux <Link href="/mentions-legales" className="text-primary-600 hover:underline">mentions légales</Link>.</p>
            <p className="mt-3">S'agissant des données à caractère personnel, les personnes concernées conservent la faculté de saisir l'autorité de protection des données compétente.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Confidentialité et non-représailles</h2>
            <p>Les réclamations sont traitées de manière confidentielle par les seules personnes habilitées. Le dépôt d'une réclamation de bonne foi ne peut donner lieu à aucune mesure défavorable à l'encontre du déclarant.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT (Intermark Business International Group)</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📧 <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a></p>
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
