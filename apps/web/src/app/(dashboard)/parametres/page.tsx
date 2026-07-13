'use client';

import { useState } from 'react';
import { Settings, Upload, UserPlus, Shield, Bell, Plug } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

type Role = 'ADMIN' | 'COMPTABLE' | 'GESTIONNAIRE' | 'MEMBRE' | 'LECTURE';

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: Role;
  actif: boolean;
  derniereConnexion: string;
}

interface SessionActive {
  id: string;
  appareil: string;
  ip: string;
  depuis: string;
  location: string;
}

const UTILISATEURS: Utilisateur[] = [
  { id: '1', nom: 'Marie Koné', email: 'marie.kone@anouanze.ci', role: 'ADMIN', actif: true, derniereConnexion: '2026-07-10 09:14' },
  { id: '2', nom: 'Kouamé Assié', email: 'kouame.assie@anouanze.ci', role: 'COMPTABLE', actif: true, derniereConnexion: '2026-07-10 10:44' },
  { id: '3', nom: 'Adjoua Bah', email: 'adjoua.bah@anouanze.ci', role: 'GESTIONNAIRE', actif: true, derniereConnexion: '2026-07-09 17:02' },
  { id: '4', nom: 'Yao Koffi', email: 'yao.koffi@anouanze.ci', role: 'MEMBRE', actif: false, derniereConnexion: '2026-06-28 11:30' },
  { id: '5', nom: 'Amina Traoré', email: 'amina.traore@anouanze.ci', role: 'LECTURE', actif: true, derniereConnexion: '2026-07-08 14:55' },
];

const SESSIONS_ACTIVES: SessionActive[] = [
  { id: '1', appareil: 'Chrome 126 — Windows 11', ip: '192.168.1.4', depuis: 'Il y a 2h', location: 'Abidjan, CI' },
  { id: '2', appareil: 'Safari — iPhone 15', ip: '41.220.55.8', depuis: 'Il y a 1 jour', location: 'Abidjan, CI' },
  { id: '3', appareil: 'Firefox 127 — macOS', ip: '10.0.0.8', depuis: 'Il y a 3 jours', location: 'Bouaké, CI' },
];

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

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: 'badge badge-error',
  COMPTABLE: 'badge badge-success',
  GESTIONNAIRE: 'badge bg-blue-100 text-blue-700',
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
  const [tab, setTab] = useState('organisation');
  const [modalInviter, setModalInviter] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [dureeSession, setDureeSession] = useState('8');
  const [sessions, setSessions] = useState(SESSIONS_ACTIVES);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFS.map((n) => [n.id, true]))
  );
  const [integrations, setIntegrations] = useState<Record<string, boolean>>(
    Object.fromEntries(PAIEMENTS.map((p) => [p.id, p.connecte]))
  );
  const [utilisateurs, setUtilisateurs] = useState(UTILISATEURS);
  const [orgForm, setOrgForm] = useState({
    nom: 'ANOUANZÊ ONG',
    email: 'contact@anouanze.ci',
    telephone: '+225 27 22 49 3300',
    devise: 'XOF',
    langue: 'fr',
    exercice: '2026',
  });

  const colsUsers: Column<Utilisateur>[] = [
    { key: 'nom', header: 'Nom', render: (r) => <span className="font-semibold text-neutral-800">{r.nom}</span> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs text-neutral-500">{r.email}</span> },
    { key: 'role', header: 'Rôle', render: (r) => <span className={ROLE_STYLES[r.role]}>{r.role}</span> },
    {
      key: 'actif', header: 'Statut', render: (r) => (
        <span className={r.actif ? 'badge badge-success' : 'badge badge-neutral'}>{r.actif ? 'Actif' : 'Inactif'}</span>
      )
    },
    { key: 'derniereConnexion', header: 'Dernière connexion', render: (r) => <span className="text-xs text-neutral-400">{r.derniereConnexion}</span> },
    {
      key: 'actions', header: '', render: (r) => (
        <div className="flex gap-1.5">
          <select
            className="text-xs border border-neutral-200 rounded px-1.5 py-1 bg-white"
            value={r.role}
            onChange={(e) => setUtilisateurs((prev) => prev.map((u) => u.id === r.id ? { ...u, role: e.target.value as Role } : u))}
          >
            {(['ADMIN', 'COMPTABLE', 'GESTIONNAIRE', 'MEMBRE', 'LECTURE'] as Role[]).map((ro) => (
              <option key={ro} value={ro}>{ro}</option>
            ))}
          </select>
          <button
            onClick={() => setUtilisateurs((prev) => prev.map((u) => u.id === r.id ? { ...u, actif: !u.actif } : u))}
            className="text-xs btn-secondary py-1 px-2"
          >
            {r.actif ? 'Désactiver' : 'Activer'}
          </button>
        </div>
      )
    },
  ];

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
              <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">A</div>
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
              <button className="btn-primary">Enregistrer</button>
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
          <DataTable columns={colsUsers} data={utilisateurs as unknown as Record<string, unknown>[]} isLoading={false} />
          <Modal
            open={modalInviter}
            onOpenChange={setModalInviter}
            title="Inviter un utilisateur"
            footer={
              <>
                <button className="btn-secondary" onClick={() => setModalInviter(false)}>Annuler</button>
                <button className="btn-primary" onClick={() => setModalInviter(false)}>Envoyer l'invitation</button>
              </>
            }
          >
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="utilisateur@organisation.ci" />
              </div>
              <div className="space-y-1">
                <label className="label">Rôle</label>
                <select className="input">
                  {(['ADMIN', 'COMPTABLE', 'GESTIONNAIRE', 'MEMBRE', 'LECTURE'] as Role[]).map((r) => (
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
          <div className="card space-y-4">
            <h3 className="font-semibold text-neutral-800">Sessions actives</h3>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{s.appareil}</p>
                    <p className="text-xs text-neutral-400">{s.ip} · {s.location} · {s.depuis}</p>
                  </div>
                  <button
                    onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Révoquer
                  </button>
                </div>
              ))}
            </div>
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
            <button className="btn-primary">Enregistrer</button>
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
