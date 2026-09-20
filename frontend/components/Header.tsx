'use client';

import { ShieldCheck, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  simulationActive?: boolean;
  actionCount?: number;
}

export function Header({
  simulationActive = false,
  actionCount = 0,
}: HeaderProps) {
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
        {/* Analysis state indicator */}
        <div
          className={cn(
            'flex items-center gap-1.5 rounded border px-2.5 py-1.5',
            simulationActive
              ? 'border-primary/40 bg-primary/10'
              : 'border-border bg-background/60'
          )}
        >
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              simulationActive ? 'bg-primary' : 'bg-risk-low'
            )}
          />
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.15em]',
              simulationActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {simulationActive
              ? `Simulated Intervention${actionCount > 0 ? ` · ${actionCount} action${actionCount > 1 ? 's' : ''}` : ''}`
              : 'Baseline Analysis'}
          </span>
        </div>

        <span className="hidden rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-primary sm:inline-block">
          Simulation Mode
        </span>
        <div className="flex items-center gap-1.5 rounded border border-border bg-background/60 px-2.5 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-risk-low" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-risk-low" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            System Ready
          </span>
          <Radio className="ml-0.5 h-3 w-3 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
