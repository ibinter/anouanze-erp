'use client';

import { useState } from 'react';
import {
  BookOpen, MessageCircle, Video, FileQuestion,
  Search, ChevronRight, ExternalLink, HelpCircle,
  Headphones, Zap, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

const FAQ = [
  {
    cat: 'Connexion & Sécurité',
    items: [
      {
        q: 'Comment réinitialiser mon mot de passe ?',
        a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, saisissez votre email. Vous recevrez un lien valable 1 heure.',
      },
      {
        q: 'Comment activer la double authentification (2FA) ?',
        a: 'Allez dans Paramètres › Sécurité › Activer la 2FA. Scannez le QR code avec une application comme Google Authenticator.',
      },
      {
        q: 'Pourquoi ma session expire-t-elle rapidement ?',
        a: 'Pour des raisons de sécurité, les sessions expirent après 15 minutes d\'inactivité. Vous pouvez rester connecté en cochant "Se souvenir de moi".',
      },
    ],
  },
  {
    cat: 'Modules métier',
    items: [
      {
        q: 'Comment enregistrer un nouveau membre ?',
        a: 'Allez dans Membres › Nouveau membre. Remplissez les informations obligatoires (nom, prénom, email) puis cliquez sur Enregistrer.',
      },
      {
        q: 'Comment créer un projet et lui associer des bailleurs ?',
        a: 'Dans Projets › Nouveau projet, renseignez les informations du projet. Ensuite allez dans Bailleurs pour créer une convention liée au projet.',
      },
      {
        q: 'Comment enregistrer une écriture comptable ?',
        a: 'Dans Comptabilité › Écritures, cliquez sur Nouvelle écriture. Sélectionnez le journal, la date, et saisissez les lignes débit/crédit en veillant à l\'équilibre.',
      },
      {
        q: 'Comment générer une fiche de paie ?',
        a: 'Dans Ressources Humaines › Employés, sélectionnez l\'employé, allez dans l\'onglet Fiches de paie, choisissez la période et cliquez sur Générer.',
      },
    ],
  },
  {
    cat: 'Exports & Documents',
    items: [
      {
        q: 'Quels formats d\'export sont disponibles ?',
        a: 'Vous pouvez exporter en PDF, Excel (XLSX) et CSV depuis la plupart des modules. Le bouton d\'export se trouve en haut à droite de chaque liste.',
      },
      {
        q: 'Comment imprimer un rapport financier ?',
        a: 'Dans Rapports & BI, filtrez la période souhaitée puis cliquez sur le bouton Exporter PDF. Le document est généré et téléchargé automatiquement.',
      },
    ],
  },
  {
    cat: 'Assistant IA SARA',
    items: [
      {
        q: 'Comment utiliser SARA ?',
        a: 'Cliquez sur l\'icône SARA (robot) en bas à droite ou allez dans le menu Assistant IA. Posez votre question en français ou en anglais.',
      },
      {
        q: 'SARA peut-elle modifier des données ?',
        a: 'Non. SARA est un assistant consultatif. Elle explique, guide et répond à vos questions mais ne modifie jamais de données sans votre confirmation explicite.',
      },
    ],
  },
];

const GUIDES = [
  { titre: 'Guide de démarrage rapide', desc: 'Configurer votre organisation en 10 minutes', icon: Zap, color: 'text-accent-500 bg-accent-50' },
  { titre: 'Comptabilité SYCEBNL', desc: 'Plan comptable, journaux, écritures, bilan', icon: BookOpen, color: 'text-primary-600 bg-primary-50' },
  { titre: 'Gestion des membres', desc: 'Inscription, cotisations, cartes membres', icon: Star, color: 'text-blue-600 bg-blue-50' },
  { titre: 'Projets & MEAL', desc: 'Cycle de projet, indicateurs, collecte de données', icon: FileQuestion, color: 'text-purple-600 bg-purple-50' },
];

export default function AidePage() {
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredFaq = FAQ.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        !search ||
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase()),
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 mb-4">
          <HelpCircle className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-800">Centre d'aide</h1>
        <p className="text-neutral-500 mt-1">Guides, FAQ et support pour ANOUANZÊ ERP</p>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="search"
          placeholder="Rechercher dans l'aide..."
          className="input pl-10 w-full text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Accès rapide */}
      {!search && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Guide utilisateur', icon: BookOpen, href: '#guides' },
            { label: 'Assistant SARA', icon: MessageCircle, href: '/ia' },
            { label: 'Vidéos formation', icon: Video, href: '#videos' },
            { label: 'Contacter le support', icon: Headphones, href: '#support' },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-card-hover transition-shadow cursor-pointer group"
            >
              <item.icon className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-neutral-700">{item.label}</span>
            </a>
          ))}
        </div>
      )}

      {/* Guides */}
      {!search && (
        <section id="guides">
          <h2 className="text-base font-semibold text-neutral-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" />
            Guides disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GUIDES.map(guide => (
              <div key={guide.titre} className="card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow cursor-pointer group">
                <div className={`p-2 rounded-lg ${guide.color} shrink-0`}>
                  <guide.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-800 text-sm group-hover:text-primary-600 transition-colors">{guide.titre}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{guide.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600 transition-colors shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section>
        <h2 className="text-base font-semibold text-neutral-700 mb-4 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-primary-600" />
          Questions fréquentes
          {search && <span className="text-xs text-neutral-400 font-normal">— résultats pour « {search} »</span>}
        </h2>

        {filteredFaq.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-neutral-400 text-sm">Aucun résultat pour « {search} »</p>
            <button onClick={() => setSearch('')} className="text-primary-600 text-sm mt-2 hover:underline">
              Effacer la recherche
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredFaq.map(cat => (
            <div key={cat.cat}>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2 px-1">{cat.cat}</h3>
              <div className="card divide-y divide-neutral-100">
                {cat.items.map(item => (
                  <div key={item.q}>
                    <button
                      className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 hover:bg-neutral-50 transition-colors"
                      onClick={() => setOpenFaq(openFaq === item.q ? null : item.q)}
                    >
                      <span className="font-medium text-neutral-800 text-sm">{item.q}</span>
                      {openFaq === item.q
                        ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      }
                    </button>
                    {openFaq === item.q && (
                      <div className="px-4 pb-4 text-sm text-neutral-600 leading-relaxed bg-neutral-50">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section id="support" className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary-50 shrink-0">
            <Headphones className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-neutral-800 mb-1">Contacter le support</h2>
            <p className="text-sm text-neutral-500 mb-4">
              Vous n'avez pas trouvé la réponse ? Notre équipe est disponible du lundi au vendredi, 8h–18h (GMT).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/ia" className="btn-primary flex items-center gap-2 justify-center">
                <MessageCircle className="w-4 h-4" />
                Demander à SARA
              </Link>
              <a
                href="mailto:support@ibigsoft.com"
                className="btn-secondary flex items-center gap-2 justify-center"
              >
                <ExternalLink className="w-4 h-4" />
                Email support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
