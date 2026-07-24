'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Ban,
  Bot,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  Mail,
  PlugZap,
  RefreshCw,
  Settings2,
  XCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  ChampConfiguration,
  type CategorieConfig,
  type EntreeConfiguration,
} from '@/components/superadmin/ChampConfiguration';

interface Diagnostic {
  ok: boolean;
  message: string;
  details?: string[];
}

const CATEGORIES: Array<{ id: CategorieConfig; cleI18n: string; icone: typeof CreditCard }> = [
  { id: 'PAIEMENT', cleI18n: 'paiement', icone: CreditCard },
  { id: 'EMAIL', cleI18n: 'email', icone: Mail },
  { id: 'IA', cleI18n: 'ia', icone: Bot },
  { id: 'GENERAL', cleI18n: 'general', icone: Settings2 },
];

export default function SuperadminConfigurationPage() {
  const t = useTranslations('shell.superadminConfig');
  const qc = useQueryClient();
  const { data: session, status } = useSession();

  const [categorie, setCategorie] = useState<CategorieConfig>('PAIEMENT');
  const [diagnostics, setDiagnostics] = useState<Partial<Record<CategorieConfig, Diagnostic>>>({});
  const [cleASupprimer, setCleASupprimer] = useState<string | null>(null);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const estSuperAdmin = role === 'SUPER_ADMIN';

  const meta = CATEGORIES.find((c) => c.id === categorie)!;

  const {
    data: entrees = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<EntreeConfiguration[]>({
    queryKey: ['sa-configuration', categorie],
    queryFn: () => api.get(`/configuration/${categorie}`).then((r) => r.data as EntreeConfiguration[]),
    enabled: estSuperAdmin,
    // Données sensibles : aucune conservation en cache une fois la page quittée.
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });

  const enregistrer = useMutation({
    mutationFn: (p: { cle: string; valeur: string }) =>
      api.put(`/configuration/${encodeURIComponent(p.cle)}`, { valeur: p.valeur }),
    onSuccess: () => {
      toast.success(t('etat.enregistre'));
      qc.invalidateQueries({ queryKey: ['sa-configuration', categorie] });
    },
    // Le message d'erreur de l'API ne contient jamais la valeur saisie.
    onError: (e: Error) => toast.error(e.message || t('etat.echecEnregistrement')),
  });

  const supprimer = useMutation({
    mutationFn: (cle: string) => api.delete(`/configuration/${encodeURIComponent(cle)}`),
    onSuccess: () => {
      toast.success(t('etat.supprime'));
      qc.invalidateQueries({ queryKey: ['sa-configuration', categorie] });
    },
    onError: (e: Error) => toast.error(e.message || t('etat.echecSuppression')),
  });

  const tester = useMutation({
    mutationFn: (cat: CategorieConfig) =>
      api.post(`/configuration/tester/${cat}`).then((r) => r.data as Diagnostic),
    onSuccess: (d, cat) => setDiagnostics((prev) => ({ ...prev, [cat]: d })),
    onError: (e: Error, cat) =>
      setDiagnostics((prev) => ({ ...prev, [cat]: { ok: false, message: e.message || t('test.echec') } })),
  });

  // ---------------------------------------------------------------- Accès
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 text-sm text-neutral-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t('etat.chargement')}
      </div>
    );
  }

  if (!estSuperAdmin) {
    return (
      <div className="max-w-2xl rounded-xl border border-red-800/60 bg-red-900/20 p-6">
        <p className="flex items-center gap-2 text-base font-semibold text-red-200">
          <Ban className="w-5 h-5" />
          {t('accesRefuseTitre')}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-red-300">{t('accesRefuseMessage')}</p>
      </div>
    );
  }

  const diagnostic = diagnostics[categorie];
  const testEnCours = tester.isPending && tester.variables === categorie;
  const entreeASupprimer = entrees.find((e) => e.cle === cleASupprimer);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('titre')}</h1>
          <p className="mt-1 text-sm text-neutral-400">{t('sousTitre')}</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-700 px-4 py-2 text-sm text-primary-400 transition-colors hover:text-primary-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {t('actions.rafraichir')}
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-neutral-800">
        <nav className="-mb-px flex gap-0 overflow-x-auto">
          {CATEGORIES.map((c) => {
            const Icone = c.icone;
            const actif = c.id === categorie;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategorie(c.id)}
                aria-current={actif ? 'page' : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  actif
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                }`}
              >
                <Icone className="w-4 h-4" />
                {t(`onglets.${c.cleI18n}`)}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bandeau d'aide */}
      <div className="rounded-xl border border-blue-900/60 bg-blue-950/30 p-4">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-blue-200">
          <Info className="mt-0.5 w-4 h-4 shrink-0" aria-hidden />
          <span>{t(`aide.${meta.cleI18n}`)}</span>
        </p>
        {categorie === 'PAIEMENT' && (
          <p className="mt-2 flex items-start gap-2 pl-6 text-sm leading-relaxed text-amber-300">
            <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden />
            <span>{t('aide.paiementAvertissement')}</span>
          </p>
        )}
      </div>

      {/* Test de connexion */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">{t(`onglets.${meta.cleI18n}`)}</p>
          <button
            type="button"
            onClick={() => tester.mutate(categorie)}
            disabled={testEnCours}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {testEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlugZap className="w-4 h-4" />}
            {testEnCours ? t('actions.testEnCours') : t('actions.tester')}
          </button>
        </div>

        {diagnostic ? (
          <div
            className={`mt-3 rounded-lg border p-3 text-sm ${
              diagnostic.ok
                ? 'border-green-800 bg-green-900/20 text-green-300'
                : 'border-red-800 bg-red-900/20 text-red-300'
            }`}
          >
            <p className="flex items-center gap-2 font-medium">
              {diagnostic.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {diagnostic.ok ? t('test.succes') : t('test.echec')}
            </p>
            <p className="mt-1 leading-relaxed opacity-90">{diagnostic.message}</p>
            {diagnostic.details && diagnostic.details.length > 0 && (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide opacity-70">{t('test.details')}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs opacity-90">
                  {diagnostic.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-600">{t('test.jamaisLance')}</p>
        )}
      </div>

      {/* Clés */}
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-neutral-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('etat.chargement')}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-800/60 bg-red-900/20 p-5 text-sm text-red-300">
          {t('etat.erreur')}
        </div>
      ) : entrees.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
          {t('etat.vide')}
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {entrees.map((entree) => (
            <ChampConfiguration
              key={entree.cle}
              entree={entree}
              enregistrement={enregistrer.isPending && enregistrer.variables?.cle === entree.cle}
              suppression={supprimer.isPending && supprimer.variables === entree.cle}
              onEnregistrer={(valeur) => enregistrer.mutate({ cle: entree.cle, valeur })}
              onSupprimer={() => setCleASupprimer(entree.cle)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={cleASupprimer !== null}
        onClose={() => setCleASupprimer(null)}
        onConfirm={() => {
          if (cleASupprimer) supprimer.mutate(cleASupprimer);
          setCleASupprimer(null);
        }}
        titre={t('suppressionTitre')}
        message={t('suppressionMessage', {
          cle: entreeASupprimer?.description?.trim() || cleASupprimer || '',
        })}
        variante="danger"
      />
    </div>
  );
}
