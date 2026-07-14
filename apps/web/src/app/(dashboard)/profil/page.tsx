'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Camera, Shield, Monitor, Building2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ProfilPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  const userOrg = (session?.user as any)?.organisationId;

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    langue: 'fr',
  });
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ ancien: '', nouveau: '', confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setForm({
        prenom: u.prenom ?? '',
        nom: u.nom ?? '',
        email: u.email ?? '',
        telephone: u.telephone ?? '',
        langue: u.langue ?? 'fr',
      });
    }
  }, [session]);

  // Also fetch full user profile from API for more fields
  useEffect(() => {
    if (!userId) return;
    api.get(`/utilisateurs/${userId}`).then(({ data }) => {
      setForm((prev) => ({
        ...prev,
        prenom: data.prenom ?? prev.prenom,
        nom: data.nom ?? prev.nom,
        email: data.email ?? prev.email,
        telephone: data.telephone ?? prev.telephone,
        langue: data.langue ?? prev.langue,
      }));
    }).catch(() => {/* silence — session data is enough */});
  }, [userId]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    try {
      await api.patch(`/utilisateurs/${userId}`, {
        prenom: form.prenom || undefined,
        nom: form.nom || undefined,
        telephone: form.telephone || undefined,
        langue: form.langue || undefined,
      });
      toast.success('Profil mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePw() {
    if (pwForm.nouveau !== pwForm.confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (!pwForm.nouveau || pwForm.nouveau.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!userId) return;
    setPwSaving(true);
    try {
      await api.post(`/utilisateurs/${userId}/changer-mot-de-passe`, {
        ancienMotDePasse: pwForm.ancien,
        nouveauMotDePasse: pwForm.nouveau,
      });
      toast.success('Mot de passe modifié avec succès');
      setPwModal(false);
      setPwForm({ ancien: '', nouveau: '', confirmation: '' });
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur lors du changement de mot de passe');
    } finally {
      setPwSaving(false);
    }
  }

  const initiales = `${form.prenom?.[0] ?? ''}${form.nom?.[0] ?? ''}`.toUpperCase() || 'U';

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    ADMIN: 'Administrateur',
    DIRECTEUR: 'Directeur',
    COMPTABLE: 'Comptable',
    RH: 'Responsable RH',
    RESPONSABLE_PROJET: 'Responsable Projet',
    AUDITEUR: 'Auditeur',
    VIEWER: 'Observateur',
  };

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
            {userRole && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                {roleLabels[userRole] ?? userRole}
              </span>
            )}
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
            <p className="text-xs text-neutral-400">Minimum 8 caractères avec majuscule et chiffre</p>
          </div>
          <button onClick={() => setPwModal(true)} className="btn-secondary text-sm">
            Changer le mot de passe
          </button>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-neutral-600" />
          <h2 className="font-semibold text-neutral-800">Mon organisation</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-neutral-700">
              {(session?.user as any)?.orgNom ?? 'Organisation'}
            </p>
            <p className="text-xs text-neutral-400">
              {userOrg ? `ID: ${userOrg.slice(0, 8).toUpperCase()}` : ''}
            </p>
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
            <button onClick={handleChangePw} disabled={pwSaving} className="btn-primary disabled:opacity-60">
              {pwSaving ? 'Modification...' : 'Confirmer'}
            </button>
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
