import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de support — ANOUANZÊ ERP',
  description: 'Niveaux de support, canaux de contact et délais de prise en charge applicables aux abonnements ANOUANZÊ ERP, édité par IBIG SOFT (Intermark Business International Group).',
};

export default function PolitiqueSupportPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de support</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="prose prose-neutral max-w-none space-y-10 text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente politique décrit les modalités d'assistance fournies par <strong>IBIG SOFT (Intermark Business International Group)</strong> aux clients de la plateforme <strong>ANOUANZÊ ERP</strong> : canaux de contact, périmètre du support, classification des demandes et objectifs de prise en charge.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Canaux de support</h2>
            <div className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm space-y-1">
              <p>Support par e-mail : <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a></p>
              <p>Support téléphonique : <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a> — <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
              <p>Assistance intégrée : assistant SARA disponible dans l'application</p>
            </div>
            <p className="mt-3">Le canal e-mail constitue le canal de référence : il permet l'enregistrement, l'horodatage et le suivi de chaque demande.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Horaires d'ouverture</h2>
            <p>Le support est assuré les jours ouvrés, hors jours fériés légaux en Côte d'Ivoire, aux heures ouvrables. Les demandes reçues en dehors de ces plages sont enregistrées et traitées à l'ouverture suivante.</p>
            <p className="mt-3">Les horaires précis en vigueur sont communiqués au client lors de l'ouverture de son compte et peuvent être obtenus sur simple demande.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Niveaux de support par formule</h2>
            <p>Les prestations d'assistance varient selon la formule d'abonnement souscrite. Le tableau ci-dessous présente les principes généraux ; le détail applicable au client est celui figurant sur son bon de commande ou son contrat.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left p-3 font-bold text-neutral-700 border-b border-neutral-200">Formule</th>
                    <th className="text-left p-3 font-bold text-neutral-700 border-b border-neutral-200">Canaux</th>
                    <th className="text-left p-3 font-bold text-neutral-700 border-b border-neutral-200">Prise en charge visée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-neutral-100 font-medium">Essai</td>
                    <td className="p-3 border-b border-neutral-100">E-mail, assistant SARA</td>
                    <td className="p-3 border-b border-neutral-100">Meilleur effort, jours ouvrés</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-neutral-100 font-medium">Standard</td>
                    <td className="p-3 border-b border-neutral-100">E-mail, assistant SARA</td>
                    <td className="p-3 border-b border-neutral-100">Sous 2 jours ouvrés</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-neutral-100 font-medium">Professionnel</td>
                    <td className="p-3 border-b border-neutral-100">E-mail, téléphone, assistant SARA</td>
                    <td className="p-3 border-b border-neutral-100">Sous 1 jour ouvré</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Entreprise / sur mesure</td>
                    <td className="p-3">E-mail, téléphone, interlocuteur dédié</td>
                    <td className="p-3">Selon conditions contractuelles négociées</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-neutral-500">Les délais indiqués correspondent à des objectifs de première réponse et non à des délais de résolution. Ils constituent une obligation de moyens.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Classification des demandes</h2>
            <ul className="mt-3 space-y-2 list-disc pl-5">
              <li><strong>Critique</strong> — la plateforme est indisponible ou une fonction essentielle est totalement inopérante pour l'ensemble des utilisateurs du client.</li>
              <li><strong>Majeure</strong> — une fonction importante est dégradée mais un contournement existe.</li>
              <li><strong>Mineure</strong> — anomalie sans impact significatif sur l'exploitation, question d'usage, demande d'information.</li>
              <li><strong>Évolution</strong> — demande de fonctionnalité nouvelle, étudiée dans le cadre de la feuille de route produit.</li>
            </ul>
            <p className="mt-3">La qualification initiale est proposée par le client et confirmée ou ajustée par IBIG SOFT (Intermark Business International Group) après analyse.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Périmètre couvert</h2>
            <p>Le support couvre l'assistance à l'utilisation des fonctionnalités standard, le diagnostic et la correction des anomalies reproductibles du logiciel, ainsi que l'accompagnement sur les paramétrages proposés par l'application.</p>
            <p className="mt-3">Sont exclus du support standard, sans que cette liste soit limitative : la formation approfondie des utilisateurs, la saisie ou la reprise de données pour le compte du client, le conseil comptable, fiscal ou juridique, les développements spécifiques, ainsi que les problèmes liés au matériel, au réseau ou aux logiciels tiers du client. Ces prestations peuvent faire l'objet d'un devis distinct.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Coopération du client</h2>
            <p>Pour permettre un traitement efficace, le client s'engage à fournir une description précise du problème, les étapes de reproduction, les messages d'erreur et, le cas échéant, des captures d'écran. Il désigne un ou plusieurs interlocuteurs référents habilités à échanger avec le support.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Maintenance et interruptions programmées</h2>
            <p>Des opérations de maintenance peuvent nécessiter une interruption temporaire du service. IBIG SOFT (Intermark Business International Group) s'efforce de les planifier en dehors des heures de forte utilisation et d'en informer les clients à l'avance lorsque cela est possible.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Escalade et réclamations</h2>
            <p>Si le traitement d'une demande ne donne pas satisfaction, le client peut solliciter une escalade auprès de la direction du support en écrivant à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>, ou engager la <Link href="/reclamations" className="text-primary-600 hover:underline">procédure de réclamation</Link>.</p>
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
