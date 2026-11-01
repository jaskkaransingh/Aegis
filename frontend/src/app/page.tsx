"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ChevronDown,
  GitBranch,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  Layers,
  Terminal,
  Shield,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { LandingNav } from "@/components/landing/landing-nav";
import { AegisBadge } from "@/components/ui/aegis-badge";
import { AegisSurface } from "@/components/ui/aegis-surface";
import { useAuth } from "@/lib/auth-context";
import { LandingAuthGate } from "@/components/auth/landing-auth-gate";

import {
  PostgresLogo,
  FastApiLogo,
  KubernetesLogo,
  DockerLogo,
  OpenTelemetryLogo,
  KafkaLogo,
  GrafanaLogo,
} from "@/components/ui/tech-logos";

// Dynamically import 3D Wormhole to ensure 100% client-side SSR safety
const WormholeBackground = dynamic(
  () => import("@/components/landing/wormhole-background"),
  { ssr: false }
);

export default function LandingPage() {
  const { isAdmin } = useAuth();
  const [activeStage, setActiveStage] = useState<number>(0);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.18) {
      setActiveStage(0);
    } else if (latest < 0.38) {
      setActiveStage(1);
    } else if (latest < 0.58) {
      setActiveStage(2);
    } else if (latest < 0.78) {
      setActiveStage(3);
    } else {
      setActiveStage(4);
    }
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // If user is not logged in: Show landing page background ONLY (no landing page text) + clean Login Gate
  if (!isAdmin) {
    return (
      <div className="relative min-h-screen text-[#f1f4fb] selection:bg-white/20 selection:text-white overflow-hidden bg-black font-sans">
        {/* Full-Screen 3D Hyperboloid Wormhole Background ONLY */}
        <WormholeBackground />

        {/* Minimal Clean Top Brand */}
        <header className="fixed top-0 left-0 right-0 z-30 h-20 px-6 lg:px-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-white/5 border border-white/15 flex items-center justify-center text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-white">
              AEGIS
            </span>
          </div>
        </header>

        {/* Central Auth Gate with increased font size and no green AI accents */}
        <LandingAuthGate />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-[#f1f4fb] selection:bg-white/20 selection:text-white overflow-x-hidden bg-black font-sans">
      {/* =========================================================================
          FULL-SCREEN 3D HYPERBOLOID WORMHOLE BACKGROUND
          ========================================================================= */}
      <WormholeBackground />

      {/* Top Minimal Navigation */}
      <LandingNav />

      {/* =========================================================================
          HERO SECTION: CENTERED EDITORIAL COMPOSITION
          ========================================================================= */}
      <section
        id="hero"
        className="relative z-10 min-h-screen flex flex-col justify-between items-center px-6 lg:px-12 pt-28 pb-10"
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center max-w-4xl mx-auto my-auto space-y-7">
          {/* Main Headline (Centered) */}
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08]"
          >
            The incident investigation
            <br />
            system for autonomous agents
          </motion.h1>

          {/* Subtitle (Centered, 2 short lines) */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed font-normal"
          >
            Coordinate evidence across every system, trigger, and service.
            <br className="hidden sm:inline" />
            Forensic context keeps every incident explained and in control.
          </motion.p>

          {/* Centered Pill Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            {/* Left Button: Dark Pill with border */}
            <Link
              href="/command-center"
              className="px-6 py-2.5 rounded-full text-xs font-mono font-medium text-white/90 border border-white/20 bg-black/40 hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-2 group backdrop-blur-sm"
            >
              <span>GET STARTED</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Right Button: Crisp Solid White Pill */}
            <button
              type="button"
              onClick={() => scrollToSection("detect")}
              className="px-6 py-2.5 rounded-full text-xs font-mono font-medium text-black bg-white hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center gap-1.5"
            >
              <span>EXPLORE EVIDENCE</span>
            </button>
          </motion.div>
        </div>

        {/* Bottom Integration / Architecture Strip with Real SVG Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="w-full max-w-5xl mx-auto pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-white/60 select-none"
        >
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <PostgresLogo className="w-4 h-4 text-white/80" />
            <span>PostgreSQL</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <FastApiLogo className="w-4 h-4 text-white/80" />
            <span>FastAPI</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <KubernetesLogo className="w-4 h-4 text-white/80" />
            <span>Kubernetes</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <DockerLogo className="w-4 h-4 text-white/80" />
            <span>Docker</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <OpenTelemetryLogo className="w-4 h-4 text-white/80" />
            <span>OpenTelemetry</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <KafkaLogo className="w-4 h-4 text-white/80" />
            <span>Kafka</span>
          </div>
          <div className="flex items-center gap-2 hover:text-white transition-colors">
            <GrafanaLogo className="w-4 h-4 text-white/80" />
            <span>Grafana</span>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          SCENE A — 01 / DETECT: Anomalies emerge
          ========================================================================= */}
      <section
        id="detect"
        className="relative z-10 min-h-[80vh] flex items-center px-6 lg:px-16 py-20 border-t border-white/10 backdrop-blur-[2px] bg-black/40"
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-[#f2c66d] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#f2c66d] animate-ping" />
              01 // DETECT
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Anomalies emerge.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed max-w-lg">
              A single anomalous signal appears across distributed services: latency spikes +420ms on authentication tokens with uncalibrated timestamps.
            </p>

            <div className="pt-2">
              <AegisBadge variant="warning" dot size="sm">
                SIGNAL: SKEW_DETECTED +420ms
              </AegisBadge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <AegisSurface elevation="card" border="default" className="p-6 space-y-4 shadow-2xl bg-black/60 border-white/15">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-[#f2c66d] flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  RAW INGESTION EVENT // EV-1042
                </span>
                <span className="text-[10px] font-mono text-white/50">T+00:00.000</span>
              </div>

              <div className="p-3.5 rounded bg-black/80 border border-white/10 font-mono text-xs text-white/80 space-y-1">
                <div><span className="text-white/40">endpoint:</span> "POST /api/v1/auth/tokens"</div>
                <div><span className="text-white/40">status:</span> <span className="text-[#f27886]">504 GATEWAY_TIMEOUT</span></div>
                <div><span className="text-white/40">latency:</span> <span className="text-[#f2c66d]">4,210ms</span> (nominal: 42ms)</div>
                <div><span className="text-white/40">source:</span> "civic-api-gateway"</div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
                <span>CORRELATION ENGINE: ACTIVE</span>
                <span className="text-[#76d6a4]">PROVENANCE VERIFIED</span>
              </div>
            </AegisSurface>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SCENE B — 02 / CONNECT: Evidence reveals relationships
          ========================================================================= */}
      <section
        id="connect"
        className="relative z-10 min-h-[80vh] flex items-center px-6 lg:px-16 py-20 border-t border-white/10 backdrop-blur-[2px] bg-black/40"
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/90 flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5" />
              02 // CONNECT
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Evidence reveals relationships.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed max-w-lg">
              The topology reveals dependencies: the edge gateway did not fail independently. It was waiting on blocked downstream database locks.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <AegisBadge variant="neutral" dot size="sm">
                TOPOLOGY: 3 TIERS LINKED
              </AegisBadge>
              <AegisBadge variant="neutral" size="sm">
                CLOCK DRIFT CORRECTION APPLIED
              </AegisBadge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <AegisSurface elevation="card" border="default" className="p-6 space-y-4 bg-black/60 border-white/15">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono text-white/80">
                  TOPOLOGY CASCADE TRACE
                </span>
                <span className="text-[10px] font-mono text-[#22c55e]">0.00ms CLOCK DRIFT</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded bg-black/70 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                    <span className="text-white">api-gateway</span>
                  </div>
                  <span className="text-[#ef4444] text-[11px]">Cascading 504</span>
                </div>

                <div className="flex justify-center text-white/40">
                  ↓ <span className="text-[10px] px-2">PROPAGATION (120ms)</span> ↓
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-black/70 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-white">auth-service</span>
                  </div>
                  <span className="text-[#f59e0b] text-[11px]">Worker Starvation</span>
                </div>

                <div className="flex justify-center text-white/40">
                  ↓ <span className="text-[10px] px-2">PROPAGATION (4ms)</span> ↓
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-red-950/20 border border-red-500/40">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                    <span className="text-[#ef4444] font-semibold">postgres-patient-db</span>
                  </div>
                  <span className="text-[#ef4444] text-[11px]">Row Lock Contention</span>
                </div>
              </div>
            </AegisSurface>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SCENE C — 03 / INVESTIGATE: Compare explanations against evidence
          ========================================================================= */}
      <section
        id="investigate"
        className="relative z-10 min-h-[80vh] flex items-center px-6 lg:px-16 py-20 border-t border-white/10 backdrop-blur-[2px] bg-black/40"
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-white/90 flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" />
              03 // INVESTIGATE
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Compare explanations against evidence.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed max-w-lg">
              Autonomous agents formulate competing hypotheses and evaluate each one against immutable spans. No unsupported conclusions.
            </p>

            <div className="pt-2">
              <AegisBadge variant="neutral" dot size="sm">
                HYPOTHESIS ARENA: 2 THEORIES EVALUATED
              </AegisBadge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-3"
          >
            <AegisSurface elevation="card" border="accent" className="p-4 space-y-2 bg-black/70 border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white">
                  THEORY A: DB Connection Pool Exhaustion
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white font-bold border border-white/20">
                  86% CONFIDENCE
                </span>
              </div>
              <p className="text-xs text-white/70">
                Supported by 4 immutable database spans: worker threads held by unindexed schema migration lock.
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#22c55e] pt-1">
                <span>✓ 4 Supporting Records</span>
                <span>✗ 0 Contradictions</span>
              </div>
            </AegisSurface>

            <AegisSurface elevation="card" border="subtle" className="p-4 space-y-2 opacity-60 bg-black/70 border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white/60">
                  THEORY B: Upstream Network Partition
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/60">
                  14% CONFIDENCE
                </span>
              </div>
              <p className="text-xs text-white/50">
                Contradicted: TCP probe telemetry confirms uninterrupted SYN-ACK responses throughout outage window.
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#f27886] pt-1">
                <span>✗ 1 Direct Contradiction</span>
              </div>
            </AegisSurface>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SCENE D — 04 / EXPLAIN: Know what the evidence supports
          ========================================================================= */}
      <section
        id="explain"
        className="relative z-10 min-h-[80vh] flex items-center px-6 lg:px-16 py-20 border-t border-white/10 backdrop-blur-[2px] bg-black/40"
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-[#76d6a4] flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              04 // EXPLAIN
            </div>

            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Know what the evidence supports.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed max-w-lg">
              AEGIS generates an evidence-grounded incident briefing: distinguishing verified facts from reasoned inferences and unresolved questions.
            </p>

            <div className="pt-2">
              <AegisBadge variant="success" dot size="sm">
                FORENSIC REPORT READY
              </AegisBadge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <AegisSurface elevation="card" border="default" className="p-6 space-y-4 bg-black/60 border-white/15">
              <div className="text-xs font-mono uppercase tracking-wider text-white/50 pb-2 border-b border-white/10">
                EPISTEMIC SEPARATION OF FINDINGS
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#76d6a4] tracking-wider block mb-1">
                    [OBSERVED FACT]
                  </span>
                  <p className="text-white/90">
                    Postgres row lock duration exceeded 4,200ms at 14:22:04 UTC across 20 active connections.
                  </p>
                </div>

                <div className="p-3 rounded bg-white/[0.03] border border-white/15">
                  <span className="font-mono text-[10px] uppercase font-bold text-white tracking-wider block mb-1">
                    [SUPPORTED INFERENCE]
                  </span>
                  <p className="text-white/90">
                    Exhaustion of connection pool starved auth workers, cascading timeout errors to the public API gateway.
                  </p>
                </div>

                <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#f2c66d] tracking-wider block mb-1">
                    [UNRESOLVED QUESTION]
                  </span>
                  <p className="text-white/90">
                    Why did client retry backoff exceed the configured 500ms jitter boundary during restart?
                  </p>
                </div>
              </div>
            </AegisSurface>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SCENE E — 05 / ENTER THE WORKSTATION: Ready to investigate?
          ========================================================================= */}
      <section
        id="workstation"
        className="relative z-10 py-28 px-6 lg:px-16 border-t border-white/10 text-center backdrop-blur-[2px] bg-black/50"
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-3xl sm:text-5xl font-normal tracking-tight text-white">
              Ready to investigate?
            </h2>

            <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
              Launch the AEGIS workstation to triage live incidents, inspect service topologies,
              and compare competing hypotheses.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/command-center"
                className="px-8 py-3 rounded-full text-xs font-mono font-medium text-black bg-white hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.4)] transition-all flex items-center gap-2"
              >
                <span>OPEN AEGIS</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 lg:px-16 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/40 gap-4 bg-black">
        <div>
          AEGIS // AUTONOMOUS EVIDENCE-GROUNDED INVESTIGATION SYSTEM
        </div>
        <div className="flex items-center gap-6">
          <Link href="/command-center" className="hover:text-white transition">
            Workstation
          </Link>
          <Link href="/evidence" className="hover:text-white transition">
            Evidence Vault
          </Link>
          <Link href="/design-system" className="hover:text-white transition">
            Design Tokens
          </Link>
        </div>
      </footer>
    </div>
  );
}
