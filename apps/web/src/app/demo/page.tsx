'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const MODULES = [
  'Membres & cotisations', 'Comptabilité SYCEBNL', 'Projets & MEAL',
  'Budget & Trésorerie', 'Ressources humaines', 'Stocks & Achats',
  'Documents', 'Reporting & BI', 'Assistant IA',
];

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', organisation: '',
    typeOrg: '', pays: 'Côte d\'Ivoire', taille: '', modules: [] as string[], message: '',
  });

  const toggleModule = (m: string) => {
    setForm((f) => ({
      ...f,
      modules: f.modules.includes(m) ? f.modules.filter((x) => x !== m) : [...f.modules, m],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ici : appel API pour enregistrer le prospect
    // await api.post('/prospects', { ...form, source: 'landing-demo' });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-6">
            <CheckCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-3">Demande reçue !</h1>
          <p className="text-neutral-500 mb-2">
            Merci <strong>{form.prenom}</strong>. Notre équipe vous contactera dans les 24 heures ouvrées pour planifier votre démonstration personnalisée.
          </p>
          <p className="text-sm text-neutral-400 mb-8">Un email de confirmation a été envoyé à <strong>{form.email}</strong>.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Retour à l'accueil
            </Link>
            <Link href="/login" className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold px-6 py-3 rounded-xl transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header minimal */}
      <nav className="bg-white border-b border-neutral-100 h-16 flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="ANOUANZÊ" className="w-7 h-7" />
          <span className="font-bold text-primary-600 text-sm">ANOUANZÊ</span>
          <span className="text-accent-400 font-semibold text-xs">ERP</span>
        </div>
        <div className="w-20" />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-neutral-800 mb-3">Demande de démonstration</h1>
          <p className="text-neutral-500">
            Remplissez ce formulaire et notre équipe vous préparera une démo personnalisée de <strong>30 minutes</strong>, adaptée à votre organisation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-6">
          {/* Identité */}
          <div>
            <h3 className="font-semibold text-neutral-700 text-sm mb-4 uppercase tracking-wide">Vos coordonnées</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Prénom *</label>
                <input required className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nom *</label>
                <input required className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Email professionnel *</label>
                <input required type="email" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Téléphone (WhatsApp)</label>
                <input type="tel" className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+225 07 00 00 00 00" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Organisation */}
          <div>
            <h3 className="font-semibold text-neutral-700 text-sm mb-4 uppercase tracking-wide">Votre organisation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Nom de l'organisation *</label>
                <input required className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.organisation} onChange={(e) => setForm({ ...form, organisation: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Type d'organisation</label>
                <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.typeOrg} onChange={(e) => setForm({ ...form, typeOrg: e.target.value })}>
                  <option value="">Sélectionner…</option>
                  <option>ONG internationale</option>
                  <option>ONG nationale</option>
                  <option>Association locale</option>
                  <option>Fondation</option>
                  <option>Coopérative</option>
                  <option>Mutuelle / groupement</option>
                  <option>Réseau / fédération</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Pays</label>
                <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })}>
                  {["Côte d'Ivoire", 'Sénégal', 'Mali', 'Burkina Faso', 'Niger', 'Guinée', 'Bénin', 'Togo', 'Cameroun', 'RDC', 'Autre'].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Taille de l'organisation</label>
                <select className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={form.taille} onChange={(e) => setForm({ ...form, taille: e.target.value })}>
                  <option value="">Sélectionner…</option>
                  <option>1–5 personnes</option>
                  <option>6–20 personnes</option>
                  <option>21–50 personnes</option>
                  <option>51–200 personnes</option>
                  <option>200+ personnes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modules d'intérêt */}
          <div>
            <h3 className="font-semibold text-neutral-700 text-sm mb-1 uppercase tracking-wide">Modules souhaités</h3>
            <p className="text-xs text-neutral-400 mb-4">Sélectionnez les modules que vous souhaitez voir en démo</p>
            <div className="flex flex-wrap gap-2">
              {MODULES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleModule(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.modules.includes(m)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Message ou contexte particulier</label>
            <textarea
              rows={3}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Décrivez vos besoins spécifiques, vos défis actuels, ou posez-nous vos questions…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-colors text-base"
          >
            Envoyer ma demande de démo →
          </button>

          <p className="text-center text-xs text-neutral-400">
            Vos données sont traitées conformément à notre{' '}
            <a href="/confidentialite" className="underline hover:text-primary-600">politique de confidentialité</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
