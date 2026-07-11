import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TOKEN_KEY } from '../../src/lib/api';
import { useAuthStore } from '../../src/lib/store';

const PRIMARY = '#146C43';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  couleur?: string;
  danger?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'org', label: 'Mon organisation', icon: 'business-outline' },
  { id: 'notifs', label: 'Notifications', icon: 'notifications-outline' },
  { id: 'langue', label: 'Langue', icon: 'language-outline' },
  { id: 'securite', label: 'Sécurité', icon: 'shield-checkmark-outline' },
  { id: 'aide', label: 'Aide & Support', icon: 'help-circle-outline' },
  { id: 'logout', label: 'Déconnexion', icon: 'log-out-outline', couleur: '#DC2626', danger: true },
];

function getInitials(nom: string): string {
  const parts = nom.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return nom.slice(0, 2).toUpperCase();
}

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const displayName = user ? `${user.nom}` : 'Utilisateur';
  const initials = getInitials(displayName);

  function handleMenuPress(item: MenuItem) {
    if (item.danger) {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnecter',
            style: 'destructive',
            onPress: async () => {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              logout();
              router.replace('/(auth)/login');
            },
          },
        ],
      );
      return;
    }
    // Navigation vers les sous-écrans (à implémenter)
    Alert.alert(item.label, 'Fonctionnalité à venir.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar et infos */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
          {user?.organisation && (
            <View style={styles.orgBadge}>
              <Ionicons name="business" size={12} color={PRIMARY} />
              <Text style={styles.orgText}>{user.organisation}</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: item.couleur ? '#FEE2E2' : '#E8F5EE' },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={18}
                  color={item.couleur ?? PRIMARY}
                />
              </View>
              <Text style={[styles.menuLabel, item.danger && { color: '#DC2626' }]}>
                {item.label}
              </Text>
              {!item.danger && (
                <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.version}>ANOUANZÊ ERP v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  container: { padding: 20, paddingBottom: 40 },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: { color: '#FFFFFF', fontSize: 30, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#6B6B6B', marginBottom: 10 },
  orgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  orgText: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1A1A1A' },
  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: '#C0C0C0' },
});
