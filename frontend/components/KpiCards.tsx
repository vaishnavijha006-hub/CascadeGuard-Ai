'use client';

import {
  Gauge,
  Layers,
  Building2,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { IncidentAnalyzeResponse } from '@/lib/types';

interface KpiCardsProps {
  analysis?: IncidentAnalyzeResponse | null;
  loading?: boolean;
}

export function KpiCards({ analysis, loading = false }: KpiCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card
            key={i}
            className="flex h-[96px] items-center justify-center border-border bg-card/40"
          >
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </div>
    );
  }

  const riskScore = analysis ? analysis.risk.risk_score : 0;
  const severity = analysis ? analysis.risk.severity : 'N/A';
  const affectedCount = analysis ? analysis.cascade.affected_count : 0;
  const cascadeDepth = analysis ? analysis.cascade.cascade_depth : 0;
  const criticalCount = analysis ? analysis.risk.critical_nodes.length : 0;

  let severityBadgeColor = 'text-muted-foreground bg-muted/30 border-muted';
  if (severity === 'CRITICAL') {
    severityBadgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  } else if (severity === 'HIGH') {
    severityBadgeColor = 'text-orange-400 bg-orange-500/15 border-orange-500/30';
  } else if (severity === 'MEDIUM') {
    severityBadgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  } else if (severity === 'LOW') {
    severityBadgeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {/* 1. Risk Score & Severity */}
      <Card className="relative overflow-hidden border-border bg-card/70 p-4">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Deterministic Risk Score
          </span>
          <Gauge className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
            {analysis ? riskScore : '--'}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityBadgeColor}`}
          >
            {severity} SEVERITY
          </span>
        </div>
      </Card>

      {/* 2. Affected Count */}
      <Card className="relative overflow-hidden border-border bg-card/70 p-4">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Affected Infrastructure Nodes
          </span>
          <Building2 className="h-4 w-4 text-amber-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-amber-400">
            {analysis ? affectedCount : '--'}
          </span>
          <span className="text-xs text-muted-foreground">nodes</span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {analysis ? `Downstream impact from ${analysis.incident.start_node}` : 'No active incident'}
        </p>
      </Card>

      {/* 3. Cascade Depth */}
      <Card className="relative overflow-hidden border-border bg-card/70 p-4">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Propagation Cascade Depth
          </span>
          <Layers className="h-4 w-4 text-sky-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-foreground">
            {analysis ? cascadeDepth : '--'}
          </span>
          <span className="text-xs text-muted-foreground">levels</span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {analysis ? `BFS depth distance (${cascadeDepth} hops)` : 'No active incident'}
        </p>
      </Card>

      {/* 4. Critical Nodes */}
      <Card className="relative overflow-hidden border-border bg-card/70 p-4">
        <div className="flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Critical Level-5 Impacted
          </span>
          <ShieldAlert className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-rose-400">
            {analysis ? criticalCount : '--'}
          </span>
          <span className="text-xs text-muted-foreground">nodes</span>
        </div>
        <p className="mt-2 text-[10px] truncate text-muted-foreground" title={analysis?.risk.critical_nodes.join(', ')}>
          {analysis && criticalCount > 0
            ? analysis.risk.critical_nodes.join(', ')
            : 'None'}
        </p>
      </Card>
    </div>
  );
}
