'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, TrendingUp, CheckCircle, Clock, Plus, X, RefreshCw, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toNum } from '@/lib/utils';

interface Transaction {
  id: string;
  reference?: string;
  montant: number | string;
  devise: string;
  description?: string;
  type: string;
  statut: string;
  payeur_email?: string;
  payeur_tel?: string;
  created_at: string;
  /** Renseigné par l'API quand une page de paiement CinetPay a été ouverte. */
  metadata?: { cinetpay?: { paymentUrl?: string } | null } | null;
}

/** Réponse de POST /paiements/initier. */
interface InitiationResponse {
  id: string;
  reference: string;
  statut: string;
  passerelle: string | null;
  paymentUrl: string | null;
  motif?: string;
  erreur?: string;
}

interface PaiementStats {
  totalCollecte: number;
  nbTransactions: number;
  tauxSucces: number;
  parStatut: { statut: string; count: number; total: number }[];
}

const STATUT_COLORS: Record<string, string> = {
  SUCCES: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  ECHEC: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-600',
};

const TYPE_IDS = ['DON', 'COTISATION', 'PRESTATION', 'REMBOURSEMENT'];

const STATUT_IDS = ['EN_ATTENTE', 'SUCCES', 'ECHEC', 'ANNULE'];

/**
 * Statut d'intégration réel de chaque passerelle :
 *  - DISPONIBLE  : initiation ET confirmation opérées de bout en bout
 *  - INTEGRATION : callback (webhook) implémenté, initiation non opérationnelle
 *  - BIENTOT     : aucun code d'intégration côté API
 *
 * ⚠️ Ces statuts ne sont PLUS codés en dur : ils proviennent de
 * `GET /paiements/configuration`, qui n'annonce « DISPONIBLE » que si les clés
 * CinetPay sont réellement présentes sur le serveur. Le cahier des charges
 * IBIG SOFT interdit d'annoncer « disponible » une intégration non
 * opérationnelle — les valeurs ci-dessous ne servent que de repli pessimiste
 * (chargement en cours ou API injoignable) et ne doivent jamais valoir
 * « DISPONIBLE ».
 */
type StatutIntegration = 'DISPONIBLE' | 'INTEGRATION' | 'BIENTOT';

interface ConfigurationPasserelles {
  cinetpay: { configure: boolean; mode: string | null; signatureVerifiable: boolean };
  initiationOperationnelle: boolean;
  operateurs: { id: string; label: string; integration: StatutIntegration; via: string | null }[];
}

const INTEGRATION_BADGES: Record<StatutIntegration, { className: string }> = {
  DISPONIBLE: { className: 'bg-green-100 text-green-700' },
  INTEGRATION: { className: 'bg-amber-100 text-amber-700' },
  BIENTOT: { className: 'bg-gray-100 text-gray-500' },
};

/** Habillage visuel par opérateur (indépendant du statut d'intégration). */
const PRESENTATION: Record<string, { initiales: string; pastille: string }> = {
  ORANGE_MONEY: { initiales: 'OM', pastille: 'bg-orange-500' },
  MTN_MOMO: { initiales: 'MTN', pastille: 'bg-yellow-500' },
  MOOV_MONEY: { initiales: 'MOOV', pastille: 'bg-blue-500' },
  WAVE: { initiales: 'W', pastille: 'bg-sky-500' },
  CINETPAY: { initiales: 'CP', pastille: 'bg-blue-600' },
};

interface Operateur {
  id: string;
  label: string;
  initiales: string;
  pastille: string;
  integration: StatutIntegration;
  via: string | null;
}

/** Repli utilisé tant que la configuration serveur n'a pas répondu. */
const OPERATEURS_REPLI: Operateur[] = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', ...PRESENTATION.ORANGE_MONEY, integration: 'INTEGRATION', via: null },
  { id: 'CINETPAY', label: 'CinetPay', ...PRESENTATION.CINETPAY, integration: 'INTEGRATION', via: null },
  { id: 'MTN_MOMO', label: 'MTN MoMo', ...PRESENTATION.MTN_MOMO, integration: 'BIENTOT', via: null },
  { id: 'WAVE', label: 'Wave', ...PRESENTATION.WAVE, integration: 'BIENTOT', via: null },
];

/** Détail affiché sous le badge — dépend du statut réel, jamais d'un a priori. */
function detailKey(op: Operateur): 'detailViaCinetpay' | 'detailOperationnel' | 'detailWebhook' | 'detailNonDemarre' {
  if (op.integration === 'DISPONIBLE') return op.via === 'CINETPAY' ? 'detailViaCinetpay' : 'detailOperationnel';
  if (op.integration === 'INTEGRATION') return 'detailWebhook';
  return 'detailNonDemarre';
}

export default function PaiementsPage() {
  const t = useTranslations('finance.paiements');
  const tc = useTranslations('finance.common');
  const qc = useQueryClient();

  const typeLabel = (type: string) => (TYPE_IDS.includes(type) ? t(`types.${type}`) : type);
  const statutLabel = (statut: string) => (STATUT_IDS.includes(statut) ? t(`statuts.${statut}`) : statut);

  const [showInitier, setShowInitier] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [form, setForm] = useState({ montant: '', devise: 'XOF', description: '', payeurEmail: '', payeurTel: '', type: 'DON', operateur: 'ORANGE_MONEY' });
  /** Dernière initiation aboutie — conserve le lien si la popup est bloquée. */
  const [dernierPaiement, setDernierPaiement] = useState<InitiationResponse | null>(null);
  const [erreurInitiation, setErreurInitiation] = useState<string | null>(null);

  const { data: configData } = useQuery<ConfigurationPasserelles>({
    queryKey: ['paiements-configuration'],
    queryFn: () => api.get('/paiements/configuration').then((r: any) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  // Sans réponse serveur, on reste sur le repli pessimiste : jamais « Disponible ».
  const operateurs: Operateur[] = configData?.operateurs?.length
    ? configData.operateurs.map((op) => ({
        id: op.id,
        label: op.label,
        initiales: PRESENTATION[op.id]?.initiales ?? op.label.slice(0, 2).toUpperCase(),
        pastille: PRESENTATION[op.id]?.pastille ?? 'bg-gray-400',
        integration: op.integration,
        via: op.via,
      }))
    : OPERATEURS_REPLI;

  const passerelleActive = configData?.initiationOperationnelle === true;
  const operateursSelectionnables = operateurs.filter((o) => o.integration !== 'BIENTOT');

  const { data: statsData } = useQuery<PaiementStats>({
    queryKey: ['paiements-stats'],
    queryFn: () => api.get('/paiements/stats').then((r: any) => r.data),
  });

  const { data: txData, isLoading, refetch } = useQuery<{ data: Transaction[]; total: number }>({
    queryKey: ['paiements-transactions', filtreStatut, filtreType],
    queryFn: () => api.get('/paiements/transactions', { params: { statut: filtreStatut || undefined, type: filtreType || undefined, limit: 50 } }).then((r: any) => r.data),
  });

  const initierPaiement = useMutation<InitiationResponse, any, any>({
    mutationFn: (data: any) => api.post('/paiements/initier', data).then((r: any) => r.data),
    onSuccess: (resultat) => {
      qc.invalidateQueries({ queryKey: ['paiements-transactions'] });
      qc.invalidateQueries({ queryKey: ['paiements-stats'] });
      setShowInitier(false);
      setForm({ montant: '', devise: 'XOF', description: '', payeurEmail: '', payeurTel: '', type: 'DON', operateur: 'ORANGE_MONEY' });
      setErreurInitiation(resultat?.erreur ?? null);
      setDernierPaiement(resultat ?? null);
      // Redirection vers la page de paiement de la passerelle, si elle existe.
      if (resultat?.paymentUrl) {
        window.open(resultat.paymentUrl, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (e: any) => {
      setErreurInitiation(e?.response?.data?.message ?? e?.message ?? 'Erreur');
    },
  });

  const transactions = txData?.data ?? [];
  const stats = statsData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} aria-label={t('actions.refresh')} title={t('actions.refresh')} className="p-2 border border-gray-300 rounded-lg text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowInitier(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> {t('actions.initier')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.totalCollecte')}</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{(stats?.totalCollecte ?? 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.transactions')}</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.nbTransactions ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.tauxSucces')}</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.tauxSucces ?? 0}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.enAttente')}</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.parStatut?.find(s => s.statut === 'EN_ATTENTE')?.count ?? 0}</p>
        </div>
      </div>

      {/* Opérateurs — statut d'intégration servi par l'API (cf. commentaire en tête de fichier) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {operateurs.map(op => {
          const badge = INTEGRATION_BADGES[op.integration];
          return (
            <div key={op.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <span
                className={`w-9 h-9 shrink-0 rounded-full ${op.pastille} text-white text-[11px] font-bold flex items-center justify-center`}
                aria-hidden="true"
              >
                {op.initiales}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{op.label}</p>
                <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full ${badge.className}`}>
                  {t(`integration.${op.integration}`)}
                </span>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t(`operateurs.${detailKey(op)}`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p
        className={`text-xs rounded-lg px-3 py-2 border ${
          passerelleActive
            ? 'text-gray-600 bg-blue-50 border-blue-100'
            : 'text-gray-500 bg-amber-50 border-amber-100'
        }`}
      >
        {t.rich(passerelleActive ? 'avertissementActif' : 'avertissement', {
          b: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>

      {/* Lien de paiement de la dernière initiation (secours si la popup est bloquée) */}
      {dernierPaiement?.paymentUrl && (
        <div className="flex flex-wrap items-center gap-2 text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <span className="text-green-800">{t('initiation.pageOuverte', { reference: dernierPaiement.reference })}</span>
          <a
            href={dernierPaiement.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-green-700 underline"
          >
            {t('initiation.rouvrir')} <ExternalLink className="w-3 h-3" />
          </a>
          <button onClick={() => setDernierPaiement(null)} className="ml-auto text-green-700" aria-label={tc('cancel')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {erreurInitiation && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {t('initiation.erreur', { message: erreurInitiation })}
        </p>
      )}

      {dernierPaiement && !dernierPaiement.paymentUrl && dernierPaiement.motif === 'PASSERELLE_NON_CONFIGUREE' && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {t('initiation.sansPasserelle', { reference: dernierPaiement.reference })}
        </p>
      )}

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">{t('filtre.tousStatuts')}</option>
          <option value="EN_ATTENTE">{t('statuts.EN_ATTENTE')}</option>
          <option value="SUCCES">{t('statuts.SUCCES')}</option>
          <option value="ECHEC">{t('statuts.ECHEC')}</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
          <option value="">{t('filtre.tousTypes')}</option>
          <option value="DON">{t('types.DON')}</option>
          <option value="COTISATION">{t('types.COTISATION')}</option>
          <option value="PRESTATION">{t('types.PRESTATION')}</option>
        </select>
      </div>

      {/* Table transactions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{t('table.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t('table.reference')}</th>
                <th className="px-4 py-3 text-left">{t('table.description')}</th>
                <th className="px-4 py-3 text-left">{t('table.type')}</th>
                <th className="px-4 py-3 text-right">{t('table.montant')}</th>
                <th className="px-4 py-3 text-left">{t('table.statut')}</th>
                <th className="px-4 py-3 text-left">{t('table.date')}</th>
                <th className="px-4 py-3 text-right">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.reference ?? tx.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{tx.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{typeLabel(tx.type)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{toNum(tx.montant).toLocaleString('fr-FR')} {tx.devise}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[tx.statut] ?? 'bg-gray-100 text-gray-600'}`}>{statutLabel(tx.statut)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3 text-right">
                    {tx.statut === 'EN_ATTENTE' && tx.metadata?.cinetpay?.paymentUrl ? (
                      <a
                        href={tx.metadata.cinetpay.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline"
                      >
                        {t('table.payer')} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal initier paiement */}
      {showInitier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('modal.title')}</h2>
              <button onClick={() => setShowInitier(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.montantPlaceholder')} value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.devise} onChange={e => setForm(f => ({ ...f, devise: e.target.value }))}>
                  <option value="XOF">{t('modal.deviseXof')}</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="DON">{t('types.DON')}</option>
                <option value="COTISATION">{t('types.COTISATION')}</option>
              </select>
              <div>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.operateur} onChange={e => setForm(f => ({ ...f, operateur: e.target.value }))}>
                  {operateursSelectionnables.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.label} — {t(`integration.${op.integration}`)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {t(passerelleActive ? 'modal.canalNoteActif' : 'modal.canalNote')}
                </p>
              </div>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.descriptionPlaceholder')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.emailPlaceholder')} value={form.payeurEmail} onChange={e => setForm(f => ({ ...f, payeurEmail: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.telPlaceholder')} value={form.payeurTel} onChange={e => setForm(f => ({ ...f, payeurTel: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowInitier(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">{tc('cancel')}</button>
              <button
                onClick={() => {
                  setErreurInitiation(null);
                  setDernierPaiement(null);
                  // `operateur` est désormais accepté par le DTO API et sert à
                  // choisir le canal CinetPay (MOBILE_MONEY / CREDIT_CARD / ALL).
                  const operateur = operateursSelectionnables.some(o => o.id === form.operateur)
                    ? form.operateur
                    : operateursSelectionnables[0]?.id;
                  initierPaiement.mutate({
                    montant: parseFloat(form.montant),
                    devise: form.devise,
                    description: form.description,
                    payeurEmail: form.payeurEmail,
                    payeurTel: form.payeurTel,
                    type: form.type,
                    ...(operateur ? { operateur } : {}),
                  });
                }}
                disabled={!form.montant || !form.payeurTel || !form.payeurEmail || initierPaiement.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60"
              >
                {initierPaiement.isPending ? t('modal.sending') : t('modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
