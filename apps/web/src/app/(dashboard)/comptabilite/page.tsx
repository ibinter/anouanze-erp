'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatMontant, formatDate, cn } from '@/lib/utils';

const TABS = [
  { id: 'plan', label: 'Plan comptable' },
  { id: 'journal', label: 'Journal' },
  { id: 'ecritures', label: 'Écritures' },
  { id: 'balance', label: 'Balance' },
];

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

  if (isLoading) return <div className="card p-6 text-center text-neutral-400 text-sm">Chargement…</div>;

  if (Object.keys(grouped).length === 0) {
    return <div className="card p-6 text-center text-neutral-400 text-sm">Plan comptable vide. Initialisez le plan SYCEBNL.</div>;
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
            <span className="font-medium text-neutral-800">Classe {cls}</span>
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
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Journal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Libellé</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Débit</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Crédit</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400 text-sm">Chargement…</td></tr>}
            {!isLoading && ecritures.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-400 text-sm">Aucune écriture.</td></tr>}
            {ecritures.map((e) => {
              const debit = e.montantDebit ?? e.lignes?.reduce((s, l) => s + (l.debit ?? 0), 0) ?? 0;
              const credit = e.montantCredit ?? e.lignes?.reduce((s, l) => s + (l.credit ?? 0), 0) ?? 0;
              return (
                <tr key={e.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-600">{formatDate(e.date ?? e.createdAt ?? '')}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-neutral font-mono">{getJournalCode(e)}</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-800">{e.libelle}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-800">{debit > 0 ? formatMontant(debit) : '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-800">{credit > 0 ? formatMontant(credit) : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {e.statut === 'VALIDE' || e.statut === 'valide'
                      ? <span className="badge badge-success">Validé</span>
                      : <span className="badge badge-warning">Brouillon</span>}
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
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Compte</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Libellé</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Débit cumulé</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Crédit cumulé</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Solde</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">Chargement…</td></tr>}
          {!isLoading && lignes.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">Aucune donnée pour l&apos;exercice {exercice}.</td></tr>}
          {lignes.map((ligne, i) => {
            const debit = ligne.debitCumul ?? ligne.totalDebit ?? 0;
            const credit = ligne.creditCumul ?? ligne.totalCredit ?? 0;
            const solde = ligne.solde ?? (debit - credit);
            return (
              <tr key={i} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 font-mono text-neutral-500">{ligne.compte ?? ligne.numero}</td>
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
  const [journal, setJournal] = useState('BQ');
  const [libelle, setLibelle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lignes, setLignes] = useState<LigneEcriture[]>([
    { compte: '', libelle: '', debit: '', credit: '' },
    { compte: '', libelle: '', debit: '', credit: '' },
  ]);
  const [error, setError] = useState('');

  const totalDebit = lignes.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lignes.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const equilibre = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = () => {
    if (!libelle.trim()) { setError('Le libellé est requis.'); return; }
    if (!equilibre) { setError('L\'écriture n\'est pas équilibrée (débit ≠ crédit).'); return; }
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onOpenChange={onClose} title="Nouvelle écriture comptable" size="xl"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSubmit}>Enregistrer</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Journal</label>
            <select className="input w-full" value={journal} onChange={(e) => setJournal(e.target.value)}>
              <option value="BQ">BQ – Banque</option>
              <option value="CA">CA – Caisse</option>
              <option value="AC">AC – Achats</option>
              <option value="VT">VT – Ventes</option>
              <option value="PA">PA – Paie</option>
              <option value="OD">OD – Opérations diverses</option>
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Libellé général</label>
            <input type="text" className="input w-full" placeholder="Libellé…" value={libelle} onChange={(e) => setLibelle(e.target.value)} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Lignes d&apos;écriture</label>
            <button type="button" className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1"
              onClick={() => setLignes((prev) => [...prev, { compte: '', libelle: '', debit: '', credit: '' }])}>
              <Plus className="w-3 h-3" /> Ajouter une ligne
            </button>
          </div>
          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500">Compte</th>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-neutral-500">Libellé</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500">Débit</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-neutral-500">Crédit</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-20" placeholder="Ex: 52" value={ligne.compte} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, compte: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-full" placeholder="Libellé" value={ligne.libelle} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, libelle: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-28 text-right" placeholder="0" value={ligne.debit} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, debit: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5"><input className="input text-sm py-1 w-28 text-right" placeholder="0" value={ligne.credit} onChange={(e) => setLignes((prev) => prev.map((l, idx) => idx === i ? { ...l, credit: e.target.value } : l))} /></td>
                    <td className="px-2 py-1.5">{lignes.length > 2 && <button type="button" onClick={() => setLignes((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">×</button>}</td>
                  </tr>
                ))}
                <tr className="bg-neutral-50 border-t border-neutral-200">
                  <td colSpan={2} className="px-3 py-2 text-xs font-semibold text-neutral-600">TOTAUX</td>
                  <td className="px-3 py-2 text-right text-xs font-mono font-semibold text-neutral-800">{formatMontant(totalDebit)}</td>
                  <td className="px-3 py-2 text-right text-xs font-mono font-semibold text-neutral-800">{formatMontant(totalCredit)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <div className={cn('mt-2 text-xs font-medium', equilibre ? 'text-green-600' : 'text-red-500')}>
            {equilibre ? '✓ Écriture équilibrée' : `⚠ Déséquilibre : ${formatMontant(Math.abs(totalDebit - totalCredit))}`}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}

export default function ComptabilitePage() {
  const [activeTab, setActiveTab] = useState('plan');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Comptabilité SYCEBNL</h1>
          <p className="text-sm text-neutral-500 mt-1">Plan comptable, journaux et balance</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouvelle écriture
        </button>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'plan' && <PlanComptable />}
        {activeTab === 'journal' && (
          <div className="card p-6 text-center text-neutral-500">
            <p className="text-sm">Sélectionnez un journal pour afficher les écritures.</p>
          </div>
        )}
        {activeTab === 'ecritures' && <TableauEcritures />}
        {activeTab === 'balance' && <Balance />}
      </div>

      <ModalNouvelleEcriture open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
