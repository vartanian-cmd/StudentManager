
export const COLORS = {
  bg: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A26',
  border: '#2A2A3C',
  borderLight: '#3A3A50',

  accent: '#6C63FF',
  accentSoft: '#6C63FF22',
  accentGlow: '#6C63FF44',

  teal: '#00D4AA',
  tealSoft: '#00D4AA22',

  amber: '#FFB347',
  amberSoft: '#FFB34722',

  rose: '#FF5C7A',
  roseSoft: '#FF5C7A22',

  text: '#E8E8F0',
  textMuted: '#8888A0',
  textDim: '#555568',

  white: '#FFFFFF',

  // Standing colors
  honors: '#00D4AA',
  goodStanding: '#6C63FF',
  warning: '#FFB347',
  probation: '#FF8C42',
  disqualified: '#FF5C7A',

  // Risk colors
  low: '#00D4AA',
  moderate: '#FFB347',
  high: '#FF8C42',
  critical: '#FF5C7A',
};

export const FONTS = {
  mono: 'SpaceMono',
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 32,
};

import { AcademicStanding, RiskLevel } from './studentLogic';

export function standingColor(standing: AcademicStanding): string {
  switch (standing) {
    case 'Honors': return COLORS.honors;
    case 'Good Standing': return COLORS.goodStanding;
    case 'Warning': return COLORS.warning;
    case 'Probation': return COLORS.probation;
    case 'Disqualified': return COLORS.disqualified;
  }
}

export function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Low': return COLORS.low;
    case 'Moderate': return COLORS.moderate;
    case 'High': return COLORS.high;
    case 'Critical': return COLORS.critical;
  }
}
