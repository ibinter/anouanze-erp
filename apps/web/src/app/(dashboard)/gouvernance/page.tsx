'use client';

import { useState } from 'react';
import {
  Building2, Users, FileText, Calendar, CheckCircle,
  Clock, AlertTriangle, Plus, RefreshCw, X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Organe {
  id: string;
  nom: string;
  typeOrgane: string;
  nombreMembres?: number;
  description?: string;
  _count?: { reunions: number };
  prochainReunion?: string;
}

interface Resolution {
  id: string;
  titre: string;
  statut: string;
  dateAdoption?: string;
  responsable?: string;
  description?: string;
}

interface GouvernanceStats {
  organeActifs: number;
  totalMembres: number;
  resolutionsParStatut: Record<string, number>;
  prochainReunion?: string;
}

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  APPROUVEE: 'bg-green-100 text-green-700',
  EN_COURS: 'bg-blue-100 text-blue-700',
  APPLIQUEE: 'bg-gray-100 text-gray-600',
  REJETEE: 'bg-red-100 text-red-700',
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVEE: 'Approuvée',
  EN_COURS: 'En cours',
  APPLIQUEE: 'Appliquée',
  REJETEE: 'Rejetée',
};

export default function GouvernancePage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'organes' | 'reunions' | 'resolutions'>('organes');
  const [showOrganeModal, setShowOrganeModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showReunionModal, setShowReunionModal] = useState(false);
  const [selectedOrganeId, setSelectedOrganeId] = useState<string | null>(null);
  const [organeForm, setOrganeForm] = useState({ nom: '', typeOrgane: 'CONSEIL_ADMINISTRATION', nombreMembres: '', description: '' });
  const [resolutionForm, setResolutionForm] = useState({ titre: '', description: '', responsable: '' });
  const [reunionForm, setReunionForm] = useState({ titre: '', dateReunion: '', lieu: '', ordreJour: '' });
  const [detailOrgane, setDetailOrgane] = useState<Organe | null>(null);
  const [detailReunion, setDetailReunion] = useState<any | null>(null);
  const [detailResolution, setDetailResolution] = useState<Resolution | null>(null);

  const { data: stats } = useQuery<GouvernanceStats>({
    queryKey: ['gouvernance-stats'],
    queryFn: () => api.get('/gouvernance/stats').then((r: any) => r.data),
  });

  const { data: organesData, isLoading: loadingOrganes } = useQuery<{ data: Organe[] }>({
    queryKey: ['gouvernance-organes'],
    queryFn: () => api.get('/gouvernance/organes').then((r: any) => r.data),
  });

  const { data: reunionsData, isLoading: loadingReunions } = useQuery<{ data: any[] }>({
    queryKey: ['gouvernance-reunions', selectedOrganeId],
    queryFn: () => api.get('/gouvernance/reunions', { params: selectedOrganeId ? { organeId: selectedOrganeId } : {} }).then((r: any) => r.data),
    enabled: tab === 'reunions',
  });

  const { data: resolutionsData, isLoading: loadingResolutions } = useQuery<{ data: Resolution[]; meta: any }>({
    queryKey: ['gouvernance-resolutions'],
    queryFn: () => api.get('/gouvernance/resolutions').then((r: any) => r.data),
    enabled: tab === 'resolutions',
  });

  const createOrgane = useMutation({
    mutationFn: (data: any) => api.post('/gouvernance/organes', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gouvernance-organes'] }); qc.invalidateQueries({ queryKey: ['gouvernance-stats'] }); setShowOrganeModal(false); setOrganeForm({ nom: '', typeOrgane: 'CONSEIL_ADMINISTRATION', nombreMembres: '', description: '' }); },
  });

  const createResolution = useMutation({
    mutationFn: (data: any) => api.post('/gouvernance/resolutions', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gouvernance-resolutions'] }); setShowResolutionModal(false); setResolutionForm({ titre: '', description: '', responsable: '' }); },
  });

  const createReunion = useMutation({
    mutationFn: ({ organeId, data }: { organeId: string; data: any }) => api.post(`/gouvernance/organes/${organeId}/reunions`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['gouvernance-reunions'] }); setShowReunionModal(false); setReunionForm({ titre: '', dateReunion: '', lieu: '', ordreJour: '' }); },
  });

  const updateResolution = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) => api.patch(`/gouvernance/resolutions/${id}`, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gouvernance-resolutions'] }),
  });

  const organes = organesData?.data ?? [];
  const reunions = reunionsData?.data ?? [];
  const resolutions = resolutionsData?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gouvernance</h1>
          <p className="text-gray-500 text-sm mt-1">Organes statutaires, réunions et résolutions</p>
        </div>
        <div className="flex gap-2">
          {tab === 'organes' && (
            <button onClick={() => setShowOrganeModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
              <Plus className="w-4 h-4" /> Nouvel organe
            </button>
          )}
          {tab === 'reunions' && (
            <button onClick={() => setShowReunionModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700" disabled={!selectedOrganeId}>
              <Plus className="w-4 h-4" /> Planifier réunion
            </button>
          )}
          {tab === 'resolutions' && (
            <button onClick={() => setShowResolutionModal(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
              <Plus className="w-4 h-4" /> Nouvelle résolution
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Organes actifs', value: stats?.organeActifs ?? '—', icon: Building2, tint: 'bg-primary-50', color: 'text-primary-600' },
          { label: 'Membres totaux', value: stats?.totalMembres ?? '—', icon: Users, tint: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Résolutions en cours', value: stats?.resolutionsParStatut?.EN_COURS ?? 0, icon: FileText, tint: 'bg-orange-50', color: 'text-orange-500' },
          { label: 'Prochaine réunion', value: stats?.prochainReunion ? new Date(stats.prochainReunion).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—', icon: Calendar, tint: 'bg-purple-50', color: 'text-purple-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="stat-card flex items-center gap-3">
            <div className={`p-2 rounded-lg ${kpi.tint}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs text-neutral-500">{kpi.label}</p>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['organes', 'reunions', 'resolutions'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${tab === t ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'organes' ? 'Organes' : t === 'reunions' ? 'Réunions' : 'Résolutions'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ORGANES */}
          {tab === 'organes' && (
            loadingOrganes ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : organes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Aucun organe créé</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {organes.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => setDetailOrgane(o)}
                    className="border border-gray-200 rounded-2xl p-4 cursor-pointer hover:border-primary-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{o.nom}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actif</span>
                    </div>
                    {o.description && <p className="text-sm text-gray-500 mb-3">{o.description}</p>}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {o.nombreMembres ?? 0} membres</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {o._count?.reunions ?? 0} réunions</span>
                    </div>
                    {o.prochainReunion && (
                      <p className="text-xs text-primary-600 mt-2">Prochaine réunion : {new Date(o.prochainReunion).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* RÉUNIONS */}
          {tab === 'reunions' && (
            <div className="space-y-4">
              {organes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setSelectedOrganeId(null)} className={`px-3 py-1.5 rounded-full text-xs border ${!selectedOrganeId ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600'}`}>Tous</button>
                  {organes.map((o) => (
                    <button key={o.id} onClick={() => setSelectedOrganeId(o.id)} className={`px-3 py-1.5 rounded-full text-xs border ${selectedOrganeId === o.id ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600'}`}>{o.nom}</button>
                  ))}
                </div>
              )}
              {loadingReunions ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
              ) : reunions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Aucune réunion planifiée</p>
                  {!selectedOrganeId && <p className="text-xs mt-1">Sélectionnez un organe pour planifier une réunion</p>}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {reunions.map((r: any) => (
                    <div key={r.id} onClick={() => setDetailReunion(r)} className="py-3 px-2 -mx-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{r.titre}</p>
                        <p className="text-sm text-gray-500">{r.lieu} · {new Date(r.dateReunion).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${r.statut === 'TENUE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.statut === 'TENUE' ? 'Tenue' : 'Planifiée'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RÉSOLUTIONS */}
          {tab === 'resolutions' && (
            loadingResolutions ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}</div>
            ) : resolutions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Aucune résolution enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {resolutions.map((r) => (
                  <div key={r.id} onClick={() => setDetailResolution(r)} className="py-4 px-2 -mx-2 rounded-lg flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{r.titre}</p>
                      {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                      {r.responsable && <p className="text-xs text-gray-400 mt-1">Responsable : {r.responsable}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUT_COLORS[r.statut] ?? 'bg-gray-100 text-gray-600'}`}>{STATUT_LABELS[r.statut] ?? r.statut}</span>
                      {r.statut === 'EN_ATTENTE' && (
                        <button onClick={(e) => { e.stopPropagation(); updateResolution.mutate({ id: r.id, statut: 'APPROUVEE' }); }} className="text-xs text-primary-600 underline">Approuver</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal: Nouvel organe */}
      {showOrganeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nouvel organe</h2>
              <button onClick={() => setShowOrganeModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nom de l'organe *" value={organeForm.nom} onChange={e => setOrganeForm(f => ({ ...f, nom: e.target.value }))} />
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={organeForm.typeOrgane} onChange={e => setOrganeForm(f => ({ ...f, typeOrgane: e.target.value }))}>
                <option value="ASSEMBLEE_GENERALE">Assemblée Générale</option>
                <option value="CONSEIL_ADMINISTRATION">Conseil d'Administration</option>
                <option value="BUREAU_EXECUTIF">Bureau Exécutif</option>
                <option value="COMITE_CONTROLE">Comité de Contrôle</option>
                <option value="COMMISSION">Commission</option>
                <option value="AUTRE">Autre</option>
              </select>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nombre de membres" value={organeForm.nombreMembres} onChange={e => setOrganeForm(f => ({ ...f, nombreMembres: e.target.value }))} />
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Description" value={organeForm.description} onChange={e => setOrganeForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowOrganeModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button onClick={() => createOrgane.mutate({ ...organeForm, nombreMembres: organeForm.nombreMembres ? parseInt(organeForm.nombreMembres) : undefined })} disabled={!organeForm.nom || createOrgane.isPending} className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm disabled:opacity-60 hover:bg-primary-700 transition-colors">
                {createOrgane.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nouvelle résolution */}
      {showResolutionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nouvelle résolution</h2>
              <button onClick={() => setShowResolutionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Titre *" value={resolutionForm.titre} onChange={e => setResolutionForm(f => ({ ...f, titre: e.target.value }))} />
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Description" value={resolutionForm.description} onChange={e => setResolutionForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Responsable de mise en œuvre" value={resolutionForm.responsable} onChange={e => setResolutionForm(f => ({ ...f, responsable: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowResolutionModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button onClick={() => createResolution.mutate(resolutionForm)} disabled={!resolutionForm.titre || createResolution.isPending} className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm disabled:opacity-60 hover:bg-primary-700 transition-colors">
                {createResolution.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Planifier réunion */}
      {showReunionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Planifier une réunion</h2>
              <button onClick={() => setShowReunionModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={selectedOrganeId ?? ''} onChange={e => setSelectedOrganeId(e.target.value)}>
                <option value="">Sélectionner un organe *</option>
                {organes.map(o => <option key={o.id} value={o.id}>{o.nom}</option>)}
              </select>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Titre *" value={reunionForm.titre} onChange={e => setReunionForm(f => ({ ...f, titre: e.target.value }))} />
              <input type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={reunionForm.dateReunion} onChange={e => setReunionForm(f => ({ ...f, dateReunion: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Lieu" value={reunionForm.lieu} onChange={e => setReunionForm(f => ({ ...f, lieu: e.target.value }))} />
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Ordre du jour (un point par ligne)" value={reunionForm.ordreJour} onChange={e => setReunionForm(f => ({ ...f, ordreJour: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowReunionModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button
                onClick={() => selectedOrganeId && createReunion.mutate({ organeId: selectedOrganeId, data: { ...reunionForm, ordreJour: reunionForm.ordreJour.split('\n').filter(Boolean) } })}
                disabled={!selectedOrganeId || !reunionForm.titre || createReunion.isPending}
                className="flex-1 bg-primary-600 text-white rounded-lg py-2 text-sm disabled:opacity-60 hover:bg-primary-700 transition-colors"
              >
                {createReunion.isPending ? 'Création...' : 'Planifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail: Organe */}
      {detailOrgane && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetailOrgane(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{detailOrgane.nom}</h2>
              <button onClick={() => setDetailOrgane(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actif</span>
              {detailOrgane.description && <p className="text-sm text-gray-600">{detailOrgane.description}</p>}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Type d'organe</p>
                  <p className="text-sm font-medium text-gray-900">{detailOrgane.typeOrgane?.replace(/_/g, ' ') ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Membres</p>
                  <p className="text-sm font-medium text-gray-900">{detailOrgane.nombreMembres ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Réunions</p>
                  <p className="text-sm font-medium text-gray-900">{detailOrgane._count?.reunions ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prochaine réunion</p>
                  <p className="text-sm font-medium text-gray-900">{detailOrgane.prochainReunion ? new Date(detailOrgane.prochainReunion).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail: Réunion */}
      {detailReunion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetailReunion(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{detailReunion.titre}</h2>
              <button onClick={() => setDetailReunion(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <span className={`text-xs px-2 py-1 rounded-full ${detailReunion.statut === 'TENUE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {detailReunion.statut === 'TENUE' ? 'Tenue' : 'Planifiée'}
              </span>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{detailReunion.dateReunion ? new Date(detailReunion.dateReunion).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lieu</p>
                  <p className="text-sm font-medium text-gray-900">{detailReunion.lieu ?? '—'}</p>
                </div>
              </div>
              {Array.isArray(detailReunion.ordreJour) && detailReunion.ordreJour.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1">Ordre du jour</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
                    {detailReunion.ordreJour.map((pt: string, i: number) => <li key={i}>{pt}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail: Résolution */}
      {detailResolution && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetailResolution(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{detailResolution.titre}</h2>
              <button onClick={() => setDetailResolution(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUT_COLORS[detailResolution.statut] ?? 'bg-gray-100 text-gray-600'}`}>{STATUT_LABELS[detailResolution.statut] ?? detailResolution.statut}</span>
              {detailResolution.description && <p className="text-sm text-gray-600">{detailResolution.description}</p>}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Responsable</p>
                  <p className="text-sm font-medium text-gray-900">{detailResolution.responsable ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date d'adoption</p>
                  <p className="text-sm font-medium text-gray-900">{detailResolution.dateAdoption ? new Date(detailResolution.dateAdoption).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
              </div>
              {detailResolution.statut === 'EN_ATTENTE' && (
                <button
                  onClick={() => { updateResolution.mutate({ id: detailResolution.id, statut: 'APPROUVEE' }); setDetailResolution(null); }}
                  className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm hover:bg-primary-700 transition-colors mt-2"
                >
                  Approuver la résolution
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
