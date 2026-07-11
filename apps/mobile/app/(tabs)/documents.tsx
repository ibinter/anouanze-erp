import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#146C43';

type TypeDocument = 'pdf' | 'word' | 'excel' | 'image' | 'autre';

interface Document {
  id: string;
  nom: string;
  type: TypeDocument;
  taille: string;
  date: string;
}

const DOCUMENTS_MOCK: Document[] = [
  { id: '1', nom: 'Rapport annuel 2025.pdf', type: 'pdf', taille: '2.4 Mo', date: '12 juin 2026' },
  { id: '2', nom: 'Budget prévisionnel.xlsx', type: 'excel', taille: '845 Ko', date: '05 juil. 2026' },
  { id: '3', nom: 'Statuts association.docx', type: 'word', taille: '320 Ko', date: '01 janv. 2026' },
  { id: '4', nom: 'Photo inauguration.jpg', type: 'image', taille: '3.1 Mo', date: '22 juin 2026' },
  { id: '5', nom: 'PV assemblée générale.pdf', type: 'pdf', taille: '1.2 Mo', date: '30 mai 2026' },
  { id: '6', nom: 'Liste membres 2026.xlsx', type: 'excel', taille: '512 Ko', date: '01 juil. 2026' },
  { id: '7', nom: 'Convention partenariat.docx', type: 'word', taille: '280 Ko', date: '15 avr. 2026' },
  { id: '8', nom: 'Carte du projet.png', type: 'image', taille: '1.8 Mo', date: '10 mars 2026' },
];

const TYPE_CONFIG: Record<TypeDocument, { icon: string; color: string; bg: string; lib: 'ion' | 'mci' }> = {
  pdf:   { icon: 'document-text',        color: '#DC2626', bg: '#FEE2E2', lib: 'ion' },
  word:  { icon: 'file-word-outline',    color: '#2563EB', bg: '#DBEAFE', lib: 'mci' },
  excel: { icon: 'file-excel-outline',   color: '#16A34A', bg: '#D1FAE5', lib: 'mci' },
  image: { icon: 'image-outline',        color: '#7C3AED', bg: '#EDE9FE', lib: 'ion' },
  autre: { icon: 'document-outline',     color: '#6B7280', bg: '#F3F4F6', lib: 'ion' },
};

function DocIcon({ type }: { type: TypeDocument }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <View style={[styles.docIcon, { backgroundColor: cfg.bg }]}>
      {cfg.lib === 'ion' ? (
        <Ionicons name={cfg.icon as any} size={28} color={cfg.color} />
      ) : (
        <MaterialCommunityIcons name={cfg.icon as any} size={28} color={cfg.color} />
      )}
    </View>
  );
}

function DocCard({ doc }: { doc: Document }) {
  return (
    <Pressable style={styles.docCard}>
      <DocIcon type={doc.type} />
      <Text style={styles.docNom} numberOfLines={2}>
        {doc.nom}
      </Text>
      <Text style={styles.docMeta}>{doc.date}</Text>
      <Text style={styles.docTaille}>{doc.taille}</Text>
    </Pressable>
  );
}

export default function DocumentsScreen() {
  const [docs, setDocs] = useState(DOCUMENTS_MOCK);

  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const taille = asset.size
          ? asset.size > 1_000_000
            ? `${(asset.size / 1_000_000).toFixed(1)} Mo`
            : `${Math.round(asset.size / 1000)} Ko`
          : '—';
        const ext = asset.name.split('.').pop()?.toLowerCase() ?? '';
        const type: TypeDocument =
          ext === 'pdf' ? 'pdf'
          : ['doc', 'docx'].includes(ext) ? 'word'
          : ['xls', 'xlsx'].includes(ext) ? 'excel'
          : ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? 'image'
          : 'autre';

        const newDoc: Document = {
          id: String(Date.now()),
          nom: asset.name,
          type,
          taille,
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
        setDocs((prev) => [newDoc, ...prev]);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible d'ouvrir le sélecteur de fichiers.');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{docs.length} document(s)</Text>
        <Pressable style={styles.uploadButton} onPress={handleUpload}>
          <Ionicons name="cloud-upload-outline" size={16} color="#FFFFFF" />
          <Text style={styles.uploadText}>Importer</Text>
        </Pressable>
      </View>

      <FlatList
        data={docs}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <DocCard doc={item} />}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.columnWrapper}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 14, color: '#6B6B6B', fontWeight: '500' },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  uploadText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  columnWrapper: { gap: 12, marginBottom: 12 },
  docCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  docIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  docNom: { fontSize: 12, fontWeight: '600', color: '#1A1A1A', marginBottom: 4, lineHeight: 16 },
  docMeta: { fontSize: 11, color: '#9D9D9D', marginBottom: 2 },
  docTaille: { fontSize: 10, color: '#BEBEBE', fontWeight: '500' },
});
