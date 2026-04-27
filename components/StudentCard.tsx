import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Student, deriveStudentInfo } from '../utils/studentLogic';
import { standingColor, riskColor, COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { Badge } from './Badge';
import { Ionicons } from '@expo/vector-icons';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
  compact?: boolean;
}

export function StudentCard({ student, onPress, compact = false }: StudentCardProps) {
  const info = deriveStudentInfo(student);
  const sColor = standingColor(info.academicStanding);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { borderLeftColor: sColor }]}
    >
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>{student.name}</Text>
          <Text style={styles.sid}>{student.studentId}</Text>
        </View>
        <View style={styles.badges}>
          <Badge label={info.academicStanding} color={sColor} size="sm" />
          {info.hasRegistrationHold && (
            <View style={styles.holdIcon}>
              <Ionicons name="warning" size={14} color={COLORS.amber} />
            </View>
          )}
        </View>
      </View>

      {!compact && (
        <View style={styles.meta}>
          <MetaItem icon="school-outline" value={student.major} />
          <MetaItem icon="trending-up-outline" value={`GPA ${student.gpa.toFixed(2)}`} color={sColor} />
          <MetaItem icon="book-outline" value={`${student.units} units`} />
          <MetaItem
            icon="shield-outline"
            value={info.riskLevel}
            color={riskColor(info.riskLevel)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function MetaItem({ icon, value, color }: { icon: string; value: string; color?: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon as any} size={11} color={color || COLORS.textDim} />
      <Text style={[styles.metaText, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameBlock: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  sid: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holdIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.amberSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
    fontWeight: '500',
  },
});
