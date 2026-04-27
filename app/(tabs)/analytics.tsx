import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useStudents } from '../../contexts/StudentContext';
import { computeAnalytics } from '../../utils/studentLogic';
import { COLORS, FONTS, SPACING, RADIUS, standingColor, riskColor } from '../../constants/theme';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';

export default function AnalyticsScreen() {
  const { students } = useStudents();
  const analytics = useMemo(() => computeAnalytics(students), [students]);

  const standingEntries = Object.entries(analytics.standingDistribution) as [any, number][];
  const riskEntries = Object.entries(analytics.riskDistribution) as [any, number][];
  const majorEntries = Object.entries(analytics.byMajor).sort((a, b) => b[1].count - a[1].count);

  const maxStanding = Math.max(...standingEntries.map(([, v]) => v), 1);
  const maxRisk = Math.max(...riskEntries.map(([, v]) => v), 1);

  if (students.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>No Data Yet</Text>
          <Text style={styles.emptyText}>Load sample data in Settings to see analytics.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Analytics</Text>
        <Text style={styles.pageSub}>System-wide academic insights</Text>

        {/* Top stats */}
        <View style={styles.statsRow}>
          <StatCard label="Students" value={analytics.totalStudents} accentColor={COLORS.accent} />
          <StatCard
            label="Avg GPA"
            value={analytics.averageGpa.toFixed(2)}
            accentColor={COLORS.teal}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            label="With Holds"
            value={analytics.studentsWithHolds}
            sub={`${((analytics.studentsWithHolds / analytics.totalStudents) * 100).toFixed(0)}% of total`}
            accentColor={COLORS.amber}
          />
          <StatCard
            label="Full-Time"
            value={analytics.fullTimeCount}
            sub={`Avg ${analytics.avgUnits.toFixed(1)} units`}
            accentColor={COLORS.rose}
          />
        </View>

        {/* Top Student */}
        {analytics.highestGpaStudent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top Performer</Text>
            <View style={styles.topStudent}>
              <View style={styles.topStudentLeft}>
                <Text style={styles.topStudentName}>{analytics.highestGpaStudent.name}</Text>
                <Text style={styles.topStudentMeta}>
                  {analytics.highestGpaStudent.major} · {analytics.highestGpaStudent.studentId}
                </Text>
              </View>
              <View style={styles.gpaCircle}>
                <Text style={styles.gpaCircleText}>{analytics.highestGpaStudent.gpa.toFixed(2)}</Text>
                <Text style={styles.gpaCircleLabel}>GPA</Text>
              </View>
            </View>
          </View>
        )}

        {/* Standing Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Standing</Text>
          {standingEntries.map(([standing, count]) => (
            <View key={standing} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barLabel, { color: standingColor(standing) }]}>{standing}</Text>
                <Text style={styles.barCount}>{count}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(count / maxStanding) * 100}%`, backgroundColor: standingColor(standing) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Risk Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Distribution</Text>
          {riskEntries.map(([risk, count]) => (
            <View key={risk} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <Text style={[styles.barLabel, { color: riskColor(risk) }]}>{risk} Risk</Text>
                <Text style={styles.barCount}>{count}</Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${(count / maxRisk) * 100}%`, backgroundColor: riskColor(risk) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* By Major */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Major</Text>
          {majorEntries.map(([major, data]) => (
            <View key={major} style={styles.majorRow}>
              <View style={styles.majorLeft}>
                <Text style={styles.majorName}>{major}</Text>
                <Text style={styles.majorMeta}>{data.count} student{data.count !== 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.majorRight}>
                <Text style={styles.majorGpa}>{data.avgGpa.toFixed(2)}</Text>
                <Text style={styles.majorGpaLabel}>avg GPA</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  pageTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -1,
  },
  pageSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 0,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    marginBottom: SPACING.md,
    letterSpacing: 0.3,
  },
  topStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topStudentLeft: { flex: 1 },
  topStudentName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
  },
  topStudentMeta: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 4,
  },
  gpaCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.tealSoft,
    borderWidth: 2,
    borderColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpaCircleText: {
    color: COLORS.teal,
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
  },
  gpaCircleLabel: {
    color: COLORS.teal,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  barRow: { marginBottom: SPACING.sm },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  barCount: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
  majorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  majorLeft: { flex: 1 },
  majorName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
  majorMeta: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  majorRight: { alignItems: 'flex-end' },
  majorGpa: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  majorGpaLabel: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
});
