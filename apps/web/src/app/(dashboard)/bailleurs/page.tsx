'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Globe, Plus, Building2, FileText, MapPin } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { formatMontant, toNum } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Bailleur {
  id: string;
  nom: string;
  sigle?: string;
  type: string;
  pays?: string;
  _count?: { conventions: number };
}

interface Convention {
  id: string;
  reference: string;
  titre: string;
  montantTotal: number | string;
  dateDebut: string;
  dateFin: string;
  montantDecaisse?: number | string;
  _count?: { decaissements: number };
}

const TYPE_COLORS: Record<string, string> = {
  MULTILATERAL: 'badge-success',
  BILATERAL: 'badge',
  FONDATION: 'badge-warning',
  PRIVE: 'badge-neutral',
};

const BAILLEUR_TYPES = ['MULTILATERAL', 'BILATERAL', 'FONDATION', 'PRIVE'];
const FORM_INIT = { nom: '', sigle: '', type: 'BILATERAL', pays: '', contactNom: '', contactEmail: '' };

export default function BailleursPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Bailleur | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createBailleur = useMutation({
    mutationFn: (data: typeof FORM_INIT) =>
      api.post('/bailleurs', {
        nom: data.nom,
        sigle: data.sigle || undefined,
        type: data.type,
        pays: data.pays || undefined,
        contactNom: data.contactNom || undefined,
        contactEmail: data.contactEmail || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bailleurs'] });
      setModalOpen(false);
      setForm(FORM_INIT);
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['bailleurs', search],
    queryFn: async () => {
      const { data } = await api.get('/bailleurs', {
        params: { search: search || undefined, limit: 50 },
      });
      return data;
    },
  });

  const { data: conventionsData, isLoading: convLoading } = useQuery({
    queryKey: ['bailleur-conventions', selected?.id],
    queryFn: async () => {
      const { data } = await api.get(`/bailleurs/${selected!.id}/conventions`);
      return data;
    },
    enabled: !!selected?.id,
  });

  const bailleurs: Bailleur[] = data?.data ?? [];
  const conventions: Convention[] = conventionsData ?? [];

  const totalBailleurs = data?.meta?.total ?? bailleurs.length;
  const totalConventions = bailleurs.reduce((s, b) => s + toNum((b as any)._count?.conventions), 0);
  const paysCount = new Set(bailleurs.map((b) => b.pays).filter(Boolean)).size;

  const columns: Column<Bailleur>[] = [
    {
      key: 'nom', header: 'Bailleur',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-800">{r.nom}</p>
          {r.sigle && <p className="text-xs text-neutral-400">{r.sigle}</p>}
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', width: '120px',
      render: (r) => <span className={`badge ${TYPE_COLORS[r.type] ?? 'badge-neutral'}`}>{r.type}</span>,
    },
    {
      key: 'pays', header: 'Pays/Région', width: '130px',
      render: (r) => r.pays ? (
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-600">{r.pays}</span>
        </div>
      ) : <span className="text-neutral-400">—</span>,
    },
    {
      key: '_count', header: 'Conventions', width: '110px',
      render: (r) => <span className="badge badge-neutral">{(r as any)._count?.conventions ?? 0}</span>,
    },
    {
      key: 'actions', header: '', width: '190px',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/bailleurs/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            Voir la fiche
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setSelected(selected?.id === r.id ? null : r); }}
            className={cn('text-xs font-medium', selected?.id === r.id ? 'text-accent-400' : 'text-neutral-500 hover:underline')}
          >
            {selected?.id === r.id ? 'Masquer' : 'Conventions'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Bailleurs de fonds</h1>
          <p className="text-sm text-neutral-500 mt-1">Partenaires financiers et conventions de financement</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Nouveau bailleur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total bailleurs</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : totalBailleurs}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Conventions</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : totalConventions}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Pays représentés</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : paysCount}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher un bailleur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 w-full"
        />
      </div>

      <DataTable
        columns={columns as Column<Bailleur & Record<string, unknown>>[]}
        data={bailleurs as (Bailleur & Record<string, unknown>)[]}
        isLoading={isLoading}
        onRowClick={(r) => router.push(`/bailleurs/${(r as Bailleur).id}`)}
      />

      {selected && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-neutral-700">
              Conventions — {selected.nom}
              <span className="ml-2 badge badge-neutral">{conventions.length}</span>
            </h2>
            <Link href={`/bailleurs/${selected.id}`} className="btn-secondary text-xs py-1.5 px-3">
              Fiche complète
            </Link>
          </div>
          {convLoading && <p className="text-sm text-neutral-400">Chargement des conventions…</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conventions.map((conv) => {
              const montant = toNum(conv.montantTotal);
              const decaisse = toNum(conv.montantDecaisse);
              const tauxDecaissement = montant > 0 ? Math.round((decaisse / montant) * 100) : 0;
              return (
                <div key={conv.id} className="card-hover p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-neutral-400">{conv.reference}</p>
                      <p className="font-semibold text-neutral-800 mt-0.5">{conv.titre}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Montant</span>
                    <span className="font-mono font-semibold text-neutral-800">{formatMontant(montant)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{conv.dateDebut?.slice(0, 7).replace('-', '/')}</span>
                    <span>→</span>
                    <span>{conv.dateFin?.slice(0, 7).replace('-', '/')}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Décaissé</span>
                      <span className={cn('font-medium', tauxDecaissement >= 80 ? 'text-green-600' : tauxDecaissement >= 40 ? 'text-orange-500' : 'text-neutral-600')}>
                        {tauxDecaissement}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', tauxDecaissement >= 80 ? 'bg-green-500' : tauxDecaissement >= 40 ? 'bg-orange-400' : 'bg-primary-600')}
                        style={{ width: `${tauxDecaissement}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{formatMontant(decaisse)} / {formatMontant(montant)}</p>
                  </div>
                </div>
              );
            })}
            {!convLoading && conventions.length === 0 && (
              <p className="text-sm text-neutral-400 col-span-2 text-center py-4">Aucune convention enregistrée.</p>
            )}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nouveau bailleur"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createBailleur.isPending || !form.nom}
              onClick={() => createBailleur.mutate(form)}
            >
              {createBailleur.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nom *</label>
              <input type="text" className="input w-full" placeholder="Nom du bailleur" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="label">Sigle</label>
              <input type="text" className="input w-full" placeholder="Ex: UE, BM…" value={form.sigle} onChange={(e) => setForm((p) => ({ ...p, sigle: e.target.value }))} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                {BAILLEUR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Pays / Région</label>
              <input type="text" className="input w-full" placeholder="France, UE…" value={form.pays} onChange={(e) => setForm((p) => ({ ...p, pays: e.target.value }))} />
            </div>
            <div>
              <label className="label">Contact (nom)</label>
              <input type="text" className="input w-full" placeholder="Prénom Nom" value={form.contactNom} onChange={(e) => setForm((p) => ({ ...p, contactNom: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">Email contact</label>
              <input type="email" className="input w-full" placeholder="contact@bailleur.org" value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
