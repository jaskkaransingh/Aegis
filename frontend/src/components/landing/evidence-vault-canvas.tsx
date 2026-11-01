"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EvidenceVaultFallback } from "@/components/landing/evidence-vault-fallback";
import { prefersReducedMotion } from "@/lib/motion";

interface EvidenceVaultCanvasProps {
  stage?: number; // 0: hero, 1: detect, 2: connect, 3: investigate, 4: explain
  className?: string;
}

export function EvidenceVaultCanvas({
  stage = 0,
  className = "",
}: EvidenceVaultCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  // Dynamic refs to pass stage and mouse to the animation loop without restarting useEffect
  const stageRef = useRef(stage);
  stageRef.current = stage;

  // Check WebGL support safely on mount
  useEffect(() => {
    try {
      const testCanvas = document.createElement("canvas");
      const gl =
        testCanvas.getContext("webgl2") ||
        testCanvas.getContext("webgl") ||
        testCanvas.getContext("experimental-webgl");
      setWebglSupported(!!gl);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    if (webglSupported !== true || !canvasRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Detect reduced motion setting
    const reducedMotion = prefersReducedMotion();

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 9);

    // Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch {
      setWebglSupported(false);
      return;
    }

    // Geometry & Materials Collection for disposal
    const disposables: { dispose: () => void }[] = [];

    // 1. Central Core: Dark Anodized Polyhedron
    const coreGeo = new THREE.IcosahedronGeometry(1.65, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0e1322,
      roughness: 0.35,
      metalness: 0.9,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    disposables.push(coreGeo, coreMat);

    // 2. Core Wireframe Overlay: Platinum Hairlines
    const coreWireGeo = new THREE.IcosahedronGeometry(1.68, 0);
    const coreWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const coreWireMesh = new THREE.Mesh(coreWireGeo, coreWireMat);
    scene.add(coreWireMesh);
    disposables.push(coreWireGeo, coreWireMat);

    // 3. Outer Nested Polyhedron: Dodecahedral Lattice (Platinum Silver)
    const latticeGeo = new THREE.DodecahedronGeometry(2.35, 0);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    scene.add(latticeMesh);
    disposables.push(latticeGeo, latticeMat);

    // 4. Concentric Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(3.2, 0.015, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x36415b,
      transparent: true,
      opacity: 0.5,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    scene.add(ring1Mesh);
    disposables.push(ring1Geo, ring1Mat);

    const ring2Geo = new THREE.TorusGeometry(3.5, 0.012, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.y = -Math.PI / 5;
    scene.add(ring2Mesh);
    disposables.push(ring2Geo, ring2Mat);

    // 5. Orbiting Evidence Nodes (8 Nodes placed around core)
    interface NodePoint {
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      speed: number;
      angle: number;
      radius: number;
      role: "anomaly" | "service" | "evidence" | "neutral";
    }

    const nodePoints: NodePoint[] = [];
    const nodeSphGeo = new THREE.SphereGeometry(0.09, 16, 16);
    disposables.push(nodeSphGeo);

    const rawNodeData: { pos: [number, number, number]; role: NodePoint["role"] }[] = [
      { pos: [2.5, 1.2, 0.8], role: "anomaly" },   // Node 0: Initial Anomaly (Warning Amber / Rose)
      { pos: [-2.4, -1.1, 0.6], role: "service" }, // Node 1: API Gateway (Cyan)
      { pos: [-1.2, 2.3, -0.9], role: "service" }, // Node 2: Auth Service (Cyan)
      { pos: [1.8, -2.1, 1.1], role: "service" },  // Node 3: Database (Cyan)
      { pos: [0.8, 2.6, 1.4], role: "evidence" },  // Node 4: Trace Evidence EV-1042 (Violet)
      { pos: [-2.1, 1.8, 1.2], role: "evidence" }, // Node 5: Trace Evidence EV-1049 (Violet)
      { pos: [2.2, -1.4, -1.3], role: "evidence" },// Node 6: Hypothesis Anchor (Violet)
      { pos: [-1.6, -2.2, -1.0], role: "neutral" },// Node 7: Downstream worker (Neutral)
    ];

    rawNodeData.forEach((data, idx) => {
      let nodeColor = 0x94a3b8;
      if (data.role === "anomaly") nodeColor = 0xef4444; // Enterprise Red
      if (data.role === "service") nodeColor = 0xffffff; // Platinum
      if (data.role === "evidence") nodeColor = 0x22c55e; // Enterprise Green

      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      disposables.push(nodeMat);

      const nodeMesh = new THREE.Mesh(nodeSphGeo, nodeMat);
      const posVec = new THREE.Vector3(...data.pos);
      nodeMesh.position.copy(posVec);
      scene.add(nodeMesh);

      const radius = posVec.length();
      nodePoints.push({
        mesh: nodeMesh,
        initialPos: posVec,
        speed: 0.15 + (idx % 3) * 0.05,
        angle: Math.atan2(posVec.y, posVec.x),
        radius,
        role: data.role,
      });
    });

    // 6. Dynamic Causal Connection Lines between nodes
    const maxLines = 12;
    const linePositions = new Float32Array(maxLines * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.45,
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);
    disposables.push(lineGeo, lineMat);

    // 7. Lighting
    const keyLight = new THREE.PointLight(0xffffff, 3.5, 30);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x7adcf5, 2.8, 30);
    rimLight.position.set(-6, -4, 5);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x07090f, 1.2);
    scene.add(ambientLight);

    // Mouse Tracking with smooth damping
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = Math.max(-1, Math.min(1, nx));
      mouse.targetY = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // IntersectionObserver to pause when off-screen
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const currentStage = stageRef.current;

      // Mouse Parallax Lerping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Base rotation rate (reduced when reduced-motion is requested)
      const rotSpeed = reducedMotion ? 0.002 : 0.25;

      // Rotate central structure
      coreMesh.rotation.y += rotSpeed * delta;
      coreMesh.rotation.x = Math.sin(elapsed * 0.3) * 0.15 + mouse.y * 0.2;
      coreMesh.rotation.z = mouse.x * 0.2;

      coreWireMesh.rotation.copy(coreMesh.rotation);
      latticeMesh.rotation.y -= rotSpeed * 0.7 * delta;
      latticeMesh.rotation.x = coreMesh.rotation.x * 1.2;

      // Orbital rings rotation
      ring1Mesh.rotation.z += 0.15 * delta;
      ring2Mesh.rotation.z -= 0.12 * delta;

      // Stage-specific transitions & reactive physics
      // Stage 0: Hero — closed steady structure
      // Stage 1: Detect — Node 0 flashes warning amber, core tilts forward
      // Stage 2: Connect — Outer lattice expands, lines connect service nodes
      // Stage 3: Investigate — Evidence nodes pulse violet, core brightens
      // Stage 4: Explain — Symmetric lock, cool harmonic stability
      let targetLatticeScale = 1.0;
      let targetCoreEmissive = 0.0;

      if (currentStage >= 1) {
        // Anomaly node pulse
        const anomalyNode = nodePoints[0];
        if (anomalyNode) {
          const pulse = (Math.sin(elapsed * 6) + 1) * 0.5;
          (anomalyNode.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
            0.8 + pulse * 1.5;
        }
      }

      if (currentStage >= 2) {
        targetLatticeScale = 1.15;
      }

      if (currentStage >= 3) {
        targetCoreEmissive = 0.3;
      }

      // Smoothly interpolate lattice scale
      latticeMesh.scale.lerp(
        new THREE.Vector3(targetLatticeScale, targetLatticeScale, targetLatticeScale),
        0.05
      );

      // Smooth camera subtle depth push
      const targetCamZ = currentStage === 2 ? 8.2 : currentStage === 3 ? 7.8 : 9.0;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;

      // Orbit evidence nodes
      nodePoints.forEach((np, idx) => {
        if (!reducedMotion) {
          np.angle += np.speed * 0.4 * delta;
          np.mesh.position.x = Math.cos(np.angle) * np.radius;
          np.mesh.position.y = Math.sin(np.angle) * np.radius * 0.75 + Math.sin(elapsed + idx) * 0.1;
          np.mesh.position.z = Math.sin(np.angle * 1.2) * (np.radius * 0.6);
        }
      });

      // Update Connection Lines based on current stage
      // If stage >= 2, draw lines between connected nodes
      let lineIndex = 0;
      const positions = lineGeo.attributes.position.array as Float32Array;

      const addLine = (idxA: number, idxB: number) => {
        if (lineIndex >= maxLines || !nodePoints[idxA] || !nodePoints[idxB]) return;
        const posA = nodePoints[idxA].mesh.position;
        const posB = nodePoints[idxB].mesh.position;

        const baseIdx = lineIndex * 6;
        positions[baseIdx + 0] = posA.x;
        positions[baseIdx + 1] = posA.y;
        positions[baseIdx + 2] = posA.z;
        positions[baseIdx + 3] = posB.x;
        positions[baseIdx + 4] = posB.y;
        positions[baseIdx + 5] = posB.z;
        lineIndex++;
      };

      if (currentStage >= 1) {
        // Connect Anomaly to Gateway
        addLine(0, 1);
      }
      if (currentStage >= 2) {
        // Connect Service Dependencies
        addLine(1, 2);
        addLine(2, 3);
        addLine(1, 3);
      }
      if (currentStage >= 3) {
        // Connect Evidence Anchors
        addLine(3, 4);
        addLine(2, 5);
        addLine(0, 6);
      }
      if (currentStage >= 4) {
        // Complete Closed Loop
        addLine(4, 5);
        addLine(5, 6);
      }

      // Zero out unused line segments
      for (let i = lineIndex * 6; i < maxLines * 6; i++) {
        positions[i] = 0;
      }
      lineGeo.attributes.position.needsUpdate = true;
      lineMat.opacity = currentStage >= 1 ? 0.55 : 0.15;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      disposables.forEach((d) => d.dispose());
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [webglSupported]);

  // If WebGL is not supported or failed to init, render pure SVG/CSS fallback
  if (webglSupported === false) {
    return <EvidenceVaultFallback stage={stage} className={className} />;
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}

