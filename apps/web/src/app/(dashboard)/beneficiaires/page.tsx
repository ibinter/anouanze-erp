'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Search, Users, UserCheck, User, FolderOpen, Eye, Phone, Hash } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { SlideOver } from '@/components/ui/SlideOver';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, toNum, initiales } from '@/lib/utils';

interface Beneficiaire {
  id: string;
  code?: string;
  nom: string;
  prenom: string;
  genre: 'M' | 'F';
  telephone?: string;
  _count?: { projets: number };
  dateEnregistrement?: string;
  createdAt?: string;
  vulnerabilites?: string[];
  notes?: string;
}

export default function BeneficiairesPage() {
  const t = useTranslations('relations.beneficiaires');
  const tc = useTranslations('relations.commun');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Beneficiaire | null>(null);
  const [form, setForm] = useState({ nom: '', prenom: '', genre: 'F', telephone: '' });
  const [error, setError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const createBeneficiaire = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/beneficiaires', {
        nom: data.nom,
        prenom: data.prenom,
        genre: data.genre,
        telephone: data.telephone || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaires'] });
      setModalOpen(false);
      setForm({ nom: '', prenom: '', genre: 'F', telephone: '' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? tc('erreurGenerique')),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaires', page, search],
    queryFn: async () => {
      const { data } = await api.get('/beneficiaires', {
        params: { page, limit, search: search || undefined },
      });
      return data;
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery<Beneficiaire>({
    queryKey: ['beneficiaire', selected?.id],
    queryFn: async () => {
      const { data } = await api.get(`/beneficiaires/${selected!.id}`);
      return data;
    },
    enabled: !!selected?.id,
    initialData: selected ?? undefined,
  });

  const beneficiaires: Beneficiaire[] = data?.data ?? data ?? [];
  const total = data?.meta?.total ?? beneficiaires.length;
  const totalFemmes = beneficiaires.filter((b) => b.genre === 'F').length;
  const totalHommes = beneficiaires.filter((b) => b.genre === 'M').length;
  const totalProjets = beneficiaires.reduce((s, b) => s + toNum(b._count?.projets), 0);
  const fiche = detail ?? selected;

  const columns: Column<Beneficiaire>[] = [
    {
      key: 'code', header: t('colonnes.code'), width: '100px',
      render: (r) => <span className="font-mono text-xs text-neutral-500">{(r as any).code ?? '—'}</span>,
    },
    {
      key: 'nom', header: t('colonnes.nomComplet'),
      render: (r) => <span className="font-medium text-neutral-800">{r.prenom} {r.nom}</span>,
    },
    {
      key: 'genre', header: t('colonnes.genre'), width: '80px',
      render: (r) => (
        <span className={`badge ${r.genre === 'F' ? 'badge-warning' : 'badge-neutral'}`}>{r.genre === 'F' ? t('genres.femme') : t('genres.homme')}</span>
      ),
    },
    {
      key: 'telephone', header: t('colonnes.telephone'),
      render: (r) => <span>{(r as any).telephone ?? '—'}</span>,
    },
    {
      key: '_count', header: t('colonnes.projets'), width: '90px',
      render: (r) => {
        const nb = (r as any)._count?.projets ?? 0;
        return <span className="badge badge-success">{t('nbProjets', { count: nb })}</span>;
      },
    },
    {
      key: 'dateEnregistrement', header: t('colonnes.enregistrement'), width: '130px',
      render: (r) => formatDate((r as any).dateEnregistrement ?? (r as any).createdAt),
    },
    {
      key: 'actions', header: t('colonnes.actions'), width: '100px',
      render: (r) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelected(r); }}
          className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
        >
          <Eye className="w-3 h-3" /> {t('details')}
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('sousTitre')}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          {t('nouveau')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.total')}</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.femmes')}</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : totalFemmes}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.hommes')}</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : totalHommes}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.accompagnements')}</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : totalProjets}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder={t('recherchePlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-9 w-full"
        />
      </div>

      <DataTable
        columns={columns as Column<Beneficiaire & Record<string, unknown>>[]}
        data={beneficiaires as (Beneficiaire & Record<string, unknown>)[]}
        isLoading={isLoading}
        onRowClick={(r) => setSelected(r as Beneficiaire)}
      />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={fiche ? `${fiche.prenom ?? ''} ${fiche.nom}`.trim() : t('fiche.titreDefaut')}
      >
        {fiche && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold">
                {initiales(fiche.nom, fiche.prenom)}
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{fiche.prenom} {fiche.nom}</p>
                <span className={`badge ${fiche.genre === 'F' ? 'badge-warning' : 'badge-neutral'}`}>{fiche.genre === 'F' ? t('genres.femme') : t('genres.homme')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-100 p-3">
                <p className="flex items-center gap-1 text-xs text-neutral-500"><Hash className="w-3 h-3" /> {t('fiche.code')}</p>
                <p className="font-mono text-sm text-neutral-800 mt-1">{fiche.code ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 p-3">
                <p className="flex items-center gap-1 text-xs text-neutral-500"><FolderOpen className="w-3 h-3" /> {t('fiche.projets')}</p>
                <p className="text-sm font-semibold text-neutral-800 mt-1">{toNum(fiche._count?.projets)}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 p-3">
                <p className="flex items-center gap-1 text-xs text-neutral-500"><Phone className="w-3 h-3" /> {t('fiche.telephone')}</p>
                <p className="text-sm text-neutral-800 mt-1">{fiche.telephone ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('fiche.enregistrement')}</p>
                <p className="text-sm text-neutral-800 mt-1">{fiche.dateEnregistrement || fiche.createdAt ? formatDate((fiche.dateEnregistrement ?? fiche.createdAt) as string) : '—'}</p>
              </div>
            </div>

            {fiche.vulnerabilites && fiche.vulnerabilites.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-600 mb-2">{t('fiche.vulnerabilites')}</p>
                <div className="flex flex-wrap gap-2">
                  {fiche.vulnerabilites.map((v) => (
                    <span key={v} className="badge badge-warning text-xs">{v}</span>
                  ))}
                </div>
              </div>
            )}

            {fiche.notes && (
              <div>
                <p className="text-xs font-medium text-neutral-600 mb-1">{t('fiche.notes')}</p>
                <p className="text-sm text-neutral-600">{fiche.notes}</p>
              </div>
            )}

            {detailLoading && <p className="text-sm text-neutral-400 text-center py-2">{tc('chargement')}</p>}
          </div>
        )}
      </SlideOver>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('modal.titre')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>{tc('annuler')}</button>
            <button
              className="btn-primary"
              disabled={createBeneficiaire.isPending || !form.nom || !form.prenom}
              onClick={() => createBeneficiaire.mutate(form)}
            >
              {createBeneficiaire.isPending ? tc('enregistrementEnCours') : tc('enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('modal.prenom')}</label>
              <input type="text" className="input w-full" placeholder={t('modal.placeholderPrenom')} value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.nom')}</label>
              <input type="text" className="input w-full" placeholder={t('modal.placeholderNom')} value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">{t('modal.genre')}</label>
            <select className="input w-full" value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}>
              <option value="F">{t('genres.femme')}</option>
              <option value="M">{t('genres.homme')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('modal.telephone')}</label>
            <input type="tel" className="input w-full" placeholder={t('modal.placeholderTelephone')} value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
