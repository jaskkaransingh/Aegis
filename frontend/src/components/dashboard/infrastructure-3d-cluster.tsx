"use client";

import React, { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { ArrowRight, ExternalLink, Activity, Server, Database, Shield } from "lucide-react";
import Link from "next/link";

export interface ClusterNode3D {
  id: string;
  name: string;
  shortName: string;
  tier: "edge" | "core_business" | "data_persistence" | "integration";
  status: "CRITICAL" | "DEGRADED" | "WARNING" | "OPERATIONAL";
  position: [number, number, number];
  isAffected: boolean;
  connections: string[];
  metrics: {
    latency: string;
    errorRate: string;
    throughput: string;
    resource: string;
  };
  observedSymptom?: string;
}

export const CLUSTER_3D_NODES: ClusterNode3D[] = [
  {
    id: "api-gateway",
    name: "API Gateway",
    shortName: "Gateway",
    tier: "edge",
    status: "CRITICAL",
    position: [-4.2, 0.4, 0.5],
    isAffected: true,
    connections: ["appointment-service", "hospital-records-service", "payment-service"],
    metrics: {
      latency: "4,210ms (p99)",
      errorRate: "48.2% 504s",
      throughput: "3,420 req/s",
      resource: "CPU: 42%",
    },
    observedSymptom: "Cascading 504 Gateway Timeout downstream of auth-service.",
  },
  {
    id: "appointment-service",
    name: "Appointment Service",
    shortName: "Appointments",
    tier: "core_business",
    status: "CRITICAL",
    position: [-0.6, 2.1, -1.2],
    isAffected: true,
    connections: ["postgresql-database", "notification-service"],
    metrics: {
      latency: "3,890ms (p99)",
      errorRate: "62.1%",
      throughput: "940 req/s",
      resource: "Memory: 82%",
    },
    observedSymptom: "All worker threads blocked awaiting database connection release.",
  },
  {
    id: "hospital-records-service",
    name: "Hospital Records EHR",
    shortName: "EHR Service",
    tier: "core_business",
    status: "CRITICAL",
    position: [-0.4, 0.0, 1.6],
    isAffected: true,
    connections: ["postgresql-database", "redis-cache"],
    metrics: {
      latency: "4,120ms (p99)",
      errorRate: "54.8%",
      throughput: "1,220 req/s",
      resource: "Memory: 78%",
    },
    observedSymptom: "Transaction backlog exceeded queue limit (500/500 items).",
  },
  {
    id: "payment-service",
    name: "Payment Gateway Service",
    shortName: "Payments",
    tier: "core_business",
    status: "DEGRADED",
    position: [-0.6, -2.1, -0.6],
    isAffected: true,
    connections: ["postgresql-database"],
    metrics: {
      latency: "1,420ms (p99)",
      errorRate: "12.4%",
      throughput: "680 req/s",
      resource: "CPU: 61%",
    },
    observedSymptom: "Thread pool contention during settlement validation.",
  },
  {
    id: "postgresql-database",
    name: "PostgreSQL Database Cluster",
    shortName: "Postgres DB",
    tier: "data_persistence",
    status: "CRITICAL",
    position: [3.8, 0.4, -0.8],
    isAffected: true,
    connections: [],
    metrics: {
      latency: "4,820ms query hold",
      errorRate: "Pool 100/100 MAX",
      throughput: "4,800 ops/s",
      resource: "Active Locks: 20",
    },
    observedSymptom: "Exclusive row lock held by unindexed schema migration query.",
  },
  {
    id: "redis-cache",
    name: "Redis Memory Cache",
    shortName: "Redis Cache",
    tier: "data_persistence",
    status: "OPERATIONAL",
    position: [3.6, -1.9, 1.4],
    isAffected: false,
    connections: [],
    metrics: {
      latency: "1.2ms (p99)",
      errorRate: "0.00%",
      throughput: "8,400 ops/s",
      resource: "Memory: 38%",
    },
    observedSymptom: "Operating normally. Cache hit ratio 94.2%.",
  },
  {
    id: "notification-service",
    name: "Notification Dispatcher",
    shortName: "Notifications",
    tier: "integration",
    status: "DEGRADED",
    position: [3.4, 2.3, 1.6],
    isAffected: true,
    connections: [],
    metrics: {
      latency: "840ms (p99)",
      errorRate: "6.1%",
      throughput: "420 msg/s",
      resource: "Queue: 1,420",
    },
    observedSymptom: "Delayed retry queue due to upstream appointment failures.",
  },
];

// 3D Spline Path with animated glowing data packets
function SplineConnection({
  source,
  target,
  isCritical,
  isSelected,
}: {
  source: [number, number, number];
  target: [number, number, number];
  isCritical: boolean;
  isSelected: boolean;
}) {
  const curve = useMemo(() => {
    const v1 = new THREE.Vector3(...source);
    const v2 = new THREE.Vector3(...target);
    const mid = new THREE.Vector3()
      .addVectors(v1, v2)
      .multiplyScalar(0.5)
      .add(new THREE.Vector3(0, 0.45, 0.3));
    return new THREE.QuadraticBezierCurve3(v1, mid, v2);
  }, [source, target]);

  const lineGeometry = useMemo(() => {
    const points = curve.getPoints(36);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  const packetRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!packetRef.current) return;
    const t = (clock.getElapsedTime() * (isCritical ? 0.65 : 0.45)) % 1;
    const pt = curve.getPoint(t);
    packetRef.current.position.copy(pt);
  });

  const lineColor = isCritical ? "#ef4444" : isSelected ? "#ffffff" : "#22c55e";
  const packetColor = isCritical ? "#f87171" : "#4ade80";

  const lineObj = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: isCritical ? 0.75 : isSelected ? 0.65 : 0.25,
    });
    return new THREE.Line(lineGeometry, mat);
  }, [lineGeometry, lineColor, isCritical, isSelected]);

  return (
    <group>
      {/* 3D Static Spline Segment */}
      <primitive object={lineObj} />

      {/* Animated glowing packet traveling along spline */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[isCritical ? 0.08 : 0.06, 12, 12]} />
        <meshBasicMaterial color={packetColor} />
      </mesh>
    </group>
  );
}

// 3D Node Mesh with glowing shell and platinum selection ring
function NodeMesh3D({
  node,
  isSelected,
  onSelect,
}: {
  node: ClusterNode3D;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const isCritical = node.status === "CRITICAL";
  const isDegraded = node.status === "DEGRADED" || node.status === "WARNING";
  const baseColor = isCritical ? "#ef4444" : isDegraded ? "#f59e0b" : "#22c55e";

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.015;
    }
  });

  return (
    <group
      ref={meshRef}
      position={node.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Central Core Sphere */}
      <mesh>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isCritical ? 0.8 : 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Rotating Outer Gyro Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <torusGeometry args={[0.48, 0.018, 12, 36]} />
        <meshBasicMaterial
          color={isSelected ? "#ffffff" : baseColor}
          transparent
          opacity={isSelected ? 0.9 : 0.55}
        />
      </mesh>

      {/* Clicked / Selected Platinum Light Aura */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.58, 24, 24]} />
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Pulsing Alert Shell for Critical Nodes */}
      {isCritical && (
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.25}
          />
        </mesh>
      )}
    </group>
  );
}

// 3D Scene Container
function Scene3D({
  selectedId,
  onSelectNode,
}: {
  selectedId: string;
  onSelectNode: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    // Gentle floating tilt
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.02 + pointer.x * 0.08;
    groupRef.current.rotation.x = -pointer.y * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Tactical Sub-grid Plane */}
      <gridHelper
        args={[14, 14, 0x36415b, 0x1b2232]}
        position={[0, -2.8, 0]}
      />

      {/* Service Connections */}
      {CLUSTER_3D_NODES.map((source) =>
        source.connections.map((targetId) => {
          const target = CLUSTER_3D_NODES.find((n) => n.id === targetId);
          if (!target) return null;

          const isCritical = source.isAffected && target.isAffected;
          const isSelected = selectedId === source.id || selectedId === target.id;

          return (
            <SplineConnection
              key={`${source.id}->${target.id}`}
              source={source.position}
              target={target.position}
              isCritical={isCritical}
              isSelected={isSelected}
            />
          );
        })
      )}

      {/* Service Nodes */}
      {CLUSTER_3D_NODES.map((node) => (
        <NodeMesh3D
          key={node.id}
          node={node}
          isSelected={selectedId === node.id}
          onSelect={onSelectNode}
        />
      ))}
    </group>
  );
}

export function Infrastructure3DCluster({
  selectedId,
  onSelectNode,
}: {
  selectedId: string;
  onSelectNode: (id: string) => void;
}) {
  const activeNode = CLUSTER_3D_NODES.find((n) => n.id === selectedId) || CLUSTER_3D_NODES[0];

  return (
    <div className="relative w-full h-[480px] bg-black/60 rounded-xl overflow-hidden border border-white/10 select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 1.2, 9.8]} fov={45} />
        <ambientLight intensity={0.65} />
        <pointLight position={[8, 8, 8]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-8, -8, -8]} intensity={0.5} color="#22c55e" />

        <Scene3D selectedId={selectedId} onSelectNode={onSelectNode} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.15}
          minPolarAngle={Math.PI / 3}
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Tactical Canvas Overlay Header */}
      <div className="absolute top-3.5 left-4 pointer-events-none flex items-center gap-2 text-xs font-mono">
        <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
        <span className="font-semibold text-white tracking-wider">
          LIVE 3D MESH TOPOLOGY
        </span>
        <span className="text-white/40">•</span>
        <span className="text-white/60">DRAG TO ROTATE // CLICK NODE TO INSPECT</span>
      </div>

      {/* Selected Node Telemetry HUD Drawer (Spacious & Highly Legible) */}
      <div className="absolute bottom-4 right-4 max-w-sm w-full p-4.5 rounded-xl border border-white/20 bg-[#07090f]/90 backdrop-blur-xl shadow-2xl space-y-3 z-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                activeNode.status === "CRITICAL"
                  ? "bg-[#ef4444] shadow-[0_0_8px_#ef4444]"
                  : activeNode.status === "DEGRADED"
                  ? "bg-[#f59e0b]"
                  : "bg-[#22c55e] shadow-[0_0_8px_#22c55e]"
              }`}
            />
            <span className="font-mono text-sm font-bold text-white tracking-tight">
              {activeNode.name}
            </span>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
              activeNode.status === "CRITICAL"
                ? "bg-red-950/80 text-[#ef4444] border border-red-500/40"
                : activeNode.status === "DEGRADED"
                ? "bg-amber-950/80 text-[#f59e0b] border border-amber-500/40"
                : "bg-emerald-950/80 text-[#22c55e] border border-emerald-500/40"
            }`}
          >
            {activeNode.status}
          </span>
        </div>

        {/* Real-time Engineering Metrics Grid (High Legibility) */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-white/5 border border-white/10 space-y-0.5">
            <div className="text-[10px] uppercase text-white/40">Latency</div>
            <div className="font-bold text-white text-sm">{activeNode.metrics.latency}</div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/10 space-y-0.5">
            <div className="text-[10px] uppercase text-white/40">Error Rate</div>
            <div
              className={`font-bold text-sm ${
                activeNode.isAffected ? "text-[#ef4444]" : "text-[#22c55e]"
              }`}
            >
              {activeNode.metrics.errorRate}
            </div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/10 space-y-0.5">
            <div className="text-[10px] uppercase text-white/40">Throughput</div>
            <div className="font-bold text-white text-sm">{activeNode.metrics.throughput}</div>
          </div>
          <div className="p-2 rounded bg-white/5 border border-white/10 space-y-0.5">
            <div className="text-[10px] uppercase text-white/40">Resource Load</div>
            <div className="font-bold text-white text-sm">{activeNode.metrics.resource}</div>
          </div>
        </div>

        {activeNode.observedSymptom && (
          <div className="p-2.5 rounded bg-black/60 border border-white/10 text-xs font-mono text-white/90 leading-relaxed">
            <div className="text-[10px] uppercase text-[#f59e0b] font-semibold mb-0.5">
              Observed Symptom
            </div>
            {activeNode.observedSymptom}
          </div>
        )}

        <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono">
          <Link
            href={`/evidence?service=${activeNode.id}`}
            className="text-white hover:underline flex items-center gap-1 font-medium"
          >
            <span>Inspect Evidence</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/timeline"
            className="text-white/60 hover:text-white flex items-center gap-1"
          >
            <span>Track in Timeline</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Infrastructure3DCluster;
