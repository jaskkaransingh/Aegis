"use client";

import React from "react";

interface EvidenceVaultFallbackProps {
  stage?: number; // 0: hero, 1: detect, 2: connect, 3: investigate, 4: explain
  className?: string;
}

export function EvidenceVaultFallback({
  stage = 0,
  className = "",
}: EvidenceVaultFallbackProps) {
  // Color determination based on narrative stage
  const getCoreAccent = () => {
    switch (stage) {
      case 1:
        return "#f59e0b"; // Warning Amber for Detect
      case 2:
        return "#ffffff"; // Platinum for Connect
      case 3:
        return "#ef4444"; // Telemetric Red for Incident Investigate
      case 4:
        return "#22c55e"; // Operational Green for Explain
      case 0:
      default:
        return "#ffffff"; // Platinum Base
    }
  };

  const accent = getCoreAccent();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      aria-label="3D Evidence Core Visualization"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-[460px] max-h-[460px] overflow-visible"
      >
        <defs>
          <radialGradient id="vault-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor="#07090f" stopOpacity="0" />
          </radialGradient>
          <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient radial glow */}
        <circle cx="200" cy="200" r="160" fill="url(#vault-core-glow)" />

        {/* Outer Orbital Ring 1 */}
        <ellipse
          cx="200"
          cy="200"
          rx="170"
          ry="70"
          fill="none"
          stroke="#252d40"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          transform="rotate(-25 200 200)"
          className="transition-all duration-700 ease-out"
        />

        {/* Outer Orbital Ring 2 */}
        <ellipse
          cx="200"
          cy="200"
          rx="155"
          ry="65"
          fill="none"
          stroke="#36415b"
          strokeWidth="1"
          strokeDasharray="8 4"
          transform="rotate(35 200 200)"
          className="transition-all duration-700 ease-out"
        />

        {/* Geometric Polyhedral Core Structure */}
        <g className="transition-transform duration-700 ease-out" transform="translate(200, 200)">
          {/* Inner Facets */}
          <polygon
            points="0,-80 70,-35 70,45 0,90 -70,45 -70,-35"
            fill="#0b0e17"
            stroke="#252d40"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Internal Wireframe Geometry */}
          <line x1="0" y1="-80" x2="0" y2="90" stroke="#36415b" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="-70" y1="-35" x2="70" y2="45" stroke="#36415b" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="-70" y1="45" x2="70" y2="-35" stroke="#36415b" strokeWidth="1" strokeDasharray="2 3" />

          {/* Central Nested Polyhedron */}
          <polygon
            points="0,-45 40,-20 40,25 0,50 -40,25 -40,-20"
            fill="#101522"
            stroke={accent}
            strokeWidth="1.5"
            className="transition-all duration-500"
            filter="url(#subtle-glow)"
          />

          {/* Central Core Signal Beacon */}
          <circle cx="0" cy="0" r="14" fill="#151b2a" stroke={accent} strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill={accent} className="animate-pulse" />
        </g>

        {/* Orbiting Evidence Nodes & Connection Vectors */}
        {/* Node 1: Latency / Anomaly (Top Right) */}
        <g transform="translate(310, 140)">
          {stage >= 1 && (
            <line x1="-110" y1="60" x2="0" y2="0" stroke="#f2c66d" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
          )}
          <circle
            cx="0"
            cy="0"
            r={stage >= 1 ? "7" : "5"}
            fill={stage >= 1 ? "#f2c66d" : "#727f98"}
            className={stage >= 1 ? "animate-pulse" : ""}
          />
        </g>

        {/* Node 2: Service Dependency (Bottom Left - Platinum) */}
        <g transform="translate(100, 270)">
          {stage >= 2 && (
            <line x1="100" y1="-70" x2="0" y2="0" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
          )}
          <circle
            cx="0"
            cy="0"
            r={stage >= 2 ? "6" : "4"}
            fill={stage >= 2 ? "#ffffff" : "#36415b"}
          />
        </g>

        {/* Node 3: Database / Spans (Top Left - Enterprise Red for Root Cause) */}
        <g transform="translate(120, 110)">
          {stage >= 2 && (
            <line x1="80" y1="90" x2="0" y2="0" stroke="#ef4444" strokeWidth="1" opacity="0.6" />
          )}
          <circle
            cx="0"
            cy="0"
            r={stage >= 2 ? "6" : "4"}
            fill={stage >= 2 ? "#ef4444" : "#36415b"}
          />
        </g>

        {/* Node 4: Hypothesis Arena (Bottom Right - Enterprise Green for Verified Truth) */}
        <g transform="translate(290, 280)">
          {stage >= 3 && (
            <line x1="-90" y1="-80" x2="0" y2="0" stroke="#22c55e" strokeWidth="1.2" opacity="0.8" />
          )}
          <circle
            cx="0"
            cy="0"
            r={stage >= 3 ? "7" : "4"}
            fill={stage >= 3 ? "#22c55e" : "#36415b"}
            className={stage >= 3 ? "animate-pulse" : ""}
          />
        </g>
      </svg>
    </div>
  );
}

