'use client';

import { useMemo } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Gauge,
  Clock,
  Layers,
  HelpCircle,
  Server,
  X,
} from 'lucide-react';
import type {
  GraphNode,
  GraphEdge,
  AnalysisNode,
  RiskLevel,
  Sector,
} from '@/lib/types';
import { SECTOR_LABELS, EDGE_TYPE_LABELS } from '@/lib/types';
import { RISK_LABELS, riskHex, riskTextClass } from '@/lib/risk';
import { cn } from '@/lib/utils';

interface NodeDetailsProps {
  node: GraphNode | null;
  analysis: AnalysisNode[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  activeEdges?: string[];
  onClose?: () => void;
  onSelectNode?: (id: string) => void;
}

export function NodeDetails({
  node,
  analysis,
  graphNodes,
  graphEdges,
  activeEdges,
  onClose,
  onSelectNode,
}: NodeDetailsProps) {
  const analysisMap = useMemo(
    () => new Map(analysis.map((a) => [a.id, a])),
    [analysis]
  );

  const an = node ? analysisMap.get(node.id) : null;

  const { upstream, downstream } = useMemo(() => {
    if (!node) return { upstream: [] as GraphNode[], downstream: [] as GraphNode[] };
    const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
    const active = new Set(
      activeEdges ?? graphEdges.map((e) => e.id ?? `${e.source}->${e.target}`)
    );
    const up: GraphNode[] = [];
    const down: GraphNode[] = [];
    for (const e of graphEdges) {
      const eId = e.id ?? `${e.source}->${e.target}`;
      if (!active.has(eId)) continue;
      if (e.target === node.id) {
        const src = nodeMap.get(e.source);
        if (src) up.push(src);
      }
      if (e.source === node.id) {
        const tgt = nodeMap.get(e.target);
        if (tgt) down.push(tgt);
      }
    }
    return { upstream: up, downstream: down };
  }, [node, graphNodes, graphEdges, activeEdges]);

  if (!node) return null;

  const risk: RiskLevel = an?.level ?? 'low';
  const riskColor = riskHex(risk);

  return (
    <section className="rounded-md border border-border bg-card/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Asset Detail
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close asset detail"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Asset name and sector */}
      <div className="mb-3 rounded-md border border-border bg-background/40 p-3">
        <p className="text-sm font-semibold text-foreground">{node.label}</p>
        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {SECTOR_LABELS[node.sector as Sector] ?? node.sector}
          </span>
          <span className="font-mono">ID: {node.id}</span>
        </div>
      </div>

      {/* Metric grid */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <MetricCell
          icon={Gauge}
          label="Criticality"
          value={`${node.criticality}/5`}
        />
        <MetricCell
          icon={Gauge}
          label="Current Risk"
          value={an ? RISK_LABELS[risk] : '—'}
          valueClass={an ? riskTextClass(risk) : ''}
          dotColor={an ? riskColor : undefined}
        />
        <MetricCell
          icon={Clock}
          label="Impact Time"
          value={an ? `T+${an.impact_time_min}` : '—'}
        />
        <MetricCell
          icon={Layers}
          label="Cascade Depth"
          value={an ? String(an.depth) : '—'}
        />
      </div>

      {/* Why it matters */}
      {an && (
        <div className="mb-3 rounded-md border border-border bg-background/40 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Why It Matters
            </span>
          </div>
          <p className="text-xs leading-relaxed text-foreground/90">{an.why}</p>
        </div>
      )}

      {/* Dependencies */}
      {(upstream.length > 0 || downstream.length > 0) && (
        <div className="space-y-2.5">
          <DepList
            title="Upstream Dependencies"
            icon={ArrowUpFromLine}
            nodes={upstream}
            edges={graphEdges}
            targetId={node.id}
            onSelectNode={onSelectNode}
          />
          <DepList
            title="Downstream Dependencies"
            icon={ArrowDownToLine}
            nodes={downstream}
            edges={graphEdges}
            sourceId={node.id}
            onSelectNode={onSelectNode}
          />
        </div>
      )}
    </section>
  );
}

function MetricCell({
  icon: Icon,
  label,
  value,
  valueClass = '',
  dotColor,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  valueClass?: string;
  dotColor?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-2.5">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        {dotColor && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        )}
        <span className={cn('font-mono text-sm font-semibold tabular-nums text-foreground', valueClass)}>
          {value}
        </span>
      </div>
    </div>
  );
}

function DepList({
  title,
  icon: Icon,
  nodes,
  edges,
  targetId,
  sourceId,
  onSelectNode,
}: {
  title: string;
  icon: typeof ArrowUpFromLine;
  nodes: GraphNode[];
  edges: GraphEdge[];
  targetId?: string;
  sourceId?: string;
  onSelectNode?: (id: string) => void;
}) {
  if (nodes.length === 0) return null;

  return (
    <div className="rounded-md border border-border bg-background/40 p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="space-y-1">
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onSelectNode?.(n.id)}
            className="flex w-full items-center justify-between gap-2 rounded border border-border/60 bg-background/30 px-2 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="truncate text-xs text-foreground">{n.label}</span>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono">
              L{n.criticality}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
