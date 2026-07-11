import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatutBadge } from '../../src/components/StatutBadge';

const PRIMARY = '#146C43';

type StatutProjet = 'en_cours' | 'termine' | 'en_attente' | 'annule';

interface Projet {
  id: string;
  nom: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutProjet;
  budgetTotal: number;
  budgetDepense: number;
  description: string;
}

const PROJETS_MOCK: Projet[] = [
  {
    id: '1', nom: 'Projet Eau Potable', dateDebut: '01 janv. 2026', dateFin: '31 déc. 2026',
    statut: 'en_cours', budgetTotal: 5000000, budgetDepense: 4600000,
    description: 'Accès à l'eau potable dans les villages ruraux',
  },
  {
    id: '2', nom: 'École Communautaire', dateDebut: '01 mars 2026', dateFin: '30 août 2026',
    statut: 'en_cours', budgetTotal: 8000000, budgetDepense: 3200000,
    description: 'Construction d'une école primaire',
  },
  {
    id: '3', nom: 'Formation Numérique', dateDebut: '15 févr. 2026', dateFin: '15 juin 2026',
    statut: 'termine', budgetTotal: 2000000, budgetDepense: 1950000,
    description: 'Formation aux outils numériques pour les jeunes',
  },
  {
    id: '4', nom: 'Microfinance Femmes', dateDebut: '01 sept. 2026', dateFin: '01 mars 2027',
    statut: 'en_attente', budgetTotal: 3500000, budgetDepense: 0,
    description: 'Programme de microcrédit pour les femmes entrepreneures',
  },
  {
    id: '5', nom: 'Reboisement 2025', dateDebut: '01 janv. 2025', dateFin: '31 déc. 2025',
    statut: 'annule', budgetTotal: 1200000, budgetDepense: 250000,
    description: 'Plantation d'arbres dans les zones dégradées',
  },
];

const FILTRES: { label: string; valeur: StatutProjet | 'tous' }[] = [
  { label: 'Tous', valeur: 'tous' },
  { label: 'En cours', valeur: 'en_cours' },
  { label: 'Terminé', valeur: 'termine' },
  { label: 'En attente', valeur: 'en_attente' },
  { label: 'Annulé', valeur: 'annule' },
];

function formatFCFA(montant: number) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

function ProjetCard({ projet }: { projet: Projet }) {
  const progression = Math.min(
    Math.round((projet.budgetDepense / projet.budgetTotal) * 100),
    100,
  );
  const progressColor =
    progression >= 90 ? '#DC2626' : progression >= 70 ? '#F28C25' : PRIMARY;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardNom} numberOfLines={1}>
          {projet.nom}
        </Text>
        <StatutBadge statut={projet.statut} type="projet" />
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {projet.description}
      </Text>
      <View style={styles.datesRow}>
        <Text style={styles.dateText}>Du {projet.dateDebut}</Text>
        <Text style={styles.dateText}>Au {projet.dateFin}</Text>
      </View>

      {/* Barre de progression budget */}
      <View style={styles.budgetSection}>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget consommé</Text>
          <Text style={[styles.budgetPct, { color: progressColor }]}>{progression}%</Text>
        </View>
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${progression}%`, backgroundColor: progressColor }]}
          />
        </View>
        <Text style={styles.budgetDetail}>
          {formatFCFA(projet.budgetDepense)} / {formatFCFA(projet.budgetTotal)}
        </Text>
      </View>
    </View>
  );
}

export default function ProjetsScreen() {
  const [filtre, setFiltre] = useState<StatutProjet | 'tous'>('tous');

  const filtered =
    filtre === 'tous' ? PROJETS_MOCK : PROJETS_MOCK.filter((p) => p.statut === filtre);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Filtres horizontaux */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtresContainer}
      >
        {FILTRES.map((f) => (
          <Pressable
            key={f.valeur}
            style={[styles.filtrePill, filtre === f.valeur && styles.filtrePillActive]}
            onPress={() => setFiltre(f.valeur)}
          >
            <Text
              style={[styles.filtreText, filtre === f.valeur && styles.filtreTextActive]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProjetCard projet={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun projet pour ce filtre</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  filtresContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filtrePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  filtrePillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  filtreText: { fontSize: 13, fontWeight: '600', color: '#4A4A4A' },
  filtreTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardNom: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  cardDescription: { fontSize: 13, color: '#6B6B6B', marginBottom: 10, lineHeight: 18 },
  datesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  dateText: { fontSize: 12, color: '#9D9D9D' },
  budgetSection: {},
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  budgetLabel: { fontSize: 12, fontWeight: '500', color: '#4A4A4A' },
  budgetPct: { fontSize: 12, fontWeight: '700' },
  progressBg: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: 8, borderRadius: 4 },
  budgetDetail: { fontSize: 11, color: '#9D9D9D' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9D9D9D', fontSize: 15 },
});
