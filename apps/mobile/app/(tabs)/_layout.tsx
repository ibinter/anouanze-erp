import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#146C43';
const INACTIVE = '#9D9D9D';

function HeaderRight() {
  return (
    <View style={styles.headerRight}>
      <Pressable style={styles.bellButton}>
        <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
        <View style={styles.bellDot} />
      </Pressable>
    </View>
  );
}

function HeaderLeft() {
  return (
    <View style={styles.headerLeft}>
      <Text style={styles.headerLogo}>ANOUANZÊ</Text>
      <Text style={styles.headerErp}>ERP</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: { backgroundColor: PRIMARY },
        headerTintColor: '#FFFFFF',
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerTitle: '',
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="membres"
        options={{
          title: 'Membres',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projets"
        options={{
          title: 'Projets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    height: 60,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  headerLeft: { flexDirection: 'row', alignItems: 'baseline', paddingLeft: 16, gap: 4 },
  headerLogo: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  headerErp: { fontSize: 11, fontWeight: '600', color: '#F28C25', letterSpacing: 3 },
  headerRight: { paddingRight: 16 },
  bellButton: { position: 'relative' },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F28C25',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
});
