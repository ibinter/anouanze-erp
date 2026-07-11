'use client';

import { useState } from 'react';
import { User, Camera, Shield, Monitor, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import Link from 'next/link';

const SESSIONS = [
  { id: 1, appareil: 'Chrome — Windows 10', lieu: 'Abidjan, Côte d\'Ivoire', derniere: '2026-07-10 09:42', actuelle: true },
  { id: 2, appareil: 'Safari — iPhone 14', lieu: 'Abidjan, Côte d\'Ivoire', derniere: '2026-07-09 18:15', actuelle: false },
  { id: 3, appareil: 'Firefox — Ubuntu', lieu: 'Paris, France', derniere: '2026-07-08 14:30', actuelle: false },
];

export default function ProfilPage() {
  const [form, setForm] = useState({
    prenom: 'Patrice',
    nom: 'Kouakou',
    email: 'p.kouakou@anouanze.org',
    telephone: '+225 07 12 34 56',
    langue: 'fr',
  });
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Profil mis à jour');
  }

  async function handleChangePw() {
    if (pwForm.nouveau !== pwForm.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Mot de passe modifié');
    setPwModal(false);
    setPwForm({ ancien: '', nouveau: '', confirmation: '' });
  }

  const initiales = `${form.prenom[0]}${form.nom[0]}`.toUpperCase();

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Mon profil</h1>
        <p className="text-sm text-neutral-500 mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold select-none">
              {initiales}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:bg-neutral-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-neutral-600" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-lg">{form.prenom} {form.nom}</p>
            <p className="text-sm text-neutral-500">{form.email}</p>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Administrateur</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Prénom</label>
            <input className="input w-full" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
          </div>
          <div>
            <label className="label">Nom</label>
            <input className="input w-full" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input w-full bg-neutral-50 text-neutral-500 cursor-not-allowed" value={form.email} readOnly />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input w-full" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          </div>
          <div>
            <label className="label">Langue</label>
            <select className="input w-full" value={form.langue} onChange={(e) => setForm({ ...form, langue: e.target.value })}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-neutral-800">Sécurité</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-neutral-700">Mot de passe</p>
            <p className="text-xs text-neutral-400">Dernière modification il y a 45 jours</p>
          </div>
          <button onClick={() => setPwModal(true)} className="btn-secondary text-sm">
            Changer le mot de passe
          </button>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-neutral-600" />
          <h2 className="font-semibold text-neutral-800">Sessions actives</h2>
        </div>
        <ul className="space-y-3">
          {SESSIONS.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                    {s.appareil}
                    {s.actuelle && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Session actuelle</span>}
                  </p>
                  <p className="text-xs text-neutral-400">{s.lieu} · {s.derniere}</p>
                </div>
              </div>
              {!s.actuelle && (
                <button
                  onClick={() => toast.success('Session révoquée')}
                  className="text-xs text-red-600 hover:underline"
                >
                  Révoquer
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-neutral-600" />
          <h2 className="font-semibold text-neutral-800">Mon organisation</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-700">ANOUANZÊ ONG</p>
            <p className="text-xs text-neutral-400">Abidjan, Côte d&apos;Ivoire · ID: ORG-2024-001</p>
          </div>
          <Link href="/parametres" className="text-sm text-primary-600 hover:underline">
            Paramètres organisation
          </Link>
        </div>
      </div>

      <Modal
        open={pwModal}
        onOpenChange={setPwModal}
        title="Changer le mot de passe"
        size="sm"
        footer={
          <>
            <button onClick={() => setPwModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={handleChangePw} className="btn-primary">Confirmer</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Mot de passe actuel</label>
            <input type="password" className="input w-full" value={pwForm.ancien} onChange={(e) => setPwForm({ ...pwForm, ancien: e.target.value })} />
          </div>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input type="password" className="input w-full" value={pwForm.nouveau} onChange={(e) => setPwForm({ ...pwForm, nouveau: e.target.value })} />
          </div>
          <div>
            <label className="label">Confirmer le nouveau mot de passe</label>
            <input type="password" className="input w-full" value={pwForm.confirmation} onChange={(e) => setPwForm({ ...pwForm, confirmation: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
