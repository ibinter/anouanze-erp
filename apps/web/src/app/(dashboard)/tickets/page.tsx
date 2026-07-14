'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Send, X, ChevronLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Ticket {
  id: string;
  reference: string;
  sujet: string;
  description: string;
  categorie: string;
  statut: string;
  priorite: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface Message {
  id: string;
  contenu: string;
  auteur: string;
  estSupport: boolean;
  createdAt: string;
}

const STATUT_COLORS: Record<string, string> = {
  OUVERT: 'bg-blue-100 text-blue-700',
  EN_COURS: 'bg-yellow-100 text-yellow-700',
  EN_ATTENTE: 'bg-purple-100 text-purple-700',
  RESOLU: 'bg-green-100 text-green-700',
  FERME: 'bg-gray-100 text-gray-600',
};

const PRIORITE_COLORS: Record<string, string> = {
  FAIBLE: 'text-gray-400',
  NORMALE: 'text-blue-500',
  HAUTE: 'text-orange-500',
  URGENTE: 'text-red-500',
};

export default function TicketsPage() {
  const qc = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [form, setForm] = useState({ sujet: '', description: '', categorie: 'GENERAL', priorite: 'NORMALE' });

  const { data: ticketsData, isLoading } = useQuery<{ data: Ticket[] }>({
    queryKey: ['tickets'],
    queryFn: () => api.get('/tickets').then((r: any) => r.data),
  });

  const { data: ticketDetail } = useQuery<Ticket>({
    queryKey: ['ticket', selectedTicket],
    queryFn: () => api.get(`/tickets/${selectedTicket}`).then((r: any) => r.data),
    enabled: !!selectedTicket,
  });

  const { data: statsData } = useQuery<Record<string, number>>({
    queryKey: ['tickets-stats'],
    queryFn: () => api.get('/tickets/stats').then((r: any) => r.data),
  });

  const createTicket = useMutation({
    mutationFn: (data: any) => api.post('/tickets', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets'] });
      qc.invalidateQueries({ queryKey: ['tickets-stats'] });
      setShowCreateModal(false);
      setForm({ sujet: '', description: '', categorie: 'GENERAL', priorite: 'NORMALE' });
    },
  });

  const sendMessage = useMutation({
    mutationFn: ({ id, contenu }: { id: string; contenu: string }) => api.post(`/tickets/${id}/messages`, { contenu }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', selectedTicket] });
      setMessageText('');
    },
  });

  const tickets = ticketsData?.data ?? [];
  const detail = ticketDetail;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support & Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Contactez l'équipe support ANOUANZÊ</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nouveau ticket
        </button>
      </div>

      {/* Stats */}
      {statsData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statsData).map(([statut, count]) => (
            <div key={statut} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500 mt-0.5">{statut.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Liste tickets */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="font-semibold text-gray-800">Mes tickets ({tickets.length})</p>
          </div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun ticket ouvert</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicket(t.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selectedTicket === t.id ? 'bg-primary/5 border-r-2 border-r-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.sujet}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full whitespace-nowrap ${STATUT_COLORS[t.statut] ?? 'bg-gray-100 text-gray-600'}`}>{t.statut.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{t.reference}</span>
                    <span>·</span>
                    <span className={PRIORITE_COLORS[t.priorite] ?? ''}>{t.priorite}</span>
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Détail ticket */}
        <div className="md:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!selectedTicket || !detail ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Sélectionnez un ticket pour voir la conversation</p>
            </div>
          ) : (
            <div className="flex flex-col h-[600px]">
              {/* En-tête */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => setSelectedTicket(null)} className="md:hidden text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-400">{detail.reference}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[detail.statut] ?? ''}`}>{detail.statut.replace('_', ' ')}</span>
                </div>
                <p className="font-semibold text-gray-900">{detail.sujet}</p>
                <p className="text-sm text-gray-500 mt-1">{detail.description}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(detail.messages ?? []).map((m) => (
                  <div key={m.id} className={`flex ${m.estSupport ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.estSupport ? 'bg-gray-100 text-gray-800 rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                      <p className="text-xs mb-1 opacity-70">{m.auteur} · {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p>{m.contenu}</p>
                    </div>
                  </div>
                ))}
                {(detail.messages ?? []).length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">Aucun message pour l'instant</p>
                )}
              </div>

              {/* Zone de saisie */}
              {detail.statut !== 'FERME' && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      placeholder="Écrire un message..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && messageText.trim()) { sendMessage.mutate({ id: detail.id, contenu: messageText.trim() }); } }}
                    />
                    <button
                      onClick={() => sendMessage.mutate({ id: detail.id, contenu: messageText.trim() })}
                      disabled={!messageText.trim() || sendMessage.isPending}
                      className="p-2 bg-primary text-white rounded-xl disabled:opacity-60 hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nouveau ticket */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nouveau ticket support</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Sujet *" value={form.sujet} onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                  <option value="GENERAL">Général</option>
                  <option value="TECHNIQUE">Technique</option>
                  <option value="FACTURATION">Facturation</option>
                  <option value="FORMATION">Formation</option>
                  <option value="BUG">Bug</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}>
                  <option value="FAIBLE">Faible</option>
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>
              <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Décrivez votre problème en détail *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button onClick={() => createTicket.mutate(form)} disabled={!form.sujet || !form.description || createTicket.isPending} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60">
                {createTicket.isPending ? 'Envoi...' : 'Ouvrir le ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
