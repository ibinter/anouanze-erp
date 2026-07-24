'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Tabs } from '@/components/ui/Tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit2, Plus, ClipboardList, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Projet { id: string; nom: string; }
interface Indicateur {
  id: string;
  nom: string;
  unite?: string;
  valeurCible?: number;
  valeurRealisee?: number;
}
interface Collecte {
  id: string;
  indicateur?: { nom?: string };
  valeur?: number;
  dateCollecte?: string;
  agent?: string;
}
interface CadreLogique {
  intrants?: string[];
  activites?: string[];
  extrants?: string[];
  effets?: string[];
}

/** Identifiants d'onglets — valeurs métier, les libellés viennent de l'i18n. */
const TAB_IDS = ['cadre', 'indicateurs', 'collecte', 'rapport'] as const;

/** Colonnes du cadre logique : clé de donnée + couleur (le libellé est traduit). */
const CADRE_COLONNES = [
  { key: 'intrants', color: 'border-t-blue-500' },
  { key: 'activites', color: 'border-t-accent-400' },
  { key: 'extrants', color: 'border-t-primary-600' },
  { key: 'effets', color: 'border-t-emerald-500' },
] as const;

export default function MealPage() {
  const t = useTranslations('activites.meal');
  const locale = useLocale();
  const [projetId, setProjetId] = useState('');
  const [tab, setTab] = useState('cadre');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndicateur, setSelectedIndicateur] = useState<Indicateur | null>(null);
  const [updateForm, setUpdateForm] = useState({ valeur: '', date: new Date().toISOString().split('T')[0], commentaire: '' });
  const [collecteForm, setCollecteForm] = useState({ indicateurId: '', valeur: '', date: new Date().toISOString().split('T')[0], agent: '' });

  const queryClient = useQueryClient();

  const { data: projets = [], isLoading: projetsLoading } = useQuery<Projet[]>({
    queryKey: ['projets-liste'],
    queryFn: async () => {
      const { data } = await api.get('/projets', { params: { limit: 100 } });
      return data?.data ?? data ?? [];
    },
    onSuccess: (data: Projet[]) => {
      if (data.length > 0 && !projetId) setProjetId(data[0].id);
    },
  } as any);

  const { data: cadreLogique, isLoading: cadreLoading } = useQuery<CadreLogique>({
    queryKey: ['meal-cadre', projetId],
    queryFn: async () => {
      const { data } = await api.get(`/meal/projets/${projetId}/cadre-logique`);
      return data;
    },
    enabled: !!projetId && tab === 'cadre',
  });

  const { data: indicateurs = [], isLoading: indLoading } = useQuery<Indicateur[]>({
    queryKey: ['meal-indicateurs', projetId],
    queryFn: async () => {
      const { data } = await api.get(`/meal/projets/${projetId}/indicateurs`);
      return data ?? [];
    },
    enabled: !!projetId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ indicateurId, body }: { indicateurId: string; body: object }) =>
      api.patch(`/meal/projets/${projetId}/indicateurs/${indicateurId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-indicateurs', projetId] });
      setModalOpen(false);
      toast.success(t('toasts.indicateurMaj'));
    },
    onError: () => toast.error(t('toasts.erreurMaj')),
  });

  const collecteMutation = useMutation({
    mutationFn: ({ indicateurId, body }: { indicateurId: string; body: object }) =>
      api.post(`/meal/projets/${projetId}/indicateurs/${indicateurId}/collectes`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-collectes', projetId, collecteForm.indicateurId] });
      setCollecteForm({ indicateurId: '', valeur: '', date: new Date().toISOString().split('T')[0], agent: '' });
      toast.success(t('toasts.collecteOk'));
    },
    onError: () => toast.error(t('toasts.erreurCollecte')),
  });

  const { data: collectes = [], isLoading: collectesLoading } = useQuery<Collecte[]>({
    queryKey: ['meal-collectes', projetId, collecteForm.indicateurId],
    queryFn: async () => {
      if (!collecteForm.indicateurId) {
        // Fetch all collectes for first indicateur if none selected
        const firstInd = indicateurs[0];
        if (!firstInd) return [];
        const { data } = await api.get(`/meal/projets/${projetId}/indicateurs/${firstInd.id}/collectes`);
        return data ?? [];
      }
      const { data } = await api.get(`/meal/projets/${projetId}/indicateurs/${collecteForm.indicateurId}/collectes`);
      return data ?? [];
    },
    enabled: !!projetId && tab === 'collecte' && indicateurs.length > 0,
  });

  function openModal(ind: Indicateur) {
    setSelectedIndicateur(ind);
    setUpdateForm({ valeur: String(ind.valeurRealisee ?? ''), date: new Date().toISOString().split('T')[0], commentaire: '' });
    setModalOpen(true);
  }

  function handleUpdate() {
    if (!selectedIndicateur || !updateForm.valeur) return;
    updateMutation.mutate({
      indicateurId: selectedIndicateur.id,
      body: { valeurRealisee: Number(updateForm.valeur), dateCollecte: updateForm.date, commentaire: updateForm.commentaire || undefined },
    });
  }

  function handleCollecte() {
    if (!collecteForm.indicateurId || !collecteForm.valeur) {
      toast.error(t('toasts.champsRequis'));
      return;
    }
    collecteMutation.mutate({
      indicateurId: collecteForm.indicateurId,
      body: { valeur: Number(collecteForm.valeur), dateCollecte: collecteForm.date, agent: collecteForm.agent || undefined },
    });
  }

  const cadre = cadreLogique ?? { intrants: [], activites: [], extrants: [], effets: [] };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('sousTitre')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="label text-sm">{t('projet')}</label>
          {projetsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          ) : (
            <select
              value={projetId}
              onChange={(e) => setProjetId(e.target.value)}
              className="input w-64"
            >
              {projets.length === 0 && <option value="">{t('aucunProjet')}</option>}
              {projets.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <Tabs
        tabs={TAB_IDS.map((id) => ({ id, label: t(`onglets.${id}`) }))}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === 'cadre' && (
        cadreLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('cadre.chargement')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {CADRE_COLONNES.map((col) => {
              const items = (cadre as any)[col.key] ?? [];
              return (
                <div key={col.key} className={`card border-t-4 ${col.color} space-y-3`}>
                  <h3 className="font-semibold text-neutral-800">{t(`cadre.${col.key}`)}</h3>
                  {items.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">{t('cadre.nonRenseigne')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}

      {tab === 'indicateurs' && (
        indLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('indicateurs.chargement')}
          </div>
        ) : indicateurs.length === 0 ? (
          <div className="card p-12 text-center text-neutral-400 text-sm">
            {t('indicateurs.vide')}
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {(['colIndicateur', 'colUnite', 'colCible', 'colRealise', 'colTaux', 'colAction'] as const).map((k) => (
                    <th key={k} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t(`indicateurs.${k}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {indicateurs.map((ind) => {
                  const cible = ind.valeurCible ?? 0;
                  const realise = ind.valeurRealisee ?? 0;
                  const taux = cible > 0 ? Math.round((realise / cible) * 100) : 0;
                  return (
                    <tr key={ind.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium text-neutral-800">{ind.nom}</td>
                      <td className="px-4 py-3 text-neutral-500">{ind.unite ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-700">{cible.toLocaleString(locale)}</td>
                      <td className="px-4 py-3 text-neutral-700">{realise.toLocaleString(locale)}</td>
                      <td className="px-4 py-3 w-48">
                        <ProgressBar value={taux} couleur="auto" />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal(ind)}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          {t('indicateurs.mettreAJour')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'collecte' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-neutral-800">{t('collecte.nouvelleSaisie')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('collecte.indicateur')}</label>
                <select
                  className="input w-full"
                  value={collecteForm.indicateurId}
                  onChange={(e) => setCollecteForm({ ...collecteForm, indicateurId: e.target.value })}
                >
                  <option value="">{t('collecte.selectionner')}</option>
                  {indicateurs.map((ind) => (
                    <option key={ind.id} value={ind.id}>{ind.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t('collecte.valeur')}</label>
                <input
                  type="number"
                  className="input w-full"
                  value={collecteForm.valeur}
                  onChange={(e) => setCollecteForm({ ...collecteForm, valeur: e.target.value })}
                  placeholder={t('collecte.valeurPlaceholder')}
                />
              </div>
              <div>
                <label className="label">{t('collecte.date')}</label>
                <input
                  type="date"
                  className="input w-full"
                  value={collecteForm.date}
                  onChange={(e) => setCollecteForm({ ...collecteForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">{t('collecte.agent')}</label>
                <input
                  type="text"
                  className="input w-full"
                  value={collecteForm.agent}
                  onChange={(e) => setCollecteForm({ ...collecteForm, agent: e.target.value })}
                  placeholder={t('collecte.agentPlaceholder')}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                className="btn-primary"
                onClick={handleCollecte}
                disabled={collecteMutation.isPending}
              >
                {collecteMutation.isPending ? t('collecte.enregistrement') : t('collecte.enregistrer')}
              </button>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-sm text-neutral-800">{t('collecte.historique')}</span>
            </div>
            {collectesLoading ? (
              <div className="py-8 flex justify-center text-neutral-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : collectes.length === 0 ? (
              <p className="px-4 py-6 text-sm text-neutral-400 text-center">{t('collecte.vide')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {(['colIndicateur', 'colValeur', 'colDate', 'colAgent'] as const).map((k) => (
                      <th key={k} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t(`collecte.${k}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {collectes.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-700">{c.indicateur?.nom ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-neutral-800">{c.valeur?.toLocaleString(locale) ?? '—'}</td>
                      <td className="px-4 py-3 text-neutral-500">{c.dateCollecte ? new Date(c.dateCollecte).toLocaleDateString(locale) : '—'}</td>
                      <td className="px-4 py-3 text-neutral-600">{c.agent ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'rapport' && (
        <div className="space-y-6">
          {indLoading ? (
            <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : (
            <>
              <div className="card space-y-4">
                <h2 className="font-semibold text-neutral-800">
                  {t('rapport.titre', {
                    projet: projets.find((p) => p.id === projetId)?.nom ?? t('rapport.projetParDefaut'),
                  })}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {indicateurs.slice(0, 4).map((ind) => {
                    const taux = ind.valeurCible && ind.valeurCible > 0
                      ? Math.round(((ind.valeurRealisee ?? 0) / ind.valeurCible) * 100)
                      : 0;
                    return (
                      <div key={ind.id} className="stat-card text-center">
                        <p className="text-xs text-neutral-500 mb-1 truncate">{ind.nom}</p>
                        <p className="text-2xl font-bold text-primary-600">{taux}%</p>
                        <p className="text-xs text-neutral-400">{ind.valeurRealisee ?? 0} / {ind.valeurCible ?? 0}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {indicateurs.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-neutral-800 mb-4">{t('rapport.tauxAtteinte')}</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={indicateurs.map((ind) => ({
                        name: ind.nom.length > 20 ? ind.nom.slice(0, 20) + '…' : ind.nom,
                        taux: ind.valeurCible && ind.valeurCible > 0
                          ? Math.round(((ind.valeurRealisee ?? 0) / ind.valeurCible) * 100)
                          : 0,
                      }))}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v}%`, t('rapport.taux')]} />
                      <Bar dataKey="taux" fill="#146C43" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('modal.titre', { indicateur: selectedIndicateur?.nom ?? '' })}
        size="sm"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">{t('modal.annuler')}</button>
            <button onClick={handleUpdate} disabled={updateMutation.isPending} className="btn-primary">
              {updateMutation.isPending ? t('modal.enregistrement') : t('modal.enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t('modal.valeur')}</label>
            <input
              type="number"
              className="input w-full"
              placeholder={t('modal.ciblePlaceholder', { cible: String(selectedIndicateur?.valeurCible ?? '') })}
              value={updateForm.valeur}
              onChange={(e) => setUpdateForm({ ...updateForm, valeur: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('modal.date')}</label>
            <input
              type="date"
              className="input w-full"
              value={updateForm.date}
              onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('modal.commentaire')}</label>
            <textarea
              className="input w-full resize-none"
              rows={3}
              placeholder={t('modal.commentairePlaceholder')}
              value={updateForm.commentaire}
              onChange={(e) => setUpdateForm({ ...updateForm, commentaire: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
