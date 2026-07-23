'use client';

import Link from 'next/link';
import { Section, BientotDisponible, LigneOption } from './primitives';

/** Fournisseurs de paiement câblés côté API — repris de l'ancien écran Paramètres. */
const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', logo: '🟠', webhook: 'POST /api/v1/paiements/webhook/orange-money' },
  { id: 'cinetpay', nom: 'CinetPay', logo: '🔵', webhook: 'POST /api/v1/paiements/webhook/cinetpay' },
  { id: 'mtn', nom: 'MTN MoMo', logo: '🟡', webhook: null },
  { id: 'wave', nom: 'Wave', logo: '🌊', webhook: null },
];

const FONCTIONS_IA = [
  { titre: 'Analyse du tableau de bord', endpoint: 'POST /api/v1/ia/analyser-tableau-bord' },
  { titre: 'Rapport narratif', endpoint: 'POST /api/v1/ia/rapport-narratif' },
  { titre: 'Proposition de budget', endpoint: 'POST /api/v1/ia/proposer-budget' },
  { titre: 'Détection d’anomalies', endpoint: 'GET /api/v1/ia/anomalies' },
  { titre: 'Assistant conversationnel SARA', endpoint: 'POST /api/v1/ia/chat' },
  { titre: 'Traduction de contenu', endpoint: 'POST /api/v1/ia/traduire' },
];

export function IntegrationsSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <Section
        titre="Paiements mobiles"
        description="Encaissement des cotisations et des dons par mobile money."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAIEMENTS.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
              <div className="text-2xl">{p.logo}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-800">{p.nom}</p>
                {p.webhook ? (
                  <>
                    <span className="badge badge-success">Webhook exposé</span>
                    <p className="mt-1 truncate font-mono text-[10px] text-neutral-400">{p.webhook}</p>
                  </>
                ) : (
                  <span className="badge badge-neutral">Non câblé</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <BientotDisponible
          titre="Connexion et déconnexion depuis l'interface"
          raison="Les identifiants marchands sont fournis à l'API par variables d'environnement : aucun endpoint ne permet de connecter ou déconnecter un fournisseur depuis l'application. Le statut affiché ci-dessus reflète uniquement les webhooks réellement exposés par le module Paiements."
        />
      </Section>

      <Section
        titre="Intelligence artificielle (SARA)"
        description="Fonctions d'assistance disponibles dans l'ERP."
      >
        <div>
          {FONCTIONS_IA.map((f) => (
            <LigneOption key={f.endpoint} titre={f.titre} description={f.endpoint}>
              <span className="badge badge-success">Disponible</span>
            </LigneOption>
          ))}
        </div>
        <div className="pt-1">
          <Link href="/ia" className="btn-secondary inline-flex">Ouvrir l'espace IA</Link>
        </div>
        <BientotDisponible
          titre="Choix du modèle et clé API personnalisée"
          raison="Le fournisseur et la clé du modèle sont configurés au niveau du serveur ; aucun réglage par organisation n'est exposé."
        />
      </Section>

      <Section titre="API et webhooks" description="Accès programmatique à vos données.">
        <LigneOption
          titre="Documentation OpenAPI"
          description="L'API expose une documentation Swagger générée automatiquement."
        >
          <span className="badge badge-success">Disponible</span>
        </LigneOption>
        <BientotDisponible
          titre="Clés d'API et webhooks sortants"
          raison="L'authentification se fait exclusivement par jeton JWT de session : il n'existe ni modèle de clé d'API, ni enregistrement de webhook sortant dans le schéma de données."
        />
      </Section>
    </div>
  );
}
