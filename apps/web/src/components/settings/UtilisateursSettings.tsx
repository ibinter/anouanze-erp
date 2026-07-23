'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Search, ShieldAlert, UserPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/utils';
import { Section, BientotDisponible, Champ, LigneOption, Toggle } from './primitives';
import { MatricePermissions } from './MatricePermissions';
import {
  ROLES,
  ROLES_ADMINISTRATION,
  badgeRole,
  estRoleConnu,
  useLibellesRoles,
  type Role,
} from './roles';

interface Membre {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string | null;
  role: Role;
  actif: boolean;
  actifOrganisation: boolean;
  compteActif: boolean;
  emailVerifie: boolean;
  deuxFacteurs: boolean;
  dernierLogin?: string | null;
  membreDepuis?: string | null;
}

function formatDate(valeur: string | null | undefined, locale: string) {
  if (!valeur) return '—';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

interface ActionEnAttente {
  type: 'role' | 'statut';
  membre: Membre;
  nouveauRole?: Role;
  nouvelEtat?: boolean;
}

export function UtilisateursSettings({
  utilisateurId,
  roleCourant,
}: {
  utilisateurId?: string;
  roleCourant?: string;
}) {
  const t = useTranslations('shell.parametres.utilisateurs');
  const locale = useLocale();
  const { labels: ROLE_LABELS, libelle: libelleRole } = useLibellesRoles();
  const queryClient = useQueryClient();
  const [recherche, setRecherche] = useState('');
  const [modalInvitation, setModalInvitation] = useState(false);
  const [invitation, setInvitation] = useState<{ email: string; role: Role; nom: string; prenom: string }>({
    email: '',
    role: 'LECTEUR',
    nom: '',
    prenom: '',
  });
  const [action, setAction] = useState<ActionEnAttente | null>(null);

  const estAdministrateur = ROLES_ADMINISTRATION.includes(roleCourant as Role);
  const estSuperAdmin = roleCourant === 'SUPER_ADMIN';

  const {
    data: membres = [],
    isLoading,
    error,
  } = useQuery<Membre[]>({
    queryKey: ['membres-organisation'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs/organisation/membres');
      return (Array.isArray(data) ? data : []) as Membre[];
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const membresFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return membres;
    return membres.filter((m) =>
      [m.nom, m.prenom, m.email, libelleRole(m.role)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [membres, recherche]);

  const rolesAssignables = useMemo(
    () => ROLES.filter((r) => (r === 'SUPER_ADMIN' ? estSuperAdmin : true)),
    [estSuperAdmin],
  );

  const mutationRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { data } = await api.patch(`/utilisateurs/organisation/membres/${id}/role`, { role });
      return data;
    },
    onSuccess: () => {
      toast.success(t('roleMisAJour'));
      queryClient.invalidateQueries({ queryKey: ['membres-organisation'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : t('roleErreur'));
    },
  });

  const mutationStatut = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data } = await api.patch(`/utilisateurs/organisation/membres/${id}/statut`, { actif });
      return data;
    },
    onSuccess: (_d, variables) => {
      toast.success(variables.actif ? t('compteActive') : t('compteDesactive'));
      queryClient.invalidateQueries({ queryKey: ['membres-organisation'] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : t('statutErreur'));
    },
  });

  const mutationInvitation = useMutation({
    mutationFn: async (payload: { email: string; role: Role; nom?: string; prenom?: string }) => {
      const { data } = await api.post('/utilisateurs/organisation/inviter', payload);
      return data as { message?: string; emailEnvoye?: boolean };
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? t('invitationEnvoyee'));
      if (data?.emailEnvoye === false) {
        toast.warning(t('invitationEmailNonEnvoye'));
      }
      queryClient.invalidateQueries({ queryKey: ['membres-organisation'] });
      setModalInvitation(false);
      setInvitation({ email: '', role: 'LECTEUR', nom: '', prenom: '' });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : t('invitationErreur'));
    },
  });

  function confirmerAction() {
    if (!action) return;
    if (action.type === 'role' && action.nouveauRole) {
      mutationRole.mutate({ id: action.membre.id, role: action.nouveauRole });
    }
    if (action.type === 'statut' && typeof action.nouvelEtat === 'boolean') {
      mutationStatut.mutate({ id: action.membre.id, actif: action.nouvelEtat });
    }
    setAction(null);
  }

  function envoyerInvitation() {
    const email = invitation.email.trim();
    if (!email || !email.includes('@')) {
      toast.error(t('emailInvalide'));
      return;
    }
    mutationInvitation.mutate({
      email,
      role: invitation.role,
      nom: invitation.nom.trim() || undefined,
      prenom: invitation.prenom.trim() || undefined,
    });
  }

  const nomMembre = action ? `${action.membre.prenom ?? ''} ${action.membre.nom ?? ''}`.trim() : '';

  const messageConfirmation = action
    ? action.type === 'role'
      ? t('confirmationRole', {
          membre: nomMembre,
          ancien: libelleRole(action.membre.role),
          nouveau: libelleRole(action.nouveauRole),
        })
      : action.nouvelEtat
        ? t('confirmationReactiver', { membre: nomMembre })
        : t('confirmationDesactiver', { membre: nomMembre })
    : '';

  return (
    <div className="space-y-6">
      {!estAdministrateur && (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            {t('accesRestreintDebut')} <strong>{ROLE_LABELS.ADMIN_ORGANISATION}</strong> {t('accesRestreintEt')}{' '}
            <strong>{ROLE_LABELS.SUPER_ADMIN}</strong>. {t('accesRestreintFin', { role: libelleRole(roleCourant) })}
          </p>
        </div>
      )}

      {estAdministrateur && (
        <Section
          titre={t('membresTitre')}
          description={t('membresDesc')}
          action={
            <button onClick={() => setModalInvitation(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> {t('inviter')}
            </button>
          }
        >
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="input pl-9"
              placeholder={t('rechercherMembre')}
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>

          {error ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              {error instanceof Error ? error.message : t('erreurChargement')}
            </p>
          ) : isLoading ? (
            <div className="flex justify-center gap-2 py-10 text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" /> {t('chargementMembres')}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[840px] text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    {[
                      t('colonneMembre'),
                      t('colonneRole'),
                      t('colonneStatut'),
                      t('colonneDerniereConnexion'),
                      t('colonneMembreDepuis'),
                      '',
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {membresFiltres.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-neutral-400">
                        {t('aucunMembre')}
                      </td>
                    </tr>
                  ) : (
                    membresFiltres.map((m) => {
                      const soiMeme = m.id === utilisateurId;
                      const verrouille =
                        soiMeme || (m.role === 'SUPER_ADMIN' && !estSuperAdmin);
                      return (
                        <tr key={m.id} className="border-b border-neutral-50 last:border-0">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-neutral-800">
                              {`${m.prenom ?? ''} ${m.nom ?? ''}`.trim() || m.email}
                              {soiMeme && <span className="badge badge-neutral ml-2">{t('vous')}</span>}
                            </p>
                            <p className="text-xs text-neutral-500">{m.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className="input h-9 min-w-[190px] py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                              value={estRoleConnu(m.role) ? m.role : ''}
                              disabled={verrouille || mutationRole.isPending}
                              onChange={(e) => {
                                const nouveauRole = e.target.value as Role;
                                if (nouveauRole === m.role) return;
                                setAction({ type: 'role', membre: m, nouveauRole });
                              }}
                            >
                              {!estRoleConnu(m.role) && <option value="">{m.role ?? '—'}</option>}
                              {rolesAssignables.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                            <span className={cn('mt-1 inline-block', badgeRole(m.role))}>{m.role}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={m.actif ? 'badge badge-success' : 'badge badge-neutral'}>
                              {m.actif ? t('actif') : t('desactive')}
                            </span>
                            {!m.emailVerifie && (
                              <span className="badge badge-warning ml-1">{t('emailNonVerifie')}</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                            {formatDate(m.dernierLogin, locale)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                            {formatDate(m.membreDepuis, locale)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                m.actif
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100',
                                verrouille && 'cursor-not-allowed opacity-40',
                              )}
                              disabled={verrouille || mutationStatut.isPending}
                              onClick={() =>
                                setAction({ type: 'statut', membre: m, nouvelEtat: !m.actif })
                              }
                            >
                              {m.actif ? t('desactiver') : t('activer')}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      <Section titre={t('matriceTitre')} description={t('matriceDesc')}>
        <MatricePermissions />
      </Section>

      <Section titre={t('authTitre')} description={t('authDesc')}>
        <LigneOption titre={t('deuxFacteursTitre')} description={t('deuxFacteursDesc')}>
          <Toggle label={t('deuxFacteursLabel')} checked={false} disabled onChange={() => undefined} />
        </LigneOption>
        <LigneOption titre={t('sessionTitre')} description={t('sessionDesc')}>
          <span className="badge badge-neutral">{t('sessionBadge')}</span>
        </LigneOption>
        <BientotDisponible titre={t('sessionBientotTitre')} raison={t('sessionBientotRaison')} />
      </Section>

      <Section titre={t('motDePasseTitre')} description={t('motDePasseDesc')}>
        <BientotDisponible titre={t('motDePasseBientotTitre')} raison={t('motDePasseBientotRaison')} />
      </Section>

      <Section titre={t('sessionsTitre')} description={t('sessionsDesc')}>
        <BientotDisponible titre={t('sessionsBientotTitre')} raison={t('sessionsBientotRaison')} />
      </Section>

      <Modal
        open={modalInvitation}
        onOpenChange={setModalInvitation}
        title={t('modalTitre')}
        description={t('modalDesc')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalInvitation(false)}>
              {t('modalAnnuler')}
            </button>
            <button
              className="btn-primary disabled:opacity-60"
              disabled={mutationInvitation.isPending}
              onClick={envoyerInvitation}
            >
              {mutationInvitation.isPending ? t('modalEnvoi') : t('modalEnvoyer')}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Champ label={t('champEmail')}>
            <input
              type="email"
              className="input"
              placeholder={t('champEmailPlaceholder')}
              value={invitation.email}
              onChange={(e) => setInvitation({ ...invitation, email: e.target.value })}
            />
          </Champ>
          <div className="grid grid-cols-2 gap-3">
            <Champ label={t('champPrenom')}>
              <input
                className="input"
                value={invitation.prenom}
                onChange={(e) => setInvitation({ ...invitation, prenom: e.target.value })}
              />
            </Champ>
            <Champ label={t('champNom')}>
              <input
                className="input"
                value={invitation.nom}
                onChange={(e) => setInvitation({ ...invitation, nom: e.target.value })}
              />
            </Champ>
          </div>
          <Champ label={t('champRole')} aide={t('champRoleAide')}>
            <select
              className="input"
              value={invitation.role}
              onChange={(e) => setInvitation({ ...invitation, role: e.target.value as Role })}
            >
              {rolesAssignables.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </Champ>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirmerAction}
        titre={action?.type === 'role' ? t('confirmationTitreRole') : t('confirmationTitreStatut')}
        message={messageConfirmation}
        variante={action?.type === 'statut' && action.nouvelEtat === false ? 'danger' : 'warning'}
      />
    </div>
  );
}
