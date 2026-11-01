"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldAlert, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { PRIMARY_DEMO_INCIDENT } from "@/lib/demo-data";

interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewInvestigationModal({ isOpen, onClose }: NewInvestigationModalProps) {
  const router = useRouter();
  const [selectedIncident, setSelectedIncident] = useState<string>("INC-001");
  const [investigationTitle, setInvestigationTitle] = useState<string>(
    "Cascade Triage: Appointment Processing Degradation"
  );
  const [investigationMode, setInvestigationMode] = useState<string>("deterministic_normalization");
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // Honest UI response: redirect after brief confirmation
    setTimeout(() => {
      onClose();
      router.push(`/investigations/INV-001`);
    }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#0c101a] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-semibold text-white">
                Initialize Incident Investigation
              </h2>
              <p className="text-[11px] text-white/60">
                Select an active infrastructure incident to initialize a workspace.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-white/60 hover:text-white/90 hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              Investigation Workspace Initialized
            </h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
              Navigating to demonstration workspace <span className="font-mono text-white">INV-001</span>.
              Full multi-agent orchestration will connect in Phase 4.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Target Incident Selection */}
            <div className="space-y-1.5">
              <label htmlFor="incident-select" className="block text-white/80 font-medium font-mono text-[11px]">
                Target Incident
              </label>
              <select
                id="incident-select"
                value={selectedIncident}
                onChange={(e) => setSelectedIncident(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 font-mono text-xs"
              >
                <option value="INC-001">
                  INC-001 — Appointment Processing Degradation (CivicHealth)
                </option>
              </select>
              <p className="text-[10px] text-white/50">
                Currently scoped to the active demonstration incident dataset.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="inv-title" className="block text-white/80 font-medium font-mono text-[11px]">
                Investigation Workspace Title
              </label>
              <input
                id="inv-title"
                type="text"
                value={investigationTitle}
                onChange={(e) => setInvestigationTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 text-xs"
              />
            </div>

            {/* Mode Selection */}
            <div className="space-y-1.5">
              <label htmlFor="inv-mode" className="block text-white/80 font-medium font-mono text-[11px]">
                Initial Pipeline Stage
              </label>
              <select
                id="inv-mode"
                value={investigationMode}
                onChange={(e) => setInvestigationMode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white/90 focus:outline-none focus:border-white/50 font-mono text-xs"
              >
                <option value="deterministic_normalization">
                  Phase 2/3: Deterministic Evidence Normalization &amp; Clock Skew Alignment
                </option>
                <option value="agent_orchestration" disabled>
                  Phase 4: Multi-Agent AI Investigation (Upcoming)
                </option>
              </select>
            </div>

            {/* Notice Callout */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-[11px] text-white/60 space-y-1">
              <div className="flex items-center gap-1.5 text-white/80 font-medium">
                <AlertCircle className="h-3.5 w-3.5 text-white shrink-0" />
                <span>Phase 3 Execution Notice</span>
              </div>
              <p className="leading-relaxed">
                Submitting opens the demonstration investigation workspace. Autonomous agent execution is not yet connected and is scheduled for Phase 4.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-white/20/80 text-white/80 hover:bg-slate-800 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white hover:bg-slate-200 text-black font-semibold font-medium transition shadow-sm shadow-white/5"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

