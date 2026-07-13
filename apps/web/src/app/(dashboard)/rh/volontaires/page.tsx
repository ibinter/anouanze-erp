'use client';

import { useState } from 'react';
import { Heart, Plus, Search } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface Volontaire {
  id: string;
  nom: string;
  email: string;
  competences: string[];
  disponibilites: string;
  actif: boolean;
}

const VOLONTAIRES: Volontaire[] = [
  { id: '1', nom: 'Brou Kouakou Éric', email: 'eric.brou@gmail.com', competences: ['Formation', 'Informatique'], disponibilites: 'Week-ends', actif: true },
  { id: '2', nom: 'Fanta Coulibaly', email: 'fanta.c@outlook.com', competences: ['Santé', 'Sensibilisation'], disponibilites: 'Mercredis + week-ends', actif: true },
  { id: '3', nom: 'Julien Adou', email: 'julien.adou@yahoo.fr', competences: ['Comptabilité', 'Audit'], disponibilites: 'Temps plein (3 mois)', actif: true },
  { id: '4', nom: 'Nadège Koffi', email: 'nadege.koffi@gmail.com', competences: ['Communication', 'Réseaux sociaux'], disponibilites: 'Jours fériés', actif: false },
  { id: '5', nom: 'Ibrahim Sanogo', email: 'ibra.sano@gmail.com', competences: ['Agriculture', 'Terrain'], disponibilites: 'Disponible immédiatement', actif: true },
  { id: '6', nom: 'Prisca Yao', email: 'prisca.yao@gmail.com', competences: ['Juridique', 'Rédaction'], disponibilites: 'Lundis et vendredis', actif: true },
];

const FORM_INIT = { nom: '', email: '', competences: '', disponibilites: '', actif: true };

export default function VolontairesPage() {
  const [search, setSearch] = useState('');
  const [modalNv, setModalNv] = useState(false);
  const [form, setForm] = useState(FORM_INIT);
  const [statuts, setStatuts] = useState<Record<string, boolean>>(
    Object.fromEntries(VOLONTAIRES.map((v) => [v.id, v.actif]))
  );

  const filtered = VOLONTAIRES.filter((v) =>
    v.nom.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    v.competences.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Volontaire>[] = [
    { key: 'nom', header: 'Nom', render: (r) => <span className="font-semibold text-neutral-800">{r.nom}</span> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-neutral-500">{r.email}</span> },
    {
      key: 'competences', header: 'Compétences', render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.competences.map((c) => (
            <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">{c}</span>
          ))}
        </div>
      )
    },
    { key: 'disponibilites', header: 'Disponibilités', render: (r) => <span className="text-xs text-neutral-500">{r.disponibilites}</span> },
    {
      key: 'actif', header: 'Statut', render: (r) => (
        <span className={statuts[r.id] ? 'badge badge-success' : 'badge badge-neutral'}>
          {statuts[r.id] ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'actions', header: '', render: (r) => (
        <button
          onClick={() => setStatuts((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
          className="text-xs btn-secondary py-1 px-2"
        >
          {statuts[r.id] ? 'Désactiver' : 'Activer'}
        </button>
      )
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Heart className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Volontaires</h1>
            <p className="text-sm text-neutral-500">{VOLONTAIRES.filter((v) => statuts[v.id]).length} volontaires actifs</p>
          </div>
        </div>
        <button onClick={() => setModalNv(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouveau volontaire
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          className="input pl-9"
          placeholder="Nom, email, compétence..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={filtered as unknown as Record<string, unknown>[]} isLoading={false} />

      <Modal
        open={modalNv}
        onOpenChange={setModalNv}
        title="Nouveau volontaire"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalNv(false)}>Annuler</button>
            <button className="btn-primary" onClick={() => setModalNv(false)}>Enregistrer</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="label">Nom complet</label>
            <input className="input" placeholder="Prénom Nom" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="email@domaine.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="label">Compétences (séparées par des virgules)</label>
            <input className="input" placeholder="Formation, Santé, Informatique..." value={form.competences} onChange={(e) => setForm((f) => ({ ...f, competences: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="label">Disponibilités</label>
            <input className="input" placeholder="Ex: Week-ends, lundis et vendredis..." value={form.disponibilites} onChange={(e) => setForm((f) => ({ ...f, disponibilites: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="actif"
              checked={form.actif}
              onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600"
            />
            <label htmlFor="actif" className="text-sm text-neutral-700">Actif dès l'inscription</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
