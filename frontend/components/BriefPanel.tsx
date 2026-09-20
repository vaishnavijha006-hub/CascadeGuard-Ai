'use client';

import {
  FileText,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Info,
  BadgeAlert,
} from 'lucide-react';
import type { AiAnalysis } from '@/lib/types';
import { Card } from '@/components/ui/card';

interface BriefPanelProps {
  aiAnalysis?: AiAnalysis | null;
  loading?: boolean;
}

export function BriefPanel({ aiAnalysis, loading = false }: BriefPanelProps) {
  if (loading) {
    return (
      <Card className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
          <FileText className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            AI Operational Brief & Action Plan
          </h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-muted/50" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted/40" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted/30" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border bg-card/70 p-5 shadow-md space-y-5">
      {/* Top Header & Simulation Trust Disclaimer */}
      <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-foreground">
            AI Operational Brief & Responder Guidance
          </h3>
        </div>

        {/* Task 12: SIMULATED SCENARIO Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <BadgeAlert className="h-3.5 w-3.5" />
            SIMULATED SCENARIO
          </span>
        </div>
      </div>

      {/* Task 12: Trust & Architecture Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-sky-200">
        <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Architecture Note:</strong> Risk and cascade values are calculated by the deterministic analysis engine. AI provides interpretation and response guidance based solely on backend results.
        </p>
      </div>

      {!aiAnalysis ? (
        <p className="text-xs leading-relaxed text-muted-foreground italic">
          No active incident analysis loaded. Select a starting node and click <strong>ANALYZE INCIDENT</strong> to generate an operational brief.
        </p>
      ) : (
        <div className="space-y-5">
          {/* Executive Summary */}
          <div className="space-y-1.5 rounded-lg border border-border bg-background/50 p-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              <span>Executive Summary</span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/90">
              {aiAnalysis.summary}
            </p>
          </div>

          {/* Key Impacts & Responder Note */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Key Impacts */}
            <div className="space-y-2 rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Key Impacts</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/80 leading-relaxed">
                {aiAnalysis.key_impacts.map((impact, idx) => (
                  <li key={idx}>{impact}</li>
                ))}
              </ul>
            </div>

            {/* Operational Responder Note */}
            <div className="space-y-2 rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                <span>Responder Guidance Note</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/80">
                {aiAnalysis.responder_note}
              </p>
            </div>
          </div>

          {/* Priority Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Prioritized Response Actions ({aiAnalysis.priority_actions.length})</span>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {aiAnalysis.priority_actions.map((act, idx) => {
                let badgeClass = 'bg-slate-500/20 text-slate-300 border-slate-500/40';
                const pUpper = act.priority.toUpperCase();
                if (pUpper.includes('HIGH') || pUpper === 'P1') {
                  badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                } else if (pUpper.includes('MEDIUM') || pUpper === 'P2') {
                  badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                } else if (pUpper.includes('LOW') || pUpper === 'P3' || pUpper === 'P4') {
                  badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                }

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-lg border border-border bg-background/60 p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground leading-snug">
                        {act.action}
                      </h4>
                      <span
                        className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}
                      >
                        {act.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      <strong className="text-foreground/80">Reason:</strong> {act.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
