'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shield, Zap, Loader2, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { Action } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResponsePanelProps {
  actions?: Action[];
  loading?: boolean;
  simulating?: boolean;
  onSimulate?: (selectedIds: string[]) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

const PRIORITY_ICONS: Record<string, LucideIcon> = {
  act_backup_hospital: Shield,
  act_isolate_telecom: Zap,
  act_manual_water: Shield,
  act_deploy_cow: Zap,
  act_failover_dc: Shield,
};

const PRIORITY_STYLES: Record<string, string> = {
  P1: 'bg-risk-critical/15 text-risk-critical',
  P2: 'bg-risk-high/15 text-risk-high',
  P3: 'bg-risk-moderate/15 text-risk-moderate',
  P4: 'bg-risk-low/15 text-risk-low',
};

const PRIORITY_ORDER: Record<string, number> = {
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
};

export function ResponsePanel({
  actions = [],
  loading = false,
  simulating = false,
  onSimulate,
  onSelectionChange,
}: ResponsePanelProps) {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAppliedIds(new Set());
    onSelectionChange?.([]);
  }, [actions, onSelectionChange]);

  const sortedActions = useMemo(
    () =>
      [...actions].sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
      ),
    [actions]
  );

  function toggle(id: string) {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      const ids = Array.from(next);
      onSelectionChange?.(ids);
      return next;
    });
  }

  function handleSimulate() {
    onSimulate?.(Array.from(appliedIds));
  }

  return (
    <section className="flex h-full flex-col rounded-md border border-border bg-card/60">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            <ListChecks className="h-4 w-4 text-primary" />
            Recommended Response Actions
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {appliedIds.size}/{actions.length} selected
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Select interventions to see their projected effect on cascade risk.
        </p>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : actions.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-1.5 text-center">
            <Shield className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Run an analysis to see recommended actions.
            </p>
          </div>
        ) : (
          sortedActions.map((action) => {
            const Icon = PRIORITY_ICONS[action.id] ?? Shield;
            const applied = appliedIds.has(action.id);
            return (
              <div
                key={action.id}
                className={cn(
                  'rounded-md border bg-background/40 p-3 transition-colors',
                  applied
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                        PRIORITY_STYLES[action.priority] ?? PRIORITY_STYLES.P4
                      )}
                    >
                      {action.priority}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {action.title}
                        </p>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {action.description}
                      </p>
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary">
                        <Zap className="h-3 w-3" />
                        Est. risk reduction:{' '}
                        <span className="font-mono">
                          -{action.est_risk_reduction_pct}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={applied}
                    onCheckedChange={() => toggle(action.id)}
                    aria-label={`Apply ${action.title}`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <Button
          onClick={handleSimulate}
          disabled={
            loading || simulating || appliedIds.size === 0 || actions.length === 0
          }
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {simulating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {simulating ? 'Simulating…' : 'Simulate Action'}
        </Button>
        {appliedIds.size === 0 && actions.length > 0 && !simulating && (
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            Select one or more actions to simulate
          </p>
        )}
      </div>
    </section>
  );
}
