'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatMontant, formatDate } from '@/lib/utils';
import {
  Wallet, Plus, CheckCircle, Clock, ChevronDown, ChevronUp, X,
  TrendingUp, AlertTriangle, Loader2, FileText as FilePdf,
} from 'lucide-react';
import { exportDocument, budgetExportDef } from '@/lib/pdf-engine';

interface LigneBudget {
  id: string;
  categorie: string;
  description?: string;
  montantPrevu: number;
  montantRealise: number;
  devise: string;
}

interface Budget {
  id: string;
  nom: string;
  exercice: number;
  statut: 'BROUILLON' | 'APPROUVE';
  dateApprobation?: string;
  createdAt: string;
  projet?: { id: string; nom: string; code: string };
  lignes: LigneBudget[];
}

function StatutBadge({ statut }: { statut: Budget['statut'] }) {
  if (statut === 'APPROUVE')
    return (
      <span className="badge bg-primary-50 text-primary-700 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Approuvé
      </span>
    );
  return (
    <span className="badge bg-neutral-100 text-neutral-600 flex items-center gap-1">
      <Clock className="w-3 h-3" /> Brouillon
    </span>
  );
}

function BudgetCard({ budget, onApprouver }: { budget: Budget; onApprouver: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const montantTotal = budget.lignes.reduce((s, l) => s + Number(l.montantPrevu), 0);
  const realise = budget.lignes.reduce((s, l) => s + Number(l.montantRealise ?? 0), 0);
  const taux = montantTotal > 0 ? Math.round((realise / montantTotal) * 100) : 0;

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-800">{budget.nom}</h3>
              <StatutBadge statut={budget.statut} />
            </div>
            <p className="text-sm text-neutral-500">
              Exercice {budget.exercice}
              {budget.projet && ` · Projet : ${budget.projet.code} — ${budget.projet.nom}`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-primary-600">{formatMontant(montantTotal)}</p>
            <p className="text-xs text-neutral-400">Budget total</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>Exécution budgétaire</span>
            <span className="font-medium text-neutral-700">{taux}%</span>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${taux >= 100 ? 'bg-red-400' : taux >= 80 ? 'bg-amber-400' : 'bg-primary-500'}`}
              style={{ width: `${Math.min(taux, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>Réalisé : {formatMontant(realise)}</span>
            <span>Écart : {formatMontant(montantTotal - realise)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-sm text-primary-600 hover:underline font-medium"
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {open ? 'Masquer les lignes' : `Voir les ${budget.lignes.length} ligne(s)`}
          </button>
          {budget.statut === 'BROUILLON' && (
            <button
              onClick={() => onApprouver(budget.id)}
              className="btn-primary text-xs py-1.5 px-3"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Approuver
            </button>
          )}
          {budget.statut === 'APPROUVE' && budget.dateApprobation && (
            <span className="text-xs text-neutral-400">
              Approuvé le {formatDate(budget.dateApprobation)}
            </span>
          )}
        </div>
      </div>

      {/* Lignes budgétaires */}
      {open && budget.lignes.length > 0 && (
        <div className="border-t border-neutral-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Catégorie</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Prévu</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Réalisé</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {budget.lignes.map((ligne) => {
                const ecart = Number(ligne.montantPrevu) - Number(ligne.montantRealise ?? 0);
                return (
                  <tr key={ligne.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-2.5 font-medium text-neutral-700">{ligne.categorie}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{ligne.description ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatMontant(Number(ligne.montantPrevu))}</td>
                    <td className="px-4 py-2.5 text-right text-neutral-500">{formatMontant(Number(ligne.montantRealise ?? 0))}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${ecart < 0 ? 'text-red-600' : 'text-primary-600'}`}>
                      {ecart < 0 ? '-' : '+'}{formatMontant(Math.abs(ecart))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-neutral-50 border-t border-neutral-200">
              <tr>
                <td colSpan={2} className="px-4 py-2.5 font-semibold text-neutral-700 text-sm">TOTAL</td>
                <td className="px-4 py-2.5 text-right font-bold text-neutral-800">{formatMontant(montantTotal)}</td>
                <td className="px-4 py-2.5 text-right font-bold text-neutral-800">
                  {formatMontant(budget.lignes.reduce((s, l) => s + Number(l.montantRealise ?? 0), 0))}
                </td>
                <td className={`px-4 py-2.5 text-right font-bold ${montantTotal - budget.lignes.reduce((s, l) => s + Number(l.montantRealise ?? 0), 0) < 0 ? 'text-red-600' : 'text-primary-600'}`}>
                  {formatMontant(Math.abs(montantTotal - budget.lignes.reduce((s, l) => s + Number(l.montantRealise ?? 0), 0)))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

interface BudgetFormData {
  nom: string;
  exercice: string;
  lignes: { categorie: string; description: string; montantPrevu: string }[];
}

function NouveauBudgetModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const annee = new Date().getFullYear();
  const [form, setForm] = useState<BudgetFormData>({
    nom: `Budget ${annee}`,
    exercice: String(annee),
    lignes: [{ categorie: '', description: '', montantPrevu: '' }],
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose();
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const addLigne = () =>
    setForm({ ...form, lignes: [...form.lignes, { categorie: '', description: '', montantPrevu: '' }] });

  const removeLigne = (i: number) =>
    setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });

  const updateLigne = (i: number, field: keyof BudgetFormData['lignes'][0], value: string) => {
    const lignes = [...form.lignes];
    lignes[i] = { ...lignes[i], [field]: value };
    setForm({ ...form, lignes });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { setError('Le nom est obligatoire'); return; }
    const lignes = form.lignes.filter((l) => l.categorie.trim() && l.montantPrevu);
    if (!lignes.length) { setError('Ajoutez au moins une ligne budgétaire'); return; }
    setError('');
    mutation.mutate({
      nom: form.nom.trim(),
      exercice: Number(form.exercice),
      lignes: lignes.map((l) => ({
        categorie: l.categorie.trim(),
        description: l.description.trim() || undefined,
        montantPrevu: Number(l.montantPrevu),
        devise: 'XOF',
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-neutral-800">Nouveau budget</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nom du budget *</label>
              <input
                className="input w-full"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Exercice *</label>
              <input
                className="input w-full"
                type="number"
                min={2020}
                max={2099}
                value={form.exercice}
                onChange={(e) => setForm({ ...form, exercice: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Lignes budgétaires */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-neutral-600">Lignes budgétaires *</label>
              <button type="button" onClick={addLigne} className="text-xs text-primary-600 hover:underline font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Ajouter une ligne
              </button>
            </div>
            <div className="space-y-2">
              {form.lignes.map((ligne, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start p-3 bg-neutral-50 rounded-lg">
                  <div className="col-span-4">
                    <input
                      className="input w-full text-xs"
                      placeholder="Catégorie *"
                      value={ligne.categorie}
                      onChange={(e) => updateLigne(i, 'categorie', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      className="input w-full text-xs"
                      placeholder="Description"
                      value={ligne.description}
                      onChange={(e) => updateLigne(i, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      className="input w-full text-xs"
                      type="number"
                      placeholder="Montant (XOF)"
                      value={ligne.montantPrevu}
                      onChange={(e) => updateLigne(i, 'montantPrevu', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center pt-1">
                    {form.lignes.length > 1 && (
                      <button type="button" onClick={() => removeLigne(i)} className="text-neutral-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
              ) : (
                <><Plus className="w-4 h-4" /> Créer le budget</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const [showModal, setShowModal] = useState(false);
  const [exercice, setExercice] = useState<string>(String(new Date().getFullYear()));
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets', exercice],
    queryFn: async () => {
      const { data } = await api.get('/budgets', { params: { exercice: exercice || undefined } });
      return data;
    },
  });

  const approuverMutation = useMutation({
    mutationFn: (id: string) => api.post(`/budgets/${id}/approuver`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  const totalPrevu = budgets.reduce(
    (s, b) => s + b.lignes.reduce((ls, l) => ls + Number(l.montantPrevu), 0),
    0,
  );
  const budgetsApprouves = budgets.filter((b) => b.statut === 'APPROUVE').length;
  const alertes = budgets.filter((b) => {
    const prevu = b.lignes.reduce((s, l) => s + Number(l.montantPrevu), 0);
    const realise = b.lignes.reduce((s, l) => s + Number(l.montantRealise ?? 0), 0);
    return prevu > 0 && realise / prevu >= 0.9;
  }).length;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const rows = budgets.flatMap((b) =>
        b.lignes.map((l) => ({
          budget: b.nom,
          exercice: String(b.exercice),
          statut: b.statut === 'APPROUVE' ? 'Approuvé' : 'Brouillon',
          categorie: l.categorie,
          prevu: Number(l.montantPrevu),
          realise: Number(l.montantRealise ?? 0),
          ecart: Number(l.montantRealise ?? 0) - Number(l.montantPrevu),
        })),
      );
      const def = budgetExportDef({
        periode: `Exercice ${exercice}`,
        filtersSummary: `${budgets.length} budget(s) — Prévu total : ${totalPrevu.toLocaleString('fr-CI')} FCFA`,
      });
      await exportDocument(def, rows, 'pdf');
    } finally { setExporting(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showModal && <NouveauBudgetModal onClose={() => setShowModal(false)} />}

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Budgets</h1>
          <p className="text-sm text-neutral-500 mt-1">Planification et suivi budgétaire par exercice</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} disabled={exporting || budgets.length === 0} className="btn-secondary flex items-center gap-2 text-sm">
            <FilePdf className="w-4 h-4" />
            {exporting ? 'Export…' : 'PDF Rapport'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouveau budget
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Budget total prévu</p>
            <p className="text-xl font-bold text-primary-600">{formatMontant(totalPrevu)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Budgets approuvés</p>
            <p className="text-xl font-bold text-green-600">{budgetsApprouves} / {budgets.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className={`p-2 rounded-lg ${alertes > 0 ? 'bg-amber-50' : 'bg-neutral-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${alertes > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Budgets à surveiller</p>
            <p className={`text-xl font-bold ${alertes > 0 ? 'text-amber-600' : 'text-neutral-600'}`}>{alertes}</p>
          </div>
        </div>
      </div>

      {/* Filtre exercice */}
      <div className="flex items-center gap-3">
        <TrendingUp className="w-4 h-4 text-neutral-400" />
        <label className="text-sm text-neutral-600 font-medium">Exercice :</label>
        <select
          className="input w-32 text-sm"
          value={exercice}
          onChange={(e) => setExercice(e.target.value)}
        >
          <option value="">Tous</option>
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>

      {/* Liste des budgets */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-neutral-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Chargement des budgets…
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <Wallet className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 font-medium">Aucun budget pour cet exercice</p>
          <p className="text-sm text-neutral-400 mt-1">Créez votre premier budget pour commencer la planification</p>
          <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
            <Plus className="w-4 h-4" /> Créer un budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onApprouver={(id) => approuverMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
