import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contrat de licence utilisateur — ANOUANZÊ ERP',
  description: 'Conditions de licence d\'utilisation du logiciel ANOUANZÊ ERP édité par IBIG SOFT.',
};

export default function LicencePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Contrat de licence utilisateur</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>
        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">
          <section className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="font-semibold text-blue-800">Ce contrat de licence utilisateur final (CLUF) régit l'utilisation du logiciel ANOUANZÊ ERP, édité par IBIG SOFT (Intermark Business International Group), ci-après « l'Éditeur ».</p>
          </section>
          {[
            { title: '1. Objet', content: 'Le présent contrat définit les conditions dans lesquelles l\'Éditeur concède à l\'Utilisateur un droit d\'accès et d\'utilisation du logiciel ANOUANZÊ ERP en mode SaaS (Software as a Service), hébergé sur les serveurs de l\'Éditeur.' },
            { title: '2. Licence concédée', content: 'L\'Éditeur concède à l\'Utilisateur un droit d\'accès non exclusif, non transférable et révocable au logiciel ANOUANZÊ ERP, pour une utilisation strictement limitée aux besoins internes de son organisation, dans les conditions de son plan souscrit.' },
            { title: '3. Restrictions', content: 'L\'Utilisateur s\'interdit de : reproduire, copier, imiter ou distribuer le logiciel ; décompiler, désassembler ou tenter d\'extraire le code source ; sous-licencier, louer, vendre ou transférer les droits d\'accès à des tiers ; utiliser le logiciel à des fins illicites ou contraires à l\'ordre public.' },
            { title: '4. Propriété intellectuelle', content: 'ANOUANZÊ ERP et tous ses composants (interface, code, bases de données, contenus, logos, marques, algorithmes, assistants IA) sont et demeurent la propriété exclusive de l\'Éditeur et sont protégés par le droit de la propriété intellectuelle applicable en Côte d\'Ivoire et à l\'international.' },
            { title: '5. Données utilisateur', content: 'L\'Utilisateur conserve la propriété de toutes les données saisies dans le logiciel. L\'Éditeur s\'engage à restituer les données de l\'Utilisateur dans un format standard en cas de résiliation. L\'Éditeur ne cède ni ne vend les données utilisateur à des tiers.' },
            { title: '6. Disponibilité', content: 'L\'Éditeur s\'efforce de maintenir le logiciel disponible 24h/24 et 7j/7, sous réserve de maintenances programmées communiquées à l\'avance. Des interruptions techniques non planifiées peuvent survenir.' },
            { title: '7. Résiliation', content: 'La licence peut être résiliée par l\'Utilisateur à tout moment avec un préavis de 30 jours. L\'Éditeur se réserve le droit de suspendre ou résilier l\'accès en cas de violation des présentes conditions.' },
            { title: '8. Limitation de responsabilité', content: 'La responsabilité de l\'Éditeur est limitée au montant des sommes effectivement versées par l\'Utilisateur au cours des 12 derniers mois. L\'Éditeur ne saurait être tenu responsable de pertes indirectes, de perte de données résultant d\'une mauvaise utilisation, ou de dommages résultant de la force majeure.' },
            { title: '9. Droit applicable', content: 'Le présent contrat est régi par le droit ivoirien. Tout litige sera soumis à la compétence exclusive des tribunaux d\'Abidjan, Côte d\'Ivoire, sauf disposition impérative contraire.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
            </div>
          </section>
        </div>
      </div>
      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
