import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
}

export function StatCard({ label, value, sub, accentColor = COLORS.accent }: StatCardProps) {
  return (
    <View style={[styles.card, { borderColor: accentColor + '33' }]}>
      <View style={[styles.bar, { backgroundColor: accentColor }]} />
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    flex: 1,
    margin: 4,
  },
  bar: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sub: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
});
