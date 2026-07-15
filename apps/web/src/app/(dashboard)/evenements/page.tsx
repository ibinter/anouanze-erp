'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CalendarDays, Plus, MapPin, Users, List, LayoutGrid, UserCheck, Percent } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { cn, toNum } from '@/lib/utils';

type TypeEvenement = 'AG' | 'REUNION' | 'FORMATION' | 'ATELIER';

interface Evenement {
  id: string;
  titre: string;
  type: TypeEvenement;
  dateDebut: string;
  lieu?: string;
  capacite?: number;
  _count?: { inscriptions: number };
  description?: string;
  statut?: string;
}

const TYPE_STYLES: Record<string, string> = {
  AG: 'badge bg-purple-100 text-purple-700',
  REUNION: 'badge badge-neutral',
  FORMATION: 'badge badge-success',
  ATELIER: 'badge bg-blue-100 text-blue-700',
};

function groupByMonth(evts: Evenement[]) {
  const groups: Record<string, Evenement[]> = {};
  evts.forEach((e) => {
    const key = (e.dateDebut ?? '').substring(0, 7);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return groups;
}

function moisLabel(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

const FORM_INIT = { titre: '', type: 'FORMATION' as TypeEvenement, date: '', lieu: '', capacite: 30, description: '' };

export default function EvenementsPage() {
  const [vue, setVue] = useState<'liste' | 'calendrier'>('calendrier');
  const [modalNouvel, setModalNouvel] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<Evenement | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: typeof FORM_INIT) =>
      api.post('/evenements', {
        titre: data.titre,
        type: data.type,
        dateDebut: data.date,
        lieu: data.lieu || undefined,
        capacite: data.capacite,
        description: data.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evenements'] });
      setModalNouvel(false);
      setForm(FORM_INIT);
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['evenements'],
    queryFn: async () => {
      const { data } = await api.get('/evenements');
      return data;
    },
  });

  const evenements: Evenement[] = data?.data ?? data ?? [];
  const grouped = groupByMonth(evenements);

  // Sommes : inscriptions et capacités peuvent arriver en chaînes → toNum
  // avant toute addition, sinon `+` concatène et fausse les totaux.
  const totalInscrits = evenements.reduce((s, e) => s + toNum(e._count?.inscriptions), 0);
  const totalCapacite = evenements.reduce((s, e) => s + toNum(e.capacite), 0);
  const placesDispo = Math.max(0, totalCapacite - totalInscrits);
  const tauxRemplissage = totalCapacite > 0 ? Math.round((totalInscrits / totalCapacite) * 100) : 0;

  const KPIS = [
    { label: 'Événements', value: evenements.length, icon: CalendarDays, tint: 'bg-primary-50', color: 'text-primary-600' },
    { label: 'Total inscrits', value: totalInscrits, icon: UserCheck, tint: 'bg-blue-50', color: 'text-blue-500' },
    { label: 'Places disponibles', value: placesDispo, icon: Users, tint: 'bg-orange-50', color: 'text-orange-500' },
    { label: 'Taux de remplissage', value: `${tauxRemplissage}%`, icon: Percent, tint: 'bg-green-50', color: 'text-green-600' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <CalendarDays className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Événements & Formations</h1>
            <p className="text-sm text-neutral-500">{isLoading ? '…' : `${evenements.length} événements planifiés`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setVue('calendrier')}
              className={cn('px-3 py-2 text-sm transition-colors', vue === 'calendrier' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVue('liste')}
              className={cn('px-3 py-2 text-sm transition-colors', vue === 'liste' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setModalNouvel(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvel événement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="stat-card flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', kpi.tint)}>
              <kpi.icon className={cn('w-5 h-5', kpi.color)} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{kpi.label}</p>
              <p className={cn('text-xl font-bold', kpi.color)}>{isLoading ? '—' : kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card p-4 h-40 animate-pulse bg-neutral-100" />)}
        </div>
      )}

      {!isLoading && vue === 'calendrier' && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([ym, evts]) => (
            <div key={ym}>
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3 capitalize">{moisLabel(ym)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {evts.map((evt) => {
                  const nb = evt._count?.inscriptions ?? 0;
                  const capacite = evt.capacite ?? 0;
                  const pct = capacite > 0 ? Math.round((nb / capacite) * 100) : 0;
                  const complet = capacite > 0 && nb >= capacite;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setDetail(evt)}
                      className="card card-hover space-y-3 p-5 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-neutral-800 text-sm leading-snug">{evt.titre}</h3>
                        <span className={cn('flex-shrink-0', TYPE_STYLES[evt.type] ?? 'badge badge-neutral')}>{evt.type}</span>
                      </div>
                      <div className="space-y-1 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(evt.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        {evt.lieu && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {evt.lieu}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          {nb}{capacite > 0 ? ` / ${capacite}` : ''} inscrits
                        </div>
                      </div>
                      {capacite > 0 && (
                        <div className="space-y-1">
                          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-primary-600')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-neutral-400">{pct}% de la capacité</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          disabled={complet}
                          onClick={(e) => e.stopPropagation()}
                          className={cn('flex-1 btn-primary text-xs py-1.5', complet && 'opacity-50 cursor-not-allowed')}
                        >
                          {complet ? 'Complet' : "S'inscrire"}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDetail(evt); }} className="btn-secondary text-xs py-1.5 px-3">Gérer</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {evenements.length === 0 && (
            <p className="text-sm text-neutral-400 text-center py-8">Aucun événement planifié.</p>
          )}
        </div>
      )}

      {!isLoading && vue === 'liste' && (
        <div className="card divide-y divide-neutral-50">
          {evenements.map((evt) => {
            const nb = evt._count?.inscriptions ?? 0;
            const capacite = evt.capacite ?? 0;
            const pct = capacite > 0 ? Math.round((nb / capacite) * 100) : 0;
            return (
              <div key={evt.id} onClick={() => setDetail(evt)} className="flex items-center gap-4 py-3 px-2 -mx-1 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-lg font-bold text-primary-600">{new Date(evt.dateDebut).getDate()}</p>
                  <p className="text-xs text-neutral-400">{new Date(evt.dateDebut).toLocaleDateString('fr-FR', { month: 'short' })}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-800 text-sm truncate">{evt.titre}</span>
                    <span className={cn('flex-shrink-0', TYPE_STYLES[evt.type] ?? 'badge badge-neutral')}>{evt.type}</span>
                  </div>
                  {evt.lieu && <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.lieu}</p>}
                </div>
                {capacite > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500">
                    <Users className="w-3.5 h-3.5" />
                    {nb}/{capacite}
                    <span className={cn('ml-1 text-xs font-medium', pct >= 90 ? 'text-red-500' : 'text-neutral-400')}>{pct}%</span>
                  </div>
                )}
                <button onClick={(e) => e.stopPropagation()} className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">S'inscrire</button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title="Détail de l'événement" size="lg">
        {detail && (() => {
          const nb = toNum(detail._count?.inscriptions);
          const cap = toNum(detail.capacite);
          const pct = cap > 0 ? Math.round((nb / cap) * 100) : 0;
          return (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-neutral-800">{detail.titre}</h3>
                <span className={cn('flex-shrink-0', TYPE_STYLES[detail.type] ?? 'badge badge-neutral')}>{detail.type}</span>
              </div>
              {detail.description && <p className="text-sm text-neutral-600">{detail.description}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-500">Date</p>
                  <p className="text-sm font-medium text-neutral-800">{new Date(detail.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Lieu</p>
                  <p className="text-sm font-medium text-neutral-800">{detail.lieu ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Inscrits</p>
                  <p className="text-sm font-medium text-neutral-800">{nb}{cap > 0 ? ` / ${cap}` : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Remplissage</p>
                  <p className="text-sm font-medium text-neutral-800">{cap > 0 ? `${pct}%` : '—'}</p>
                </div>
              </div>
              {cap > 0 && (
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-400' : 'bg-primary-600')} style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={modalNouvel}
        onOpenChange={setModalNouvel}
        title="Nouvel événement"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalNouvel(false); setError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createMutation.isPending || !form.titre || !form.date}
              onClick={() => createMutation.mutate(form)}
            >
              {createMutation.isPending ? 'Création…' : 'Créer'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="space-y-1">
            <label className="label">Titre</label>
            <input type="text" className="input" placeholder="Titre de l'événement" value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TypeEvenement }))}>
                <option value="AG">Assemblée générale</option>
                <option value="REUNION">Réunion</option>
                <option value="FORMATION">Formation</option>
                <option value="ATELIER">Atelier</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">Lieu</label>
            <input type="text" className="input" placeholder="Lieu de l'événement" value={form.lieu} onChange={(e) => setForm((f) => ({ ...f, lieu: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="label">Capacité</label>
            <input type="number" className="input" min={1} value={form.capacite} onChange={(e) => setForm((f) => ({ ...f, capacite: Number(e.target.value) }))} />
          </div>
          <div className="space-y-1">
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Description de l'événement" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
