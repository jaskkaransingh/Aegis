"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useReactFlow,
  type NodeTypes,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ServiceNodeComponent } from "./service-node";
import type { TopologyGraphEdge, TopologyGraphNode } from "@/types/topology";
import { AlertCircle } from "lucide-react";

interface TopologyCanvasProps {
  nodes: TopologyGraphNode[];
  edges: TopologyGraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onDeselect: () => void;
  resetTrigger: number;
}

function TopologyFlowInner({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onDeselect,
  resetTrigger,
}: TopologyCanvasProps) {
  const { fitView } = useReactFlow();

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      serviceNode: ServiceNodeComponent,
    }),
    []
  );

  // Auto-fit on initial load or reset trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.18, duration: 400 });
    }, 120);
    return () => clearTimeout(timer);
  }, [fitView, resetTrigger]);

  const onNodeClick: NodeMouseHandler<TopologyGraphNode> = useCallback(
    (_, node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const onPaneClick = useCallback(() => {
    onDeselect();
  }, [onDeselect]);

  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-950/70 border border-slate-800 rounded-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-amber-400" />
        </div>
        <h4 className="text-base font-semibold text-slate-200 mb-1">
          No services match active filters
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Adjust your status, category, or search filters to restore nodes on the dependency graph canvas.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls
          className="!bg-slate-900/90 !border !border-slate-800 !rounded-xl !shadow-xl !fill-slate-300 [&>button]:!bg-slate-900 [&>button]:!border-b [&>button]:!border-slate-800 [&>button:hover]:!bg-slate-800"
        />
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(node) => {
            const data = node.data as { status?: string };
            if (data?.status === "CRITICAL") return "#f43f5e";
            if (data?.status === "DEGRADED" || data?.status === "WARNING") return "#f59e0b";
            if (data?.status === "HEALTHY") return "#10b981";
            return "#64748b";
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
          className="!bg-slate-900/90 !border !border-slate-800 !rounded-xl !shadow-xl overflow-hidden hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
}

export function TopologyCanvas(props: TopologyCanvasProps) {
  return (
    <div className="w-full h-[620px] lg:h-[calc(100vh-270px)] min-h-[500px]">
      <ReactFlowProvider>
        <TopologyFlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
