import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KpiCard } from '../../src/components/KpiCard';

const PRIMARY = '#146C43';
const ACCENT = '#F28C25';

const KPI_DATA = [
  {
    titre: 'Membres actifs',
    valeur: '142',
    couleur: PRIMARY,
    icone: <Ionicons name="people" size={18} color={PRIMARY} />,
  },
  {
    titre: 'Projets',
    valeur: '12',
    couleur: '#2563EB',
    icone: <MaterialCommunityIcons name="folder" size={18} color="#2563EB" />,
  },
  {
    titre: 'Trésorerie (FCFA)',
    valeur: '4 250 000',
    couleur: ACCENT,
    icone: <MaterialCommunityIcons name="cash" size={18} color={ACCENT} />,
  },
  {
    titre: 'Dons du mois',
    valeur: '320 000',
    couleur: '#7C3AED',
    icone: <Ionicons name="heart" size={18} color="#7C3AED" />,
  },
];

const ECHEANCES = [
  { id: '1', titre: 'Réunion CA mensuelle', date: '15 juil. 2026', projet: 'Gouvernance' },
  { id: '2', titre: 'Rapport financier T2', date: '20 juil. 2026', projet: 'Finance' },
  { id: '3', titre: 'Remise dossier subvention', date: '25 juil. 2026', projet: 'Proj. Eau' },
  { id: '4', titre: 'Renouvellement cotisations', date: '31 juil. 2026', projet: 'Membres' },
  { id: '5', titre: 'Audit interne', date: '05 août 2026', projet: 'Contrôle' },
];

const ALERTES = [
  { id: '1', message: '8 cotisations membres en retard', niveau: 'critique' },
  { id: '2', message: '2 projets sans rapport de suivi', niveau: 'attention' },
  { id: '3', message: 'Budget Projet Eau dépassé à 92%', niveau: 'attention' },
];

type NiveauAlerte = 'critique' | 'attention';

const ALERTE_STYLE: Record<NiveauAlerte, { bg: string; text: string; dot: string }> = {
  critique: { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  attention: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
};

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Bonjour 👋</Text>
        <Text style={styles.subtitle}>Vue d'ensemble de votre organisation</Text>

        {/* KPI Grid 2x2 */}
        <View style={styles.kpiGrid}>
          {KPI_DATA.map((kpi, i) => (
            <KpiCard key={i} {...kpi} />
          ))}
        </View>

        {/* Prochaines échéances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prochaines échéances</Text>
          {ECHEANCES.map((e) => (
            <View key={e.id} style={styles.echeanceItem}>
              <View style={styles.echeanceIcon}>
                <Ionicons name="calendar-outline" size={18} color={PRIMARY} />
              </View>
              <View style={styles.echeanceInfo}>
                <Text style={styles.echeanceTitre} numberOfLines={1}>
                  {e.titre}
                </Text>
                <Text style={styles.echeanceMeta}>
                  {e.date} · {e.projet}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Alertes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes</Text>
          {ALERTES.map((a) => {
            const s = ALERTE_STYLE[a.niveau as NiveauAlerte];
            return (
              <View key={a.id} style={[styles.alerteItem, { backgroundColor: s.bg }]}>
                <View style={[styles.alerteDot, { backgroundColor: s.dot }]} />
                <Text style={[styles.alerteText, { color: s.text }]}>{a.message}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 32 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 13, color: '#6B6B6B', marginTop: 2, marginBottom: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  echeanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  echeanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  echeanceInfo: { flex: 1 },
  echeanceTitre: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  echeanceMeta: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  alerteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  alerteDot: { width: 8, height: 8, borderRadius: 4 },
  alerteText: { fontSize: 13, fontWeight: '500', flex: 1 },
});
