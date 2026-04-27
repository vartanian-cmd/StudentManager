import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../../contexts/StudentContext';
import { deriveStudentInfo } from '../../utils/studentLogic';
import { COLORS, FONTS, SPACING, RADIUS, standingColor, riskColor } from '../../constants/theme';
import { Badge } from '../../components/Badge';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, deleteStudent } = useStudents();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Student not found.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const info = deriveStudentInfo(student);
  const sColor = standingColor(info.academicStanding);
  const rColor = riskColor(info.riskLevel);

  function handleDelete() {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete ${student.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteStudent(student.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Modal Handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-down" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{student.name}</Text>
        <TouchableOpacity onPress={() => router.push(`/student/edit/${student.id}`)} style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={18} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity */}
        <View style={[styles.heroCard, { borderColor: sColor + '44' }]}>
          <View style={[styles.heroBand, { backgroundColor: sColor }]} />
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{student.name}</Text>
            <Text style={styles.heroId}>{student.studentId}</Text>
            <Text style={styles.heroMajor}>{student.major}</Text>
            <View style={styles.heroBadges}>
              <Badge label={info.academicStanding} color={sColor} />
              <Badge label={info.enrollmentLoad} color={COLORS.accent} />
              {info.hasRegistrationHold && <Badge label="REG HOLD" color={COLORS.amber} />}
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          <DataBox label="GPA" value={student.gpa.toFixed(2)} color={sColor} />
          <DataBox label="Units" value={String(student.units)} color={COLORS.accent} />
          <DataBox label="Age" value={String(student.age)} color={COLORS.teal} />
          <DataBox label="Grad Year" value={String(student.graduationYear)} color={COLORS.textMuted} />
        </View>

        {/* Risk Section */}
        <View style={[styles.section, { borderColor: rColor + '33' }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Risk Assessment</Text>
            <Badge label={info.riskLevel + ' Risk'} color={rColor} />
          </View>
          <View style={styles.riskMeter}>
            {(['Low', 'Moderate', 'High', 'Critical'] as const).map((level) => (
              <View
                key={level}
                style={[
                  styles.riskSegment,
                  {
                    backgroundColor: info.riskLevel === level ? riskColor(level) : riskColor(level) + '22',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.riskDesc}>
            {info.riskLevel === 'Low' && 'Student is performing well with no financial concerns.'}
            {info.riskLevel === 'Moderate' && 'Student has minor academic or financial concerns.'}
            {info.riskLevel === 'High' && 'Student is at significant academic or financial risk.'}
            {info.riskLevel === 'Critical' && 'Student requires immediate intervention and support.'}
          </Text>
        </View>

        {/* Hold Details */}
        {info.hasRegistrationHold && (
          <View style={[styles.section, { borderColor: COLORS.amber + '44' }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={16} color={COLORS.amber} />
              <Text style={[styles.sectionTitle, { color: COLORS.amber }]}>Registration Hold Active</Text>
            </View>
            {info.holdReasons.map((reason) => (
              <View key={reason} style={styles.holdRow}>
                <Ionicons name="alert-circle-outline" size={14} color={COLORS.amber} />
                <Text style={styles.holdText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Financial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial</Text>
          <View style={styles.finRow}>
            <Text style={styles.finLabel}>Unpaid Dues</Text>
            <Text style={[styles.finValue, { color: student.unpaidDues > 0 ? COLORS.rose : COLORS.teal }]}>
              {student.unpaidDues > 0 ? `$${student.unpaidDues.toFixed(2)}` : 'Clear'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editFullBtn}
            onPress={() => router.push(`/student/edit/${student.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={16} color={COLORS.white} />
            <Text style={styles.editFullBtnText}>Edit Record</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color={COLORS.rose} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DataBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.dataBox}>
      <View style={[styles.dataBoxInner, { borderColor: color + '33' }]}>
        <Text style={[styles.dataValue, { color }]}>{value}</Text>
        <Text style={styles.dataLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  editBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: SPACING.md },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  heroBand: { height: 4 },
  heroContent: { padding: SPACING.md },
  heroName: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroId: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  heroMajor: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: SPACING.sm,
  },
  dataBox: {
    width: '50%',
    padding: 4,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  dataBoxInner: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  dataValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  dataLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  riskMeter: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  riskSegment: {
    flex: 1,
    borderRadius: 4,
  },
  riskDesc: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
  },
  holdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 3,
  },
  holdText: {
    color: COLORS.amber,
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
  },
  finValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  editFullBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  editFullBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.roseSoft,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.rose + '44',
  },
  deleteBtnText: {
    color: COLORS.rose,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: COLORS.text, fontSize: FONTS.sizes.lg },
  backLink: { color: COLORS.accent, marginTop: SPACING.sm, fontSize: FONTS.sizes.base },
});
