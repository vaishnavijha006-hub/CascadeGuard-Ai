'use client';

import { useMemo } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Gauge,
  AlertOctagon,
  Hospital,
  Loader2,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SimulateResponse, Action } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SimulationComparisonProps {
  simulation: SimulateResponse | null;
  simulating: boolean;
  error: boolean;
  selectedActions: Action[];
  onRetry?: () => void;
}

interface MetricRow {
  label: string;
  icon: LucideIcon;
  before: string;
  after: string;
  delta: string;
  deltaIcon: 'down' | 'up';
  positive: boolean;
}

export function SimulationComparison({
  simulation,
  simulating,
  error,
  selectedActions,
  onRetry,
}: SimulationComparisonProps) {
  const metrics: MetricRow[] = useMemo(() => {
    if (!simulation) return [];
    const riskDelta = simulation.after.risk_score - simulation.before.risk_score;
    const hcDelta = simulation.after.high_or_critical - simulation.before.high_or_critical;
    const impactDelta = simulation.after.hospital_impact_min - simulation.before.hospital_impact_min;

    return [
      {
        label: 'Risk Score',
        icon: Gauge,
        before: String(simulation.before.risk_score),
        after: String(simulation.after.risk_score),
        delta: `${riskDelta > 0 ? '+' : ''}${riskDelta}`,
        deltaIcon: 'down',
        positive: riskDelta < 0,
      },
      {
        label: 'High/Critical Nodes',
        icon: AlertOctagon,
        before: String(simulation.before.high_or_critical),
        after: String(simulation.after.high_or_critical),
        delta: `${hcDelta > 0 ? '+' : ''}${hcDelta}`,
        deltaIcon: 'down',
        positive: hcDelta < 0,
      },
      {
        label: 'Hospital Impact',
        icon: Hospital,
        before: `T+${simulation.before.hospital_impact_min}`,
        after: `T+${simulation.after.hospital_impact_min}`,
        delta: `+${impactDelta} min`,
        deltaIcon: 'up',
        positive: impactDelta > 0,
      },
    ];
  }, [simulation]);

  if (simulating) {
    return (
      <section className="rounded-md border border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Simulating Intervention
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Recalculating cascade propagation with selected actions
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {selectedActions.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded border border-border bg-background/40 px-3 py-2"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-foreground">{a.title}</span>
              <span className="ml-auto font-mono text-[10px] text-primary">
                -{a.est_risk_reduction_pct}%
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-md border border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-destructive">
              Simulation Unavailable
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Unable to calculate projected intervention impact.
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </section>
    );
  }

  if (!simulation) {
    return null;
  }

  return (
    <section className="rounded-md border border-primary/30 bg-primary/5 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Gauge className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Projected Intervention Impact
        </h3>
      </div>

      {/* Flow indicator */}
      <div className="mb-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Before</span>
        <ArrowDown className="h-3 w-3" />
        <span className="text-primary">Intervention</span>
        <ArrowDown className="h-3 w-3" />
        <span>Projected After</span>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* BEFORE column */}
        <div className="rounded-md border border-border bg-background/50 p-3">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Before
          </div>
          <div className="space-y-3">
            {metrics.map((m) => (
              <MetricCell key={`b-${m.label}`} metric={m} side="before" />
            ))}
          </div>
        </div>

        {/* AFTER column */}
        <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            Projected After
          </div>
          <div className="space-y-3">
            {metrics.map((m) => (
              <MetricCell key={`a-${m.label}`} metric={m} side="after" />
            ))}
          </div>
        </div>
      </div>

      {/* Delta summary */}
      <div className="mt-4 rounded-md border border-border bg-background/40 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Projected Improvement
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {metrics.map((m) => (
            <div key={`d-${m.label}`} className="flex items-center gap-1.5">
              {m.deltaIcon === 'down' ? (
                <ArrowDown
                  className={cn(
                    'h-3.5 w-3.5',
                    m.positive ? 'text-risk-low' : 'text-risk-high'
                  )}
                />
              ) : (
                <ArrowUp
                  className={cn(
                    'h-3.5 w-3.5',
                    m.positive ? 'text-risk-low' : 'text-risk-high'
                  )}
                />
              )}
              <span className="text-xs text-foreground">{m.label}:</span>
              <span
                className={cn(
                  'font-mono text-xs font-semibold tabular-nums',
                  m.positive ? 'text-risk-low' : 'text-risk-high'
                )}
              >
                {m.delta}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {m.label === 'Risk Score'
                  ? 'projected risk'
                  : m.label === 'High/Critical Nodes'
                    ? 'nodes'
                    : 'delayed impact'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected interventions list */}
      {selectedActions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedActions.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1 rounded border border-border bg-background/40 px-2 py-1 text-[10px] text-muted-foreground"
            >
              <ShieldCheck className="h-3 w-3 text-primary" />
              {a.title}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function MetricCell({ metric, side }: { metric: MetricRow; side: 'before' | 'after' }) {
  const Icon = metric.icon;
  const value = side === 'before' ? metric.before : metric.after;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{metric.label}</span>
      </div>
      <span
        className={cn(
          'font-mono text-lg font-semibold tabular-nums',
          side === 'after' && metric.label === 'Risk Score'
            ? 'text-primary'
            : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}
