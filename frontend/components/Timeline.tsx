'use client';

import { useMemo } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import type { AnalysisNode } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TimelineProps {
  analysis?: AnalysisNode[];
  loading?: boolean;
  horizon: number;
  onHorizonChange: (h: number) => void;
  playing?: boolean;
  onPlayToggle?: () => void;
  onReset?: () => void;
}

export function Timeline({
  analysis = [],
  loading = false,
  horizon,
  onHorizonChange,
  playing = false,
  onPlayToggle,
  onReset,
}: TimelineProps) {
  const markers = useMemo(() => {
    const times = analysis.map((a) => a.impact_time_min).sort((a, b) => a - b);
    const unique = Array.from(new Set(times));
    return unique.length > 0 ? unique : [0];
  }, [analysis]);

  const affectedCount = useMemo(
    () => analysis.filter((a) => a.impact_time_min <= horizon).length,
    [analysis, horizon]
  );

  return (
    <div className="rounded-md border border-border bg-card/60 px-4 py-3">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Impact Timeline
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Current horizon
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-primary">
            T+{horizon}
          </span>
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            ·
          </span>
          <span className="hidden text-[10px] text-muted-foreground sm:inline">
            Affected assets: <span className="font-mono text-foreground">{affectedCount}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Horizon markers */}
        <div className="relative flex h-9 flex-1 items-center gap-1 overflow-x-auto">
          {loading ? (
            <div className="flex h-9 w-full items-center justify-center text-[10px] text-muted-foreground">
              Loading impact times…
            </div>
          ) : (
            markers.map((t) => {
              const active = t <= horizon;
              const selected = t === horizon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onHorizonChange(t)}
                  className={cn(
                    'flex h-9 min-w-[64px] flex-1 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary/15 text-primary'
                      : active
                        ? 'border-primary/30 bg-primary/5 text-primary/80'
                        : 'border-border bg-background/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <span className="font-mono tabular-nums">T+{t}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Play / Reset controls */}
        {onPlayToggle && (
          <button
            type="button"
            onClick={onPlayToggle}
            disabled={loading || markers.length <= 1}
            className="flex h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-border bg-background/40 text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            aria-label={playing ? 'Pause demo' : 'Play demo'}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Play className="h-3.5 w-3.5 text-primary" />
            )}
            <span className="hidden text-[10px] uppercase tracking-wider sm:inline">
              {playing ? 'Pause' : 'Play'}
            </span>
          </button>
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="flex h-9 min-w-[44px] items-center justify-center gap-1.5 rounded-md border border-border bg-background/40 text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            aria-label="Reset timeline"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden text-[10px] uppercase tracking-wider sm:inline">
              Reset
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
