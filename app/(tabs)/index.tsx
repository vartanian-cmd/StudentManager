import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStudents } from '../../contexts/StudentContext';
import { deriveStudentInfo } from '../../utils/studentLogic';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { StudentCard } from '../../components/StudentCard';

type SortKey = 'name' | 'gpa' | 'units' | 'createdAt' | 'graduationYear';
type SortDir = 'asc' | 'desc';
type FilterKey = 'all' | 'holds' | 'honors' | 'atRisk';

export default function StudentsScreen() {
  const { students } = useStudents();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    let list = [...students];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.major.toLowerCase().includes(q)
      );
    }

    list = list.filter((s) => {
      const info = deriveStudentInfo(s);
      if (filter === 'holds') return info.hasRegistrationHold;
      if (filter === 'honors') return info.academicStanding === 'Honors';
      if (filter === 'atRisk') return info.riskLevel === 'High' || info.riskLevel === 'Critical';
      return true;
    });

    list.sort((a, b) => {
      let aVal: any = a[sortKey];
      let bVal: any = b[sortKey];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [students, search, sortKey, sortDir, filter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'honors', label: '🏅 Honors' },
    { key: 'atRisk', label: '⚠️ At Risk' },
    { key: 'holds', label: '🔒 Holds' },
  ];

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'gpa', label: 'GPA' },
    { key: 'units', label: 'Units' },
    { key: 'graduationYear', label: 'Grad' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Student Records</Text>
          <Text style={styles.headerSub}>{students.length} enrolled students</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/student/new')}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={COLORS.textDim} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, ID, or major…"
          placeholderTextColor={COLORS.textDim}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textDim} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter row */}
      <View style={styles.controlRow}>
        <Text style={styles.rowLabel}>FILTER</Text>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort row */}
      <View style={styles.controlRow}>
        <Text style={styles.rowLabel}>SORT</Text>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => toggleSort(s.key)}
            style={[styles.chip, sortKey === s.key && styles.chipSort]}
          >
            <Text style={[styles.chipText, sortKey === s.key && styles.chipTextSort]}>
              {s.label}{sortKey === s.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={48} color={COLORS.textDim} />
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text style={styles.emptyText}>
            {students.length === 0
              ? 'Add students or load sample data in Settings.'
              : 'Try adjusting your search or filters.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          renderItem={({ item }) => (
            <StudentCard
              student={item}
              onPress={() => router.push(`/student/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  searchIcon: { marginRight: SPACING.xs },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONTS.sizes.base,
    paddingVertical: 10,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    flexWrap: 'nowrap',
  },
  rowLabel: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginRight: SPACING.sm,
    width: 36,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  chipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  chipSort: {
    backgroundColor: COLORS.tealSoft,
    borderColor: COLORS.teal,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
  chipTextActive: { color: COLORS.accent },
  chipTextSort: { color: COLORS.teal },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
    paddingTop: SPACING.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xl,
  },
});