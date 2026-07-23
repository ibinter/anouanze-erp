import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de traitement des données — ANOUANZÊ ERP',
  description: 'Politique de traitement des données à caractère personnel au sein de la plateforme ANOUANZÊ ERP, éditée par IBIG SOFT (Intermark Business International Group).',
};

export default function TraitementDonneesPage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Politique de traitement des données</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet et articulation</h2>
            <p>La présente politique décrit les conditions dans lesquelles <strong>IBIG SOFT (Intermark Business International Group)</strong> traite les données à caractère personnel dans le cadre de la fourniture de la plateforme <strong>ANOUANZÊ ERP</strong>.</p>
            <p className="mt-3">Elle complète la <Link href="/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>, qui s'adresse aux personnes concernées, en précisant le cadre contractuel applicable entre le client et l'éditeur.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Rôles des parties</h2>
            <p>Pour les données saisies par le client dans la plateforme (données relatives à ses salariés, bénévoles, bénéficiaires, adhérents, donateurs, fournisseurs ou partenaires), le <strong>client agit en qualité de responsable de traitement</strong> et IBIG SOFT (Intermark Business International Group) intervient en qualité de <strong>sous-traitant</strong>, agissant sur instruction documentée du client.</p>
            <p className="mt-3">Pour les données relatives à la gestion de la relation commerciale, à la facturation, à la sécurité de la plateforme et à l'amélioration du service, IBIG SOFT (Intermark Business International Group) agit en qualité de responsable de traitement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Cadre réglementaire</h2>
            <p>Les traitements sont réalisés dans le respect de la réglementation applicable en Côte d'Ivoire, notamment la loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, ainsi que, lorsque le client y est soumis, des exigences équivalentes issues de sa propre législation nationale ou de ses bailleurs de fonds.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Catégories de données traitées</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li><strong>Données de compte</strong> : nom, prénom, adresse e-mail professionnelle, fonction, organisation, rôle applicatif ;</li>
              <li><strong>Données de connexion</strong> : horodatage, adresse IP, type de navigateur, journaux d'activité ;</li>
              <li><strong>Données métier saisies par le client</strong> : tiers, projets, écritures comptables, pièces justificatives, éléments de paie et de ressources humaines ;</li>
              <li><strong>Données de facturation</strong> : coordonnées de l'organisation, historique des abonnements et paiements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Finalités et bases légales</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li>Fourniture, exploitation et maintenance de la plateforme — exécution du contrat ;</li>
              <li>Gestion des accès, authentification et traçabilité — exécution du contrat et intérêt légitime de sécurité ;</li>
              <li>Assistance et support utilisateurs — exécution du contrat ;</li>
              <li>Facturation, recouvrement et obligations comptables — obligation légale ;</li>
              <li>Amélioration du service et statistiques d'usage agrégées — intérêt légitime ;</li>
              <li>Communications d'information relatives au service — intérêt légitime ou consentement selon le cas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Instructions du client et confidentialité</h2>
            <p>En qualité de sous-traitant, IBIG SOFT (Intermark Business International Group) ne traite les données du client que pour les finalités nécessaires à la fourniture du service et sur instruction de celui-ci. Le personnel habilité est soumis à une obligation de confidentialité.</p>
            <p className="mt-3">Aucune donnée client n'est vendue, louée ou cédée à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Sous-traitants ultérieurs</h2>
            <p>IBIG SOFT (Intermark Business International Group) peut recourir à des prestataires techniques (hébergement, envoi de courriels transactionnels, services d'intelligence artificielle) pour l'exécution de certaines opérations. Ces prestataires sont sélectionnés pour leurs garanties de sécurité et sont liés par des engagements de confidentialité.</p>
            <p className="mt-3">La liste des sous-traitants ultérieurs en vigueur peut être communiquée au client sur demande écrite adressée à <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Localisation et transferts</h2>
            <p>Les données sont hébergées sur des serveurs dédiés situés en Afrique de l'Ouest et/ou en Europe. Lorsqu'un transfert hors du pays du client est nécessaire à la fourniture du service, IBIG SOFT (Intermark Business International Group) veille à ce qu'il soit encadré par des garanties appropriées.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Durées de conservation</h2>
            <p>Les données métier sont conservées pendant toute la durée de l'abonnement, puis pendant la période de rétention post-résiliation décrite dans la <Link href="/gestion-compte" className="text-primary-600 hover:underline">politique de gestion et suppression du compte</Link>. Les documents comptables et de facturation sont conservés pendant la durée imposée par la réglementation applicable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Mesures de sécurité</h2>
            <p>Des mesures techniques et organisationnelles raisonnables sont mises en œuvre : chiffrement des flux, cloisonnement des données par organisation, gestion des habilitations par rôles, journalisation des accès sensibles, sauvegardes régulières (voir la <Link href="/politique-sauvegarde" className="text-primary-600 hover:underline">politique de sauvegarde</Link>) et mises à jour de sécurité.</p>
            <p className="mt-3">Aucun dispositif ne pouvant garantir une sécurité absolue, ces mesures constituent une obligation de moyens renforcés.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">11. Violation de données</h2>
            <p>En cas de violation de données à caractère personnel susceptible d'affecter le client, IBIG SOFT (Intermark Business International Group) informe celui-ci dans les meilleurs délais après en avoir pris connaissance, lui communique les éléments utiles et lui apporte une assistance raisonnable pour l'accomplissement de ses propres obligations de notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">12. Droits des personnes concernées</h2>
            <p>Les personnes concernées disposent, dans les conditions prévues par la réglementation applicable, de droits d'accès, de rectification, d'opposition, d'effacement et de limitation. Ces demandes doivent être adressées en priorité au client, responsable de traitement.</p>
            <p className="mt-3">IBIG SOFT (Intermark Business International Group) apporte au client l'assistance raisonnable nécessaire au traitement de ces demandes. Contact : <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">13. Traitements liés à l'assistant SARA</h2>
            <p>Les échanges avec l'assistant SARA peuvent être transmis à un fournisseur de modèle de langage pour générer une réponse. Les utilisateurs sont invités à ne pas y saisir de données sensibles. Voir les <Link href="/conditions-sara" className="text-primary-600 hover:underline">conditions d'utilisation de SARA</Link> et la <Link href="/limitation-responsabilite-ia" className="text-primary-600 hover:underline">limitation de responsabilité de l'IA</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">14. Contact</h2>
            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <p><strong>IBIG SOFT (Intermark Business International Group)</strong> — Abidjan, Côte d'Ivoire</p>
              <p>📧 <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a></p>
              <p>📧 <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a></p>
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
