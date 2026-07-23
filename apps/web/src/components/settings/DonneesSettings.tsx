'use client';

import Link from 'next/link';
import { Download, Upload } from 'lucide-react';
import { Section, BientotDisponible, LigneOption } from './primitives';

const IMPORTS_DISPONIBLES = [
  { type: 'membres', libelle: 'Membres', endpoint: 'POST /api/v1/import/membres' },
  { type: 'donateurs', libelle: 'Donateurs', endpoint: 'POST /api/v1/import/donateurs' },
];

export function DonneesSettings() {
  return (
    <div className="max-w-3xl space-y-6">
      <Section
        titre="Import de données"
        description="Reprise de vos fichiers existants au format tabulaire."
        action={
          <Link href="/import" className="btn-primary inline-flex items-center gap-2">
            <Upload className="h-4 w-4" /> Ouvrir l'assistant d'import
          </Link>
        }
      >
        <div>
          {IMPORTS_DISPONIBLES.map((i) => (
            <LigneOption key={i.type} titre={i.libelle} description={i.endpoint}>
              <span className="badge badge-success">Disponible</span>
            </LigneOption>
          ))}
        </div>
        <p className="text-xs text-neutral-500">
          Chaque import passe par un modèle de fichier téléchargeable puis une étape de validation avant écriture.
        </p>
        <BientotDisponible
          titre="Import des autres modules (projets, comptabilité, RH, stocks)"
          raison="Le module Import n'expose aujourd'hui que les entités Membres et Donateurs."
        />
      </Section>

      <Section
        titre="Export de données"
        description="Extraction de vos données au format Excel ou PDF."
      >
        <LigneOption
          titre="Export depuis chaque module"
          description="Les listes de l'ERP disposent d'un bouton d'export XLSX et PDF composé côté navigateur."
        >
          <span className="badge badge-success">Disponible</span>
        </LigneOption>
        <div className="pt-1">
          <Link href="/reporting" className="btn-secondary inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> Ouvrir le reporting
          </Link>
        </div>
        <BientotDisponible
          titre="Export global de l'organisation en une archive"
          raison="Aucun endpoint d'export complet (portabilité des données) n'existe côté API : les exports se font module par module."
        />
      </Section>

      <Section titre="Sauvegarde et restauration" description="Copies de sécurité de votre base de données.">
        <BientotDisponible
          titre="Sauvegardes planifiées et restauration à la demande"
          raison="Les sauvegardes sont opérées au niveau de l'infrastructure PostgreSQL par IBIG SOFT. Aucune interface ni endpoint ne les pilote depuis l'application : afficher un historique ici reviendrait à inventer des données."
        />
      </Section>

      <Section titre="Purge et suppression" description="Effacement définitif de données.">
        <BientotDisponible
          titre="Suppression de l'organisation et de ses données"
          raison="Opération irréversible non exposée dans l'interface. Elle doit être demandée par écrit à IBIG SOFT depuis l'espace Aide."
        />
      </Section>
    </div>
  );
}
