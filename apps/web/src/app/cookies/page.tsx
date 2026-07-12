import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de cookies — ANOUANZÊ ERP',
  description: 'Politique d\'utilisation des cookies sur la plateforme ANOUANZÊ ERP éditée par IBIG SOFT.',
};

export default function CookiesPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de cookies</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="font-semibold text-blue-800">ANOUANZÊ ERP utilise uniquement des cookies strictement nécessaires au fonctionnement du service. Nous ne recourons à aucun cookie publicitaire ou de traçage tiers sans votre consentement explicite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Qu'est-ce qu'un cookie ?</h2>
            <p>Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences (connexion, langue, etc.) sur une période donnée.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Cookies utilisés sur ANOUANZÊ ERP</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-neutral-800 mb-3">🔒 Cookies strictement nécessaires</h3>
                <p className="text-neutral-500 text-xs mb-3">Ces cookies sont indispensables au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Nom</th>
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Finalité</th>
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {[
                        ['next-auth.session-token', 'Maintien de la session utilisateur authentifiée', 'Session'],
                        ['next-auth.csrf-token', 'Protection contre les attaques CSRF', 'Session'],
                        ['next-auth.callback-url', 'Redirection après authentification', 'Session'],
                        ['__Secure-next-auth.session-token', 'Session sécurisée (HTTPS)', '30 jours'],
                        ['anouanze-theme', 'Mémorisation du thème (clair/sombre)', '1 an'],
                        ['anouanze-lang', 'Préférence de langue', '1 an'],
                      ].map(([name, desc, dur]) => (
                        <tr key={name} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 font-mono text-primary-600">{name}</td>
                          <td className="px-3 py-2 text-neutral-600">{desc}</td>
                          <td className="px-3 py-2 text-neutral-500">{dur}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-neutral-800 mb-3">📊 Cookies analytiques (optionnels)</h3>
                <p className="text-neutral-500 text-xs mb-3">Ces cookies nous aident à améliorer la plateforme en mesurant son utilisation. Ils sont activés uniquement avec votre consentement.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Nom</th>
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Finalité</th>
                        <th className="text-left px-3 py-2 font-semibold text-neutral-700 border-b border-neutral-200">Durée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {[
                        ['_anouanze_session_id', 'Analyse des parcours utilisateurs (anonymisé)', '30 min'],
                        ['_anouanze_perf', 'Mesure des performances de chargement', 'Session'],
                      ].map(([name, desc, dur]) => (
                        <tr key={name} className="hover:bg-neutral-50">
                          <td className="px-3 py-2 font-mono text-neutral-600">{name}</td>
                          <td className="px-3 py-2 text-neutral-600">{desc}</td>
                          <td className="px-3 py-2 text-neutral-500">{dur}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Cookies tiers</h2>
            <p>ANOUANZÊ ERP <strong>n'intègre pas de cookies publicitaires</strong> ni de réseaux sociaux tiers. Aucun cookie de traçage commercial (Google Ads, Facebook Pixel, etc.) n'est utilisé sur notre plateforme.</p>
            <p className="mt-3">L'assistant IA SARA (intégré à la landing page) utilise une session temporaire qui n'est pas persistée via des cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Gestion de vos préférences</h2>
            <p className="mb-4">Vous pouvez à tout moment gérer vos cookies via :</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-primary-500 font-bold mt-0.5 shrink-0">🌐</span>
                <div>
                  <strong className="text-neutral-800">Votre navigateur :</strong>
                  <p className="text-neutral-500 mt-0.5">Paramètres → Confidentialité → Cookies. Chaque navigateur propose ses propres options de gestion.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-primary-500 font-bold mt-0.5 shrink-0">⚙️</span>
                <div>
                  <strong className="text-neutral-800">Votre compte ANOUANZÊ :</strong>
                  <p className="text-neutral-500 mt-0.5">Paramètres → Confidentialité → Gestion des cookies.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <span className="text-primary-500 font-bold mt-0.5 shrink-0">📧</span>
                <div>
                  <strong className="text-neutral-800">Nous contacter :</strong>
                  <p className="text-neutral-500 mt-0.5"><a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
                </div>
              </li>
            </ul>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-xs"><strong>Note :</strong> La désactivation des cookies strictement nécessaires empêchera votre connexion à la plateforme ANOUANZÊ ERP.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Base légale</h2>
            <p>Le dépôt de cookies strictement nécessaires est fondé sur notre <strong>intérêt légitime</strong> à assurer le bon fonctionnement du service. Les cookies analytiques reposent sur votre <strong>consentement explicite</strong>, conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données personnelles.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Mise à jour de cette politique</h2>
            <p>IBIG SOFT se réserve le droit de modifier cette politique de cookies à tout moment pour refléter les évolutions technologiques ou réglementaires. Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
              <p>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></p>
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
