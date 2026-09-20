'use client';

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { ApiNode, ApiEdge } from '@/lib/types';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

interface CascadeMapProps {
  nodes?: ApiNode[];
  edges?: ApiEdge[];
  affectedNodeIds?: string[];
  criticalNodeIds?: string[];
  loading?: boolean;
  selectedNodeId?: string | null;
  onNodeClick?: (id: string) => void;
}

interface CustomNodeData {
  label: string;
  sector: string;
  criticality: number;
  isAffected: boolean;
  isCritical: boolean;
  selected: boolean;
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  sldc: { x: 300, y: 30 },
  hospital: { x: 80, y: 150 },
  water: { x: 300, y: 150 },
  datacenter: { x: 520, y: 150 },
  emergency: { x: 80, y: 270 },
  government: { x: 520, y: 270 },
  ambulance: { x: 80, y: 390 },
};

function CascadeCustomNode({ data }: { data: CustomNodeData }) {
  let borderColor = 'hsl(217, 19%, 27%)';
  let bgColor = 'hsl(222, 47%, 11%)';
  let glowStyle = undefined;
  let statusColor = 'hsl(215, 16%, 47%)';
  let statusText = 'NORMAL';

  if (data.isCritical && data.isAffected) {
    borderColor = '#f43f5e'; // Rose / Red for critical affected node
    bgColor = 'rgba(136, 19, 55, 0.4)';
    glowStyle = '0 0 16px rgba(244, 63, 94, 0.6)';
    statusColor = '#f43f5e';
    statusText = 'CRITICAL IMPACT';
  } else if (data.isAffected) {
    borderColor = '#f59e0b'; // Amber for affected node
    bgColor = 'rgba(120, 53, 15, 0.35)';
    glowStyle = '0 0 12px rgba(245, 158, 11, 0.5)';
    statusColor = '#f59e0b';
    statusText = 'CASCADE AFFECTED';
  }

  return (
    <div
      className="relative min-w-[200px] rounded-lg border px-3.5 py-3 shadow-lg backdrop-blur-md transition-all duration-300"
      style={{
        borderColor: data.selected ? '#38bdf8' : borderColor,
        backgroundColor: bgColor,
        boxShadow: data.selected ? '0 0 0 2px #38bdf8' : glowStyle,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {data.isCritical && data.isAffected ? (
            <ShieldAlert className="h-4 w-4 animate-bounce text-rose-500" />
          ) : data.isAffected ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          )}
          <span className="truncate text-xs font-semibold text-foreground">
            {data.label}
          </span>
        </div>
        <span className="rounded bg-background/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
          L{data.criticality}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
        <span className="uppercase tracking-wider text-muted-foreground">
          {data.sector}
        </span>
        <span
          className="font-semibold uppercase tracking-wider"
          style={{ color: statusColor }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = { cascadeNode: CascadeCustomNode };

export function CascadeMap({
  nodes: apiNodes = [],
  edges: apiEdges = [],
  affectedNodeIds = [],
  criticalNodeIds = [],
  loading = false,
  selectedNodeId = null,
  onNodeClick,
}: CascadeMapProps) {
  const affectedSet = new Set(affectedNodeIds);
  const criticalSet = new Set(criticalNodeIds);

  const flowNodes: Node[] = apiNodes.map((n, idx) => {
    const pos = NODE_POSITIONS[n.id] ?? { x: (idx % 3) * 220 + 50, y: Math.floor(idx / 3) * 140 + 50 };
    return {
      id: n.id,
      type: 'cascadeNode',
      position: pos,
      data: {
        label: n.label,
        sector: n.sector,
        criticality: n.criticality,
        isAffected: affectedSet.has(n.id),
        isCritical: criticalSet.has(n.id),
        selected: n.id === selectedNodeId,
      } satisfies CustomNodeData,
    };
  });

  const flowEdges: Edge[] = apiEdges.map((e, idx) => {
    const isEdgeActive = affectedSet.has(e.source) && affectedSet.has(e.target);
    const isSourceCritical = criticalSet.has(e.source);
    const strokeColor = isEdgeActive
      ? isSourceCritical ? '#f43f5e' : '#f59e0b'
      : '#475569';

    return {
      id: `e-${e.source}-${e.target}-${idx}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: isEdgeActive,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 16,
        height: 16,
      },
      style: {
        stroke: strokeColor,
        strokeWidth: isEdgeActive ? 2.5 : 1.5,
        opacity: isEdgeActive ? 1.0 : 0.45,
      },
    };
  });

  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-border bg-background shadow-inner">
      {loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Loading dependency graph from backend…
          </span>
        </div>
      ) : (
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          zoomOnScroll
          panOnScroll
          onNodeClick={(_, node) => onNodeClick?.(node.id)}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="hsl(217 19% 20%)"
          />
          <Controls
            showInteractive={false}
            className="!rounded-lg !border !border-border !bg-card"
          />
          <MiniMap
            pannable
            zoomable
            nodeColor={(n) => {
              const d = n.data as CustomNodeData;
              if (d.isCritical && d.isAffected) return '#f43f5e';
              if (d.isAffected) return '#f59e0b';
              return '#475569';
            }}
            maskColor="rgba(15, 23, 42, 0.75)"
          />
        </ReactFlow>
      )}

      {/* Header Info Banner */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-3 rounded-lg border border-border bg-card/85 px-3 py-2 backdrop-blur-md">
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Dependency Graph
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {apiNodes.length} Nodes · {apiEdges.length} Directed Dependencies
        </span>
        {affectedNodeIds.length > 0 && (
          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Cascade Active ({affectedNodeIds.length} Affected)
          </span>
        )}
      </div>

      {/* Map Legend */}
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col gap-1.5 rounded-lg border border-border bg-card/85 px-3 py-2.5 backdrop-blur-md text-[10px]">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          Status Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="text-foreground">Level 5 Critical Impact</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-foreground">Cascade Affected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
          <span className="text-muted-foreground">Normal Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
