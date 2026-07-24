'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, BientotDisponible } from './primitives';
import { ROLES_ADMINISTRATION, type Role } from './roles';

interface MembreLeger {
  id: string;
  actif: boolean;
}

interface PlanLeger {
  id: string;
  code: string;
  nom: string;
  prixMensuel: string | number;
  prixAnnuel: string | number;
  maxUtilisateurs: number | null;
  surDevis: boolean;
}

interface AbonnementCourant {
  organisation: {
    id: string;
    nom: string;
    statutAbonnement: string;
    dateFinEssai: string | null;
  };
  abonnement: {
    id: string;
    periodicite: 'MENSUELLE' | 'ANNUELLE';
    dateDebut: string;
    dateFin: string;
    statut: string;
    montant: string | number;
    renouvellementAuto: boolean;
    plan: PlanLeger;
  } | null;
  consommation: {
    utilisateursActifs: number;
    utilisateursTotal: number;
    utilisateursInclus: number | null;
  };
  prochaineEcheance: string | null;
}

interface LigneFactureLeger {
  id: string;
  libelle: string;
  quantite: string | number;
  prixUnitaire: string | number;
  montant: string | number;
}

interface FactureLeger {
  id: string;
  numero: string;
  montantHT: string | number;
  montantTTC: string | number;
  statut: string;
  dateEmission: string;
  dateEcheance: string;
  datePaiement: string | null;
  lignes: LigneFactureLeger[];
}

const num = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fcfa = (v: string | number | null | undefined) =>
  `${new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(num(v))} FCFA`;

const dateFr = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString('fr-CI') : '—';

const STATUT_FACTURE_CLASSES: Record<string, string> = {
  PAYEE: 'bg-green-100 text-green-700',
  EMISE: 'bg-blue-100 text-blue-700',
  EN_RETARD: 'bg-red-100 text-red-700',
  ANNULEE: 'bg-neutral-100 text-neutral-500',
  BROUILLON: 'bg-neutral-100 text-neutral-600',
};

export function AbonnementSettings({ roleCourant }: { roleCourant?: string }) {
  const t = useTranslations('shell.parametres.abonnement');
  const estAdministrateur = ROLES_ADMINISTRATION.includes(roleCourant as Role);
  const [exportEnCours, setExportEnCours] = useState<string | null>(null);

  const { data: membres = [] } = useQuery<MembreLeger[]>({
    queryKey: ['membres-organisation'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs/organisation/membres');
      return (Array.isArray(data) ? data : []) as MembreLeger[];
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const { data: courant, isLoading: chargeAbonnement } = useQuery<AbonnementCourant | null>({
    queryKey: ['abonnement-courant'],
    queryFn: async () => {
      const { data } = await api.get('/abonnements/courant');
      return (data ?? null) as AbonnementCourant | null;
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const { data: factures = [] } = useQuery<FactureLeger[]>({
    queryKey: ['abonnement-factures'],
    queryFn: async () => {
      const { data } = await api.get('/abonnements/factures');
      return (Array.isArray(data) ? data : []) as FactureLeger[];
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const actifs = membres.filter((m) => m.actif).length;
  const abonnement = courant?.abonnement ?? null;
  const inclus = courant?.consommation.utilisateursInclus ?? null;

  async function telechargerFacture(facture: FactureLeger) {
    setExportEnCours(facture.id);
    try {
      const { exportDocument, factureExportDef } = await import('@/lib/pdf-engine');
      const def = factureExportDef({
        numero: facture.numero,
        organisation: courant?.organisation.nom,
        periode: `${dateFr(facture.dateEmission)} — échéance ${dateFr(facture.dateEcheance)}`,
        filtersSummary: `Statut : ${facture.statut} · Total TTC : ${fcfa(facture.montantTTC)}`,
      });
      const rows = (facture.lignes ?? []).map((l) => ({
        libelle: l.libelle,
        quantite: num(l.quantite),
        prixUnitaire: num(l.prixUnitaire),
        montant: num(l.montant),
      }));
      await exportDocument(def, rows, 'pdf');
    } finally {
      setExportEnCours(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre={t('consommationTitre')} description={t('consommationDesc')}>
        {estAdministrateur ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">{t('comptesActifs')}</p>
                  <p className="text-xl font-bold text-neutral-800">{actifs}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">{t('comptesTotal')}</p>
                  <p className="text-xl font-bold text-neutral-800">{membres.length}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">{t('utilisateursInclus')}</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {inclus === null ? t('illimite') : inclus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">{t('reserveAdmin')}</p>
        )}
        <BientotDisponible
          titre={t('consommationBientotTitre')}
          raison={t('consommationBientotRaison')}
        />
      </Section>

      <Section titre={t('formuleTitre')} description={t('formuleDesc')}>
        {!estAdministrateur ? (
          <p className="text-sm text-neutral-500">{t('reserveAdmin')}</p>
        ) : chargeAbonnement ? (
          <p className="text-sm text-neutral-500">{t('chargement')}</p>
        ) : abonnement ? (
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-neutral-500">{t('formuleActuelle')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">{abonnement.plan.nom}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t('periodicite')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">
                {abonnement.periodicite === 'ANNUELLE' ? t('ANNUELLE') : t('MENSUELLE')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t('montant')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">{fcfa(abonnement.montant)}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t('prochaineEcheance')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">
                {dateFr(courant?.prochaineEcheance)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t('statutAbonnement')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">{abonnement.statut}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">{t('renouvellementAuto')}</dt>
              <dd className="text-sm font-semibold text-neutral-800">
                {abonnement.renouvellementAuto ? t('oui') : t('non')}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-neutral-600">{t('aucunAbonnement')}</p>
            {courant?.organisation.statutAbonnement === 'ESSAI' && (
              <p className="text-xs text-neutral-500">
                {t('essaiEnCours')} — {dateFr(courant.organisation.dateFinEssai)}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/#tarifs" className="btn-secondary inline-flex">{t('voirTarifs')}</Link>
          <Link href="/aide" className="btn-secondary inline-flex">{t('contacterSupport')}</Link>
        </div>
      </Section>

      <Section titre={t('facturesTitre')} description={t('facturesDesc')}>
        {!estAdministrateur ? (
          <p className="text-sm text-neutral-500">{t('reserveAdmin')}</p>
        ) : factures.length === 0 ? (
          <p className="text-sm text-neutral-500">{t('aucuneFacture')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-xs uppercase text-neutral-500">
                <tr>
                  <th className="py-2 text-left">{t('colNumero')}</th>
                  <th className="py-2 text-left">{t('colDate')}</th>
                  <th className="py-2 text-left">{t('colEcheance')}</th>
                  <th className="py-2 text-right">{t('colMontant')}</th>
                  <th className="py-2 text-left">{t('colStatut')}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {factures.map((f) => (
                  <tr key={f.id}>
                    <td className="py-2 font-medium text-neutral-800">{f.numero}</td>
                    <td className="py-2 text-neutral-600">{dateFr(f.dateEmission)}</td>
                    <td className="py-2 text-neutral-600">{dateFr(f.dateEcheance)}</td>
                    <td className="py-2 text-right text-neutral-800">{fcfa(f.montantTTC)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          STATUT_FACTURE_CLASSES[f.statut] ?? 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {f.statut}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => telechargerFacture(f)}
                        disabled={exportEnCours === f.id}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline disabled:opacity-60"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {exportEnCours === f.id ? t('exportEnCours') : t('telecharger')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <BientotDisponible
          titre={t('paiementBientotTitre')}
          raison={t('paiementBientotRaison')}
        />
      </Section>
    </div>
  );
}
