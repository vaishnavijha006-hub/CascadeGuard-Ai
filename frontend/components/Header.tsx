'use client';

import { ShieldCheck, Radio, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BackendStatus = 'checking' | 'online' | 'offline';
export type AnalysisStatus =
  | 'loading_graph'
  | 'baseline_ready'
  | 'analyzing'
  | 'incident_analyzed'
  | 'graph_error'
  | 'analysis_error';

interface HeaderProps {
  backendStatus?: BackendStatus;
  analysisStatus?: AnalysisStatus;
  nodeCount?: number;
  edgeCount?: number;
}

export function Header({
  backendStatus = 'checking',
  analysisStatus = 'loading_graph',
  nodeCount = 0,
  edgeCount = 0,
}: HeaderProps) {
  // Config for the Analysis / Graph Status Indicator (First indicator)
  const getAnalysisConfig = () => {
    switch (analysisStatus) {
      case 'loading_graph':
        return {
          label: 'LOADING GRAPH',
          dotColor: 'bg-amber-400 animate-pulse',
          borderColor: 'border-amber-500/40 bg-amber-500/10',
          textColor: 'text-amber-400',
        };
      case 'analyzing':
        return {
          label: 'ANALYZING INCIDENT',
          dotColor: 'bg-amber-400 animate-ping',
          borderColor: 'border-amber-500/50 bg-amber-500/20',
          textColor: 'text-amber-400',
        };
      case 'incident_analyzed':
        return {
          label: 'INCIDENT ANALYZED',
          dotColor: 'bg-sky-400',
          borderColor: 'border-sky-500/40 bg-sky-500/15',
          textColor: 'text-sky-400',
        };
      case 'graph_error':
        return {
          label: 'GRAPH ERROR',
          dotColor: 'bg-rose-500',
          borderColor: 'border-rose-500/50 bg-rose-500/15',
          textColor: 'text-rose-400',
        };
      case 'analysis_error':
        return {
          label: 'ANALYSIS ERROR',
          dotColor: 'bg-rose-500',
          borderColor: 'border-rose-500/50 bg-rose-500/15',
          textColor: 'text-rose-400',
        };
      case 'baseline_ready':
      default:
        return {
          label: 'BASELINE READY',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-500/40 bg-emerald-500/10',
          textColor: 'text-emerald-400',
        };
    }
  };

  // Config for the System / Backend Connectivity Indicator (Second indicator)
  const getBackendConfig = () => {
    switch (backendStatus) {
      case 'checking':
        return {
          label: 'CONNECTING',
          dotColor: 'bg-amber-400 animate-pulse',
          borderColor: 'border-amber-500/40 bg-amber-500/10',
          textColor: 'text-amber-400',
          icon: <RefreshCw className="ml-0.5 h-3 w-3 animate-spin text-amber-400" />,
        };
      case 'offline':
        return {
          label: 'BACKEND OFFLINE',
          dotColor: 'bg-rose-500',
          borderColor: 'border-rose-500/50 bg-rose-500/15',
          textColor: 'text-rose-400',
          icon: <AlertTriangle className="ml-0.5 h-3 w-3 text-rose-400" />,
        };
      case 'online':
      default:
        return {
          label: 'SYSTEM READY',
          dotColor: 'bg-emerald-400',
          borderColor: 'border-emerald-500/40 bg-emerald-500/10',
          textColor: 'text-emerald-400',
          icon: <Radio className="ml-0.5 h-3 w-3 text-emerald-400" />,
        };
    }
  };

  const analysisConfig = getAnalysisConfig();
  const backendConfig = getBackendConfig();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-wide text-foreground">
            CascadeGuard
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Cascading Failure Intelligence
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Indicator 1: Functional Baseline / Incident Analysis Indicator */}
        <div
          className={cn(
            'flex items-center gap-2 rounded border px-3 py-1.5 transition-all duration-300',
            analysisConfig.borderColor
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', analysisConfig.dotColor)} />
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.15em]',
              analysisConfig.textColor
            )}
          >
            {analysisConfig.label}
          </span>
        </div>

        <span className="hidden rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-primary sm:inline-block">
          Simulation Mode
        </span>

        {/* Indicator 2: Functional Backend System Health Indicator */}
        <div
          className={cn(
            'flex items-center gap-2 rounded border px-3 py-1.5 transition-all duration-300',
            backendConfig.borderColor
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', backendConfig.dotColor)} />
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.15em]',
              backendConfig.textColor
            )}
          >
            {backendConfig.label}
          </span>
          {backendConfig.icon}
        </div>
      </div>
    </header>
  );
}
