import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Student, ValidationErrors, deriveStudentInfo } from '../utils/studentLogic';
import { COLORS, FONTS, SPACING, RADIUS, standingColor, riskColor } from '../constants/theme';
import { FormField } from '../components/FormField';
import { Badge } from '../components/Badge';

interface StudentFormProps {
  title: string;
  initial?: Partial<Student>;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt'>) => ValidationErrors | null;
  submitLabel?: string;
}

const BLANK: Omit<Student, 'id' | 'createdAt'> = {
  name: '',
  studentId: '',
  age: 18,
  gpa: 0.0,
  major: '',
  units: 0,
  graduationYear: new Date().getFullYear() + 4,
  unpaidDues: 0,
};

export default function StudentForm({ title, initial, onSubmit, submitLabel = 'Save' }: StudentFormProps) {
  const [form, setForm] = useState<Omit<Student, 'id' | 'createdAt'>>({
    ...BLANK,
    ...initial,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saved, setSaved] = useState(false);

  function set(key: keyof typeof form, raw: string) {
    const numericKeys = ['age', 'gpa', 'units', 'graduationYear', 'unpaidDues'];
    const val = numericKeys.includes(key) ? (raw === '' ? 0 : Number(raw)) : raw;
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleSubmit() {
    const result = onSubmit(form);
    if (result) {
      setErrors(result);
    } else {
      setSaved(true);
      setTimeout(() => router.back(), 300);
    }
  }

  // Live preview of derived values (no storage — just computation)
  const preview = form.gpa >= 0 && form.gpa <= 4.0 && form.units >= 0
    ? deriveStudentInfo({ ...form, id: '__preview__', createdAt: 0 })
    : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Modal handle */}
      <View style={styles.handle} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
          <Ionicons name="close" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={handleSubmit} style={[styles.saveBtn, saved && styles.saveBtnDone]}>
          <Text style={styles.saveBtnText}>{saved ? '✓' : submitLabel}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Live Preview */}
        {preview && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Live Preview</Text>
            <View style={styles.previewBadges}>
              <Badge label={preview.academicStanding} color={standingColor(preview.academicStanding)} size="sm" />
              <Badge label={preview.enrollmentLoad} color={COLORS.accent} size="sm" />
              <Badge label={preview.riskLevel + ' Risk'} color={riskColor(preview.riskLevel)} size="sm" />
              {preview.hasRegistrationHold && <Badge label="HOLD" color={COLORS.amber} size="sm" />}
            </View>
          </View>
        )}

        <Text style={styles.groupLabel}>Identity</Text>
        <FormField
          label="Full Name"
          value={form.name}
          onChangeText={(v) => set('name', v)}
          error={errors.name}
          placeholder="e.g. Jane Smith"
          autoCapitalize="words"
        />
        <FormField
          label="Student ID"
          value={form.studentId}
          onChangeText={(v) => set('studentId', v)}
          error={errors.studentId}
          placeholder="e.g. CS2024001"
          autoCapitalize="characters"
        />
        <FormField
          label="Major"
          value={form.major}
          onChangeText={(v) => set('major', v)}
          error={errors.major}
          placeholder="e.g. Computer Science"
          autoCapitalize="words"
        />

        <Text style={styles.groupLabel}>Academic</Text>
        <FormField
          label="GPA (0.0 – 4.0)"
          value={form.gpa === 0 ? '' : String(form.gpa)}
          onChangeText={(v) => set('gpa', v)}
          error={errors.gpa}
          placeholder="e.g. 3.5"
          keyboardType="decimal-pad"
          hint="Determines academic standing and risk level"
        />
        <FormField
          label="Units This Semester (0 – 30)"
          value={form.units === 0 ? '' : String(form.units)}
          onChangeText={(v) => set('units', v)}
          error={errors.units}
          placeholder="e.g. 15"
          keyboardType="number-pad"
          hint="Determines enrollment load"
        />
        <FormField
          label="Expected Graduation Year"
          value={form.graduationYear === 0 ? '' : String(form.graduationYear)}
          onChangeText={(v) => set('graduationYear', v)}
          error={errors.graduationYear}
          placeholder={String(new Date().getFullYear() + 4)}
          keyboardType="number-pad"
        />

        <Text style={styles.groupLabel}>Personal & Financial</Text>
        <FormField
          label="Age"
          value={form.age === 0 ? '' : String(form.age)}
          onChangeText={(v) => set('age', v)}
          error={errors.age}
          placeholder="e.g. 20"
          keyboardType="number-pad"
        />
        <FormField
          label="Unpaid Dues ($)"
          value={form.unpaidDues === 0 ? '' : String(form.unpaidDues)}
          onChangeText={(v) => set('unpaidDues', v)}
          error={errors.unpaidDues}
          placeholder="0.00"
          keyboardType="decimal-pad"
          hint="Any unpaid dues will trigger a registration hold"
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>{submitLabel}</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  cancelBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  saveBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
  },
  saveBtnDone: { backgroundColor: COLORS.teal },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.md },
  previewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  previewLabel: {
    color: COLORS.textDim,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  previewBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  groupLabel: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
