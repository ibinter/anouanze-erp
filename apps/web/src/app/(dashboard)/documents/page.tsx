'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Grid3X3, List, Upload, X, Tag, QrCode } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { FileIcon } from '@/components/ui/FileIcon';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate, cn } from '@/lib/utils';

interface Document {
  id: string;
  nom: string;
  categorie?: string;
  mimeType?: string;
  taille?: number | string;
  createdAt?: string;
  updatedAt?: string;
  statut?: string;
  tags?: string[];
}

const CATEGORIES = ['Tous', 'Rapports', 'Conventions', 'Finance', 'Médias', 'Gouvernance', 'Projets'];

const STATUT_BADGE: Record<string, string> = {
  VALIDE: 'badge-success',
  EN_ATTENTE: 'badge-warning',
  ARCHIVE: 'badge-neutral',
  valide: 'badge-success',
  en_attente: 'badge-warning',
  archive: 'badge-neutral',
};

const STATUT_LABEL: Record<string, string> = {
  VALIDE: 'Validé',
  EN_ATTENTE: 'En attente',
  ARCHIVE: 'Archivé',
  valide: 'Validé',
  en_attente: 'En attente',
  archive: 'Archivé',
};

function formatTaille(t?: number | string) {
  if (!t) return '—';
  if (typeof t === 'string') return t;
  if (t < 1024) return `${t} o`;
  if (t < 1024 * 1024) return `${(t / 1024).toFixed(0)} Ko`;
  return `${(t / 1024 / 1024).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const [vue, setVue] = useState<'grille' | 'liste'>('grille');
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Tous');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [newDoc, setNewDoc] = useState({ nom: '', categorie: 'Rapports', tags: '' });
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [qrDoc, setQrDoc] = useState<{ id: string; nom: string; qrImageUrl: string; url: string } | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const limit = 24;

  const openQr = async (docId: string, docNom: string) => {
    setQrLoading(true);
    try {
      const { data } = await api.get(`/documents/${docId}/qr`) as any;
      setQrDoc({ ...data, nom: docNom });
    } catch { /* silencieux */ } finally { setQrLoading(false); }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, search, categorie, statut],
    queryFn: async () => {
      const { data } = await api.get('/documents', {
        params: {
          page,
          limit,
          search: search || undefined,
          categorie: categorie !== 'Tous' ? categorie : undefined,
          statut: statut || undefined,
        },
      });
      return data;
    },
  });

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setDroppedFile(file);
      setNewDoc((p) => ({ ...p, nom: file.name }));
      setModalOpen(true);
    }
  }, []);

  const documents: Document[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Gestion documentaire</h1>
          <p className="text-sm text-neutral-500 mt-1">{isLoading ? '…' : `${total} documents`} — {documents.length} affichés</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setVue('grille')}
              className={cn('p-2 transition-colors', vue === 'grille' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-50')}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVue('liste')}
              className={cn('p-2 transition-colors', vue === 'liste' ? 'bg-primary-600 text-white' : 'text-neutral-500 hover:bg-neutral-50')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <Upload className="w-4 h-4" />
            Déposer un document
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou tag…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 w-full"
          />
        </div>
        <select className="input w-full sm:w-44" value={categorie} onChange={(e) => { setCategorie(e.target.value); setPage(1); }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input w-full sm:w-44" value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          <option value="VALIDE">Validé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="ARCHIVE">Archivé</option>
        </select>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-4 text-center text-sm transition-colors',
          dragging ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-neutral-200 text-neutral-400',
        )}
      >
        <Upload className="w-5 h-5 mx-auto mb-1" />
        Glissez un fichier ici pour le déposer
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="card p-4 h-32 animate-pulse bg-neutral-100" />)}
        </div>
      ) : vue === 'grille' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="card p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-50">
                  <FileIcon mimeType={doc.mimeType ?? ''} className="w-7 h-7" />
                </div>
                <button onClick={(e) => { e.stopPropagation(); openQr(doc.id, doc.nom); }} title="QR code de vérification" className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100 transition-all">
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm font-medium text-neutral-800 truncate" title={doc.nom}>{doc.nom}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{formatTaille(doc.taille)} · {formatDate(doc.createdAt ?? '')}</p>
              {doc.statut && (
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  <span className={`badge ${STATUT_BADGE[doc.statut] ?? 'badge-neutral'} text-xs`}>{STATUT_LABEL[doc.statut] ?? doc.statut}</span>
                </div>
              )}
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-0.5 text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">
                      <Tag className="w-2.5 h-2.5" />{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-4 text-center py-8 text-sm text-neutral-400">Aucun document trouvé.</div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                {['Nom', 'Catégorie', 'Taille', 'Date', 'Statut', 'Tags'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileIcon mimeType={doc.mimeType ?? ''} className="w-4 h-4 shrink-0" />
                      <span className="font-medium text-neutral-800 truncate max-w-48">{doc.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{doc.categorie ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatTaille(doc.taille)}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(doc.createdAt ?? '')}</td>
                  <td className="px-4 py-3">
                    {doc.statut && <span className={`badge ${STATUT_BADGE[doc.statut] ?? 'badge-neutral'}`}>{STATUT_LABEL[doc.statut] ?? doc.statut}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(doc.tags ?? []).map((t) => (
                        <span key={t} className="text-xs bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Déposer un document"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Annuler</button>
            <button className="btn-primary" onClick={() => setModalOpen(false)}>Enregistrer</button>
          </>
        }
      >
        <div className="space-y-4">
          {droppedFile ? (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <FileIcon mimeType={droppedFile.type} className="w-6 h-6" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{droppedFile.name}</p>
                <p className="text-xs text-neutral-400">{(droppedFile.size / 1024).toFixed(0)} Ko</p>
              </div>
              <button onClick={() => setDroppedFile(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn('border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors', dragging ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 hover:border-primary-300')}
            >
              <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Glissez un fichier ou <span className="text-primary-600 font-medium">parcourez</span></p>
            </div>
          )}
          <div>
            <label className="label">Nom du document</label>
            <input type="text" className="input w-full" placeholder="Nom du fichier" value={newDoc.nom} onChange={(e) => setNewDoc((p) => ({ ...p, nom: e.target.value }))} />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="input w-full" value={newDoc.categorie} onChange={(e) => setNewDoc((p) => ({ ...p, categorie: e.target.value }))}>
              {CATEGORIES.filter((c) => c !== 'Tous').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tags <span className="text-neutral-400 font-normal">(séparés par virgule)</span></label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input type="text" className="input w-full pl-9" placeholder="Ex: rapport, 2026, UE" value={newDoc.tags} onChange={(e) => setNewDoc((p) => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal QR code */}
      {qrDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrDoc(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">QR code de vérification</h2>
              <button onClick={() => setQrDoc(null)}><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4 truncate">{qrDoc.nom}</p>
            <img src={qrDoc.qrImageUrl} alt="QR code" className="mx-auto w-48 h-48 rounded-xl border border-gray-200" />
            <p className="text-xs text-gray-400 mt-3 break-all">{qrDoc.url}</p>
            <a href={qrDoc.qrImageUrl} download={`qr-${qrDoc.id}.png`} className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
              Télécharger le QR
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
