import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Propriété intellectuelle — ANOUANZÊ ERP',
  description: 'Protection de la marque et propriété intellectuelle de ANOUANZÊ ERP édité par IBIG SOFT.',
};

export default function ProprieteIntellectuellePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Propriété intellectuelle & Protection de la marque</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>
        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">
          <section className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="font-semibold text-amber-800">ANOUANZÊ ERP est une marque déposée d'IBIG SOFT (Intermark Business International Group). Toute utilisation non autorisée est strictement interdite et poursuivie.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Éléments protégés</h2>
            <p className="mb-3">Sont protégés par le droit de la propriété intellectuelle applicable :</p>
            <div className="grid grid-cols-2 gap-2">
              {['Le nom ANOUANZÊ ERP', 'Le logo officiel', 'Le code source du logiciel', 'Les interfaces utilisateur', 'Les bases de données', 'Les contenus textuels', 'La documentation', 'Les visuels et graphismes', 'Les modèles de documents', 'Les rapports générés', 'Les éléments graphiques', 'Les assistants IA SARA', 'Les marques IBIG SOFT et IBIG SARL', 'Les algorithmes et méthodes'].map(e => (
                <div key={e} className="flex items-center gap-2 text-xs p-2 bg-neutral-50 rounded-lg">
                  <span className="text-primary-500 shrink-0">🔒</span>{e}
                </div>
              ))}
            </div>
          </section>
          {[
            { title: '2. Interdictions', content: 'Toute reproduction, imitation, copie, adaptation, extraction, décompilation, ingénierie inverse, distribution ou utilisation non autorisée de ces éléments est formellement interdite sans l\'accord écrit préalable de l\'Éditeur. Ces interdictions s\'appliquent à toute personne physique ou morale, quelle que soit sa nationalité ou son lieu d\'établissement.' },
            { title: '3. Utilisation autorisée', content: 'Les Utilisateurs disposant d\'un accès valide au logiciel sont autorisés à utiliser les éléments du logiciel dans le cadre strict de leur utilisation normale et à des fins internes à leur organisation. Toute utilisation au-delà de ce périmètre requiert une autorisation écrite préalable.' },
            { title: '4. Marques tierces', content: 'Les noms, logos et marques de tiers mentionnés dans le logiciel ou sa documentation appartiennent à leurs propriétaires respectifs. Leur mention ne constitue pas un partenariat ou une endorsement de l\'Éditeur.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Signaler une violation</h2>
            <p className="mb-4">Vous avez constaté une utilisation abusive, une copie non autorisée ou une imitation de nos éléments protégés ? Contactez-nous immédiatement :</p>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT</strong> — Service juridique</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📍 Abidjan, Côte d'Ivoire</p>
              <p className="text-xs text-neutral-500 mt-2">Merci de préciser la nature de la violation constatée, l'URL ou l'entité concernée, et vos coordonnées.</p>
            </div>
            <p className="text-xs text-neutral-500 mt-4">Le contenu de cette page a valeur informative. Il n'est pas un avis juridique. Toute décision relative à la protection des droits doit être prise en accord avec un professionnel juridique compétent.</p>
          </section>
        </div>
      </div>
      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
