'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Settings, Upload, UserPlus, Shield, Bell, Plug, Loader2 } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Role = 'ADMIN' | 'COMPTABLE' | 'GESTIONNAIRE' | 'MEMBRE' | 'LECTURE';

interface Utilisateur {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  role?: Role;
  actif?: boolean;
  derniereConnexion?: string;
}

const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', logo: '🟠', connecte: true },
  { id: 'mtn', nom: 'MTN MoMo', logo: '🟡', connecte: false },
  { id: 'cinetpay', nom: 'CinetPay', logo: '🔵', connecte: true },
  { id: 'wave', nom: 'Wave', logo: '🌊', connecte: false },
];

const NOTIFS = [
  { id: 'cotisation_retard', label: 'Cotisation en retard', desc: 'Alerte quand une cotisation n\'est pas réglée à échéance' },
  { id: 'budget_depasse', label: 'Budget dépassé', desc: 'Alerte quand un budget de projet est dépassé' },
  { id: 'stock_alerte', label: 'Stock sous le minimum', desc: 'Alerte quand un article passe sous le seuil minimum' },
  { id: 'nouveau_membre', label: 'Nouveau membre inscrit', desc: 'Notification lors d\'une nouvelle adhésion' },
  { id: 'paiement_recu', label: 'Paiement reçu', desc: 'Confirmation lors de la réception d\'un paiement' },
  { id: 'rapport_mensuel', label: 'Rapport mensuel disponible', desc: 'Notification à la génération du rapport mensuel' },
];

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'badge badge-error',
  ADMIN: 'badge badge-error',
  DIRECTEUR: 'badge bg-purple-100 text-purple-700',
  COMPTABLE: 'badge badge-success',
  RH: 'badge bg-blue-100 text-blue-700',
  RESPONSABLE_PROJET: 'badge bg-teal-100 text-teal-700',
  GESTIONNAIRE: 'badge bg-blue-100 text-blue-700',
  AUDITEUR: 'badge badge-warning',
  VIEWER: 'badge badge-neutral',
  MEMBRE: 'badge badge-neutral',
  LECTURE: 'badge badge-warning',
};

const TABS = [
  { id: 'organisation', label: 'Organisation', icon: <Settings className="w-4 h-4" /> },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: <UserPlus className="w-4 h-4" /> },
  { id: 'securite', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'integrations', label: 'Intégrations', icon: <Plug className="w-4 h-4" /> },
];

export default function ParametresPage() {
  const { data: session } = useSession();
  const orgId = (session?.user as any)?.organisationId;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState('organisation');
  const [modalInviter, setModalInviter] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [dureeSession, setDureeSession] = useState('8');
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFS.map((n) => [n.id, true]))
  );
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(
    Object.fromEntries(PAIEMENTS.map((p) => [p.id, p.connecte]))
  );
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'VIEWER' });
  const [orgForm, setOrgForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    devise: 'XOF',
    langue: 'fr',
    exercice: String(new Date().getFullYear()),
  });
  const [orgSaving, setOrgSaving] = useState(false);

  // Fetch organisation data
  const { data: orgData } = useQuery({
    queryKey: ['organisation', orgId],
    queryFn: async () => {
      const { data } = await api.get(`/organisations/${orgId}`);
      return data;
    },
    enabled: !!orgId && tab === 'organisation',
  });

  useEffect(() => {
    if (orgData) {
      setOrgForm({
        nom: orgData.nom ?? '',
        email: orgData.emailContact ?? orgData.email ?? '',
        telephone: orgData.telephone ?? '',
        devise: orgData.deviseDefaut ?? 'XOF',
        langue: orgData.langue ?? 'fr',
        exercice: String(orgData.exerciceComptable ?? new Date().getFullYear()),
      });
    }
  }, [orgData]);

  async function handleOrgSave() {
    if (!orgId) return;
    setOrgSaving(true);
    try {
      await api.patch(`/organisations/${orgId}`, {
        nom: orgForm.nom || undefined,
        emailContact: orgForm.email || undefined,
        telephone: orgForm.telephone || undefined,
        deviseDefaut: orgForm.devise || undefined,
        langue: orgForm.langue || undefined,
        exerciceComptable: orgForm.exercice ? parseInt(orgForm.exercice) : undefined,
      });
      toast.success('Organisation mise à jour');
      queryClient.invalidateQueries({ queryKey: ['organisation', orgId] });
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setOrgSaving(false);
    }
  }

  // Fetch users
  const { data: utilisateursData = [], isLoading: usersLoading } = useQuery<Utilisateur[]>({
    queryKey: ['utilisateurs'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs');
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    enabled: tab === 'utilisateurs',
  });

  const colsUsers: Column<Utilisateur>[] = [
    {
      key: 'nom',
      header: 'Nom',
      render: (r) => <span className="font-semibold text-neutral-800">{r.prenom} {r.nom}</span>
    },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-neutral-500">{r.email}</span> },
    {
      key: 'role',
      header: 'Rôle',
      render: (r) => r.role ? <span className={ROLE_STYLES[r.role] ?? 'badge badge-neutral'}>{r.role}</span> : <span className="text-neutral-400 text-xs">—</span>
    },
    {
      key: 'actif',
      header: 'Statut',
      render: (r) => (
        <span className={r.actif !== false ? 'badge badge-success' : 'badge badge-neutral'}>
          {r.actif !== false ? 'Actif' : 'Inactif'}
        </span>
      )
    },
    {
      key: 'derniereConnexion',
      header: 'Dernière connexion',
      render: (r) => <span className="text-xs text-neutral-400">{r.derniereConnexion ? new Date(r.derniereConnexion).toLocaleDateString('fr-FR') : '—'}</span>
    },
  ];

  async function handleInvite() {
    if (!inviteForm.email) { toast.error('Email requis'); return; }
    try {
      // Create user with a temp password — they'll reset it
      await api.post('/utilisateurs', { email: inviteForm.email, role: inviteForm.role });
      toast.success(`Invitation envoyée à ${inviteForm.email}`);
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
      setModalInviter(false);
      setInviteForm({ email: '', role: 'VIEWER' });
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors de l\'invitation');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <Settings className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Paramètres</h1>
          <p className="text-sm text-neutral-500">Configuration de l'organisation</p>
        </div>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'organisation' && (
        <div className="max-w-2xl space-y-6">
          <div className="card space-y-4">
            <h3 className="font-semibold text-neutral-800">Logo de l'organisation</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
                {orgForm.nom?.[0]?.toUpperCase() ?? 'A'}
              </div>
              <button className="btn-secondary flex items-center gap-2">
                <Upload className="w-4 h-4" /> Changer le logo
              </button>
            </div>
          </div>
          <div className="card space-y-4">
            <h3 className="font-semibold text-neutral-800">Informations générales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="label">Nom de l'organisation</label>
                <input className="input" value={orgForm.nom} onChange={(e) => setOrgForm((f) => ({ ...f, nom: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="label">Email</label>
                <input type="email" className="input" value={orgForm.email} onChange={(e) => setOrgForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="label">Téléphone</label>
                <input type="tel" className="input" value={orgForm.telephone} onChange={(e) => setOrgForm((f) => ({ ...f, telephone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="label">Devise</label>
                <select className="input" value={orgForm.devise} onChange={(e) => setOrgForm((f) => ({ ...f, devise: e.target.value }))}>
                  <option value="XOF">XOF — Franc CFA BCEAO</option>
                  <option value="XAF">XAF — Franc CFA BEAC</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar américain</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label">Langue</label>
                <select className="input" value={orgForm.langue} onChange={(e) => setOrgForm((f) => ({ ...f, langue: e.target.value }))}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="label">Exercice comptable</label>
                <input type="number" className="input" value={orgForm.exercice} onChange={(e) => setOrgForm((f) => ({ ...f, exercice: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleOrgSave} disabled={orgSaving} className="btn-primary disabled:opacity-60">
                {orgSaving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'utilisateurs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModalInviter(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Inviter un utilisateur
            </button>
          </div>
          {usersLoading ? (
            <div className="flex justify-center py-12 text-neutral-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Chargement des utilisateurs...
            </div>
          ) : (
            <DataTable columns={colsUsers} data={utilisateursData as unknown as Record<string, unknown>[]} isLoading={false} />
          )}
          <Modal
            open={modalInviter}
            onOpenChange={setModalInviter}
            title="Inviter un utilisateur"
            footer={
              <>
                <button className="btn-secondary" onClick={() => setModalInviter(false)}>Annuler</button>
                <button className="btn-primary" onClick={handleInvite}>Envoyer</button>
              </>
            }
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="utilisateur@organisation.ci"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="label">Rôle</label>
                <select
                  className="input"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  {['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'RH', 'RESPONSABLE_PROJET', 'AUDITEUR', 'VIEWER'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {tab === 'securite' && (
        <div className="max-w-2xl space-y-6">
          <div className="card space-y-4">
            <h3 className="font-semibold text-neutral-800">Authentification</h3>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-neutral-700">Double authentification (2FA)</p>
                <p className="text-xs text-neutral-400 mt-0.5">Ajoute une couche de sécurité supplémentaire</p>
              </div>
              <button
                onClick={() => setTwoFA((v) => !v)}
                className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', twoFA ? 'bg-primary-600' : 'bg-neutral-200')}
              >
                <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', twoFA ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>
            <div className="space-y-1">
              <label className="label">Durée de session (heures)</label>
              <select className="input max-w-xs" value={dureeSession} onChange={(e) => setDureeSession(e.target.value)}>
                <option value="2">2 heures</option>
                <option value="8">8 heures</option>
                <option value="24">24 heures</option>
                <option value="168">7 jours</option>
              </select>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm text-neutral-500 text-center py-4">
              La gestion avancée des sessions (révoquer des appareils distants) sera disponible dans une prochaine version.
            </p>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="max-w-2xl card space-y-4">
          <h3 className="font-semibold text-neutral-800">Préférences de notification</h3>
          <div className="space-y-4">
            {NOTIFS.map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id={n.id}
                  checked={notifs[n.id]}
                  onChange={(e) => setNotifs((prev) => ({ ...prev, [n.id]: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={n.id} className="cursor-pointer">
                  <p className="text-sm font-medium text-neutral-700">{n.label}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{n.desc}</p>
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => toast.success('Préférences sauvegardées')} className="btn-primary">Enregistrer</button>
          </div>
        </div>
      )}

      {tab === 'integrations' && (
        <div className="space-y-4">
          <p className="text-sm text-neutral-500">Connectez vos solutions de paiement mobile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAIEMENTS.map((p) => (
              <div key={p.id} className="card flex items-center gap-4">
                <div className="text-3xl">{p.logo}</div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-800">{p.nom}</p>
                  <span className={integrations[p.id] ? 'badge badge-success' : 'badge badge-neutral'}>
                    {integrations[p.id] ? 'Connecté' : 'Déconnecté'}
                  </span>
                </div>
                <button
                  onClick={() => setIntegrations((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className={integrations[p.id] ? 'btn-secondary text-sm' : 'btn-primary text-sm'}
                >
                  {integrations[p.id] ? 'Déconnecter' : 'Connecter'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
