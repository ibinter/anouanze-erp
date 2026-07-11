import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatutMembre = 'actif' | 'inactif' | 'suspendu';
type StatutProjet = 'en_cours' | 'termine' | 'en_attente' | 'annule';

interface StatutBadgeProps {
  statut: StatutMembre | StatutProjet;
  type: 'membre' | 'projet';
}

const MEMBRE_CONFIG: Record<StatutMembre, { bg: string; text: string; label: string }> = {
  actif: { bg: '#D1FAE5', text: '#065F46', label: 'Actif' },
  inactif: { bg: '#F3F4F6', text: '#6B7280', label: 'Inactif' },
  suspendu: { bg: '#FEE2E2', text: '#991B1B', label: 'Suspendu' },
};

const PROJET_CONFIG: Record<StatutProjet, { bg: string; text: string; label: string }> = {
  en_cours: { bg: '#DBEAFE', text: '#1E40AF', label: 'En cours' },
  termine: { bg: '#D1FAE5', text: '#065F46', label: 'Terminé' },
  en_attente: { bg: '#FEF3C7', text: '#92400E', label: 'En attente' },
  annule: { bg: '#FEE2E2', text: '#991B1B', label: 'Annulé' },
};

export function StatutBadge({ statut, type }: StatutBadgeProps) {
  const config =
    type === 'membre'
      ? MEMBRE_CONFIG[statut as StatutMembre]
      : PROJET_CONFIG[statut as StatutProjet];

  if (!config) return null;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
