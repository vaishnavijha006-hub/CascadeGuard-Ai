/* ---------- Core Domain & Backend API Types ---------- */

export interface ApiNode {
  id: string;
  label: string;
  sector: string;
  criticality: number;
}

export interface ApiEdge {
  id?: string;
  source: string;
  target: string;
}

export interface ApiGraphResponse {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

export interface IncidentRequest {
  incident_type: string;
  incident_description: string;
  start_node: string;
}

export interface PriorityActionItem {
  priority: string; // "HIGH" | "MEDIUM" | "LOW"
  action: string;
  reason: string;
}

export interface AiAnalysis {
  summary: string;
  key_impacts: string[];
  priority_actions: PriorityActionItem[];
  responder_note: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type Sector = string;
export type IncidentType = string;
export type Severity = string;
export type EdgeType = string;

export interface Action {
  id: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  est_risk_reduction_pct: number;
}

export interface AnalysisNode {
  id: string;
  risk: number;
  level: RiskLevel;
  impact_time_min: number;
  depth: number;
  why: string;
}

export interface SectorImpactPoint {
  sector: string;
  impact: number;
}

export interface IncidentAnalyzeResponse {
  incident: {
    type: string;
    description: string;
    start_node: string;
  };
  cascade: {
    affected_nodes: string[];
    cascade_depth: number;
    affected_count: number;
  };
  risk: {
    risk_score: number;
    severity: string; // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    critical_nodes: string[];
  };
  ai_analysis: AiAnalysis;

  // Optional legacy template fields for UI helper sub-components
  summary?: {
    risk_score: number;
    cascade_depth: number;
    affected_nodes: number;
    critical_nodes: number;
    first_impact_min: number;
  };
  nodes?: AnalysisNode[];
  edges_active?: string[];
  sector_impact?: {
    sector: Sector;
    avg_risk: number;
  }[];
  blast_radius?: {
    id: string;
    score: number;
  }[];
  actions?: Action[];
  brief?: {
    situation: string;
    projection: string;
    recommendation: string;
    compliance: string;
  };
}

/* ---------- Component Type Aliases & Helpers ---------- */

export type GraphNode = ApiNode;
export type GraphEdge = ApiEdge;
export type GraphResponse = ApiGraphResponse;
export type AnalyzeResponse = IncidentAnalyzeResponse;
export type AnalyzeRequest = IncidentRequest;

export interface KpiCardData {
  id: string;
  label: string;
  value: number | string;
  indicator: string;
  risk?: RiskLevel;
}

export interface SimulateRequest extends AnalyzeRequest {
  actions: string[];
}

export interface SimulateResponse {
  before: {
    risk_score: number;
    high_or_critical: number;
    hospital_impact_min: number;
  };
  after: {
    risk_score: number;
    high_or_critical: number;
    hospital_impact_min: number;
  };
  delta: {
    risk_pct: number;
    delay_min: number;
  };
  nodes: AnalysisNode[];
}

export const INCIDENT_TYPE_OPTIONS = [
  { value: 'Power Failure', label: 'Power Failure' },
  { value: 'Cyber Attack / Ransomware', label: 'Cyber Attack / Ransomware' },
  { value: 'SCADA Disruption', label: 'SCADA Disruption' },
  { value: 'Physical Sabotage', label: 'Physical Sabotage' },
  { value: 'Telecom Outage', label: 'Telecom Outage' },
];

export const SECTOR_LABELS: Record<string, string> = {
  Energy: 'Energy',
  Healthcare: 'Healthcare',
  Water: 'Water',
  Government: 'Government',
  'Emergency Services': 'Emergency Services',
  'IT & Telecommunications': 'IT & Telecommunications',
  power: 'Power',
  telecom: 'Telecom',
  health: 'Health',
  water: 'Water',
  transport: 'Transport',
  finance: 'Finance',
  data: 'Data',
  public: 'Public',
};

export const EDGE_TYPE_LABELS: Record<string, string> = {
  power: 'Power',
  comms: 'Comms',
  data: 'Data',
  control: 'Control',
  dependency: 'Dependency',
};
