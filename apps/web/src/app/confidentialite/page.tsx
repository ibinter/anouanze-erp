import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — ANOUANZÊ ERP',
  description: 'Comment IBIG SOFT (Intermark Business International Group) collecte, utilise et protège vos données personnelles dans le cadre de l\'utilisation d\'ANOUANZÊ ERP.',
};

export default function ConfidentialitePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Responsable du traitement</h2>
            <p>Le responsable du traitement des données collectées via la plateforme ANOUANZÊ ERP est :</p>
            <div className="mt-4 p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT (Intermark Business International Group)</strong> — Abidjan, Côte d'Ivoire</p>
              <p>Email : <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>Tél. : <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation de la plateforme ANOUANZÊ ERP, nous collectons les catégories de données suivantes :</p>
            <ul className="mt-4 space-y-2 list-none">
              {[
                ['Données d\'identification', 'Nom, prénom, adresse email, numéro de téléphone, fonction'],
                ['Données d\'organisation', 'Nom de l\'organisation, pays, type, taille, secteur d\'activité'],
                ['Données de connexion', 'Adresse IP, logs de connexion, type de navigateur, système d\'exploitation'],
                ['Données financières', 'Informations de facturation, historique des paiements (sans conservation des numéros de carte)'],
                ['Données métier', 'Données saisies dans l\'ERP (membres, projets, comptabilité) pour le compte de l\'organisation cliente'],
              ].map(([cat, desc]) => (
                <li key={cat} className="flex gap-3 p-3 bg-neutral-50 rounded-lg">
                  <span className="text-primary-500 mt-0.5 shrink-0">●</span>
                  <span><strong className="text-neutral-800">{cat} :</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Finalités du traitement</h2>
            <p>Vos données sont traitées aux fins suivantes :</p>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Fourniture et amélioration des services ANOUANZÊ ERP</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Gestion des comptes utilisateurs et authentification</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Facturation et gestion des abonnements</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Support technique et assistance clientèle</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Communication sur les mises à jour et nouvelles fonctionnalités</li>
              <li className="flex items-start gap-2"><span className="text-primary-500 font-bold mt-0.5">✓</span> Respect des obligations légales et réglementaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Base légale du traitement</h2>
            <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Exécution du contrat</strong> : pour la fourniture des services souscrits</li>
              <li>• <strong>Intérêt légitime</strong> : pour l'amélioration des services et la sécurité</li>
              <li>• <strong>Obligation légale</strong> : pour le respect des obligations comptables et fiscales</li>
              <li>• <strong>Consentement</strong> : pour les communications marketing (révocable à tout moment)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Conservation des données</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <span className="font-medium text-neutral-700">Données de compte actif</span>
                <span className="text-primary-600 font-semibold">Durée de l'abonnement</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <span className="font-medium text-neutral-700">Données après résiliation</span>
                <span className="text-primary-600 font-semibold">3 mois (export possible)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <span className="font-medium text-neutral-700">Données de facturation</span>
                <span className="text-primary-600 font-semibold">10 ans (obligation légale)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                <span className="font-medium text-neutral-700">Logs de connexion</span>
                <span className="text-primary-600 font-semibold">12 mois</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Partage des données</h2>
            <p>IBIG SOFT (Intermark Business International Group) ne vend jamais vos données personnelles à des tiers. Vos données peuvent être partagées avec :</p>
            <ul className="mt-3 space-y-2">
              <li>• <strong>Prestataires techniques</strong> : hébergement, messagerie, paiement (sous contrat de confidentialité)</li>
              <li>• <strong>Autorités compétentes</strong> : uniquement sur réquisition légale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Sécurité des données</h2>
            <p>IBIG SOFT (Intermark Business International Group) met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
            <ul className="mt-3 space-y-2">
              <li>• Chiffrement SSL/TLS de toutes les communications</li>
              <li>• Chiffrement des données sensibles en base de données</li>
              <li>• Sauvegardes quotidiennes automatiques</li>
              <li>• Contrôle d'accès basé sur les rôles (RBAC)</li>
              <li>• Surveillance et journalisation des accès</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Vos droits</h2>
            <p>Conformément à la législation en vigueur, vous disposez des droits suivants sur vos données :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                ['Droit d\'accès', 'Obtenir une copie de vos données'],
                ['Droit de rectification', 'Corriger des données inexactes'],
                ['Droit à l\'effacement', 'Supprimer vos données (sous conditions)'],
                ['Droit à la portabilité', 'Exporter vos données en format standard'],
                ['Droit d\'opposition', 'Vous opposer à certains traitements'],
                ['Droit de limitation', 'Limiter le traitement de vos données'],
              ].map(([droit, desc]) => (
                <div key={droit} className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <p className="font-semibold text-neutral-800 text-xs mb-0.5">{droit}</p>
                  <p className="text-neutral-500 text-xs">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-5">Pour exercer vos droits, contactez-nous à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a> en précisant votre demande. Nous vous répondrons dans un délai de 30 jours.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Cookies</h2>
            <p>La plateforme ANOUANZÊ ERP utilise des cookies strictement nécessaires au fonctionnement du service (authentification, session, préférences). Aucun cookie publicitaire ou de traçage tiers n'est utilisé sans votre consentement explicite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Contact & réclamations</h2>
            <p>Pour toute question relative à cette politique ou pour exercer vos droits :</p>
            <div className="mt-3 p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
              <p>📞 <a href="tel:+2250555059901" className="text-primary-600 hover:underline">+225 05 55 05 99 01</a></p>
              <p>☎️ <a href="tel:+2252722276014" className="text-primary-600 hover:underline">+225 27 22 27 60 14</a></p>
            </div>
          </section>
        </div>
      </div>

      <footer className="bg-neutral-950 text-neutral-500 text-sm py-8 px-6 text-center">
        <p>© {new Date().getFullYear()} IBIG SOFT (Intermark Business International Group) — ANOUANZÊ ERP &nbsp;·&nbsp;
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link> &nbsp;·&nbsp;
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
        </p>
      </footer>
    </div>
  );
}
