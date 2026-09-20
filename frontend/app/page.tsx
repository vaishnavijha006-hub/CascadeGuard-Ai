'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Header, type BackendStatus, type AnalysisStatus } from '@/components/Header';
import { IncidentForm } from '@/components/Sidebar/IncidentForm';
import { KpiCards } from '@/components/KpiCards';
import { CascadeMap } from '@/components/CascadeMap';
import { BriefPanel } from '@/components/BriefPanel';
import { getHealth, getGraph, analyzeIncident } from '@/lib/api';
import type { ApiGraphResponse, IncidentAnalyzeResponse } from '@/lib/types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Page() {
  // Real API lifecycle states for top-right indicators
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('loading_graph');

  // Backend API data states
  const [graphData, setGraphData] = useState<ApiGraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState<boolean>(true);
  const [graphError, setGraphError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<IncidentAnalyzeResponse | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 1. Functional Backend Health Check on mount (GET /health)
  const checkBackendHealth = useCallback(async () => {
    setBackendStatus('checking');
    try {
      const res = await getHealth();
      if (res.status === 'ok') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  // 2. Functional Dependency Graph Fetch on mount (GET /api/graph)
  const loadGraph = useCallback(async () => {
    setGraphLoading(true);
    setGraphError(null);
    setAnalysisStatus('loading_graph');
    try {
      const data = await getGraph();
      setGraphData(data);
      setAnalysisStatus('baseline_ready');
    } catch (err: any) {
      const msg = err.message || 'Unable to connect to CascadeGuard backend.';
      setGraphError(msg);
      setAnalysisStatus('graph_error');
    } finally {
      setGraphLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // 3. Functional Incident Analysis Execution (POST /api/incident/analyze)
  const handleAnalyze = useCallback(
    async (requestData: {
      incident_type: string;
      incident_description: string;
      start_node: string;
    }) => {
      setAnalyzing(true);
      setAnalysisError(null);
      setAnalysisStatus('analyzing');
      setSelectedNodeId(requestData.start_node);

      try {
        const result = await analyzeIncident({
          incident_type: requestData.incident_type,
          incident_description: requestData.incident_description,
          start_node: requestData.start_node,
        });
        setAnalysis(result);
        setAnalysisStatus('incident_analyzed');
      } catch (err: any) {
        const msg = err.message || 'An unexpected error occurred during incident analysis.';
        setAnalysisError(msg);
        setAnalysisStatus('analysis_error');
      } finally {
        setAnalyzing(false);
      }
    },
    []
  );

  // 4. Reset behavior when input changes before running new analysis
  const handleInputChange = useCallback(() => {
    if (analysisStatus === 'incident_analyzed' || analysisStatus === 'analysis_error') {
      setAnalysisStatus('baseline_ready');
    }
  }, [analysisStatus]);

  const affectedNodeIds = useMemo(
    () => analysis?.cascade.affected_nodes ?? [],
    [analysis]
  );

  const criticalNodeIds = useMemo(
    () => analysis?.risk.critical_nodes ?? [],
    [analysis]
  );

  const originNodeId = useMemo(
    () => analysis?.incident.start_node ?? selectedNodeId,
    [analysis, selectedNodeId]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Dynamic Header with functional real-time indicators */}
      <Header
        backendStatus={backendStatus}
        analysisStatus={analysisStatus}
        nodeCount={graphData?.nodes.length ?? 0}
        edgeCount={graphData?.edges.length ?? 0}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Sidebar */}
        <div className="w-[310px] shrink-0 border-r border-border hidden md:block">
          <IncidentForm
            nodes={graphData?.nodes ?? []}
            loading={graphLoading}
            analyzing={analyzing}
            onAnalyze={handleAnalyze}
            onInputChange={handleInputChange}
          />
        </div>

        {/* Main Content Dashboard */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-5">
          {/* Graph Connection Error Alert */}
          {graphError && (
            <Alert variant="destructive" className="border-rose-500/50 bg-rose-500/10 text-rose-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Backend Connection Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between text-xs mt-1">
                <span>{graphError}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    checkBackendHealth();
                    loadGraph();
                  }}
                  className="h-7 border-rose-500/40 text-rose-300 hover:bg-rose-500/20 gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" /> Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Incident Analysis Error Alert */}
          {analysisError && (
            <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10 text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Analysis Failed</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                {analysisError}
              </AlertDescription>
            </Alert>
          )}

          {/* 1. Risk KPI Overview Cards */}
          <KpiCards analysis={analysis} loading={analyzing} />

          {/* 2. PROMINENT DEPENDENCY & CASCADE MAP */}
          <CascadeMap
            nodes={graphData?.nodes ?? []}
            edges={graphData?.edges ?? []}
            affectedNodeIds={affectedNodeIds}
            criticalNodeIds={criticalNodeIds}
            originNodeId={originNodeId}
            loading={graphLoading}
            selectedNodeId={selectedNodeId}
            onNodeClick={(id) => setSelectedNodeId(id)}
          />

          {/* 3. AI Operational Brief & Action Plan */}
          <BriefPanel
            aiAnalysis={analysis?.ai_analysis}
            loading={analyzing}
          />

          {/* Status Footer */}
          <footer className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>
              {analysis
                ? `Active Simulation: ${analysis.incident.type} originating at '${analysis.incident.start_node}'`
                : 'CascadeGuard Real-time Infrastructure Intelligence v1.0'}
            </span>
            <span className="font-mono text-primary font-semibold">
              FastAPI Engine Connected
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
