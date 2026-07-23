'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, ChevronRight, ChevronDown, FileSpreadsheet, FileText as FilePdf } from 'lucide-react';
import {
  exportDocument, comptabiliteExportDef, ANOUANZE_BRANDING, formatFCFA,
  type DocumentExportDefinition,
} from '@/lib/pdf-engine';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatMontant, formatDate, toNum, cn } from '@/lib/utils';

const TAB_IDS = ['plan', 'journal', 'ecritures', 'balance'] as const;

interface CompteComptable {
  id?: string;
  numero: string;
  libelle: string;
  classe?: number;
  type?: string;
  children?: CompteComptable[];
}

interface Ecriture {
  id: string;
  date?: string;
  createdAt?: string;
  journal?: { code?: string; libelle?: string } | string;
  libelle: string;
  lignes?: { debit?: number; credit?: number }[];
  montantDebit?: number;
  montantCredit?: number;
  statut?: string;
}

interface BalanceLigne {
  compte?: string;
  numero?: string;
  libelle: string;
  debitCumul?: number;
  creditCumul?: number;
  totalDebit?: number;
  totalCredit?: number;
  solde?: number;
}

function PlanComptable() {
  const t = useTranslations('finance.comptabilite');
  const tc = useTranslations('finance.common');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['comptabilite-plan'],
    queryFn: async () => {
      const { data } = await api.get('/comptabilite/plan-comptable');
      return data;
    },
  });

  const plan: CompteComptable[] = data ?? [];

  const grouped: Record<string, CompteComptable[]> = {};
  plan.forEach((c) => {
    const cls = c.classe?.toString() ?? c.numero?.charAt(0) ?? '?';
    if (!grouped[cls]) grouped[cls] = [];
    grouped[cls].push(c);
  });

  if (isLoading) return <div className="card p-6 text-center text-neutral-400 text-sm">{tc('loading')}</div>;

  if (Object.keys(grouped).length === 0) {
    return <div className="card p-6 text-center text-neutral-400 text-sm">{t('plan.empty')}</div>;
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([cls, comptes]) => (
        <div key={cls} className="card overflow-hidden">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
            onClick={() => setExpanded((prev) => ({ ...prev, [cls]: !prev[cls] }))}
          >
            {expanded[cls] ? (
              <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
            )}
            <span className="font-semibold text-primary-600 w-8 shrink-0">{cls}</span>
            <span className="font-medium text-neutral-800">{t('plan.classe', { classe: cls })}</span>
            <span className="badge badge-neutral ml-auto">{comptes.length}</span>
          </button>
          {expanded[cls] && (
            <div className="border-t border-neutral-100">
              {comptes.map((compte) => (
                <div key={compte.id ?? compte.numero} className="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-neutral-50 border-b last:border-b-0 border-neutral-50">
                  <span className="text-sm font-mono text-neutral-500 w-16 shrink-0">{compte.numero}</span>
                  <span className="text-sm text-neutral-700">{compte.libelle}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TableauEcritures() {
  const t = useTranslations('finance.comptabilite');
  const tc = useTranslations('finance.common');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['comptabilite-ecritures', page],
    queryFn: async () => {
      const { data } = await api.get('/comptabilite/ecritures', { params: { page, limit } });
      return data;
    },
  });

  const ecritures: Ecriture[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  function getJournalCode(e: Ecriture) {
    if (!e.journal) return '—';
    if (typeof e.journal === 'string') return e.journal;
    return e.journal.code ?? '—';
  }

  return (
    <>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[540px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.date')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.journal')}</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.libelle')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.debit')}</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.credit')}</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('ecritures.statut')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400 text-sm">{tc('loading')}</td></tr>}
            {!isLoading && ecritures.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400 text-sm">{t('ecritures.empty')}</td></tr>}
            {ecritures.map((e) => {
              const debit = e.montantDebit != null
                ? toNum(e.montantDebit)
                : (e.lignes?.reduce((s, l) => s + toNum(l.debit), 0) ?? 0);
              const credit = e.montantCredit != null
                ? toNum(e.montantCredit)
                : (e.lignes?.reduce((s, l) => s + toNum(l.credit), 0) ?? 0);
              return (
                <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-default">
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{formatDate(e.date ?? e.createdAt ?? '')}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-neutral font-mono">{getJournalCode(e)}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-800">{e.libelle}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-800">{debit > 0 ? formatMontant(debit) : '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-800">{credit > 0 ? formatMontant(credit) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {e.statut === 'VALIDE' || e.statut === 'valide'
                      ? <span className="badge badge-success">{t('ecritures.valide')}</span>
                      : <span className="badge badge-warning">{t('ecritures.brouillon')}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {total > limit && <Pagination total={total} page={page} limit={limit} onChange={setPage} />}
    </>
  );
}

function Balance() {
  const t = useTranslations('finance.comptabilite');
  const tc = useTranslations('finance.common');
  const exercice = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ['comptabilite-balance', exercice],
    queryFn: async () => {
      const { data } = await api.get(`/comptabilite/balance/${exercice}`);
      return data;
    },
  });

  const lignes: BalanceLigne[] = data ?? [];

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('balance.compte')}</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('balance.libelle')}</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('balance.debitCumule')}</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('balance.creditCumule')}</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('balance.solde')}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{tc('loading')}</td></tr>}
          {!isLoading && lignes.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{t('balance.empty', { exercice: String(exercice) })}</td></tr>}
          {lignes.map((ligne, i) => {
            const debit = toNum(ligne.debitCumul ?? ligne.totalDebit);
            const credit = toNum(ligne.creditCumul ?? ligne.totalCredit);
            const solde = ligne.solde != null ? toNum(ligne.solde) : debit - credit;
            return (
              <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-default">
                <td className="px-4 py-3 font-mono text-neutral-500 whitespace-nowrap">{ligne.compte ?? ligne.numero}</td>
                <td className="px-4 py-3 text-neutral-800">{ligne.libelle}</td>
                <td className="px-4 py-3 text-right font-mono text-neutral-700">{formatMontant(debit)}</td>
                <td className="px-4 py-3 text-right font-mono text-neutral-700">{formatMontant(credit)}</td>
                <td className={cn('px-4 py-3 text-right font-mono font-semibold', solde >= 0 ? 'text-red-600' : 'text-green-600')}>
                  {formatMontant(Math.abs(solde))}
                  <span className="text-xs ml-1">{solde >= 0 ? 'D' : 'C'}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface LigneEcriture { compte: string; libelle: string; debit: string; credit: string; }

function ModalNouvelleEcriture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('finance.comptabilite');
  const tc = useTranslations('finance.common');
  const [journalId, setJournalId] = useState('');
  const [libelle, setLibelle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lignes, setLignes] = useState<LigneEcriture[]>([
    { compte: '', libelle: '', debit: '', credit: '' },
    { compte: '', libelle: '', debit: '', credit: '' },
  ]);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: journauxData } = useQuery({
    queryKey: ['comptabilite-journaux'],
    queryFn: async () => { const { data } = await api.get('/comptabilite/journaux'); return data; },
    enabled: open,
  });
  const journaux: { id: string; code: string; libelle: string }[] = journauxData ?? [];

  const { data: planData } = useQuery({
    queryKey: ['comptabilite-plan'],
    queryFn: async () => { const { data } = await api.get('/comptabilite/plan-comptable'); return data; },
    enabled: open,
  });
  const compteMap: Record<string, string> = {};
  (planData ?? []).forEach((c: { id?: string; numero: string }) => { if (c.id) compteMap[c.numero] = c.id; });

  const totalDebit = lignes.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lignes.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const equilibre = Math.abs(totalDebit - totalCredit) < 0.01;

  const mutation = useMutation({
    mutationFn: () => {
      const now = new Date(date);
      const exercice = now.getFullYear();
      const periode = `${exercice}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return api.post('/comptabilite/ecritures', {
        journalId,
        libelle,
        dateEcriture: date,
        exercice,
        periode,
        lignes: lignes.map((l) => ({
          compteId: compteMap[l.compte] ?? l.compte,
          libelle: l.libelle || undefined,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comptabilite-ecritures'] });
      queryClient.invalidateQueries({ queryKey: ['comptabilite-balance'] });
      setLibelle(''); setJournalId(''); setDate(new Date().toISOString().slice(0, 10));
      setLignes([{ compte: '', libelle: '', debit: '', credit: '' }, { compte: '', libelle: '', debit: '', credit: '' }]);
      setError('');
      onClose();
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? tc('error')),
  });

  const handleSubmit = () => {
    if (!libelle.trim()) { setError(t('errors.libelleRequis')); return; }
    if (!journalId) { setError(t('errors.journalRequis')); return; }
    if (!equilibre) { setError(t('errors.nonEquilibre')); return; }
    const missing = lignes.find((l) => l.compte && !compteMap[l.compte]);
    if (missing) { setError(t('errors.compteIntrouvable', { compte: missing.compte })); return; }
    setError('');
    mutation.mutate();
  };

  return (
    <Modal open={open} onOpenChange={onClose} title={t('modal.title')} size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>{tc('cancel')}</button>
          <button className="btn-primary" disabled={mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending ? tc('saving') : tc('save')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">{t('modal.journal')}</label>
            <select className="input w-full" value={journalId} onChange={(e) => setJournalId(e.target.value)}>
              <option value="">{t('modal.chooseJournal')}</option>
              {journaux.map((j) => (
                <option key={j.id} value={j.id}>{j.code} – {j.libelle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('modal.date')}</label>
            <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">{t('modal.libelleGeneral')}</label>
            <input type="text" className="input w-full" placeholder={t('modal.libellePlaceholder')} value={libelle} onChange={(e) => setLibelle(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">{t('modal.lignes')}</label>
            <button type="button" className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1"
              onClick={() => setLignes((prev) => [...prev, { compte: '', libelle: '', debit: '', credit: '' }])}>
              <Plus className="w-3 h-3" /> {t('modal.addLigne')}
            </button>
          </div>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500">{t('modal.colCompte')}</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500">{t('modal.colLibelle')}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500">{t('modal.colDebit')}</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500">{t('modal.colCredit')}</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-20" placeholder={t('modal.comptePlaceholder')} value={ligne.compte} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, compte: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-full" placeholder={t('modal.ligneLibellePlaceholder')} value={ligne.libelle} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, libelle: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-28 text-right" placeholder={t('modal.montantPlaceholder')} value={ligne.debit} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, debit: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-28 text-right" placeholder={t('modal.montantPlaceholder')} value={ligne.credit} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, credit: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5">{lignes.length > 2 && <button type="button" onClick={() => setLignes((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">×</button>}</td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 border-t border-neutral-200">
                  <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-neutral-600">{t('modal.totaux')}</td>
                  <td className="px-3 py-2 text-right text-xs font-mono font-semibold text-neutral-800">{formatMontant(totalDebit)}</td>
                  <td className="px-3 py-2 text-right text-xs font-mono font-semibold text-neutral-800">{formatMontant(totalCredit)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className={cn('mt-2 text-xs font-medium', equilibre ? 'text-green-600' : 'text-red-500')}>
            {equilibre
              ? t('modal.equilibre')
              : t('modal.desequilibre', { montant: formatMontant(Math.abs(totalDebit - totalCredit)) })}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}

export default function ComptabilitePage() {
  const t = useTranslations('finance.comptabilite');
  const tc = useTranslations('finance.common');
  const [activeTab, setActiveTab] = useState('plan');
  const [modalOpen, setModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const tabs = TAB_IDS.map((id) => ({ id, label: t(`tabs.${id}`) }));

  const handleExportEcritures = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/comptabilite/ecritures', { params: { limit: 9999 } });
      const rows = (data?.data ?? []).map((e: Ecriture) => ({
        date: e.date ?? null,
        journal: typeof e.journal === 'string' ? e.journal : (e.journal?.code ?? '—'),
        libelle: e.libelle,
        debit: e.montantDebit ?? e.lignes?.reduce((s, l) => s + (l.debit ?? 0), 0) ?? 0,
        credit: e.montantCredit ?? e.lignes?.reduce((s, l) => s + (l.credit ?? 0), 0) ?? 0,
        statut: e.statut ?? '—',
      }));
      if (activeTab === 'ecritures') {
        await exportDocument(comptabiliteExportDef({ filtersSummary: `${rows.length} écriture(s)` }), rows, 'xlsx');
      } else if (activeTab === 'balance') {
        const { data: balData } = await api.get('/comptabilite/balance');
        const balRows = (balData?.data ?? balData ?? []).map((b: BalanceLigne) => ({
          compte: b.compte ?? b.numero ?? '—',
          libelle: b.libelle,
          debit: b.debitCumul ?? b.totalDebit ?? 0,
          credit: b.creditCumul ?? b.totalCredit ?? 0,
          solde: b.solde ?? 0,
        }));
        const balDef: DocumentExportDefinition = {
          title: 'Balance comptable SYCEBNL',
          subtitle: 'Balance générale des comptes',
          documentType: 'financial-statement',
          branding: ANOUANZE_BRANDING,
          lang: 'fr',
          columns: [
            { key: 'compte', label: 'Compte', type: 'code', priority: 'essential', nowrap: true },
            { key: 'libelle', label: 'Libellé', type: 'long-description', priority: 'essential' },
            { key: 'debit', label: 'Débit cumulé', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
            { key: 'credit', label: 'Crédit cumulé', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
            { key: 'solde', label: 'Solde', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
          ],
        };
        await exportDocument(balDef, balRows, 'pdf');
      }
    } finally { setExporting(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">{t('title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(activeTab === 'ecritures' || activeTab === 'balance') && (
            <button onClick={handleExportEcritures} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              {activeTab === 'balance' ? <FilePdf className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
              {exporting ? tc('exporting') : activeTab === 'balance' ? t('actions.exportBalancePdf') : t('actions.exportEcrituresExcel')}
            </button>
          )}
          <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('actions.newEntry')}
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'plan' && <PlanComptable />}
        {activeTab === 'journal' && (
          <div className="card p-6 text-center text-neutral-500">
            <p className="text-sm">{t('journalPlaceholder')}</p>
          </div>
        )}
        {activeTab === 'ecritures' && <TableauEcritures />}
        {activeTab === 'balance' && <Balance />}
      </div>

      <ModalNouvelleEcriture open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
