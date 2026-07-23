'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertTriangle, Check, Loader2, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ROLES, useLibellesRoles, type Role } from './roles';

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
  const t = useTranslations('shell.parametres.matrice');
  const { labels: ROLE_LABELS } = useLibellesRoles();
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
        <Loader2 className="h-5 w-5 animate-spin" /> {t('chargement')}
      </div>
    );
  }

  if (error || !data) {
    return <p className="py-6 text-center text-sm text-neutral-500">{t('erreur')}</p>;
  }

  const roles = data.roles.length ? data.roles.map((r) => r.code) : [...ROLES];
  const appliquees = data.regles.filter((r) => r.applique);
  const nonAppliquees = data.regles.filter((r) => !r.applique);

  /** Sigle de colonne : initiales du libellé traduit du rôle. */
  const sigle = (r: Role) =>
    (ROLE_LABELS[r] ?? r)
      .split(' ')
      .map((mot) => mot[0])
      .join('')
      .slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs leading-relaxed text-amber-800">{data.resume.avertissement}</p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-700">
          {t('appliqueesTitre', { count: appliquees.length })}
        </h4>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {t('colonneAction')}
                </th>
                {roles.map((r) => (
                  <th
                    key={r}
                    title={ROLE_LABELS[r] ?? r}
                    className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
                  >
                    {sigle(r)}
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
                          <Check className="mx-auto h-4 w-4 text-primary-600" aria-label={t('autorise')} />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-neutral-200" aria-label={t('nonAutorise')} />
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
          {t('legende', {
            legende: roles.map((r) => `${sigle(r)} = ${ROLE_LABELS[r] ?? r}`).join(' · '),
          })}
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-700">
          {t('nonAppliqueesTitre', { count: nonAppliquees.length })}
        </h4>
        <p className="mb-3 text-xs text-neutral-500">{t('nonAppliqueesDesc')}</p>
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('colonneModule')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('colonneEndpoint')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">{t('colonneControle')}</th>
              </tr>
            </thead>
            <tbody>
              {nonAppliquees.map((regle, i) => (
                <tr key={`${regle.endpoint}-${i}`} className="border-b border-neutral-50 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 font-medium text-neutral-700">{regle.domaine}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-neutral-500">{regle.endpoint}</td>
                  <td className="px-4 py-2.5">
                    <span className={cn('badge', 'bg-neutral-100 text-neutral-600')}>
                      {t('controleValeur')}
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
