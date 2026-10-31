"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  Box,
  Eye,
  Sliders,
} from "lucide-react";
import { AegisButton } from "@/components/ui/aegis-button";
import { AegisBadge } from "@/components/ui/aegis-badge";
import { AegisSurface } from "@/components/ui/aegis-surface";
import { AegisSectionHeading } from "@/components/ui/aegis-section-heading";
import { AegisStatusIndicator } from "@/components/ui/aegis-status-indicator";

interface ColorSwatch {
  name: string;
  token: string;
  hex: string;
  role: string;
  category: "surface" | "accent" | "border" | "text";
}

const COLOR_SWATCHES: ColorSwatch[] = [
  // Surfaces
  { name: "Obsidian Base", token: "--aegis-bg", hex: "#07090F", role: "Viewport root foundation", category: "surface" },
  { name: "Elevated Backplane", token: "--aegis-bg-elevated", hex: "#0B0E17", role: "Sidebar & backplane", category: "surface" },
  { name: "Surface Panel", token: "--aegis-surface", hex: "#101522", role: "Containers & tables", category: "surface" },
  { name: "Surface Raised", token: "--aegis-surface-raised", hex: "#151B2A", role: "Cards & drawer trays", category: "surface" },
  { name: "Surface Hover", token: "--aegis-surface-hover", hex: "#1A2233", role: "Hover lift state", category: "surface" },

  // Borders
  { name: "Border Subtle", token: "--aegis-border-subtle", hex: "#1B2232", role: "Sub-dividers & rows", category: "border" },
  { name: "Border Standard", token: "--aegis-border", hex: "#252D40", role: "Standard card frames", category: "border" },
  { name: "Border Strong", token: "--aegis-border-strong", hex: "#36415B", role: "Elevated borders", category: "border" },
  { name: "Border Focus", token: "--aegis-border-focus", hex: "#9875FF", role: "Keyboard focus ring", category: "border" },

  // Typography
  { name: "Text Primary", token: "--aegis-text-primary", hex: "#F1F4FB", role: "Headings & KPIs", category: "text" },
  { name: "Text Secondary", token: "--aegis-text-secondary", hex: "#A3ADC2", role: "Body text & descriptions", category: "text" },
  { name: "Text Muted", token: "--aegis-text-muted", hex: "#727F98", role: "Timestamps & IDs", category: "text" },

  // Accents
  { name: "Tactile Violet", token: "--aegis-violet", hex: "#9875FF", role: "AI Reasoning & Hypotheses", category: "accent" },
  { name: "Violet Bright", token: "--aegis-violet-bright", hex: "#B29AFF", role: "Violet hover highlight", category: "accent" },
  { name: "Ice Cyan", token: "--aegis-cyan", hex: "#7ADCF5", role: "Verified Evidence & Traces", category: "accent" },
  { name: "Warning Amber", token: "--aegis-warning", hex: "#F2C66D", role: "Latency Skew & Anomalies", category: "accent" },
  { name: "Critical Rose", token: "--aegis-danger", hex: "#F27886", role: "Service Outages & Trips", category: "accent" },
  { name: "Resilient Emerald", token: "--aegis-success", hex: "#76D6A4", role: "Nominal Baseline & Health", category: "accent" },
];

export default function DesignSystemPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [testButtonLoading, setTestButtonLoading] = useState(false);
  const [testButtonDisabled, setTestButtonDisabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // Cupboard interactive demo state
  const [activeDrawer, setActiveDrawer] = useState<number | null>(2);

  const handleCopy = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-[#f1f4fb] p-6 lg:p-10 space-y-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#252d40]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/"
              className="text-xs font-mono text-[#727f98] hover:text-[#9875ff] transition-colors inline-flex items-center gap-1"
            >
              <Shield className="h-3.5 w-3.5" />
              AEGIS WORKSTATION
            </Link>
            <span className="text-[#727f98]">/</span>
            <span className="text-xs font-mono text-[#b29aff] font-semibold">
              DESIGN SYSTEM SPECIFICATION
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f1f4fb]">
            AEGIS Design System & UI Primitives
          </h1>
          <p className="text-sm text-[#a3adc2] mt-1">
            Obsidian Foundations, Tactile Forensics, and Hardware Cabinet Metaphors
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <AegisBadge variant="violet" dot pulse>
            PHASE 1 SPEC ACTIVE
          </AegisBadge>
          <AegisBadge variant="cyan" mono>
            WCAG 2.1 AAA
          </AegisBadge>
          <Link href="/">
            <AegisButton variant="secondary" size="sm" icon={<ArrowRight className="h-3 w-3" />} iconPosition="right">
              Return to Console
            </AegisButton>
          </Link>
        </div>
      </div>

      {/* SECTION 1: COLOR SYSTEM & PALETTE TOKENS */}
      <section className="space-y-6">
        <AegisSectionHeading
          eyebrow="Tokens // 01"
          eyebrowBadge={<AegisBadge variant="neutral" size="xs">16 Tokens</AegisBadge>}
          title="Obsidian Color Architecture"
          description="Disciplined obsidian surfaces with precise hairline borders and functional semantic accents. Click any token card to copy its value."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {COLOR_SWATCHES.map((swatch) => (
            <AegisSurface
              key={swatch.token}
              elevation="card"
              border="default"
              interactive
              onClick={() => handleCopy(swatch.hex, swatch.token)}
              className="p-4 space-y-3 relative group"
            >
              {/* Color Swatch Header */}
              <div className="flex items-center justify-between">
                <div
                  className="h-9 w-9 rounded border border-[#36415b] shadow-inner"
                  style={{ backgroundColor: swatch.hex }}
                />
                <button
                  type="button"
                  aria-label={`Copy ${swatch.hex}`}
                  className="opacity-60 group-hover:opacity-100 text-[#a3adc2] hover:text-white transition"
                >
                  {copiedToken === swatch.token ? (
                    <Check className="h-4 w-4 text-[#76d6a4]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Token Details */}
              <div>
                <div className="text-sm font-semibold text-[#f1f4fb]">{swatch.name}</div>
                <div className="text-xs font-mono text-[#b29aff]">{swatch.hex}</div>
                <div className="text-[11px] font-mono text-[#727f98] mt-0.5">{swatch.token}</div>
                <p className="text-[11px] text-[#a3adc2] mt-1.5 leading-snug">{swatch.role}</p>
              </div>
            </AegisSurface>
          ))}
        </div>
      </section>

      {/* SECTION 2: BUTTON PRIMITIVES */}
      <section className="space-y-6">
        <AegisSectionHeading
          eyebrow="Components // 02"
          eyebrowBadge={<AegisBadge variant="violet" size="xs">Interactive</AegisBadge>}
          title="AegisButton Primitives"
          description="Tactile, high-contrast buttons designed for critical investigation decisions with loading states and keyboard focus indicators."
          actions={
            <div className="flex items-center gap-2">
              <AegisButton
                variant="ghost"
                size="xs"
                onClick={() => setTestButtonLoading(!testButtonLoading)}
                icon={<RefreshCw className="h-3 w-3" />}
              >
                Toggle Loading
              </AegisButton>
              <AegisButton
                variant="ghost"
                size="xs"
                onClick={() => setTestButtonDisabled(!testButtonDisabled)}
                icon={<Sliders className="h-3 w-3" />}
              >
                Toggle Disabled
              </AegisButton>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variant Showcase */}
          <AegisSurface elevation="raised" border="default" className="p-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#727f98]">
              Button Variants (Size: Medium)
            </div>
            <div className="flex flex-wrap gap-3">
              <AegisButton
                variant="primary"
                loading={testButtonLoading}
                disabled={testButtonDisabled}
                onClick={() => setClickCount(c => c + 1)}
                icon={<Play className="h-3.5 w-3.5" />}
              >
                Primary ({clickCount})
              </AegisButton>

              <AegisButton
                variant="secondary"
                loading={testButtonLoading}
                disabled={testButtonDisabled}
                onClick={() => setClickCount(c => c + 1)}
                icon={<Terminal className="h-3.5 w-3.5" />}
              >
                Secondary
              </AegisButton>

              <AegisButton
                variant="subtle"
                loading={testButtonLoading}
                disabled={testButtonDisabled}
                onClick={() => setClickCount(c => c + 1)}
              >
                Subtle
              </AegisButton>

              <AegisButton
                variant="ghost"
                loading={testButtonLoading}
                disabled={testButtonDisabled}
                onClick={() => setClickCount(c => c + 1)}
              >
                Ghost
              </AegisButton>

              <AegisButton
                variant="danger"
                loading={testButtonLoading}
                disabled={testButtonDisabled}
                onClick={() => setClickCount(c => c + 1)}
                icon={<AlertTriangle className="h-3.5 w-3.5" />}
              >
                Critical Action
              </AegisButton>
            </div>
          </AegisSurface>

          {/* Size Scale Showcase */}
          <AegisSurface elevation="raised" border="default" className="p-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#727f98]">
              Size Hierarchy (XS to LG)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <AegisButton variant="secondary" size="xs">
                Size XS (10px)
              </AegisButton>
              <AegisButton variant="secondary" size="sm">
                Size SM (11px)
              </AegisButton>
              <AegisButton variant="secondary" size="md">
                Size MD (12px)
              </AegisButton>
              <AegisButton variant="primary" size="lg">
                Size LG (14px)
              </AegisButton>
            </div>
          </AegisSurface>
        </div>
      </section>

      {/* SECTION 3: BADGES & STATUS INDICATORS */}
      <section className="space-y-6">
        <AegisSectionHeading
          eyebrow="Components // 03"
          eyebrowBadge={<AegisBadge variant="cyan" size="xs">Telemetry</AegisBadge>}
          title="Badges & Status Beacons"
          description="High-precision telemetry tags, verified forensic evidence indicators, and health beacons."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Badge Variants */}
          <AegisSurface elevation="raised" border="default" className="p-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#727f98]">
              Badge Semantic Variants
            </div>
            <div className="flex flex-wrap gap-2.5">
              <AegisBadge variant="neutral">NEUTRAL_DEFAULT</AegisBadge>
              <AegisBadge variant="violet" dot>AI_INFERENCE</AegisBadge>
              <AegisBadge variant="cyan" dot pulse>VERIFIED_EVIDENCE</AegisBadge>
              <AegisBadge variant="warning" dot>CLOCK_SKEW_DETECTED</AegisBadge>
              <AegisBadge variant="danger" dot pulse>SERVICE_CRASH</AegisBadge>
              <AegisBadge variant="success" dot>INVARIANTS_HELD</AegisBadge>
            </div>

            <div className="pt-2 text-xs font-mono uppercase tracking-wider text-[#727f98]">
              Badge Sizes
            </div>
            <div className="flex items-center gap-2">
              <AegisBadge size="xs" variant="violet">XS (10px)</AegisBadge>
              <AegisBadge size="sm" variant="violet">SM (11px)</AegisBadge>
              <AegisBadge size="md" variant="violet">MD (12px)</AegisBadge>
            </div>
          </AegisSurface>

          {/* Status Indicator Beacons */}
          <AegisSurface elevation="raised" border="default" className="p-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#727f98]">
              Investigation Status Indicators
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AegisStatusIndicator status="healthy" pulse />
              <AegisStatusIndicator status="warning" />
              <AegisStatusIndicator status="degraded" />
              <AegisStatusIndicator status="critical" pulse />
              <AegisStatusIndicator status="investigating" pulse />
              <AegisStatusIndicator status="verified_evidence" />
              <AegisStatusIndicator status="hypothesis" />
              <AegisStatusIndicator status="unknown" />
            </div>
          </AegisSurface>
        </div>
      </section>

      {/* SECTION 4: SURFACE ELEVATIONS & DEPTH */}
      <section className="space-y-6">
        <AegisSectionHeading
          eyebrow="Architecture // 04"
          eyebrowBadge={<AegisBadge variant="neutral" size="xs">Spatial</AegisBadge>}
          title="Surface Elevations & Occlusion Depth"
          description="Tactile obsidian layering that establishes visual hierarchy without artificial illumination."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <AegisSurface elevation="base" border="subtle" className="p-4 text-center space-y-2">
            <span className="text-xs font-mono text-[#727f98]">ELEVATION: BASE</span>
            <div className="text-sm font-semibold text-[#f1f4fb]">#07090F</div>
            <p className="text-[11px] text-[#a3adc2]">Root void background canvas</p>
          </AegisSurface>

          <AegisSurface elevation="elevated" border="subtle" className="p-4 text-center space-y-2">
            <span className="text-xs font-mono text-[#727f98]">ELEVATION: ELEVATED</span>
            <div className="text-sm font-semibold text-[#f1f4fb]">#0B0E17</div>
            <p className="text-[11px] text-[#a3adc2]">Workstation backplanes & shells</p>
          </AegisSurface>

          <AegisSurface elevation="raised" border="default" className="p-4 text-center space-y-2">
            <span className="text-xs font-mono text-[#727f98]">ELEVATION: RAISED</span>
            <div className="text-sm font-semibold text-[#f1f4fb]">#101522</div>
            <p className="text-[11px] text-[#a3adc2]">Panels, viewports & tables</p>
          </AegisSurface>

          <AegisSurface elevation="card" border="strong" className="p-4 text-center space-y-2">
            <span className="text-xs font-mono text-[#727f98]">ELEVATION: CARD</span>
            <div className="text-sm font-semibold text-[#f1f4fb]">#151B2A</div>
            <p className="text-[11px] text-[#a3adc2]">Interactive cards with shadow</p>
          </AegisSurface>

          <AegisSurface elevation="glass" border="accent" className="p-4 text-center space-y-2">
            <span className="text-xs font-mono text-[#b29aff]">ELEVATION: GLASS</span>
            <div className="text-sm font-semibold text-[#f1f4fb]">Backdrop Blur</div>
            <p className="text-[11px] text-[#a3adc2]">Translucent inspection overlays</p>
          </AegisSurface>
        </div>
      </section>

      {/* SECTION 5: SIGNATURE INVESTIGATION CUPBOARD METAPHOR */}
      <section className="space-y-6">
        <AegisSectionHeading
          eyebrow="Metaphor // 05"
          eyebrowBadge={<AegisBadge variant="violet" size="xs">Physical Metaphor</AegisBadge>}
          title="The Investigation Cupboard"
          description="Interactive physical preview of the archival evidence cupboard. Drawers slide out on ball-bearing rails to reveal forensic findings."
        />

        <div className="bg-[#0b0e17] border border-[#252d40] rounded-xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1b2232]">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-[#9875ff]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-[#f1f4fb]">
                CABINET UNIT: FORENSIC-CHASSIS-01
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#727f98]">
              STATUS: SEALED EVIDENCE VAULT
            </span>
          </div>

          {/* Cupboard Drawers */}
          <div className="space-y-3">
            {[
              { id: 1, title: "DRAWER 01 // RAW TELEMETRY & CHRONO INGEST", count: "1,420 Spans", color: "cyan" as const, desc: "Immutable HTTP trace spans, DNS probe logs, and container metric feeds." },
              { id: 2, title: "DRAWER 02 // TOPOLOGY & CASCADE INTERCONNECTS", count: "8 Services", color: "violet" as const, desc: "Directed acyclic dependency graph, upstream choke points, and downstream failure paths." },
              { id: 3, title: "DRAWER 03 // EVIDENCE VAULT & SKEW CALIBRATION", count: "14 Correlated", color: "warning" as const, desc: "Clock-skew-corrected timestamps, verified evidentiary anchors, and factual anomalies." },
              { id: 4, title: "DRAWER 04 // HYPOTHESIS ARENA & COMPETING THEORIES", count: "3 Hypotheses", color: "violet" as const, desc: "Parallel explanation matrices, falsification tests, and agent confidence breakdown." },
            ].map((drawer) => {
              const isOpen = activeDrawer === drawer.id;

              return (
                <div
                  key={drawer.id}
                  onClick={() => setActiveDrawer(isOpen ? null : drawer.id)}
                  className={`rounded-lg border transition-all duration-300 ease-[cubic-bezier(0.16,1.0,0.3,1.0)] cursor-pointer overflow-hidden ${
                    isOpen
                      ? "bg-[#151b2a] border-[#9875ff]/50 shadow-[0_8px_30px_rgba(0,0,0,0.7)] translate-x-2"
                      : "bg-[#101522] border-[#252d40] hover:border-[#36415b] hover:bg-[#151b2a]/60"
                  }`}
                >
                  {/* Drawer Handle & Faceplate */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-1.5 rounded-full bg-[#727f98] group-hover:bg-[#9875ff]" />
                      <div>
                        <div className="text-xs font-mono font-semibold text-[#f1f4fb]">
                          {drawer.title}
                        </div>
                        <div className="text-[11px] text-[#727f98] font-sans">
                          {drawer.desc}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AegisBadge variant={drawer.color} size="xs" mono>
                        {drawer.count}
                      </AegisBadge>
                      <span className="text-xs font-mono text-[#727f98]">
                        {isOpen ? "[SLID OUT]" : "[RECESSED]"}
                      </span>
                    </div>
                  </div>

                  {/* Drawer Internal Tray (Revealed on click) */}
                  {isOpen && (
                    <div className="p-4 pt-0 border-t border-[#1b2232] bg-[#0b0e17]/60 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#a3adc2] pt-3">
                        <span>INSPECTION TRAY CONTENTS:</span>
                        <span className="text-[#76d6a4] flex items-center gap-1">
                          <Check className="h-3 w-3" /> VERIFIED SIGNATURE
                        </span>
                      </div>
                      <div className="p-3 rounded bg-[#07090f] border border-[#1b2232] text-xs font-mono text-[#7adcf5]">
                        {"// FORENSIC ARTIFACT #"}
                        {drawer.id}042 {"->"} READY FOR AGENTIC CORRELATION
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="pt-8 border-t border-[#252d40] flex flex-col sm:flex-row items-center justify-between text-xs text-[#727f98] font-mono gap-4">
        <div>AEGIS FORENSIC DESIGN SYSTEM // v1.0.0</div>
        <div className="flex items-center gap-4">
          <Link href="/reports" className="hover:text-[#9875ff] transition">
            Investigation Reports
          </Link>
          <Link href="/topology" className="hover:text-[#9875ff] transition">
            Topology Explorer
          </Link>
          <Link href="/hypotheses" className="hover:text-[#9875ff] transition">
            Hypothesis Arena
          </Link>
        </div>
      </div>
    </div>
  );
}

