import React from 'react';
import { SafeAreaView } from 'react-native';
import { useStudents } from '../../contexts/StudentContext';
import StudentForm from '../../components/StudentForm';
import { COLORS } from '../../constants/theme';

export default function NewStudentScreen() {
  const { addStudent } = useStudents();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StudentForm
        title="New Student"
        onSubmit={addStudent}
        submitLabel="Add Student"
      />
    </SafeAreaView>
  );
}
