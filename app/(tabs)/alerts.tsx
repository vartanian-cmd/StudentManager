import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../../contexts/StudentContext';
import { deriveStudentInfo } from '../../utils/studentLogic';
import { COLORS, FONTS, SPACING, RADIUS, riskColor, standingColor } from '../../constants/theme';
import { Badge } from '../../components/Badge';

export default function AlertsScreen() {
  const { students } = useStudents();

  const { criticalStudents, holdStudents, warningStudents } = useMemo(() => {
    const crit = students.filter((s) => {
      const info = deriveStudentInfo(s);
      return info.riskLevel === 'Critical' || info.riskLevel === 'High';
    }).sort((a, b) => {
      const ra = deriveStudentInfo(a).riskLevel;
      const rb = deriveStudentInfo(b).riskLevel;
      const order = { Critical: 0, High: 1, Moderate: 2, Low: 3 };
      return order[ra] - order[rb];
    });

    const holds = students.filter((s) => deriveStudentInfo(s).hasRegistrationHold);
    const warn = students.filter((s) => {
      const info = deriveStudentInfo(s);
      return info.academicStanding === 'Warning' || info.academicStanding === 'Probation';
    });

    return { criticalStudents: crit, holdStudents: holds, warningStudents: warn };
  }, [students]);

  const allAlerts = useMemo(() => {
    const items: { type: 'header' | 'student'; label?: string; count?: number; student?: any; color?: string }[] = [];

    if (criticalStudents.length) {
      items.push({ type: 'header', label: 'High & Critical Risk', count: criticalStudents.length, color: COLORS.rose });
      criticalStudents.forEach((s) => items.push({ type: 'student', student: s }));
    }

    if (holdStudents.length) {
      items.push({ type: 'header', label: 'Registration Holds', count: holdStudents.length, color: COLORS.amber });
      holdStudents.forEach((s) => items.push({ type: 'student', student: s }));
    }

    if (warningStudents.length) {
      items.push({ type: 'header', label: 'Academic Warning / Probation', count: warningStudents.length, color: COLORS.warning });
      warningStudents.forEach((s) => items.push({ type: 'student', student: s }));
    }

    return items;
  }, [criticalStudents, holdStudents, warningStudents]);

  if (students.length === 0 || allAlerts.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Alerts</Text>
          <Text style={styles.pageSub}>Students requiring attention</Text>
        </View>
        <View style={styles.allClear}>
          <Text style={styles.clearIcon}>✅</Text>
          <Text style={styles.clearTitle}>All Clear</Text>
          <Text style={styles.clearText}>
            {students.length === 0
              ? 'Load students to see alerts.'
              : 'No students currently require attention.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Alerts</Text>
        <Text style={styles.pageSub}>{allAlerts.filter((a) => a.type === 'student').length} students need attention</Text>
      </View>

      <FlatList
        data={allAlerts}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={[styles.sectionHeader, { borderLeftColor: item.color }]}>
                <Text style={[styles.sectionTitle, { color: item.color }]}>{item.label}</Text>
                <View style={[styles.countBadge, { backgroundColor: item.color + '22' }]}>
                  <Text style={[styles.countText, { color: item.color }]}>{item.count}</Text>
                </View>
              </View>
            );
          }

          const s = item.student;
          const info = deriveStudentInfo(s);
          return (
            <TouchableOpacity
              style={styles.alertCard}
              onPress={() => router.push(`/student/${s.id}`)}
              activeOpacity={0.75}
            >
              <View style={styles.alertTop}>
                <View style={styles.alertLeft}>
                  <Text style={styles.alertName}>{s.name}</Text>
                  <Text style={styles.alertSid}>{s.studentId} · {s.major}</Text>
                </View>
                <View style={styles.alertRight}>
                  <Badge label={info.riskLevel + ' Risk'} color={riskColor(info.riskLevel)} size="sm" />
                </View>
              </View>

              <View style={styles.alertTags}>
                <Badge label={info.academicStanding} color={standingColor(info.academicStanding)} size="sm" />
                {info.holdReasons.map((reason) => (
                  <View key={reason} style={styles.holdReason}>
                    <Ionicons name="lock-closed" size={10} color={COLORS.amber} />
                    <Text style={styles.holdReasonText}>{reason}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.alertMeta}>
                <Text style={styles.alertMetaText}>GPA {s.gpa.toFixed(2)}</Text>
                <Text style={styles.alertMetaDot}>·</Text>
                <Text style={styles.alertMetaText}>{info.enrollmentLoad}</Text>
                {s.unpaidDues > 0 && (
                  <>
                    <Text style={styles.alertMetaDot}>·</Text>
                    <Text style={[styles.alertMetaText, { color: COLORS.amber }]}>
                      ${s.unpaidDues.toFixed(0)} owed
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -1,
  },
  pageSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  list: { paddingHorizontal: SPACING.md, paddingBottom: 100 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: SPACING.sm,
    marginVertical: SPACING.sm,
    borderLeftWidth: 3,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '800',
  },
  alertCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  alertLeft: { flex: 1, marginRight: SPACING.sm },
  alertName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  alertSid: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  alertRight: {},
  alertTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  holdReason: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.amberSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.amber + '44',
  },
  holdReasonText: {
    color: COLORS.amber,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  alertMetaText: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
  },
  alertMetaDot: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
  },
  allClear: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  clearIcon: { fontSize: 48, marginBottom: SPACING.md },
  clearTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
  },
  clearText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
});
