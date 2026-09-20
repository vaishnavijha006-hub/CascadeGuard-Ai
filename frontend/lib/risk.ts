import type { RiskLevel, Severity } from './types';

export const RISK_LEVELS: RiskLevel[] = [
  'low',
  'moderate',
  'high',
  'critical',
];

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

export function riskTextClass(risk: RiskLevel): string {
  return `risk-text-${risk}`;
}

export function riskBgClass(risk: RiskLevel): string {
  return `risk-bg-${risk}`;
}

export function riskBorderClass(risk: RiskLevel): string {
  return `risk-border-${risk}`;
}

export function riskHex(risk: RiskLevel): string {
  switch (risk) {
    case 'low':
      return 'hsl(var(--risk-low))';
    case 'moderate':
      return 'hsl(var(--risk-moderate))';
    case 'high':
      return 'hsl(var(--risk-high))';
    case 'critical':
      return 'hsl(var(--risk-critical))';
    default:
      return 'hsl(var(--risk-low))';
  }
}

export function severityToRisk(severity: Severity): RiskLevel {
  const s = severity?.toLowerCase();
  switch (s) {
    case 'low':
      return 'low';
    case 'medium':
    case 'moderate':
      return 'moderate';
    case 'high':
      return 'high';
    case 'critical':
      return 'critical';
    default:
      return 'low';
  }
}

export function riskFromScore(score: number): RiskLevel {
  if (score >= 0.75) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.25) return 'moderate';
  return 'low';
}
