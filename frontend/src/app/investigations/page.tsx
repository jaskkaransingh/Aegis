"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import { DEMO_INVESTIGATIONS, DemoInvestigation } from "@/lib/demo-data";
import { NewInvestigationModal } from "@/components/dashboard/new-investigation-modal";
import { AegisButton } from "@/components/ui/aegis-button";
import { AegisBadge } from "@/components/ui/aegis-badge";
import { AegisSurface } from "@/components/ui/aegis-surface";

export default function InvestigationsDirectoryPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = DEMO_INVESTIGATIONS.filter((inv) => {
    const matchesQuery =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.scope.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Investigation Workspaces
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/15">
              {DEMO_INVESTIGATIONS.length} Active
            </span>
          </div>
          <p className="text-xs text-white/60 mt-1 font-sans">
            Forensic investigation repositories, evidence progression graphs, and causal verdicts.
          </p>
        </div>

        <AegisButton
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          icon={<Plus className="h-3.5 w-3.5" />}
        >
          New Investigation
        </AegisButton>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-[#07090f]/90 backdrop-blur-md">
        <div className="relative w-full sm:w-96">
          <Search className="h-3.5 w-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, or service scope..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 text-xs font-mono"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center text-xs font-mono">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full border transition ${
              statusFilter === "ALL"
                ? "bg-white text-black border-white font-medium"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            All ({DEMO_INVESTIGATIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ANALYZING_EVIDENCE")}
            className={`px-3 py-1 rounded-full border transition ${
              statusFilter === "ANALYZING_EVIDENCE"
                ? "bg-white text-black border-white font-medium"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Active Triage
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("SKEW_RESOLVED")}
            className={`px-3 py-1 rounded-full border transition ${
              statusFilter === "SKEW_RESOLVED"
                ? "bg-white text-black border-white font-medium"
                : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            Skew Resolved
          </button>
        </div>
      </div>

      {/* Visual Workspace Cards Grid (Replacing the dense table) */}
      {filtered.length === 0 ? (
        <AegisSurface elevation="card" border="default" className="p-12 text-center space-y-3 bg-[#0b0e17]/80">
          <FolderOpen className="h-8 w-8 text-white/30 mx-auto" />
          <div className="text-sm font-semibold text-white">No Investigations Found</div>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            No active investigation workspaces match the query "{searchQuery}".
          </p>
          <AegisButton variant="ghost" size="xs" onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }}>
            Clear Filters
          </AegisButton>
        </AegisSurface>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inv) => {
            const isSev1 = inv.severity === "SEV-1";

            return (
              <AegisSurface
                key={inv.id}
                elevation="card"
                border="default"
                interactive
                className="p-5 space-y-4 bg-[#0b0e17]/90 border-white/10 flex flex-col justify-between group hover:border-white/30 hover:shadow-2xl transition-all"
              >
                {/* Card Top: ID & Severity */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      {inv.id}
                    </span>
                    <AegisBadge
                      variant={isSev1 ? "danger" : "warning"}
                      size="xs"
                      dot
                      pulse={isSev1}
                    >
                      {inv.severity}
                    </AegisBadge>
                  </div>

                  {/* Incident Title */}
                  <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors leading-snug">
                    {inv.incidentTitle}
                  </h3>

                  {/* Scope / Affected Services preview */}
                  <p className="text-xs text-white/60 line-clamp-2 leading-relaxed font-sans">
                    Scope: {inv.scope}
                  </p>
                </div>

                {/* Card Bottom: State Pill & Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-white/50 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {inv.lastUpdated}
                  </span>

                  <Link
                    href={`/investigations/${inv.id}`}
                    className="inline-flex items-center gap-1 text-white/80 hover:text-white font-medium group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Enter Workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </AegisSurface>
            );
          })}
        </div>
      )}

      {/* New Investigation Modal */}
      <NewInvestigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
