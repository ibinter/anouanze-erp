import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales — ANOUANZÊ ERP',
  description: 'Mentions légales de la plateforme ANOUANZÊ ERP, éditée par IBIG SARL.',
};

export default function MentionsLegalesPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Mentions légales</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="prose prose-neutral max-w-none space-y-10 text-neutral-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Éditeur du site</h2>
            <p>La plateforme <strong>ANOUANZÊ ERP</strong> accessible à l'adresse <strong>https://anouanze.ibigsoft.com</strong> est éditée par :</p>
            <div className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm space-y-1">
              <p><strong>IBIG SARL</strong></p>
              <p>Société à responsabilité limitée de droit ivoirien</p>
              <p>Siège social : Abidjan, Côte d'Ivoire</p>
              <p>Email : <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>Tél. : <a href="tel:+2250778882592" className="text-primary-600 hover:underline">+225 07 78 88 25 92</a></p>
              <p>Tél. fixe : <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
              <p>Site web : <a href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">www.ibigsoft.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de la société IBIG SARL.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Hébergement</h2>
            <p>La plateforme ANOUANZÊ ERP est hébergée sur des serveurs dédiés. Les données sont stockées et traitées conformément aux dispositions légales applicables en matière de protection des données.</p>
            <div className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm space-y-1">
              <p>Hébergeur technique : Serveurs VPS dédiés</p>
              <p>Localisation des données : Afrique de l'Ouest / Europe</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Propriété intellectuelle</h2>
            <p>L'ensemble des éléments constituant la plateforme ANOUANZÊ ERP (logo, textes, visuels, code source, base de données, architecture logicielle) sont la propriété exclusive de <strong>IBIG SARL</strong> et sont protégés par les lois en vigueur relatives à la propriété intellectuelle.</p>
            <p className="mt-3">Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout ou partie des éléments de la plateforme, sans l'autorisation écrite préalable de IBIG SARL, est strictement interdite et constitue une contrefaçon.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Protection des données personnelles</h2>
            <p>IBIG SARL traite les données personnelles de ses utilisateurs conformément à la réglementation en vigueur sur la protection des données personnelles, notamment la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel.</p>
            <p className="mt-3">Pour toute question relative au traitement de vos données, consultez notre <Link href="/confidentialite" className="text-primary-600 hover:underline">Politique de confidentialité</Link> ou contactez-nous à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Responsabilité</h2>
            <p>IBIG SARL s'efforce de maintenir la plateforme ANOUANZÊ ERP accessible et à jour. Cependant, IBIG SARL ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utilisation de la plateforme, notamment en cas d'interruption de service, de perte de données ou d'intrusion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Droit applicable</h2>
            <p>Les présentes mentions légales sont régies par le droit ivoirien. En cas de litige, et après tentative de résolution amiable, les tribunaux compétents d'Abidjan (Côte d'Ivoire) seront seuls compétents.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Contact</h2>
            <p>Pour toute question ou réclamation, vous pouvez nous contacter :</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></li>
              <li>📞 <a href="tel:+2250778882592" className="text-primary-600 hover:underline">+225 07 78 88 25 92</a></li>
              <li>☎️ <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></li>
            </ul>
          </section>
        </div>
      </div>

      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SARL — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
