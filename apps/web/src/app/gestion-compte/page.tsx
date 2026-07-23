import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gestion et suppression du compte — ANOUANZÊ ERP',
  description: 'Création, administration, désactivation et suppression des comptes utilisateurs et organisations sur ANOUANZÊ ERP, édité par IBIG SOFT (Intermark Business International Group).',
};

export default function GestionComptePage() {
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
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-2">Gestion et suppression du compte</h1>
        <p className="text-sm text-neutral-400 mb-12">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. Objet</h2>
            <p>La présente politique décrit le cycle de vie des comptes sur la plateforme <strong>ANOUANZÊ ERP</strong> : création, administration, désactivation, suppression et sort des données associées.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. Types de comptes</h2>
            <ul className="mt-3 space-y-1 list-disc pl-5">
              <li><strong>Compte organisation</strong> : espace de travail rattaché à une entité cliente, contenant l'ensemble de ses données ;</li>
              <li><strong>Compte utilisateur</strong> : accès nominatif d'une personne physique à une ou plusieurs organisations, doté d'un rôle et d'habilitations ;</li>
              <li><strong>Compte administrateur</strong> : compte utilisateur disposant des droits de gestion des utilisateurs, des paramétrages et des exports.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. Création et exactitude des informations</h2>
            <p>La création d'un compte suppose la fourniture d'informations exactes et à jour. Chaque utilisateur est identifié par une adresse e-mail personnelle et professionnelle. Le partage d'un même identifiant entre plusieurs personnes est proscrit.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. Sécurité des accès</h2>
            <p>L'utilisateur est responsable de la confidentialité de ses identifiants et de toute action réalisée depuis son compte. Il est tenu de choisir un mot de passe robuste, de ne pas le réutiliser sur d'autres services et de signaler sans délai à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a> toute suspicion de compromission.</p>
            <p className="mt-3">Les sessions inactives peuvent être fermées automatiquement pour des raisons de sécurité.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. Administration par le client</h2>
            <p>L'administrateur de l'organisation peut créer, modifier, suspendre ou désactiver les comptes utilisateurs de son entité, ajuster leurs rôles et leurs habilitations, et consulter les journaux d'activité mis à disposition.</p>
            <p className="mt-3">Il appartient au client de désactiver sans délai les comptes des personnes ayant quitté l'organisation.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. Désactivation d'un compte utilisateur</h2>
            <p>La désactivation d'un compte utilisateur interrompt immédiatement son accès à la plateforme. Elle est réversible tant que le compte n'a pas été supprimé.</p>
            <p className="mt-3">Pour des raisons de traçabilité comptable et d'auditabilité, les traces d'activité rattachées à un utilisateur désactivé (auteur d'une écriture, d'une validation ou d'une modification) sont conservées dans les journaux et les pièces concernées.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. Suppression d'un compte utilisateur</h2>
            <p>La suppression d'un compte utilisateur peut être demandée par l'administrateur du client ou par la personne concernée. Elle entraîne l'effacement des données d'identification associées, sous réserve des mentions dont la conservation est nécessaire au respect des obligations légales, comptables ou probatoires.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">8. Fermeture du compte organisation</h2>
            <p>La fermeture d'un compte organisation résulte de la résiliation de l'abonnement, dans les conditions prévues par la <Link href="/politique-resiliation" className="text-primary-600 hover:underline">politique de résiliation</Link>, ou d'une demande écrite du représentant légal du client.</p>
            <p className="mt-3">La demande doit émaner d'une personne habilitée à engager l'organisation et être adressée à <a href="mailto:contact@ibigsoft.com" className="text-primary-600 hover:underline">contact@ibigsoft.com</a>. IBIG SOFT (Intermark Business International Group) peut solliciter des éléments permettant de vérifier cette habilitation avant toute opération irréversible.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">9. Période de rétention et export</h2>
            <p>Après la fermeture d'un compte organisation, les données sont conservées pendant une période de rétention permettant au client d'en demander l'export. Sauf indication contraire figurant au contrat, cette période est de trente (30) jours à compter de la date d'effet de la fermeture.</p>
            <p className="mt-3">Pendant cette période, une demande d'export peut être adressée à <a href="mailto:support@ibigsoft.com" className="text-primary-600 hover:underline">support@ibigsoft.com</a>. Passé ce délai, aucune restitution ne peut être garantie.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">10. Suppression définitive</h2>
            <p>À l'issue de la période de rétention, les données sont supprimées des environnements de production, puis progressivement des jeux de sauvegarde selon le cycle de rotation décrit dans la <Link href="/politique-sauvegarde" className="text-primary-600 hover:underline">politique de sauvegarde</Link>.</p>
            <p className="mt-3">Demeurent conservés, pour la seule durée imposée par la réglementation applicable, les documents de facturation et les éléments nécessaires à la constatation, l'exercice ou la défense de droits en justice. La suppression définitive est irréversible.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">11. Comptes inactifs</h2>
            <p>Un compte d'essai non converti ou un compte sans abonnement actif peut être désactivé après une période d'inactivité prolongée. Une information préalable est adressée, lorsque cela est possible, à l'adresse e-mail enregistrée.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">12. Droits des personnes concernées</h2>
            <p>Les modalités d'exercice des droits d'accès, de rectification et d'effacement sont précisées dans la <Link href="/traitement-donnees" className="text-primary-600 hover:underline">politique de traitement des données</Link> et la <Link href="/confidentialite" className="text-primary-600 hover:underline">politique de confidentialité</Link>. Contact : <a href="mailto:legal@ibigsoft.com" className="text-primary-600 hover:underline">legal@ibigsoft.com</a>.</p>
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
