import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Student,
  SAMPLE_STUDENTS,
  validateStudent,
  ValidationErrors,
} from '../utils/studentLogic';

const STORAGE_KEY = '@academiq_students';

interface StudentContextType {
  students: Student[];
  isLoading: boolean;
  addStudent: (data: Omit<Student, 'id' | 'createdAt'>) => ValidationErrors | null;
  updateStudent: (id: string, data: Omit<Student, 'id' | 'createdAt'>) => ValidationErrors | null;
  deleteStudent: (id: string) => void;
  loadSampleData: () => void;
  clearAll: () => void;
}

const StudentContext = createContext<StudentContextType | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setStudents(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load students', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Persist whenever students change
  const persist = useCallback(async (list: Student[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist students', e);
    }
  }, []);

  const addStudent = useCallback(
    (data: Omit<Student, 'id' | 'createdAt'>): ValidationErrors | null => {
      const errors = validateStudent(data, students);
      if (Object.keys(errors).length > 0) return errors;

      const newStudent: Student = { ...data, id: generateId(), createdAt: Date.now() };
      setStudents((prev) => {
        const next = [...prev, newStudent];
        persist(next);
        return next;
      });
      return null;
    },
    [students, persist]
  );

  const updateStudent = useCallback(
    (id: string, data: Omit<Student, 'id' | 'createdAt'>): ValidationErrors | null => {
      const errors = validateStudent(data, students, id);
      if (Object.keys(errors).length > 0) return errors;

      setStudents((prev) => {
        const next = prev.map((s) =>
          s.id === id ? { ...data, id, createdAt: s.createdAt } : s
        );
        persist(next);
        return next;
      });
      return null;
    },
    [students, persist]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      setStudents((prev) => {
        const next = prev.filter((s) => s.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const loadSampleData = useCallback(() => {
    const samples: Student[] = SAMPLE_STUDENTS.map((s) => ({
      ...s,
      id: generateId(),
      createdAt: Date.now() - Math.floor(Math.random() * 1000000),
    }));
    setStudents((prev) => {
      // Only add non-duplicate studentIds
      const existingIds = new Set(prev.map((s) => s.studentId));
      const filtered = samples.filter((s) => !existingIds.has(s.studentId));
      const next = [...prev, ...filtered];
      persist(next);
      return next;
    });
  }, [persist]);

  const clearAll = useCallback(() => {
    setStudents([]);
    persist([]);
  }, [persist]);

  return (
    <StudentContext.Provider
      value={{ students, isLoading, addStudent, updateStudent, deleteStudent, loadSampleData, clearAll }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents(): StudentContextType {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudents must be used within StudentProvider');
  return ctx;
}
