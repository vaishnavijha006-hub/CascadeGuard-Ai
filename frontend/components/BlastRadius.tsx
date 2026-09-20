'use client';

import { useMemo } from 'react';
import { Radar, Layers, AlertOctagon, Network, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AnalyzeResponse, AnalysisNode, GraphNode, Sector } from '@/lib/types';
import { SECTOR_LABELS } from '@/lib/types';
import { riskHex } from '@/lib/risk';

interface BlastRadiusProps {
  analysis: AnalyzeResponse | null;
  graphNodes: GraphNode[];
  loading?: boolean;
}

interface BlastMetric {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function BlastRadius({ analysis, graphNodes, loading = false }: BlastRadiusProps) {
  const metrics: BlastMetric[] = useMemo(() => {
    if (!analysis) return [];
    const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
    const sectors = new Set<Sector>();
    let highCount = 0;

    const blastList = analysis.blast_radius ?? [];
    const nodesList = analysis.nodes ?? [];

    for (const bn of blastList) {
      const gn = nodeMap.get(bn.id);
      if (gn) sectors.add(gn.sector);
    }
    for (const an of nodesList) {
      if (an.level === 'high' || an.level === 'critical') highCount++;
    }

    return [
      {
        icon: Network,
        label: 'Connected Assets',
        value: blastList.length,
      },
      {
        icon: Layers,
        label: 'Sectors Affected',
        value: sectors.size,
      },
      {
        icon: AlertOctagon,
        label: 'High-Risk Nodes',
        value: highCount,
      },
      {
        icon: Radar,
        label: 'Cascade Layers',
        value: analysis.summary?.cascade_depth ?? analysis.cascade.cascade_depth,
      },
      {
        icon: Clock,
        label: 'First Impact',
        value: `T+${analysis.summary?.first_impact_min ?? 0}`,
      },
    ];
  }, [analysis, graphNodes]);

  if (loading) {
    return (
      <section className="rounded-md border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Blast Radius
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[60px] animate-pulse rounded-md bg-muted/30"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!analysis || !analysis.blast_radius) return null;

  const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
  const topBlast = [...(analysis.blast_radius ?? [])]
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return (
    <section className="rounded-md border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Radar className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
          Blast Radius
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-md border border-border bg-background/40 p-2.5"
          >
            <div className="flex items-center gap-1">
              <m.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {m.label}
              </span>
            </div>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top affected assets */}
      <div className="mt-3 space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Top Affected Assets
        </span>
        {topBlast.map((b) => {
          const gn = nodeMap.get(b.id);
          const score = Math.round(b.score * 100);
          const color =
            score >= 75
              ? riskHex('critical')
              : score >= 50
                ? riskHex('high')
                : score >= 25
                  ? riskHex('moderate')
                  : riskHex('low');
          return (
            <div key={b.id} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-foreground">
                {gn?.label ?? b.id}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/30">
                <div
                  className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
              <span
                className="w-8 shrink-0 text-right font-mono text-[10px] tabular-nums"
                style={{ color }}
              >
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export { SECTOR_LABELS };
