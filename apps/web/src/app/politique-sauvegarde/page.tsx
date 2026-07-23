import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de sauvegarde — ANOUANZÊ ERP',
  description: 'Politique de sauvegarde, de restauration et de continuité des données de la plateforme ANOUANZÊ ERP, éditée par IBIG SOFT (Intermark Business International Group).',
};

export default function PolitiqueSauvegardePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de sauvegarde</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="prose prose-neutral max-w-none space-y-10 text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente politique décrit les principes appliqués par <strong>IBIG SOFT (Intermark Business International Group)</strong> pour la sauvegarde, la conservation et la restauration des données hébergées dans la plateforme <strong>ANOUANZÊ ERP</strong>.</p>
            <p className="mt-3">Elle a vocation à informer les clients sur les mesures mises en œuvre pour limiter le risque de perte de données et sur la répartition des responsabilités entre l'éditeur et le client.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Périmètre des sauvegardes</h2>
            <p>Les sauvegardes portent sur les données applicatives nécessaires au fonctionnement du service, notamment :</p>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>La base de données principale (comptabilité, tiers, projets, bailleurs, ressources humaines, paramétrages) ;</li>
              <li>Les fichiers et pièces justificatives téléversés par les utilisateurs ;</li>
              <li>Les paramètres de configuration propres à chaque organisation.</li>
            </ul>
            <p className="mt-3">Les documents que le client conserve exclusivement sur ses propres postes de travail ou dans des outils tiers ne sont pas couverts par les sauvegardes d'IBIG SOFT (Intermark Business International Group).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Fréquence et rétention</h2>
            <p>Des sauvegardes automatisées de la base de données sont réalisées de manière régulière, selon une périodicité au minimum quotidienne pour l'environnement de production.</p>
            <p className="mt-3">Les jeux de sauvegarde sont conservés pendant une durée glissante définie par IBIG SOFT (Intermark Business International Group) en fonction des contraintes techniques et réglementaires. La durée de rétention effective peut être communiquée au client sur demande écrite adressée à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Stockage et sécurité des sauvegardes</h2>
            <p>Les sauvegardes sont stockées sur des supports distincts de l'environnement de production. Les accès aux jeux de sauvegarde sont restreints aux personnels techniques habilités d'IBIG SOFT (Intermark Business International Group).</p>
            <p className="mt-3">Des mesures techniques et organisationnelles raisonnables sont mises en œuvre pour protéger les sauvegardes contre les accès non autorisés, l'altération et la destruction, conformément à la <Link href="/traitement-donnees" className="text-primary-600 hover:underline">politique de traitement des données</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Procédure de restauration</h2>
            <p>Toute demande de restauration doit être formulée par écrit par un contact habilité du client, en précisant les données concernées et, si possible, la date ou l'horaire souhaité de restauration.</p>
            <p className="mt-3">IBIG SOFT (Intermark Business International Group) évalue la demande, informe le client de la faisabilité technique et des impacts éventuels (notamment la perte des données saisies entre le point de restauration et la demande), puis procède à la restauration après validation écrite du client.</p>
            <p className="mt-3">Les restaurations demandées à la suite d'une erreur de manipulation imputable au client peuvent faire l'objet d'une facturation d'intervention, communiquée avant exécution.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Exportation par le client</h2>
            <p>La plateforme met à disposition des fonctions d'export (états comptables, listes, documents) permettant au client de constituer ses propres copies. Il est recommandé au client de réaliser périodiquement des exports et de les conserver selon ses obligations légales et statutaires.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Limites et responsabilité</h2>
            <p>Les sauvegardes constituent une mesure de réduction du risque et non une garantie absolue de récupération intégrale des données. IBIG SOFT (Intermark Business International Group) est tenu à une obligation de moyens.</p>
            <p className="mt-3">Ne sont pas couvertes par la présente politique les pertes résultant notamment : d'une suppression volontaire par un utilisateur du client au-delà de la période de rétention, d'un usage non conforme de la plateforme, ou d'un événement de force majeure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Continuité de service</h2>
            <p>En cas d'incident majeur affectant l'infrastructure, IBIG SOFT (Intermark Business International Group) met en œuvre les moyens raisonnables pour rétablir le service dans les meilleurs délais et informe les clients concernés de l'évolution de la situation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Contact</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>📧 <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a></li>
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
