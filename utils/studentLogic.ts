// ============================================================
// SINGLE SOURCE OF TRUTH — ALL DERIVED LOGIC LIVES HERE
// ============================================================

export interface Student {
  id: string;
  name: string;
  studentId: string;
  age: number;
  gpa: number;
  major: string;
  units: number;
  graduationYear: number;
  unpaidDues: number;
  createdAt: number;
}

export interface DerivedStudentInfo {
  academicStanding: AcademicStanding;
  enrollmentLoad: EnrollmentLoad;
  hasRegistrationHold: boolean;
  holdReasons: string[];
  riskLevel: RiskLevel;
}

export type AcademicStanding = 'Honors' | 'Good Standing' | 'Warning' | 'Probation' | 'Disqualified';
export type EnrollmentLoad = 'Full-Time' | 'Half-Time' | 'Part-Time' | 'Not Enrolled';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

// ── Academic Standing ────────────────────────────────────────
export function computeAcademicStanding(gpa: number): AcademicStanding {
  if (gpa >= 3.7) return 'Honors';
  if (gpa >= 2.0) return 'Good Standing';
  if (gpa >= 1.7) return 'Warning';
  if (gpa >= 1.0) return 'Probation';
  return 'Disqualified';
}

// ── Enrollment Load ──────────────────────────────────────────
export function computeEnrollmentLoad(units: number): EnrollmentLoad {
  if (units >= 12) return 'Full-Time';
  if (units >= 6) return 'Half-Time';
  if (units >= 1) return 'Part-Time';
  return 'Not Enrolled';
}

// ── Registration Hold ────────────────────────────────────────
export function computeRegistrationHold(
  gpa: number,
  unpaidDues: number
): { hasHold: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const standing = computeAcademicStanding(gpa);

  if (standing === 'Probation' || standing === 'Disqualified') {
    reasons.push(`Academic ${standing}`);
  }
  if (unpaidDues > 0) {
    reasons.push(`Unpaid Dues ($${unpaidDues.toFixed(2)})`);
  }

  return { hasHold: reasons.length > 0, reasons };
}

// ── Risk Level ───────────────────────────────────────────────
export function computeRiskLevel(
  gpa: number,
  units: number,
  unpaidDues: number
): RiskLevel {
  let score = 0;
  const standing = computeAcademicStanding(gpa);

  if (standing === 'Disqualified') score += 4;
  else if (standing === 'Probation') score += 3;
  else if (standing === 'Warning') score += 2;
  else if (standing === 'Good Standing') score += 0;

  if (unpaidDues > 1000) score += 2;
  else if (unpaidDues > 0) score += 1;

  if (units === 0) score += 1;

  if (score >= 5) return 'Critical';
  if (score >= 3) return 'High';
  if (score >= 1) return 'Moderate';
  return 'Low';
}

// ── Aggregate all derived info ───────────────────────────────
export function deriveStudentInfo(student: Student): DerivedStudentInfo {
  const academicStanding = computeAcademicStanding(student.gpa);
  const enrollmentLoad = computeEnrollmentLoad(student.units);
  const { hasHold, reasons } = computeRegistrationHold(student.gpa, student.unpaidDues);
  const riskLevel = computeRiskLevel(student.gpa, student.units, student.unpaidDues);

  return {
    academicStanding,
    enrollmentLoad,
    hasRegistrationHold: hasHold,
    holdReasons: reasons,
    riskLevel,
  };
}

// ── Validation ───────────────────────────────────────────────
export interface ValidationErrors {
  name?: string;
  studentId?: string;
  age?: string;
  gpa?: string;
  major?: string;
  units?: string;
  graduationYear?: string;
  unpaidDues?: string;
}

export function validateStudent(
  data: Partial<Student>,
  existingStudents: Student[],
  editingId?: string
): ValidationErrors {
  const errors: ValidationErrors = {};
  const currentYear = new Date().getFullYear();

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!data.studentId || data.studentId.trim().length < 3) {
    errors.studentId = 'Student ID must be at least 3 characters.';
  } else {
    const duplicate = existingStudents.find(
      (s) => s.studentId === data.studentId.trim() && s.id !== editingId
    );
    if (duplicate) errors.studentId = 'Student ID must be unique.';
  }

  const age = Number(data.age);
  if (isNaN(age) || age < 16 || age > 80) {
    errors.age = 'Age must be between 16 and 80.';
  }

  const gpa = Number(data.gpa);
  if (isNaN(gpa) || gpa < 0.0 || gpa > 4.0) {
    errors.gpa = 'GPA must be between 0.0 and 4.0.';
  }

  if (!data.major || data.major.trim().length < 2) {
    errors.major = 'Major must be at least 2 characters.';
  }

  const units = Number(data.units);
  if (isNaN(units) || units < 0 || units > 30) {
    errors.units = 'Units must be between 0 and 30 per semester.';
  }

  const gradYear = Number(data.graduationYear);
  if (isNaN(gradYear) || gradYear < currentYear - 10 || gradYear > currentYear + 10) {
    errors.graduationYear = `Graduation year must be between ${currentYear - 10} and ${currentYear + 10}.`;
  }

  const dues = Number(data.unpaidDues);
  if (isNaN(dues) || dues < 0) {
    errors.unpaidDues = 'Unpaid dues cannot be negative.';
  }

  return errors;
}

// ── Analytics ────────────────────────────────────────────────
export interface Analytics {
  totalStudents: number;
  averageGpa: number;
  highestGpaStudent: Student | null;
  standingDistribution: Record<AcademicStanding, number>;
  studentsWithHolds: number;
  byMajor: Record<string, { count: number; avgGpa: number }>;
  riskDistribution: Record<RiskLevel, number>;
  avgUnits: number;
  fullTimeCount: number;
}

export function computeAnalytics(students: Student[]): Analytics {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageGpa: 0,
      highestGpaStudent: null,
      standingDistribution: {
        Honors: 0,
        'Good Standing': 0,
        Warning: 0,
        Probation: 0,
        Disqualified: 0,
      },
      studentsWithHolds: 0,
      byMajor: {},
      riskDistribution: { Low: 0, Moderate: 0, High: 0, Critical: 0 },
      avgUnits: 0,
      fullTimeCount: 0,
    };
  }

  const total = students.length;
  const avgGpa = students.reduce((s, st) => s + st.gpa, 0) / total;
  const highestGpaStudent = students.reduce((best, s) => (s.gpa > best.gpa ? s : best));

  const standingDist: Record<AcademicStanding, number> = {
    Honors: 0,
    'Good Standing': 0,
    Warning: 0,
    Probation: 0,
    Disqualified: 0,
  };
  const riskDist: Record<RiskLevel, number> = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
  const majorMap: Record<string, { totalGpa: number; count: number }> = {};
  let holdsCount = 0;
  let totalUnits = 0;
  let fullTimeCount = 0;

  students.forEach((s) => {
    const info = deriveStudentInfo(s);
    standingDist[info.academicStanding]++;
    riskDist[info.riskLevel]++;
    if (info.hasRegistrationHold) holdsCount++;
    if (info.enrollmentLoad === 'Full-Time') fullTimeCount++;
    totalUnits += s.units;

    if (!majorMap[s.major]) majorMap[s.major] = { totalGpa: 0, count: 0 };
    majorMap[s.major].totalGpa += s.gpa;
    majorMap[s.major].count++;
  });

  const byMajor: Record<string, { count: number; avgGpa: number }> = {};
  Object.entries(majorMap).forEach(([major, data]) => {
    byMajor[major] = { count: data.count, avgGpa: data.totalGpa / data.count };
  });

  return {
    totalStudents: total,
    averageGpa: avgGpa,
    highestGpaStudent,
    standingDistribution: standingDist,
    studentsWithHolds: holdsCount,
    byMajor,
    riskDistribution: riskDist,
    avgUnits: totalUnits / total,
    fullTimeCount,
  };
}

// ── Sample Data ──────────────────────────────────────────────
export const SAMPLE_STUDENTS: Omit<Student, 'id' | 'createdAt'>[] = [
  { name: 'Aria Chen', studentId: 'CS2021001', age: 20, gpa: 3.9, major: 'Computer Science', units: 15, graduationYear: 2025, unpaidDues: 0 },
  { name: 'Marcus Webb', studentId: 'EE2020042', age: 22, gpa: 2.8, major: 'Electrical Engineering', units: 12, graduationYear: 2024, unpaidDues: 250 },
  { name: 'Zoe Patel', studentId: 'BIO2022017', age: 19, gpa: 1.5, major: 'Biology', units: 9, graduationYear: 2026, unpaidDues: 0 },
  { name: 'Liam Torres', studentId: 'MTH2021033', age: 21, gpa: 3.4, major: 'Mathematics', units: 14, graduationYear: 2025, unpaidDues: 0 },
  { name: 'Naomi Okafor', studentId: 'PSY2023005', age: 18, gpa: 0.8, major: 'Psychology', units: 6, graduationYear: 2027, unpaidDues: 1500 },
  { name: 'Ethan Brooks', studentId: 'PHY2020098', age: 23, gpa: 3.7, major: 'Physics', units: 16, graduationYear: 2024, unpaidDues: 0 },
  { name: 'Sofia Lima', studentId: 'CS2022044', age: 20, gpa: 2.2, major: 'Computer Science', units: 12, graduationYear: 2026, unpaidDues: 300 },
  { name: 'Derek Nguyen', studentId: 'BUS2021077', age: 22, gpa: 3.1, major: 'Business', units: 13, graduationYear: 2025, unpaidDues: 0 },
  { name: 'Priya Sharma', studentId: 'ENG2022088', age: 20, gpa: 3.85, major: 'Engineering', units: 15, graduationYear: 2026, unpaidDues: 0 },
  { name: 'Carlos Rivera', studentId: 'ART2021055', age: 21, gpa: 1.2, major: 'Art History', units: 8, graduationYear: 2025, unpaidDues: 800 },
];
