import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../../contexts/StudentContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

export default function SettingsScreen() {
  const { students, loadSampleData, clearAll } = useStudents();
  const [loadedMsg, setLoadedMsg] = useState('');

  function handleLoad() {
    loadSampleData();
    setLoadedMsg('Sample data loaded!');
    setTimeout(() => setLoadedMsg(''), 3000);
  }

  function handleClear() {
    Alert.alert(
      'Clear All Data',
      `This will permanently delete all ${students.length} student records. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAll();
            setLoadedMsg('All data cleared.');
            setTimeout(() => setLoadedMsg(''), 3000);
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSub}>Data management & app info</Text>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={COLORS.accent} />
            <Text style={styles.infoText}>
              <Text style={{ color: COLORS.accent, fontWeight: '800' }}>{students.length}</Text>
              {' '}student{students.length !== 1 ? 's' : ''} in system
            </Text>
          </View>

          {loadedMsg ? (
            <View style={styles.toastRow}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.teal} />
              <Text style={styles.toastText}>{loadedMsg}</Text>
            </View>
          ) : null}

          <SettingsButton
            icon="download-outline"
            label="Load Sample Data"
            sub="Adds 10 pre-built student records"
            color={COLORS.teal}
            onPress={handleLoad}
          />
          <SettingsButton
            icon="trash-outline"
            label="Clear All Data"
            sub="Permanently deletes all records"
            color={COLORS.rose}
            onPress={handleClear}
          />
        </View>

        {/* Logic Reference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Logic Reference</Text>

          <LogicBlock
            title="Academic Standing"
            items={[
              { label: 'Honors', detail: 'GPA ≥ 3.7', color: COLORS.honors },
              { label: 'Good Standing', detail: 'GPA ≥ 2.0', color: COLORS.goodStanding },
              { label: 'Warning', detail: 'GPA ≥ 1.7', color: COLORS.warning },
              { label: 'Probation', detail: 'GPA ≥ 1.0', color: COLORS.probation },
              { label: 'Disqualified', detail: 'GPA < 1.0', color: COLORS.disqualified },
            ]}
          />

          <LogicBlock
            title="Enrollment Load"
            items={[
              { label: 'Full-Time', detail: '≥ 12 units', color: COLORS.teal },
              { label: 'Half-Time', detail: '6–11 units', color: COLORS.accent },
              { label: 'Part-Time', detail: '1–5 units', color: COLORS.amber },
              { label: 'Not Enrolled', detail: '0 units', color: COLORS.textMuted },
            ]}
          />

          <LogicBlock
            title="Registration Hold"
            items={[
              { label: 'Academic Hold', detail: 'Standing is Probation or Disqualified', color: COLORS.rose },
              { label: 'Financial Hold', detail: 'Any unpaid dues > $0', color: COLORS.amber },
            ]}
          />

          <LogicBlock
            title="Risk Level"
            items={[
              { label: 'Low', detail: 'Good standing, no dues', color: COLORS.low },
              { label: 'Moderate', detail: 'Warning or small dues', color: COLORS.moderate },
              { label: 'High', detail: 'Probation or large dues', color: COLORS.high },
              { label: 'Critical', detail: 'Disqualified + financial issues', color: COLORS.critical },
            ]}
          />
        </View>


        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsButton({ icon, label, sub, color, onPress }: {
  icon: string; label: string; sub: string; color: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.settingsBtn, { borderColor: color + '33' }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.btnText}>
        <Text style={[styles.btnLabel, { color }]}>{label}</Text>
        <Text style={styles.btnSub}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
    </TouchableOpacity>
  );
}

function LogicBlock({ title, items }: { title: string; items: { label: string; detail: string; color: string }[] }) {
  return (
    <View style={styles.logicBlock}>
      <Text style={styles.logicTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item.label} style={styles.logicRow}>
          <View style={[styles.logicDot, { backgroundColor: item.color }]} />
          <Text style={[styles.logicLabel, { color: item.color }]}>{item.label}</Text>
          <Text style={styles.logicDetail}>{item.detail}</Text>
        </View>
      ))}
    </View>
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
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.base,
  },
  toastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.tealSoft,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  toastText: {
    color: COLORS.teal,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { flex: 1 },
  btnLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
  },
  btnSub: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
    marginTop: 2,
  },
  logicBlock: { marginBottom: SPACING.md },
  logicTitle: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  logicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 3,
  },
  logicDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  logicLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    width: 110,
  },
  logicDetail: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.sm,
    flex: 1,
  },
  aboutText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
});
