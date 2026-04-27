# AcademiQ — Student Records Manager

A production-quality React Native mobile application for managing student academic records, built with Expo SDK 53 (compatible with Expo Go SDK 54).

## Overview

AcademiQ is a dark-themed, data-dense student management system that enforces academic validation rules, computes derived standings and risk levels from a single source of truth, and presents multi-view analytics and alert dashboards.

## Features

- **Full CRUD** — Create, read, update, and delete student records
- **Live Validation** — All fields validated before save; Student ID uniqueness enforced
- **Single-Source Derived Logic** — Academic Standing, Enrollment Load, Registration Hold, and Risk Level are all computed from raw data in one place (`utils/studentLogic.ts`) and never stored redundantly
- **Live Preview** — Form shows derived statuses as you type
- **Search + Sort + Filter** — Combined data pipeline with instant results
- **4 Views:**
  - **Students** — Searchable, sortable, filterable record list
  - **Analytics** — System-wide stats, distributions, top performer, by-major breakdown
  - **Alerts** — Students requiring attention grouped by High/Critical Risk, Holds, and Academic Warning
  - **Settings** — Data management and logic reference
- **Persistence** — All records stored via AsyncStorage, survive app restarts
- **Sample Data** — Load 10 diverse pre-built student records
- **Dark academic aesthetic** — Consistent dark theme with color-coded standing/risk indicators

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd student-manager

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

## Running the App

```bash
# Start Expo
npx expo start

# Then scan the QR code with Expo Go (SDK 54)
# Or press 'i' for iOS simulator, 'a' for Android emulator
```

## Required Packages

| Package | Version | Purpose |
|---|---|---|
| expo | ~53.0.0 | Core Expo SDK |
| expo-router | ~4.0.0 | File-based navigation |
| @react-native-async-storage/async-storage | 2.1.0 | Local persistence |
| react-native-reanimated | ~3.16.1 | Animations |
| react-native-gesture-handler | ~2.20.2 | Gesture support |
| react-native-screens | ~4.4.0 | Native navigation |
| react-native-safe-area-context | 4.12.0 | Safe area handling |
| @expo/vector-icons | ^14.0.0 | Ionicons |

## Usage

### Adding a Student
Tap the **+** button on the Students tab. Fill in all fields — the form shows a live preview of derived statuses as you type.

### Editing a Student
Tap any student card → tap the pencil icon, or use the **Edit Record** button on the detail screen.

### Deleting a Student
Open the student detail → tap **Delete** → confirm.

### Loading Sample Data
Go to **Settings** → tap **Load Sample Data**. This adds 10 diverse student records with varying GPAs, units, and dues.

### Clearing All Data
Go to **Settings** → tap **Clear All Data** → confirm.

### Search & Filter
On the Students tab:
- Type in the search bar to filter by name, ID, or major
- Tap filter chips (All / Honors / At Risk / Holds) to filter by status
- Tap sort chips (Name / GPA / Units / Grad) to sort; tap again to reverse

## How Logic Is Kept Consistent

All derived values are computed by a single set of pure functions in `utils/studentLogic.ts`:

```
computeAcademicStanding(gpa)     → Honors | Good Standing | Warning | Probation | Disqualified
computeEnrollmentLoad(units)     → Full-Time | Half-Time | Part-Time | Not Enrolled
computeRegistrationHold(gpa, dues) → { hasHold, reasons[] }
computeRiskLevel(gpa, units, dues) → Low | Moderate | High | Critical
deriveStudentInfo(student)       → All four values at once
computeAnalytics(students[])     → System-wide metrics
```

These are **never stored**. Every view calls `deriveStudentInfo(student)` on the fly when it needs derived data. This guarantees that the Students list, Detail modal, Alerts view, and Analytics screen all show identical, up-to-date values — there is no possibility of stale or conflicting derived state.

Validation (`validateStudent`) also lives in this same file and is called identically from both the Add and Edit forms.

## Project Structure

```
app/
  _layout.tsx              # Root layout with StudentProvider
  (tabs)/
    _layout.tsx            # Tab navigator
    index.tsx              # Students list
    analytics.tsx          # Analytics dashboard
    alerts.tsx             # Risk & hold alerts
    settings.tsx           # Data management
  student/
    [id].tsx               # Student detail modal
    new.tsx                # Add student modal
    edit/[id].tsx          # Edit student modal

components/
  Badge.tsx                # Reusable colored badge
  FormField.tsx            # Labeled input with error display
  StatCard.tsx             # Metric display card
  StudentCard.tsx          # List item card with derived status
  StudentForm.tsx          # Shared create/edit form with live preview

contexts/
  StudentContext.tsx       # Global state + AsyncStorage persistence

utils/
  studentLogic.ts          # ALL validation, derivation, and analytics logic

constants/
  theme.ts                 # Colors, fonts, spacing, radius, color helpers
```
