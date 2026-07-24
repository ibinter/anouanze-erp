'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Check,
  Copy,
  Download,
  KeyRound,
  Loader2,
  Laptop,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { Section, BientotDisponible, Champ, LigneOption } from './primitives';

// ─────────────────────────────────────────────────────────────────────────────
// Types renvoyés par l'API
// ─────────────────────────────────────────────────────────────────────────────

interface Statut2FA {
  actif: boolean;
  activationEnAttente: boolean;
  codesSecoursRestants: number;
  algorithme: string;
  chiffres: number;
  periodeSecondes: number;
  activeLe: string | null;
}

interface Preparation2FA {
  secret: string;
  secretLisible: string;
  otpauthUrl: string;
  emetteur: string;
  algorithme: string;
  chiffres: number;
  periodeSecondes: number;
}

interface SessionActive {
  id: string;
  courante: boolean;
  appareil: string;
  navigateur: string | null;
  systeme: string | null;
  ipAdresse: string | null;
  createdAt: string;
  expiresAt: string;
  derniereRotation: string | null;
  expiree: boolean;
}

interface Politique {
  longueurMinimale: number;
  longueurMaximale: number;
  classesRequises: number;
  regles: string[];
  nonImplemente: string[];
  hachage: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Indicateur de robustesse — miroir exact de la règle appliquée par l'API
// (apps/api/src/modules/auth/politique-mot-de-passe.ts). La validation qui fait
// foi reste serveur : cet affichage n'est qu'une aide à la saisie.
// ─────────────────────────────────────────────────────────────────────────────

function classesUtilisees(valeur: string): number {
  let n = 0;
  if (/[a-z]/.test(valeur)) n++;
  if (/[A-Z]/.test(valeur)) n++;
  if (/[0-9]/.test(valeur)) n++;
  if (/[^A-Za-z0-9]/.test(valeur)) n++;
  return n;
}

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', 'azertyuiopqsdfghjklmwxcvbn', '01234567890'];

function contientSequence(valeur: string): boolean {
  const v = valeur.toLowerCase();
  return SEQUENCES.some((sequence) => {
    for (let i = 0; i + 4 <= sequence.length; i++) {
      const morceau = sequence.slice(i, i + 4);
      const inverse = morceau.split('').reverse().join('');
      if (v.includes(morceau) || v.includes(inverse)) return true;
    }
    return false;
  });
}

export function scoreMotDePasse(valeur: string, longueurMinimale = 12): number {
  if (!valeur) return 0;
  let score = 0;
  if (valeur.length >= longueurMinimale) score++;
  if (valeur.length >= 16) score++;
  const classes = classesUtilisees(valeur);
  if (classes >= 3) score++;
  if (classes === 4) score++;
  if (contientSequence(valeur)) score = Math.max(0, score - 1);
  return Math.min(4, score);
}

function JaugeMotDePasse({ valeur, longueurMinimale }: { valeur: string; longueurMinimale: number }) {
  const t = useTranslations('shell.parametres.securite');
  const score = scoreMotDePasse(valeur, longueurMinimale);
  const libelles = [t('force0'), t('force1'), t('force2'), t('force3'), t('force4')];
  const couleurs = ['bg-neutral-200', 'bg-red-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-600'];

  return (
    <div className="space-y-1">
      <div className="flex gap-1" role="presentation">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={cn('h-1.5 flex-1 rounded-full', n <= score ? couleurs[score] : 'bg-neutral-200')}
          />
        ))}
      </div>
      <p className="text-[11px] text-neutral-500">
        {t('forceLabel')} <strong>{libelles[score]}</strong>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function formatDateHeure(valeur: string | null | undefined, locale: string) {
  if (!valeur) return '—';
  const d = new Date(valeur);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function messageErreur(err: unknown, defaut: string) {
  return err instanceof Error && err.message ? err.message : defaut;
}

export function SecuriteSettings() {
  const t = useTranslations('shell.parametres.securite');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const utilisateurId = (session?.user as { id?: string } | undefined)?.id;

  // ─── État local des assistants ───
  const [preparation, setPreparation] = useState<Preparation2FA | null>(null);
  const [codeActivation, setCodeActivation] = useState('');
  const [codesSecours, setCodesSecours] = useState<string[] | null>(null);
  const [modalDesactivation, setModalDesactivation] = useState(false);
  const [modalRegeneration, setModalRegeneration] = useState(false);
  const [motDePasseConfirmation, setMotDePasseConfirmation] = useState('');
  const [copie, setCopie] = useState(false);
  const [formulaireMdp, setFormulaireMdp] = useState({ ancien: '', nouveau: '', confirmation: '' });

  // ─── Requêtes ───
  const { data: statut, isLoading: chargementStatut } = useQuery<Statut2FA>({
    queryKey: ['2fa-statut'],
    queryFn: async () => (await api.get('/auth/2fa/statut')).data as Statut2FA,
    retry: false,
  });

  const {
    data: sessions = [],
    isLoading: chargementSessions,
    error: erreurSessions,
  } = useQuery<SessionActive[]>({
    queryKey: ['mes-sessions'],
    queryFn: async () => {
      const { data } = await api.get('/auth/sessions');
      return (Array.isArray(data) ? data : []) as SessionActive[];
    },
    retry: false,
  });

  const { data: politique } = useQuery<Politique>({
    queryKey: ['politique-mot-de-passe'],
    queryFn: async () => (await api.get('/auth/politique-mot-de-passe')).data as Politique,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  const longueurMinimale = politique?.longueurMinimale ?? 12;

  // ─── Mutations 2FA ───
  const mutationPreparer = useMutation({
    mutationFn: async () => (await api.post('/auth/2fa/preparer')).data as Preparation2FA,
    onSuccess: (data) => {
      setPreparation(data);
      setCodeActivation('');
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurPreparation'))),
  });

  const mutationActiver = useMutation({
    mutationFn: async (code: string) =>
      (await api.post('/auth/2fa/activer', { code })).data as { codesSecours: string[] },
    onSuccess: (data) => {
      setPreparation(null);
      setCodeActivation('');
      setCodesSecours(data.codesSecours ?? []);
      toast.success(t('activation2faReussie'));
      queryClient.invalidateQueries({ queryKey: ['2fa-statut'] });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurActivation'))),
  });

  const mutationAnnuler = useMutation({
    mutationFn: async () => (await api.post('/auth/2fa/annuler')).data,
    onSettled: () => {
      setPreparation(null);
      setCodeActivation('');
      queryClient.invalidateQueries({ queryKey: ['2fa-statut'] });
    },
  });

  const mutationDesactiver = useMutation({
    mutationFn: async (motDePasse: string) =>
      (await api.post('/auth/2fa/desactiver', { motDePasse })).data,
    onSuccess: () => {
      setModalDesactivation(false);
      setMotDePasseConfirmation('');
      toast.success(t('desactivation2faReussie'));
      queryClient.invalidateQueries({ queryKey: ['2fa-statut'] });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurDesactivation'))),
  });

  const mutationRegenerer = useMutation({
    mutationFn: async (motDePasse: string) =>
      (await api.post('/auth/2fa/codes-secours', { motDePasse })).data as { codesSecours: string[] },
    onSuccess: (data) => {
      setModalRegeneration(false);
      setMotDePasseConfirmation('');
      setCodesSecours(data.codesSecours ?? []);
      queryClient.invalidateQueries({ queryKey: ['2fa-statut'] });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurRegeneration'))),
  });

  // ─── Mutations sessions ───
  const mutationRevoquer = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/auth/sessions/${id}`)).data,
    onSuccess: () => {
      toast.success(t('sessionRevoquee'));
      queryClient.invalidateQueries({ queryKey: ['mes-sessions'] });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurRevocation'))),
  });

  const mutationRevoquerAutres = useMutation({
    mutationFn: async () =>
      (await api.post('/auth/sessions/revoquer-autres')).data as { message?: string },
    onSuccess: (data) => {
      toast.success(data?.message ?? t('autresSessionsFermees'));
      queryClient.invalidateQueries({ queryKey: ['mes-sessions'] });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurRevocation'))),
  });

  // ─── Mutation mot de passe ───
  const mutationMotDePasse = useMutation({
    mutationFn: async (payload: { ancien: string; nouveau: string }) => {
      if (!utilisateurId) throw new Error(t('sessionIntrouvable'));
      const { data } = await api.post(`/utilisateurs/${utilisateurId}/changer-mot-de-passe`, {
        ancienMotDePasse: payload.ancien,
        nouveauMotDePasse: payload.nouveau,
      });
      return data;
    },
    onSuccess: () => {
      toast.success(t('motDePasseModifie'));
      setFormulaireMdp({ ancien: '', nouveau: '', confirmation: '' });
    },
    onError: (err) => toast.error(messageErreur(err, t('erreurMotDePasse'))),
  });

  const autresSessions = useMemo(() => sessions.filter((s) => !s.courante), [sessions]);

  async function copier(texte: string) {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
      toast.success(t('copie'));
    } catch {
      toast.error(t('copieEchouee'));
    }
  }

  function telechargerCodes(codes: string[]) {
    const contenu = `${t('codesSecoursTitre')}\n${new Date().toISOString()}\n\n${codes.join('\n')}\n`;
    const blob = new Blob([contenu], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = 'anouanze-codes-secours.txt';
    lien.click();
    URL.revokeObjectURL(url);
  }

  function soumettreMotDePasse() {
    if (formulaireMdp.nouveau !== formulaireMdp.confirmation) {
      toast.error(t('confirmationDifferente'));
      return;
    }
    if (formulaireMdp.nouveau.length < longueurMinimale) {
      toast.error(t('tropCourt', { n: longueurMinimale }));
      return;
    }
    mutationMotDePasse.mutate({ ancien: formulaireMdp.ancien, nouveau: formulaireMdp.nouveau });
  }

  return (
    <div className="space-y-6">
      {/* ─── Double authentification ─── */}
      <Section titre={t('deuxFacteursTitre')} description={t('deuxFacteursDesc')}>
        {chargementStatut ? (
          <div className="flex items-center gap-2 py-4 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('chargement')}
          </div>
        ) : (
          <>
            <LigneOption
              titre={t('etatTitre')}
              description={
                statut?.actif
                  ? t('etatActifDesc', { date: formatDateHeure(statut?.activeLe, locale) })
                  : t('etatInactifDesc')
              }
            >
              <div className="flex items-center gap-3">
                <span className={statut?.actif ? 'badge badge-success' : 'badge badge-neutral'}>
                  {statut?.actif ? t('activee') : t('desactivee')}
                </span>
                {statut?.actif ? (
                  <button
                    className="btn-secondary flex items-center gap-2"
                    onClick={() => setModalDesactivation(true)}
                  >
                    <ShieldOff className="h-4 w-4" /> {t('desactiver')}
                  </button>
                ) : (
                  <button
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    disabled={mutationPreparer.isPending}
                    onClick={() => mutationPreparer.mutate()}
                  >
                    {mutationPreparer.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {t('activer')}
                  </button>
                )}
              </div>
            </LigneOption>

            {statut?.actif && (
              <LigneOption titre={t('codesSecoursTitre')} description={t('codesSecoursDesc')}>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'badge',
                      (statut?.codesSecoursRestants ?? 0) > 2 ? 'badge-neutral' : 'badge-warning',
                    )}
                  >
                    {t('codesRestants', { n: statut?.codesSecoursRestants ?? 0 })}
                  </span>
                  <button className="btn-secondary" onClick={() => setModalRegeneration(true)}>
                    {t('regenerer')}
                  </button>
                </div>
              </LigneOption>
            )}

            {statut?.activationEnAttente && !preparation && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                {t('activationEnAttente')}{' '}
                <button
                  className="font-semibold underline"
                  onClick={() => mutationAnnuler.mutate()}
                >
                  {t('abandonnerConfiguration')}
                </button>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-neutral-400">
              {t('detailTechnique', {
                algorithme: statut?.algorithme ?? 'SHA1',
                chiffres: statut?.chiffres ?? 6,
                periode: statut?.periodeSecondes ?? 30,
              })}
            </p>
          </>
        )}
      </Section>

      {/* ─── Sessions et appareils ─── */}
      <Section
        titre={t('sessionsTitre')}
        description={t('sessionsDesc')}
        action={
          autresSessions.length > 0 ? (
            <button
              className="btn-secondary disabled:opacity-60"
              disabled={mutationRevoquerAutres.isPending}
              onClick={() => mutationRevoquerAutres.mutate()}
            >
              {t('deconnecterPartoutAilleurs')}
            </button>
          ) : undefined
        }
      >
        {erreurSessions ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            {messageErreur(erreurSessions, t('erreurChargementSessions'))}
          </p>
        ) : chargementSessions ? (
          <div className="flex items-center gap-2 py-6 text-sm text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('chargement')}
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-400">{t('aucuneSession')}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {[
                    t('colonneAppareil'),
                    t('colonneIp'),
                    t('colonneOuverte'),
                    t('colonneRotation'),
                    t('colonneExpire'),
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
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-neutral-800">
                        <Laptop className="h-4 w-4 text-neutral-400" />
                        {s.appareil}
                        {s.courante && <span className="badge badge-success">{t('sessionCourante')}</span>}
                        {s.expiree && <span className="badge badge-neutral">{t('sessionExpiree')}</span>}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                      {s.ipAdresse ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                      {formatDateHeure(s.createdAt, locale)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                      {formatDateHeure(s.derniereRotation, locale)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                      {formatDateHeure(s.expiresAt, locale)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          'bg-red-50 text-red-600 hover:bg-red-100',
                          mutationRevoquer.isPending && 'opacity-50',
                        )}
                        disabled={mutationRevoquer.isPending}
                        onClick={() => mutationRevoquer.mutate(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {s.courante ? t('fermerCetteSession') : t('revoquer')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-neutral-400">{t('noteRotation')}</p>
      </Section>

      {/* ─── Politique de mot de passe ─── */}
      <Section titre={t('politiqueTitre')} description={t('politiqueDesc')}>
        <ul className="space-y-1.5">
          {(politique?.regles ?? []).map((regle) => (
            <li key={regle} className="flex items-start gap-2 text-sm text-neutral-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              {regle}
            </li>
          ))}
        </ul>
        {politique?.hachage && (
          <p className="text-[11px] text-neutral-400">{t('hachage', { valeur: politique.hachage })}</p>
        )}

        <div className="grid gap-3 pt-2 sm:max-w-md">
          <Champ label={t('ancienMotDePasse')}>
            <input
              type="password"
              autoComplete="current-password"
              className="input"
              value={formulaireMdp.ancien}
              onChange={(e) => setFormulaireMdp({ ...formulaireMdp, ancien: e.target.value })}
            />
          </Champ>
          <Champ label={t('nouveauMotDePasse')} aide={t('aideNouveauMotDePasse', { n: longueurMinimale })}>
            <input
              type="password"
              autoComplete="new-password"
              className="input"
              value={formulaireMdp.nouveau}
              onChange={(e) => setFormulaireMdp({ ...formulaireMdp, nouveau: e.target.value })}
            />
          </Champ>
          <JaugeMotDePasse valeur={formulaireMdp.nouveau} longueurMinimale={longueurMinimale} />
          <Champ label={t('confirmerMotDePasse')}>
            <input
              type="password"
              autoComplete="new-password"
              className="input"
              value={formulaireMdp.confirmation}
              onChange={(e) => setFormulaireMdp({ ...formulaireMdp, confirmation: e.target.value })}
            />
          </Champ>
          <div>
            <button
              className="btn-primary disabled:opacity-60"
              disabled={
                mutationMotDePasse.isPending ||
                !formulaireMdp.ancien ||
                !formulaireMdp.nouveau ||
                !utilisateurId
              }
              onClick={soumettreMotDePasse}
            >
              {mutationMotDePasse.isPending ? t('enregistrement') : t('changerMotDePasse')}
            </button>
          </div>
        </div>

        {politique?.nonImplemente?.length ? (
          <BientotDisponible
            titre={politique.nonImplemente.join(' · ')}
            raison={t('politiqueNonImplementeeRaison')}
          />
        ) : null}
      </Section>

      {/* ─── Assistant d'activation 2FA ─── */}
      <Modal
        open={!!preparation}
        onOpenChange={(ouvert) => {
          if (!ouvert) mutationAnnuler.mutate();
        }}
        title={t('assistantTitre')}
        description={t('assistantDesc')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => mutationAnnuler.mutate()}>
              {t('annuler')}
            </button>
            <button
              className="btn-primary disabled:opacity-60"
              disabled={codeActivation.trim().length !== 6 || mutationActiver.isPending}
              onClick={() => mutationActiver.mutate(codeActivation.trim())}
            >
              {mutationActiver.isPending ? t('verification') : t('confirmerActivation')}
            </button>
          </>
        }
      >
        {preparation && (
          <div className="space-y-4">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-700">
              <li>{t('etape1')}</li>
              <li>{t('etape2')}</li>
              <li>{t('etape3')}</li>
            </ol>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                {t('cleConfiguration')}
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="select-all break-all font-mono text-sm text-neutral-800">
                  {preparation.secretLisible}
                </code>
                <button
                  className="btn-secondary shrink-0"
                  onClick={() => copier(preparation.secret)}
                  aria-label={t('copierCle')}
                >
                  {copie ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 break-all text-[11px] text-neutral-400">{preparation.otpauthUrl}</p>
            </div>

            <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 text-[11px] leading-relaxed text-neutral-500">
              {t('noteQrCode')}
            </div>

            <Champ label={t('codeGenere')} aide={t('codeGenereAide')}>
              <input
                className="input font-mono tracking-[0.4em]"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={codeActivation}
                onChange={(e) => setCodeActivation(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </Champ>
          </div>
        )}
      </Modal>

      {/* ─── Codes de secours ─── */}
      <Modal
        open={!!codesSecours}
        onOpenChange={(ouvert) => {
          if (!ouvert) setCodesSecours(null);
        }}
        title={t('codesSecoursTitre')}
        description={t('codesSecoursModalDesc')}
        footer={
          <>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => codesSecours && telechargerCodes(codesSecours)}
            >
              <Download className="h-4 w-4" /> {t('telecharger')}
            </button>
            <button className="btn-primary" onClick={() => setCodesSecours(null)}>
              {t('jaiNote')}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-2">
          {(codesSecours ?? []).map((code) => (
            <code
              key={code}
              className="select-all rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-center font-mono text-sm"
            >
              {code}
            </code>
          ))}
        </div>
      </Modal>

      {/* ─── Confirmation par mot de passe (désactivation / régénération) ─── */}
      <Modal
        open={modalDesactivation || modalRegeneration}
        onOpenChange={(ouvert) => {
          if (!ouvert) {
            setModalDesactivation(false);
            setModalRegeneration(false);
            setMotDePasseConfirmation('');
          }
        }}
        title={modalDesactivation ? t('desactiver2faTitre') : t('regenererTitre')}
        description={modalDesactivation ? t('desactiver2faDesc') : t('regenererDesc')}
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                setModalDesactivation(false);
                setModalRegeneration(false);
                setMotDePasseConfirmation('');
              }}
            >
              {t('annuler')}
            </button>
            <button
              className="btn-primary disabled:opacity-60"
              disabled={
                !motDePasseConfirmation ||
                mutationDesactiver.isPending ||
                mutationRegenerer.isPending
              }
              onClick={() =>
                modalDesactivation
                  ? mutationDesactiver.mutate(motDePasseConfirmation)
                  : mutationRegenerer.mutate(motDePasseConfirmation)
              }
            >
              {t('confirmer')}
            </button>
          </>
        }
      >
        <Champ label={t('motDePasseCourant')}>
          <input
            type="password"
            autoComplete="current-password"
            className="input"
            value={motDePasseConfirmation}
            onChange={(e) => setMotDePasseConfirmation(e.target.value)}
          />
        </Champ>
        <p className="mt-2 flex items-start gap-2 text-[11px] text-neutral-500">
          <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t('motDePasseCourantAide')}
        </p>
      </Modal>
    </div>
  );
}
