import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nous contacter — ANOUANZÊ ERP',
  description: 'Contactez l\'équipe IBIG SARL pour toute question sur ANOUANZÊ ERP. Support, vente, partenariat.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 h-16 flex items-center justify-between px-6 lg:px-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-9 h-9" />
          <div className="leading-none">
            <span className="font-bold text-primary-600 text-base">ANOUANZÊ</span>
            <span className="font-bold text-accent-400 text-xs ml-1">ERP</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">← Retour à l'accueil</Link>
          <Link href="/demo" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
            Essai gratuit
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Parlons de votre projet</h1>
        <p className="text-white/70 max-w-xl mx-auto text-lg">Notre équipe est disponible pour répondre à toutes vos questions sur ANOUANZÊ ERP.</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Infos de contact */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">Nos coordonnées</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-5 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">📧</span>
                </div>
                <div>
                  <p className="font-bold text-neutral-800 mb-1">Email</p>
                  <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline font-medium">contact@ibigsoft.com</a>
                  <p className="text-sm text-neutral-400 mt-1">Réponse sous 24h ouvrées</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">📱</span>
                </div>
                <div>
                  <p className="font-bold text-neutral-800 mb-1">Téléphone mobile</p>
                  <a href="tel:+2250778882592" className="text-primary-600 hover:underline font-medium block">+225 07 78 88 25 92</a>
                  <p className="text-sm text-neutral-400 mt-1">Lun–Ven, 8h–18h GMT</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-primary-50 rounded-2xl border border-primary-100">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">☎️</span>
                </div>
                <div>
                  <p className="font-bold text-neutral-800 mb-1">Téléphone fixe</p>
                  <a href="tel:+2252722276014" className="text-primary-600 hover:underline font-medium block">+225 27 22 27 60 14</a>
                  <p className="text-sm text-neutral-400 mt-1">Lun–Ven, 8h–17h GMT</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-xl">🏢</span>
                </div>
                <div>
                  <p className="font-bold text-neutral-800 mb-1">Siège social</p>
                  <p className="text-neutral-600 font-medium">IBIG SARL</p>
                  <p className="text-sm text-neutral-400">Abidjan, Côte d'Ivoire</p>
                  <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline mt-1 inline-block">www.ibigsoft.com</a>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-accent-50 rounded-2xl border border-accent-200">
              <p className="font-bold text-neutral-800 mb-2">🚀 Démarrez avec un essai gratuit</p>
              <p className="text-sm text-neutral-600 mb-4">Testez ANOUANZÊ ERP pendant 30 jours sans engagement ni carte bancaire.</p>
              <Link href="/demo" className="inline-block bg-accent-400 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                Demander une démonstration →
              </Link>
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">Envoyez-nous un message</h2>
            <form action={`mailto:contact@ibigsoft.com`} method="get" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Prénom *</label>
                  <input name="prenom" required className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="Kouassi" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Nom *</label>
                  <input name="nom" required className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="BROU" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Email professionnel *</label>
                <input type="email" name="email" required className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="direction@votre-ong.org" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Organisation</label>
                <input name="organisation" className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent" placeholder="ONG / Association / Fondation" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Sujet *</label>
                <select name="sujet" required className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent bg-white">
                  <option value="">Sélectionnez un sujet</option>
                  <option>Demande de démonstration</option>
                  <option>Question commerciale / Tarifs</option>
                  <option>Support technique</option>
                  <option>Partenariat</option>
                  <option>Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Message *</label>
                <textarea name="body" required rows={5} className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none" placeholder="Décrivez votre organisation et vos besoins..." />
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg text-sm">
                Envoyer le message →
              </button>
              <p className="text-xs text-neutral-400 text-center">En soumettant ce formulaire, vous acceptez notre <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.</p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SARL — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
