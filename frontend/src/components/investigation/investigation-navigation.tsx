import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Clock,
  FileSearch,
  Scale,
  GitFork,
  FileText,
} from "lucide-react";

export type InvestigationTab =
  | "overview"
  | "timeline"
  | "evidence"
  | "hypotheses"
  | "counterfactuals"
  | "report";

interface InvestigationNavigationProps {
  activeTab: InvestigationTab;
  onTabChange: (tab: InvestigationTab) => void;
  timelineCount?: number;
}

export function InvestigationNavigation({
  activeTab,
  onTabChange,
  timelineCount,
}: InvestigationNavigationProps) {
  const tabs = [
    {
      id: "overview" as const,
      label: "Overview",
      icon: LayoutDashboard,
      status: "Ready",
      isInteractive: true,
    },
    {
      id: "timeline" as const,
      label: "Timeline",
      icon: Clock,
      status: "Ready",
      badge: timelineCount !== undefined ? `${timelineCount}` : undefined,
      isInteractive: true,
      href: "/timeline",
    },
    {
      id: "evidence" as const,
      label: "Evidence",
      icon: FileSearch,
      status: "Phase 4 Route",
      isInteractive: true,
      href: "/evidence",
    },
    {
      id: "hypotheses" as const,
      label: "Hypotheses",
      icon: Scale,
      status: "Phase 4 Route",
      isInteractive: true,
      href: "/hypotheses",
    },
    {
      id: "counterfactuals" as const,
      label: "Counterfactuals",
      icon: GitFork,
      status: "Phase 5 Route",
      isInteractive: true,
      href: "/counterfactual",
    },
    {
      id: "report" as const,
      label: "Report",
      icon: FileText,
      status: "Phase 5 Route",
      isInteractive: true,
      href: "/reports",
    },
  ];

  return (
    <div className="border-b border-white/10">
      <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.href && tab.id !== "timeline") {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono rounded-lg transition border border-transparent text-white/60 hover:text-white/90 hover:bg-slate-800/40"
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-slate-600 bg-black/40 px-1.5 py-0.2 rounded border border-white/10">
                  {tab.status}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono rounded-lg transition border ${
                isActive
                  ? "bg-white/10 text-white/40 text-white border-violet-800/60 shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-slate-800/40 border-transparent"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[10px] bg-slate-800 text-white/80 px-1.5 py-0.2 rounded">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
