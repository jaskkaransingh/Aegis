"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, Filter, ArrowLeft, ShieldAlert } from "lucide-react";
import { DEMO_INVESTIGATIONS, DemoInvestigation } from "@/lib/demo-data";
import { RecentInvestigationsTable } from "@/components/dashboard/recent-investigations-table";
import { NewInvestigationModal } from "@/components/dashboard/new-investigation-modal";

export default function InvestigationsDirectoryPage() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = DEMO_INVESTIGATIONS.filter((inv) => {
    const matchesQuery =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.incidentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || inv.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 transition flex items-center gap-1 font-mono"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Command Center</span>
            </Link>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 font-mono mt-1.5">
            Investigations Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage evidence-grounded investigation workspaces and audit trails.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition shadow-sm shadow-violet-950/60 self-start sm:self-center"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, incident, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Filter className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-[11px] font-mono text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 text-xs font-mono"
          >
            <option value="ALL">All States ({DEMO_INVESTIGATIONS.length})</option>
            <option value="ANALYZING_EVIDENCE">Analyzing Evidence</option>
            <option value="SKEW_RESOLVED">Skew Resolved</option>
            <option value="REFUTED_SYMPTOM">Refuted Symptom</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <RecentInvestigationsTable
        investigations={filtered}
        showHeaderLink={false}
      />

      {/* Modal */}
      <NewInvestigationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

