import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Conditions d'utilisation de SARA — ANOUANZÊ ERP",
  description: "Conditions d'utilisation de l'assistant IA SARA intégré à ANOUANZÊ ERP par IBIG SOFT.",
};

export default function ConditionsSaraPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Conditions d'utilisation de SARA</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>
        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">
          <section className="p-5 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="font-semibold text-primary-800">SARA est l'assistante intelligente d'ANOUANZÊ ERP, développée par IBIG SOFT et propulsée par des modèles de langage de grande envergure. Son utilisation est soumise aux conditions ci-dessous.</p>
          </section>
          {[
            { title: '1. Nature du service', content: 'SARA est un assistant conversationnel alimenté par l\'intelligence artificielle (Groq / LLaMA 3.3 70B). Elle est conçue pour répondre aux questions relatives au logiciel ANOUANZÊ ERP, aux offres d\'IBIG SOFT, au support et aux services associés.' },
            { title: '2. Périmètre des réponses', content: 'SARA répond uniquement aux questions liées à ANOUANZÊ ERP, à ses fonctionnalités, ses tarifs, IBIG SOFT, le programme IBIG PARTNERS et les services d\'assistance. Elle décline poliment toute demande hors de son périmètre.' },
            { title: '3. Limitations de l\'IA', content: 'Les réponses de SARA sont générées automatiquement et peuvent contenir des inexactitudes. SARA ne fournit pas de conseils juridiques, médicaux ou financiers personnalisés. Les informations données ne constituent pas des engagements contractuels de l\'Éditeur.' },
            { title: '4. Ce que SARA ne fera jamais', content: 'SARA ne divulgue jamais de clé API, de données confidentielles d\'autres clients, ni d\'informations internes non publiques. Elle ne promet jamais une fonctionnalité, un tarif ou une intégration non disponible. Elle ne détient pas et n\'affiche jamais vos données personnelles sans votre consentement.' },
            { title: '5. Données des conversations', content: 'Les échanges avec SARA peuvent être analysés par l\'équipe IBIG SOFT à des fins d\'amélioration du service et de formation des modèles. Aucune donnée personnelle sensible ne doit être partagée avec SARA. Les conversations publiques (landing page) sont conservées en mémoire temporaire et réinitialisées au redémarrage du serveur.' },
            { title: '6. Utilisation acceptable', content: 'L\'utilisation de SARA est réservée à des fins légitimes en lien avec ANOUANZÊ ERP. Tout usage abusif, tentative de manipulation du modèle, ou utilisation visant à obtenir des informations confidentielles est strictement interdit.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
            </div>
          </section>
        </div>
      </div>
      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
