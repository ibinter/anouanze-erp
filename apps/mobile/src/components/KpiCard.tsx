import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface KpiCardProps {
  titre: string;
  valeur: string | number;
  couleur: string;
  icone: React.ReactNode;
}

export function KpiCard({ titre, valeur, couleur, icone }: KpiCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: couleur }]}>
      <View style={[styles.iconContainer, { backgroundColor: couleur + '1A' }]}>
        {icone}
      </View>
      <Text style={styles.valeur}>{valeur}</Text>
      <Text style={styles.titre}>{titre}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  valeur: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  titre: {
    fontSize: 12,
    color: '#6B6B6B',
    fontWeight: '500',
  },
});
