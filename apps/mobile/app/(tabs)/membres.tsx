import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatutBadge } from '../../src/components/StatutBadge';

const PRIMARY = '#146C43';

interface Membre {
  id: string;
  nom: string;
  prenom: string;
  numero: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  email: string;
}

const MEMBRES_MOCK: Membre[] = [
  { id: '1', nom: 'KOUAKOU', prenom: 'Patrice', numero: 'M-001', statut: 'actif', email: 'patrice@exemple.ci' },
  { id: '2', nom: 'DIALLO', prenom: 'Aminata', numero: 'M-002', statut: 'actif', email: 'aminata@exemple.ci' },
  { id: '3', nom: 'BAMBA', prenom: 'Seydou', numero: 'M-003', statut: 'inactif', email: 'seydou@exemple.ci' },
  { id: '4', nom: 'KONÉ', prenom: 'Fatoumata', numero: 'M-004', statut: 'actif', email: 'fatoumata@exemple.ci' },
  { id: '5', nom: 'TOURÉ', prenom: 'Ibrahim', numero: 'M-005', statut: 'suspendu', email: 'ibrahim@exemple.ci' },
  { id: '6', nom: 'OUATTARA', prenom: 'Mariam', numero: 'M-006', statut: 'actif', email: 'mariam@exemple.ci' },
  { id: '7', nom: 'TRAORÉ', prenom: 'Moussa', numero: 'M-007', statut: 'actif', email: 'moussa@exemple.ci' },
];

function getInitials(prenom: string, nom: string) {
  return `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
}

const AVATAR_COLORS = ['#146C43', '#2563EB', '#7C3AED', '#DC2626', '#F28C25', '#0891B2'];

function MembreItem({ item }: { item: Membre }) {
  const avatarColor = AVATAR_COLORS[parseInt(item.id) % AVATAR_COLORS.length];
  return (
    <View style={styles.membreItem}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(item.prenom, item.nom)}</Text>
      </View>
      <View style={styles.membreInfo}>
        <Text style={styles.membreNom}>
          {item.prenom} {item.nom}
        </Text>
        <Text style={styles.membreNumero}>{item.numero}</Text>
      </View>
      <StatutBadge statut={item.statut} type="membre" />
    </View>
  );
}

export default function MembresScreen() {
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(MEMBRES_MOCK);

  const filtered = data.filter(
    (m) =>
      `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      m.numero.toLowerCase().includes(search.toLowerCase()),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simuler un rechargement réseau
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9D9D9D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un membre..."
          placeholderTextColor="#ABABAB"
          clearButtonMode="while-editing"
        />
      </View>

      <Text style={styles.countText}>{filtered.length} membre(s)</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MembreItem item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D0D0D0" />
            <Text style={styles.emptyText}>Aucun membre trouvé</Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1A1A1A' },
  countText: { fontSize: 12, color: '#6B6B6B', paddingHorizontal: 16, marginBottom: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  membreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  membreInfo: { flex: 1 },
  membreNom: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  membreNumero: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  separator: { height: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: '#9D9D9D', fontSize: 15 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
