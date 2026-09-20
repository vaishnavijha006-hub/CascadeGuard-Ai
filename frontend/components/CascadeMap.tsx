'use client';

import { useState } from 'react';
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
import {
  Loader2,
  AlertCircle,
  ShieldAlert,
  Target,
  X,
  Building2,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface CascadeMapProps {
  nodes?: ApiNode[];
  edges?: ApiEdge[];
  affectedNodeIds?: string[];
  criticalNodeIds?: string[];
  originNodeId?: string | null;
  loading?: boolean;
  selectedNodeId?: string | null;
  onNodeClick?: (id: string) => void;
}

interface CustomNodeData {
  id: string;
  label: string;
  sector: string;
  criticality: number;
  isAffected: boolean;
  isCritical: boolean;
  isOrigin: boolean;
  selected: boolean;
}

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  sldc: { x: 380, y: 30 },
  hospital: { x: 100, y: 170 },
  water: { x: 380, y: 170 },
  datacenter: { x: 660, y: 170 },
  emergency: { x: 100, y: 310 },
  government: { x: 660, y: 310 },
  ambulance: { x: 100, y: 450 },
};

function CascadeCustomNode({ data }: { data: CustomNodeData }) {
  let borderColor = 'hsl(217, 19%, 27%)';
  let bgColor = 'hsl(222, 47%, 9%)';
  let glowStyle = undefined;
  let statusColor = 'hsl(215, 16%, 47%)';
  let statusText = 'UNAFFECTED';

  if (data.isOrigin) {
    borderColor = '#38bdf8'; // Sky / Cyan for origin
    bgColor = 'rgba(14, 165, 233, 0.25)';
    glowStyle = '0 0 18px rgba(56, 189, 248, 0.6)';
    statusColor = '#38bdf8';
    statusText = 'INCIDENT ORIGIN';
  } else if (data.isCritical && data.isAffected) {
    borderColor = '#f43f5e'; // Rose / Red for critical affected node
    bgColor = 'rgba(136, 19, 55, 0.35)';
    glowStyle = '0 0 16px rgba(244, 63, 94, 0.6)';
    statusColor = '#f43f5e';
    statusText = 'LEVEL 5 CRITICAL';
  } else if (data.isAffected) {
    borderColor = '#f59e0b'; // Amber for affected node
    bgColor = 'rgba(120, 53, 15, 0.3)';
    glowStyle = '0 0 12px rgba(245, 158, 11, 0.5)';
    statusColor = '#f59e0b';
    statusText = 'CASCADE AFFECTED';
  }

  return (
    <div
      className="relative min-w-[210px] rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300"
      style={{
        borderColor: data.selected ? '#38bdf8' : borderColor,
        backgroundColor: bgColor,
        boxShadow: data.selected ? '0 0 0 3px rgba(56, 189, 248, 0.8)' : glowStyle,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {data.isOrigin ? (
            <Target className="h-4 w-4 animate-pulse text-sky-400" />
          ) : data.isCritical && data.isAffected ? (
            <ShieldAlert className="h-4 w-4 animate-bounce text-rose-500" />
          ) : data.isAffected ? (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          ) : (
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          )}
          <span className="truncate text-xs font-bold text-foreground">
            {data.label}
          </span>
        </div>
        <span className="rounded bg-background/70 px-1.5 py-0.5 text-[9px] font-mono font-bold text-muted-foreground border border-white/10">
          Level {data.criticality}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
        <span className="uppercase tracking-wider text-muted-foreground font-medium">
          {data.sector}
        </span>
        <span
          className="font-bold uppercase tracking-wider"
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
  originNodeId = null,
  loading = false,
  selectedNodeId = null,
  onNodeClick,
}: CascadeMapProps) {
  const [modalNode, setModalNode] = useState<ApiNode | null>(null);

  const affectedSet = new Set(affectedNodeIds);
  const criticalSet = new Set(criticalNodeIds);

  const flowNodes: Node[] = apiNodes.map((n, idx) => {
    const pos = NODE_POSITIONS[n.id] ?? { x: (idx % 3) * 260 + 80, y: Math.floor(idx / 3) * 150 + 50 };
    return {
      id: n.id,
      type: 'cascadeNode',
      position: pos,
      data: {
        id: n.id,
        label: n.label,
        sector: n.sector,
        criticality: n.criticality,
        isAffected: affectedSet.has(n.id),
        isCritical: criticalSet.has(n.id),
        isOrigin: n.id === originNodeId,
        selected: n.id === selectedNodeId || n.id === modalNode?.id,
      } satisfies CustomNodeData,
    };
  });

  const flowEdges: Edge[] = apiEdges.map((e, idx) => {
    const isEdgeActive = affectedSet.has(e.source) && affectedSet.has(e.target);
    const isSourceCritical = criticalSet.has(e.source);

    let strokeColor = '#475569';
    if (isEdgeActive) {
      strokeColor = isSourceCritical ? '#f43f5e' : '#f59e0b';
    }

    return {
      id: `e-${e.source}-${e.target}-${idx}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: isEdgeActive,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: strokeColor,
        width: 18,
        height: 18,
      },
      style: {
        stroke: strokeColor,
        strokeWidth: isEdgeActive ? 3.0 : 1.5,
        opacity: isEdgeActive ? 1.0 : 0.45,
      },
    };
  });

  const handleNodeClickInternal = (nodeId: string) => {
    onNodeClick?.(nodeId);
    const target = apiNodes.find((n) => n.id === nodeId);
    if (target) setModalNode(target);
  };

  return (
    <div className="relative flex flex-col h-[560px] w-full overflow-hidden rounded-xl border border-border bg-background shadow-xl">
      {/* Prominent Section Header Banner */}
      <div className="flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              DEPENDENCY & CASCADE MAP
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Interactive Graph: Source → Downstream Dependency Failure Propagation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {affectedNodeIds.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Cascade Active ({affectedNodeIds.length} Nodes)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Graph Baseline Ready
            </span>
          )}
        </div>
      </div>

      {/* Main ReactFlow Graph Container */}
      <div className="relative flex-1 w-full overflow-hidden">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Loading backend graph from GET /api/graph…
            </span>
          </div>
        ) : (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.22 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable
            zoomOnScroll
            panOnScroll
            onNodeClick={(_, node) => handleNodeClickInternal(node.id)}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={26}
              size={1.5}
              color="hsl(217 19% 22%)"
            />
            <Controls
              showInteractive={false}
              className="!rounded-lg !border !border-border !bg-card !shadow-md"
            />
            <MiniMap
              pannable
              zoomable
              nodeColor={(n) => {
                const d = n.data as CustomNodeData;
                if (d.isOrigin) return '#38bdf8';
                if (d.isCritical && d.isAffected) return '#f43f5e';
                if (d.isAffected) return '#f59e0b';
                return '#475569';
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
            />
          </ReactFlow>
        )}

        {/* Graph Legend Overlay */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex flex-col gap-1.5 rounded-lg border border-border bg-card/90 px-3.5 py-3 backdrop-blur-md shadow-md text-[10px]">
          <span className="font-bold uppercase tracking-wider text-foreground border-b border-border pb-1 mb-0.5">
            Graph Legend
          </span>
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-sky-400" />
            <span className="text-foreground font-medium">● Incident Origin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-foreground font-medium">● Critical Affected (L5)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-foreground font-medium">● Cascade Affected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span className="text-muted-foreground">● Unaffected Node</span>
          </div>
          <div className="flex items-center gap-2 border-t border-border/60 pt-1 mt-0.5">
            <span className="h-0.5 w-4 bg-amber-500" />
            <span className="text-amber-400 font-semibold">~&gt; Propagation Path</span>
          </div>
        </div>

        {/* Node Detail Interactive Modal Panel */}
        {modalNode && (
          <div className="absolute left-4 bottom-4 z-20 w-[280px] rounded-xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Node Metadata
                </span>
              </div>
              <button
                onClick={() => setModalNode(null)}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  Node Label
                </span>
                <span className="font-bold text-foreground text-sm">
                  {modalNode.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Sector
                  </span>
                  <span className="font-semibold text-foreground">
                    {modalNode.sector}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                    Criticality
                  </span>
                  <span className="font-mono font-bold text-primary">
                    Level {modalNode.criticality} / 5
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Node ID:</span>
                <code className="font-mono text-xs bg-background/80 px-1.5 py-0.5 rounded border border-border text-primary">
                  {modalNode.id}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
