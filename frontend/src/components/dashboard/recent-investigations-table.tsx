import React from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck, Clock } from "lucide-react";
import { DEMO_INVESTIGATIONS, DemoInvestigation } from "@/lib/demo-data";
import { StatusBadge, BadgeVariant } from "@/components/ui/status-badge";

interface RecentInvestigationsTableProps {
  investigations?: DemoInvestigation[];
  showHeaderLink?: boolean;
}

export function RecentInvestigationsTable({
  investigations = DEMO_INVESTIGATIONS,
  showHeaderLink = true,
}: RecentInvestigationsTableProps) {
  function getStatusVariant(status: string): BadgeVariant {
    switch (status) {
      case "ANALYZING_EVIDENCE":
        return "violet";
      case "HYPOTHESIS_EVALUATION":
        return "info";
      case "SKEW_RESOLVED":
        return "success";
      case "REFUTED_SYMPTOM":
        return "neutral";
      case "COMPLETED":
        return "success";
      default:
        return "neutral";
    }
  }

  function getSeverityVariant(sev: string): BadgeVariant {
    switch (sev) {
      case "SEV-1":
        return "critical";
      case "SEV-2":
        return "warning";
      case "SEV-3":
        return "neutral";
      default:
        return "neutral";
    }
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-violet-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Active Investigations
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            DEMO DATASET
          </span>
          {showHeaderLink && (
            <Link
              href="/investigations"
              className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 text-slate-400 font-mono text-[11px]">
              <th className="pb-2.5 font-medium">Investigation</th>
              <th className="pb-2.5 font-medium">Incident Target</th>
              <th className="pb-2.5 font-medium">Severity</th>
              <th className="pb-2.5 font-medium">Status</th>
              <th className="pb-2.5 font-medium hidden sm:table-cell">Scope</th>
              <th className="pb-2.5 font-medium hidden md:table-cell">Last Updated</th>
              <th className="pb-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {investigations.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-900/40 transition">
                <td className="py-3 font-mono font-bold text-slate-100">
                  {inv.id}
                </td>
                <td className="py-3">
                  <div>
                    <span className="font-semibold text-slate-200 block truncate max-w-xs">
                      {inv.incidentTitle}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Target: {inv.incidentId}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <StatusBadge
                    label={inv.severity}
                    variant={getSeverityVariant(inv.severity)}
                  />
                </td>
                <td className="py-3">
                  <StatusBadge
                    label={inv.status.replace(/_/g, " ")}
                    variant={getStatusVariant(inv.status)}
                  />
                </td>
                <td className="py-3 text-[11px] font-mono text-slate-400 hidden sm:table-cell">
                  {inv.scope}
                </td>
                <td className="py-3 text-[11px] font-mono text-slate-400 hidden md:table-cell">
                  {inv.lastUpdated}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/investigations/${inv.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
                  >
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

