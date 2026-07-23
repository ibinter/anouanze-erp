'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertTriangle, Check, Loader2, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLES, ROLE_LABELS, type Role } from './roles';

interface RegleMatrice {
  domaine: string;
  action: string;
  endpoint: string;
  rolesAutorises: Role[] | null;
  applique: boolean;
  source: string;
}

interface Matrice {
  roles: { code: Role; libelle: string; administrateur: boolean }[];
  regles: RegleMatrice[];
  resume: {
    reglesAppliquees: number;
    reglesNonAppliquees: number;
    avertissement: string;
  };
}

/**
 * Matrice en lecture seule. Les données proviennent de l'API
 * (GET /utilisateurs/organisation/matrice-permissions) qui les dérive des
 * décorateurs @Roles réellement présents dans le code : rien n'est inventé ici.
 */
export function MatricePermissions() {
  const { data, isLoading, error } = useQuery<Matrice>({
    queryKey: ['matrice-permissions'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs/organisation/matrice-permissions');
      return data as Matrice;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center gap-2 py-10 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement de la matrice…
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="py-6 text-center text-sm text-neutral-500">
        La matrice des permissions n'a pas pu être chargée.
      </p>
    );
  }

  const roles = data.roles.length ? data.roles.map((r) => r.code) : [...ROLES];
  const appliquees = data.regles.filter((r) => r.applique);
  const nonAppliquees = data.regles.filter((r) => !r.applique);

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{data.resume.avertissement}</p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-700">
          Restrictions réellement appliquées par l'API ({appliquees.length})
        </h4>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Action
                </th>
                {roles.map((r) => (
                  <th
                    key={r}
                    title={ROLE_LABELS[r] ?? r}
                    className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
                  >
                    {(ROLE_LABELS[r] ?? r)
                      .split(' ')
                      .map((mot) => mot[0])
                      .join('')
                      .slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appliquees.map((regle, i) => (
                <tr key={`${regle.endpoint}-${i}`} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-700">{regle.action}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-neutral-400">{regle.endpoint}</p>
                  </td>
                  {roles.map((r) => {
                    const autorise = regle.rolesAutorises?.includes(r) ?? false;
                    return (
                      <td key={r} className="px-2 py-3 text-center">
                        {autorise ? (
                          <Check className="mx-auto h-4 w-4 text-primary-600" aria-label="Autorisé" />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-neutral-200" aria-label="Non autorisé" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-neutral-400">
          Légende des colonnes : {roles.map((r) => `${(ROLE_LABELS[r] ?? r).split(' ').map((m) => m[0]).join('').slice(0, 3)} = ${ROLE_LABELS[r] ?? r}`).join(' · ')}
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-700">
          Modules sans restriction de rôle ({nonAppliquees.length})
        </h4>
        <p className="mb-3 text-xs text-neutral-500">
          Ces modules sont protégés par l'authentification et le cloisonnement par organisation,
          mais n'exigent aucun rôle particulier. À traiter comme une dette de sécurité, pas comme une règle.
        </p>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Module</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Endpoint</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Contrôle en place</th>
              </tr>
            </thead>
            <tbody>
              {nonAppliquees.map((regle, i) => (
                <tr key={`${regle.endpoint}-${i}`} className="border-b border-neutral-50 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-neutral-700">{regle.domaine}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{regle.endpoint}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('badge', 'bg-neutral-100 text-neutral-600')}>
                      Authentification + organisation
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
