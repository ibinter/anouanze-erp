'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users } from 'lucide-react';
import { Section, BientotDisponible } from './primitives';
import { ROLES_ADMINISTRATION, type Role } from './roles';

interface MembreLeger {
  id: string;
  actif: boolean;
}

export function AbonnementSettings({ roleCourant }: { roleCourant?: string }) {
  const estAdministrateur = ROLES_ADMINISTRATION.includes(roleCourant as Role);

  const { data: membres = [] } = useQuery<MembreLeger[]>({
    queryKey: ['membres-organisation'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs/organisation/membres');
      return (Array.isArray(data) ? data : []) as MembreLeger[];
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const actifs = membres.filter((m) => m.actif).length;

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre="Consommation" description="Données réellement mesurables aujourd'hui.">
        {estAdministrateur ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">Comptes actifs</p>
                  <p className="text-xl font-bold text-neutral-800">{actifs}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Comptes rattachés (total)</p>
                  <p className="text-xl font-bold text-neutral-800">{membres.length}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            Le décompte des comptes n'est visible que par un administrateur de l'organisation.
          </p>
        )}
        <BientotDisponible
          titre="Volume de stockage et nombre d'écritures consommés"
          raison="Aucun compteur d'usage n'est calculé par l'API : seules les métriques ci-dessus sont réelles."
        />
      </Section>

      <Section titre="Formule et facturation" description="Plan souscrit, quotas et historique de facturation.">
        <BientotDisponible
          titre="Formule, quotas, factures et moyens de paiement"
          raison="Le schéma de données ne comporte aucun modèle d'abonnement, de plan tarifaire ni de facture. Afficher une formule ou un quota ici serait purement fictif. Pour toute question sur votre contrat, contactez IBIG SOFT."
        />
        <div className="pt-1">
          <Link href="/aide" className="btn-secondary inline-flex">Contacter le support IBIG SOFT</Link>
        </div>
      </Section>
    </div>
  );
}
