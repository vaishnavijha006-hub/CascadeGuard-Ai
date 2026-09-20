'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INCIDENT_TYPE_OPTIONS, type ApiNode } from '@/lib/types';

interface IncidentFormProps {
  nodes: ApiNode[];
  loading?: boolean;
  analyzing?: boolean;
  onAnalyze?: (data: {
    incident_type: string;
    incident_description: string;
    start_node: string;
  }) => void;
  onInputChange?: () => void;
}

export function IncidentForm({
  nodes = [],
  loading = false,
  analyzing = false,
  onAnalyze,
  onInputChange,
}: IncidentFormProps) {
  const [incidentType, setIncidentType] = useState<string>('Power Failure');
  const [incidentDescription, setIncidentDescription] = useState<string>(
    'Power failure at hospital feeder'
  );
  const [selectedStartNode, setSelectedStartNode] = useState<string>('hospital');

  // Sync selectedStartNode if nodes load and hospital is in nodes
  useEffect(() => {
    if (nodes.length > 0 && !nodes.some((n) => n.id === selectedStartNode)) {
      setSelectedStartNode(nodes[0].id);
    }
  }, [nodes, selectedStartNode]);

  const currentNode = nodes.find((n) => n.id === selectedStartNode);

  function handleTypeChange(val: string) {
    setIncidentType(val);
    onInputChange?.();
  }

  function handleDescriptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIncidentDescription(e.target.value);
    onInputChange?.();
  }

  function handleNodeChange(val: string) {
    setSelectedStartNode(val);
    onInputChange?.();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!incidentType.trim() || !incidentDescription.trim() || !selectedStartNode) {
      return;
    }

    onAnalyze?.({
      incident_type: incidentType,
      incident_description: incidentDescription,
      start_node: selectedStartNode,
    });
  }

  return (
    <aside className="flex h-full flex-col bg-card border-r border-border">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            Incident Control
          </h2>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Define the initiating event to simulate downstream cascade propagation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-4">
          {/* 1. Incident Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Incident Type
            </label>
            <Select
              value={incidentType}
              onValueChange={handleTypeChange}
              disabled={loading || analyzing}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue placeholder="Select Incident Type" />
              </SelectTrigger>
              <SelectContent>
                {INCIDENT_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Incident Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Incident Description
            </label>
            <Input
              value={incidentDescription}
              onChange={handleDescriptionChange}
              placeholder="e.g. Power failure at hospital feeder"
              disabled={loading || analyzing}
              className="bg-background/60 text-xs"
              required
            />
          </div>

          {/* 3. Starting Node (Dynamically populated from GET /api/graph) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Starting Node (Origin)
            </label>
            <Select
              value={selectedStartNode}
              onValueChange={handleNodeChange}
              disabled={loading || analyzing || nodes.length === 0}
            >
              <SelectTrigger className="bg-background/60">
                <SelectValue
                  placeholder={loading ? 'Loading graph nodes…' : 'Select starting node'}
                />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    <span className="flex items-center justify-between gap-3">
                      <span>{n.label}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        (Level {n.criticality})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentNode && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground rounded bg-background/40 p-2 border border-border/50">
                <Info className="h-3 w-3 text-primary shrink-0" />
                <span>
                  Sector: <strong className="text-foreground">{currentNode.sector}</strong> | ID:{' '}
                  <code className="font-mono text-primary">{currentNode.id}</code>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-border mt-auto">
          <Button
            type="submit"
            disabled={loading || analyzing || !incidentType || !incidentDescription || !selectedStartNode}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider h-10 gap-2 shadow-lg shadow-primary/20"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Simulating Cascade…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-primary-foreground" />
                Analyze Incident
              </>
            )}
          </Button>
        </div>
      </form>
    </aside>
  );
}
