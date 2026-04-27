import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useStudents } from '../../../contexts/StudentContext';
import StudentForm from '../../../components/StudentForm';
import { COLORS, FONTS, SPACING } from '../../../constants/theme';

export default function EditStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, updateStudent } = useStudents();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg }}>Student not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: SPACING.md }}>
            <Text style={{ color: COLORS.accent, fontSize: FONTS.sizes.base }}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StudentForm
        title="Edit Student"
        initial={student}
        onSubmit={(data) => updateStudent(id, data)}
        submitLabel="Save Changes"
      />
    </SafeAreaView>
  );
}
