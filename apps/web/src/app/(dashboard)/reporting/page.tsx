'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BarChart2, Download, FileText } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ReportingCharts } from './ReportingCharts';
import { cn, toNum, formatMontant } from '@/lib/utils';

interface LigneFinanciere {
  libelle: string;
  montant: number;
}

interface LigneBilan {
  poste: string;
  montant: number;
}

const EXPORT_KEYS = [
  { key: 'rapportFinancier', icon: FileText, formats: ['PDF', 'Excel'] },
  { key: 'bilanComptable', icon: FileText, formats: ['PDF', 'Excel'] },
  { key: 'grandLivre', icon: FileText, formats: ['PDF', 'Excel'] },
  { key: 'balanceGenerale', icon: FileText, formats: ['PDF', 'Excel'] },
  { key: 'rapportBailleur', icon: FileText, formats: ['PDF'] },
] as const;

const TAB_IDS = ['bi', 'financier', 'bilan', 'exports'] as const;

export default function ReportingPage() {
  const t = useTranslations('outils.reporting');
  const [tab, setTab] = useState('bi');
  const exercice = new Date().getFullYear();
  const tabs = TAB_IDS.map((id) => ({ id, label: t(`onglets.${id}` as never) }));

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
  const totalProduits = toNum(rapportData?.totalProduits ?? produits.reduce((s: number, r: LigneFinanciere) => s + toNum(r.montant), 0));
  const totalCharges = toNum(rapportData?.totalCharges ?? charges.reduce((s: number, r: LigneFinanciere) => s + toNum(r.montant), 0));
  const resultat = toNum(rapportData?.resultat ?? (totalProduits - totalCharges));

  const actif: LigneBilan[] = bilanData?.actif ?? [];
  const passif: LigneBilan[] = bilanData?.passif ?? [];
  const totalActif = toNum(bilanData?.totalActif ?? actif.reduce((s: number, r: LigneBilan) => s + toNum(r.montant), 0));
  const totalPassif = toNum(bilanData?.totalPassif ?? passif.reduce((s: number, r: LigneBilan) => s + toNum(r.montant), 0));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <BarChart2 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500">{t('sousTitre', { exercice: String(exercice) })}</p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === 'bi' && <ReportingCharts />}

      {tab === 'financier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">{t('produits')}</h3>
            {rapportLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">{t('chargement')}</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {produits.map((r) => (
                    <tr key={r.libelle} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.libelle}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{formatMontant(r.montant)}</td>
                    </tr>
                  ))}
                  {produits.length === 0 && (
                    <tr><td colSpan={2} className="py-4 text-center text-neutral-400">{t('aucuneDonnee')}</td></tr>
                  )}
                  <tr className="bg-neutral-50">
                    <td className="py-2.5 font-semibold text-neutral-800">{t('totalProduits')}</td>
                    <td className="py-2.5 text-right font-bold text-primary-600">{formatMontant(totalProduits)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">{t('charges')}</h3>
            {rapportLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">{t('chargement')}</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {charges.map((r) => (
                    <tr key={r.libelle} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.libelle}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{formatMontant(r.montant)}</td>
                    </tr>
                  ))}
                  {charges.length === 0 && (
                    <tr><td colSpan={2} className="py-4 text-center text-neutral-400">{t('aucuneDonnee')}</td></tr>
                  )}
                  <tr className="bg-neutral-50">
                    <td className="py-2.5 font-semibold text-neutral-800">{t('totalCharges')}</td>
                    <td className="py-2.5 text-right font-bold text-red-500">{formatMontant(totalCharges)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {!rapportLoading && (
            <div className="lg:col-span-2">
              <div className={cn('card flex items-center justify-between', resultat >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50')}>
                <div>
                  <p className="text-sm font-medium text-neutral-600">{t('resultatNet', { exercice: String(exercice) })}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{t('resultatFormule')}</p>
                </div>
                <p className={cn('text-2xl font-bold', resultat >= 0 ? 'text-green-700' : 'text-red-600')}>
                  {resultat >= 0 ? '+' : ''}{formatMontant(resultat)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'bilan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">{t('actif')}</h3>
            {bilanLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">{t('chargement')}</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {actif.map((r) => (
                    <tr key={r.poste} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.poste}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{formatMontant(r.montant)}</td>
                    </tr>
                  ))}
                  {actif.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-neutral-400">{t('aucuneDonnee')}</td></tr>}
                  <tr className="bg-primary-50">
                    <td className="py-2.5 font-bold text-primary-700">{t('totalActif')}</td>
                    <td className="py-2.5 text-right font-bold text-primary-700">{formatMontant(totalActif)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div className="card space-y-3">
            <h3 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">{t('passif')}</h3>
            {bilanLoading ? (
              <div className="text-sm text-neutral-400 text-center py-4">{t('chargement')}</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {passif.map((r) => (
                    <tr key={r.poste} className="border-b border-neutral-50">
                      <td className="py-2 text-neutral-600">{r.poste}</td>
                      <td className="py-2 text-right font-medium text-neutral-800">{formatMontant(r.montant)}</td>
                    </tr>
                  ))}
                  {passif.length === 0 && <tr><td colSpan={2} className="py-4 text-center text-neutral-400">{t('aucuneDonnee')}</td></tr>}
                  <tr className="bg-primary-50">
                    <td className="py-2.5 font-bold text-primary-700">{t('totalPassif')}</td>
                    <td className="py-2.5 text-right font-bold text-primary-700">{formatMontant(totalPassif)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'exports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {EXPORT_KEYS.map((ex) => (
            <div key={ex.key} className="card space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-600">
                  <ex.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{t(`exports.${ex.key}` as never)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{t(`exports.${ex.key}Desc` as never)}</p>
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
