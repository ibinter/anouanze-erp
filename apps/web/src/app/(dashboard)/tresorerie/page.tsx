'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, TrendingUp, Landmark } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatMontant, formatDate, cn } from '@/lib/utils';

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
  const [selectedCompteId, setSelectedCompteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ libelle: '', date: new Date().toISOString().slice(0, 10), type: 'debit', montant: '', compteId: '' });
  const [error, setError] = useState('');
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
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur'),
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
  const totalTresorerie = comptes.reduce((s, c) => s + (c.solde ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Trésorerie</h1>
          <p className="text-sm text-neutral-500 mt-1">Situation des comptes et flux de trésorerie</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouveau mouvement
        </button>
      </div>

      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">Trésorerie totale</p>
          <p className="text-3xl font-bold text-neutral-800 mt-1">{comptesLoading ? '—' : formatMontant(totalTresorerie)}</p>
        </div>
        <div className="p-3 rounded-xl bg-primary-50">
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
              className={cn(
                'card p-4 text-left transition-all border-2',
                selectedCompte?.id === compte.id ? 'border-primary-600' : 'border-transparent hover:border-neutral-200',
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-neutral-500">{compte.banque}</p>
                  <p className="font-semibold text-neutral-800 mt-0.5">{compte.nom}</p>
                  {compte.numeroCarte && <p className="text-xs text-neutral-400 mt-0.5 font-mono">{compte.numeroCarte}</p>}
                </div>
                <div className="flex items-center gap-0.5 text-xs font-medium text-neutral-400">
                  <TrendingUp className="w-3 h-3" />
                </div>
              </div>
              <p className="text-xl font-bold text-primary-600 mt-3">{formatMontant(compte.solde ?? 0)}</p>
            </button>
          ))}
        </div>
      )}

      {selectedCompte && (
        <div>
          <h2 className="text-base font-semibold text-neutral-700 mb-3">
            Mouvements — {selectedCompte.nom}
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Libellé</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Débit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Crédit</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rapproché</th>
                </tr>
              </thead>
              <tbody>
                {mouvLoading && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">Chargement…</td></tr>
                )}
                {!mouvLoading && mouvements.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">Aucun mouvement</td></tr>
                )}
                {mouvements.map((m) => {
                  const isDebit = m.type === 'DEBIT' || (m.debit ?? 0) > 0;
                  const montant = m.montant ?? m.debit ?? m.credit ?? 0;
                  return (
                    <tr key={m.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-neutral-600">{formatDate(m.date)}</td>
                      <td className="px-4 py-3 text-neutral-800">{m.libelle}</td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        {isDebit ? formatMontant(montant) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-green-600">
                        {!isDebit ? formatMontant(montant) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={m.rapproche ?? false} readOnly className="w-4 h-4 accent-primary-600" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nouveau mouvement"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createMouvement.isPending || !form.libelle || !form.montant}
              onClick={() => createMouvement.mutate(form)}
            >
              {createMouvement.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Compte</label>
            <select className="input w-full" value={form.compteId || selectedCompte?.id || ''} onChange={(e) => setForm((p) => ({ ...p, compteId: e.target.value }))}>
              {comptes.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.banque})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-full" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <label className="label">Libellé</label>
            <input type="text" className="input w-full" placeholder="Description du mouvement" value={form.libelle} onChange={(e) => setForm((p) => ({ ...p, libelle: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="debit">Débit (sortie)</option>
                <option value="credit">Crédit (entrée)</option>
              </select>
            </div>
            <div>
              <label className="label">Montant (XOF)</label>
              <input type="number" className="input w-full" placeholder="0" value={form.montant} onChange={(e) => setForm((p) => ({ ...p, montant: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
