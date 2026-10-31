"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Hyperboloid Parametric Coordinate Calculation matching the video reference
function getWormholeCoord(s: number, baseAngle: number, direction: 1 | -1, radialJitter: number = 0) {
  // s is in [0, 1] from top (1.0) to bottom (0.0)
  const v = (s - 0.5) * 2; // -1 at bottom, +1 at top

  const waistRadius = 2.4;
  const heightTop = 8.8;
  const heightBottom = 7.8;

  let r = 0;
  let y = 0;

  if (v >= 0) {
    // Upper bell mouth flaring upward and outward
    const nv = v; // 0 to 1
    r = waistRadius * Math.sqrt(1 + Math.pow(nv * 2.7, 2));
    y = nv * heightTop;
  } else {
    // Lower bell mouth spreading into a wide horizontal disc
    const nv = -v; // 0 to 1
    const baseR = waistRadius * Math.sqrt(1 + Math.pow(nv * 2.1, 2));
    // Flare out smoothly into the broad accretion disk
    const diskFlare = Math.pow(nv, 1.85) * 8.8;
    r = baseR + diskFlare;
    // Flatten y towards the bottom
    y = -Math.pow(nv, 0.78) * heightBottom;
  }

  // Add subtle radial volume jitter
  r = Math.max(0.1, r + radialJitter);

  // Smooth spiral twist angle
  const twist = direction * v * 1.55;
  const angle = baseAngle + twist;

  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);

  return { x, y, z, v };
}

// Generate a smooth radial Gaussian glow sprite texture for soft blurred particles
function createSoftParticleTexture(): THREE.Texture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.85)");
  gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.25)");
  gradient.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface WormholeSceneProps {
  particleCount?: number;
}

function WormholeScene({ particleCount = 16000 }: WormholeSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate soft blurred circular particle texture on client
  const softTexture = useMemo(() => createSoftParticleTexture(), []);

  // 1. Generate Flowing Particle System state
  const { particleData, positions, colors } = useMemo(() => {
    const pData: {
      s: number;
      baseAngle: number;
      direction: 1 | -1;
      speed: number;
      jitter: number;
    }[] = [];

    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);

    const numStreams = 96;

    for (let i = 0; i < particleCount; i++) {
      const streamIdx = i % numStreams;
      const baseAngle = (streamIdx / numStreams) * Math.PI * 2;
      const direction: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const s = Math.random(); // random progress along streamline
      const speed = 0.045 + Math.random() * 0.075; // flow velocity
      const jitter = (Math.random() - 0.5) * 0.22;

      pData.push({ s, baseAngle, direction, speed, jitter });

      const pt = getWormholeCoord(s, baseAngle, direction, jitter);
      const i3 = i * 3;
      pos[i3] = pt.x;
      pos[i3 + 1] = pt.y;
      pos[i3 + 2] = pt.z;

      // Brightness: waist is intense bright white, edges soft silver
      const isWaist = Math.abs(pt.v) < 0.25;
      const shade = isWaist ? 1.0 : 0.75 + Math.random() * 0.25;
      cols[i3] = shade;
      cols[i3 + 1] = shade;
      cols[i3 + 2] = shade;
    }

    return { particleData: pData, positions: pos, colors: cols };
  }, [particleCount]);

  // 2. Generate Soft Blurred Streamline Guide Filaments (Vertical only, no harsh rings)
  const linePositions = useMemo(() => {
    const coords: number[] = [];
    const numRibs = 48;
    const stepsPerRib = 72;

    // A) Clockwise Twisted Guide Streamlines
    for (let r = 0; r < numRibs; r++) {
      const baseAngle = (r / numRibs) * Math.PI * 2;
      for (let step = 0; step < stepsPerRib - 1; step++) {
        const s1 = step / (stepsPerRib - 1);
        const s2 = (step + 1) / (stepsPerRib - 1);
        const p1 = getWormholeCoord(s1, baseAngle, 1, 0);
        const p2 = getWormholeCoord(s2, baseAngle, 1, 0);
        coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    // B) Counter-Clockwise Twisted Guide Streamlines
    for (let r = 0; r < numRibs; r++) {
      const baseAngle = (r / numRibs) * Math.PI * 2;
      for (let step = 0; step < stepsPerRib - 1; step++) {
        const s1 = step / (stepsPerRib - 1);
        const s2 = (step + 1) / (stepsPerRib - 1);
        const p1 = getWormholeCoord(s1, baseAngle, -1, 0);
        const p2 = getWormholeCoord(s2, baseAngle, -1, 0);
        coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    return new Float32Array(coords);
  }, []);

  // Animation Loop: Real-time particle transit along streamlines + group rotation
  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current || !groupRef.current) return;

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // 1. Slow, continuous global rotation around Y axis
    groupRef.current.rotation.y = time * 0.04;

    // Subtle pointer parallax tilt
    groupRef.current.rotation.x = -pointer.y * 0.045;
    groupRef.current.rotation.z = pointer.x * 0.03;

    // 2. Advance particles along their streamlines (flow motion like in the video)
    const positionAttr = pointsRef.current.geometry.attributes.position;
    const posArr = positionAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const p = particleData[i];

      // Move particle continuously down along the streamline
      p.s -= p.speed * delta;
      if (p.s < 0) {
        p.s += 1.0;
      }

      // Recompute 3D coordinates along the hyperboloid path
      const pt = getWormholeCoord(p.s, p.baseAngle, p.direction, p.jitter);
      const i3 = i * 3;
      posArr[i3] = pt.x;
      posArr[i3 + 1] = pt.y;
      posArr[i3 + 2] = pt.z;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* 1. Soft, Blurred Ethereal Guide Filaments (ultra-subtle opacity, no harsh grid) */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.045}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Streaming Glowing Soft-Blurred Light Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          map={softTexture || undefined}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function WormholeBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="fixed inset-0 pointer-events-none bg-black"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none w-screen h-screen overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        backgroundColor: "#000000",
      }}
      aria-hidden="true"
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        {/* Pure Solid Black Background */}
        <color attach="background" args={["#000000"]} />

        {/* Depth Fog: distant parts fade into black */}
        <fog attach="fog" args={["#000000", 12, 38]} />

        {/* Perspective Camera positioned to capture the centered waist and sweeping base disc */}
        <PerspectiveCamera
          makeDefault
          position={[0, -0.4, 17.5]}
          fov={50}
          near={0.1}
          far={100}
        />

        {/* 3D Streamline Hyperboloid Wormhole Structure */}
        <WormholeScene particleCount={16000} />

        {/* Wide Soft-Glow Bloom (Blurred Luminous Halos) */}
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.06}
            luminanceSmoothing={0.9}
            intensity={2.1}
            radius={0.88}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default WormholeBackground;
