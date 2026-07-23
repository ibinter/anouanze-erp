'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, TrendingUp, Landmark, FileSpreadsheet } from 'lucide-react';
import { exportDocument, tresorerieExportDef } from '@/lib/pdf-engine';
import { Modal } from '@/components/ui/Modal';
import { formatMontant, formatDate, toNum, cn } from '@/lib/utils';

interface CompteBancaire {
  id: string;
  nom: string;
  banque: string;
  numeroCarte?: string;
  solde: number;
}

interface Mouvement {
  id: string;
  date: string;
  libelle: string;
  debit?: number;
  credit?: number;
  montant: number;
  type: string;
  rapproche: boolean;
  soldeApres?: number;
}

export default function TresoreriePage() {
  const t = useTranslations('finance.tresorerie');
  const tc = useTranslations('finance.common');
  const [selectedCompteId, setSelectedCompteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ libelle: '', date: new Date().toISOString().slice(0, 10), type: 'debit', montant: '', compteId: '' });
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const createMouvement = useMutation({
    mutationFn: (f: typeof form) => {
      const compteId = f.compteId || selectedCompte?.id;
      const montant = Number(f.montant);
      return api.post(`/tresorerie/comptes/${compteId}/mouvements`, {
        libelle: f.libelle,
        date: f.date,
        debit: f.type === 'debit' ? montant : undefined,
        credit: f.type === 'credit' ? montant : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tresorerie-mouvements'] });
      queryClient.invalidateQueries({ queryKey: ['tresorerie-comptes'] });
      setModalOpen(false);
      setForm({ libelle: '', date: new Date().toISOString().slice(0, 10), type: 'debit', montant: '', compteId: '' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? tc('error')),
  });

  const { data: comptesData, isLoading: comptesLoading } = useQuery({
    queryKey: ['tresorerie-comptes'],
    queryFn: async () => {
      const { data } = await api.get('/tresorerie/comptes');
      return data;
    },
  });

  const comptes: CompteBancaire[] = comptesData ?? [];
  const selectedCompte = comptes.find((c) => c.id === selectedCompteId) ?? comptes[0] ?? null;

  const { data: mouvementsData, isLoading: mouvLoading } = useQuery({
    queryKey: ['tresorerie-mouvements', selectedCompte?.id],
    queryFn: async () => {
      const { data } = await api.get(`/tresorerie/comptes/${selectedCompte!.id}/mouvements`, {
        params: { limit: 50 },
      });
      return data;
    },
    enabled: !!selectedCompte?.id,
  });

  const mouvements: Mouvement[] = mouvementsData?.data ?? mouvementsData ?? [];
  const totalTresorerie = comptes.reduce((s, c) => s + toNum(c.solde), 0);

  const handleExportMouvements = async () => {
    if (!selectedCompte) return;
    setExporting(true);
    try {
      const { data } = await api.get(`/tresorerie/comptes/${selectedCompte.id}/mouvements`, { params: { limit: 9999 } });
      const rows = (data?.data ?? data ?? mouvements).map((m: Mouvement) => ({
        date: m.date ?? null,
        libelle: m.libelle,
        debit: m.debit ?? (m.type === 'debit' ? m.montant : 0) ?? 0,
        credit: m.credit ?? (m.type === 'credit' ? m.montant : 0) ?? 0,
        rapproche: m.rapproche ?? false,
        soldeApres: m.soldeApres ?? null,
      }));
      const def = tresorerieExportDef({
        organisation: selectedCompte.nom,
        filtersSummary: `${selectedCompte.banque} — Solde : ${selectedCompte.solde?.toLocaleString('fr-CI')} FCFA`,
      });
      def.title = `Relevé de compte — ${selectedCompte.nom}`;
      await exportDocument(def, rows, 'xlsx');
    } finally { setExporting(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{t('title')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedCompte && (
            <button onClick={handleExportMouvements} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4" />
              {exporting ? tc('exporting') : t('actions.exportReleve')}
            </button>
          )}
          <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            {t('actions.newMouvement')}
          </button>
        </div>
      </div>

      <div className="stat-card flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{t('kpi.total')}</p>
          <p className="text-3xl font-bold text-neutral-800 mt-1">{comptesLoading ? '—' : formatMontant(totalTresorerie)}</p>
          {!comptesLoading && (
            <p className="text-xs text-neutral-400 mt-1">
              {t('kpi.comptes', { count: comptes.length })}
            </p>
          )}
        </div>
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 shrink-0">
          <Landmark className="w-8 h-8 text-primary-600" />
        </div>
      </div>

      {comptesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-24 animate-pulse bg-neutral-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {comptes.map((compte) => (
            <button
              key={compte.id}
              onClick={() => setSelectedCompteId(compte.id)}
              aria-pressed={selectedCompte?.id === compte.id}
              className={cn(
                'card p-4 text-left transition-all duration-200 border-2 hover:-translate-y-0.5 hover:shadow-card-hover',
                selectedCompte?.id === compte.id
                  ? 'border-primary-600 ring-2 ring-primary-600/15 shadow-card-hover'
                  : 'border-transparent hover:border-neutral-200',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-neutral-500">{compte.banque}</p>
                  <p className="font-semibold text-neutral-800 mt-0.5">{compte.nom}</p>
                  {compte.numeroCarte && <p className="text-xs text-neutral-400 mt-0.5 font-mono">{compte.numeroCarte}</p>}
                </div>
                <div className={cn(
                  'flex items-center justify-center rounded-full p-1.5 transition-colors',
                  selectedCompte?.id === compte.id ? 'bg-primary-50 text-primary-600' : 'bg-neutral-100 text-neutral-400',
                )}>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-xl font-bold text-primary-600 mt-3">{formatMontant(compte.solde)}</p>
            </button>
          ))}
        </div>
      )}

      {selectedCompte && (
        <div>
          <h2 className="text-base font-semibold text-neutral-700 mb-3">
            {t('mouvements.title', { compte: selectedCompte.nom })}
          </h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('mouvements.date')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('mouvements.libelle')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('mouvements.debit')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('mouvements.credit')}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('mouvements.rapproche')}</th>
                </tr>
              </thead>
              <tbody>
                {mouvLoading && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{tc('loading')}</td></tr>
                )}
                {!mouvLoading && mouvements.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{t('mouvements.empty')}</td></tr>
                )}
                {mouvements.map((m) => {
                  const isDebit = m.type === 'DEBIT' || toNum(m.debit) > 0;
                  const montant = toNum(m.montant ?? m.debit ?? m.credit);
                  return (
                    <tr key={m.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-default">
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">{formatDate(m.date)}</td>
                      <td className="px-4 py-3 text-neutral-800">{m.libelle}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-600 whitespace-nowrap">
                        {isDebit ? formatMontant(montant) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-600 whitespace-nowrap">
                        {!isDebit ? formatMontant(montant) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.rapproche
                          ? <span className="badge badge-success">{t('mouvements.statutRapproche')}</span>
                          : <span className="badge badge-neutral">{t('mouvements.statutEnAttente')}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('modal.title')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>{tc('cancel')}</button>
            <button
              className="btn-primary"
              disabled={createMouvement.isPending || !form.libelle || !form.montant}
              onClick={() => createMouvement.mutate(form)}
            >
              {createMouvement.isPending ? tc('saving') : tc('save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">{t('modal.compte')}</label>
            <select className="input w-full" value={form.compteId || selectedCompte?.id || ''} onChange={(e) => setForm((p) => ({ ...p, compteId: e.target.value }))}>
              {comptes.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.banque})</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('modal.date')}</label>
            <input type="date" className="input w-full" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">{t('modal.libelle')}</label>
            <input type="text" className="input w-full" placeholder={t('modal.libellePlaceholder')} value={form.libelle} onChange={(e) => setForm((p) => ({ ...p, libelle: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('modal.type')}</label>
              <select className="input w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="debit">{t('modal.typeDebit')}</option>
                <option value="credit">{t('modal.typeCredit')}</option>
              </select>
            </div>
            <div>
              <label className="label">{t('modal.montant')}</label>
              <input type="number" className="input w-full" placeholder={t('modal.montantPlaceholder')} value={form.montant} onChange={(e) => setForm((p) => ({ ...p, montant: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
