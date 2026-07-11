'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BarChart2, Download, FileText } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ReportingCharts } from './ReportingCharts';
import { cn } from '@/lib/utils';

interface LigneFinanciere {
  libelle: string;
  montant: number;
}

interface LigneBilan {
  poste: string;
  montant: number;
}

const EXPORTS = [
  { label: 'Rapport financier', description: 'Produits, charges et résultat de l\'exercice', icon: FileText, formats: ['PDF', 'Excel'] },
  { label: 'Bilan comptable', description: 'Actif et passif de l\'organisation', icon: FileText, formats: ['PDF', 'Excel'] },
  { label: 'Grand livre', description: 'Détail de toutes les écritures comptables', icon: FileText, formats: ['PDF', 'Excel'] },
  { label: 'Balance générale', description: 'Soldes de tous les comptes', icon: FileText, formats: ['PDF', 'Excel'] },
  { label: 'Rapport bailleur', description: 'Rapport d\'utilisation des fonds par bailleur', icon: FileText, formats: ['PDF'] },
];

function fmtXOF(n: number) {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(n);
}

const TABS = [
  { id: 'bi', label: 'Tableau de bord BI' },
  { id: 'financier', label: 'Rapport financier' },
  { id: 'bilan', label: 'Bilan' },
  { id: 'exports', label: 'Exports' },
];

export default function ReportingPage() {
  const [tab, setTab] = useState('bi');
  const exercice = new Date().getFullYear();

  const { data: rapportData, isLoading: rapportLoading } = useQuery({
    queryKey: ['reporting-rapport-financier', exercice],
    queryFn: async () => {
      const { data } = await api.get('/reporting/rapport-financier', { params: { exercice } });
      return data;
    },
    enabled: tab === 'financier',
  });

  const { data: bilanData, isLoading: bilanLoading } = useQuery({
    queryKey: ['reporting-bilan', exercice],
    queryFn: async () => {
      const { data } = await api.get('/reporting/bilan', { params: { exercice } });
      return data;
    },
    enabled: tab === 'bilan',
  });

  const produits: LigneFinanciere[] = rapportData?.produits ?? [];
  const charges: LigneFinanciere[] = rapportData?.charges ?? [];
  const totalProduits = rapportData?.totalProduits ?? produits.reduce((s: number, r: LigneFinanciere) => s + r.montant, 0);
  const totalCharges = rapportData?.totalCharges ?? charges.reduce((s: number, r: LigneFinanciere) => s + r.montant, 0);
  const resultat = rapportData?.resultat ?? (totalProduits - totalCharges);

  const actif: LigneBilan[] = bilanData?.actif ?? [];
  const passif: LigneBilan[] = bilanData?.passif ?? [];
  const totalActif = bilanData?.totalActif ?? actif.reduce((s: number, r: LigneBilan) => s + r.montant, 0);
  const totalPassif = bilanData?.totalPassif ?? passif.reduce((s: number, r: LigneBilan) => s + r.montant, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <BarChart2 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Rapports & BI</h1>
          <p className="text-sm text-neutral-500">Analyses financières et exports — Exercice {exercice}</p>
        </div>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'bi' && <ReportingCharts />}

      {tab === 'financier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Produits</h3>
            {rapportLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">Chargement…</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {produits.map((r) => (
                    <tr key={r.libelle} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.libelle}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{fmtXOF(r.montant)}</td>
                    </tr>
                  ))}
                  {produits.length === 0 && (
                    <tr><td colSpan={2} className="py-4 text-center text-neutral-400">Aucune donnée</td></tr>
                  )}
                  <tr className="bg-neutral-50">
                    <td className="py-2.5 font-semibold text-neutral-800">Total produits</td>
                    <td className="py-2.5 text-right font-bold text-primary-600">{fmtXOF(totalProduits)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Charges</h3>
            {rapportLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">Chargement…</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {charges.map((r) => (
                    <tr key={r.libelle} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.libelle}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{fmtXOF(r.montant)}</td>
                    </tr>
                  ))}
                  {charges.length === 0 && (
                    <tr><td colSpan={2} className="py-4 text-center text-neutral-400">Aucune donnée</td></tr>
                  )}
                  <tr className="bg-neutral-50">
                    <td className="py-2.5 font-semibold text-neutral-800">Total charges</td>
                    <td className="py-2.5 text-right font-bold text-red-500">{fmtXOF(totalCharges)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {!rapportLoading && (
            <div className="lg:col-span-2">
              <div className={cn('card flex items-center justify-between', resultat >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
                <div>
                  <p className="text-sm font-medium text-neutral-600">Résultat net de l&apos;exercice {exercice}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Total produits − Total charges</p>
                </div>
                <p className={cn('text-2xl font-bold', resultat >= 0 ? 'text-green-700' : 'text-red-600')}>
                  {resultat >= 0 ? '+' : ''}{fmtXOF(resultat)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Actif</h3>
            {bilanLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">Chargement…</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {actif.map((r) => (
                    <tr key={r.poste} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.poste}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{fmtXOF(r.montant)}</td>
                    </tr>
                  ))}
                  {actif.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-neutral-400">Aucune donnée</td></tr>}
                  <tr className="bg-primary-50">
                    <td className="py-2.5 font-bold text-primary-700">Total Actif</td>
                    <td className="py-2.5 text-right font-bold text-primary-700">{fmtXOF(totalActif)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">Passif</h3>
            {bilanLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">Chargement…</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {passif.map((r) => (
                    <tr key={r.poste} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.poste}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{fmtXOF(r.montant)}</td>
                    </tr>
                  ))}
                  {passif.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-neutral-400">Aucune donnée</td></tr>}
                  <tr className="bg-primary-50">
                    <td className="py-2.5 font-bold text-primary-700">Total Passif</td>
                    <td className="py-2.5 text-right font-bold text-primary-700">{fmtXOF(totalPassif)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXPORTS.map((ex) => (
            <div key={ex.label} className="card space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600">
                  <ex.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{ex.label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{ex.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {ex.formats.map((fmt) => (
                  <button key={fmt} className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                    <Download className="w-3.5 h-3.5" />
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
