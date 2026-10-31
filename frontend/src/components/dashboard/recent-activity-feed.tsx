import React from "react";
import { History, AlertCircle, Info, Clock, CheckCircle2 } from "lucide-react";
import { DEMO_ACTIVITY_FEED, DemoActivityItem } from "@/lib/demo-data";

export function RecentActivityFeed() {
  function getSeverityIcon(sev: DemoActivityItem["severity"]) {
    switch (sev) {
      case "critical":
        return <AlertCircle className="h-3.5 w-3.5 text-rose-400" />;
      case "warning":
        return <Clock className="h-3.5 w-3.5 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "info":
      default:
        return <Info className="h-3.5 w-3.5 text-cyan-400" />;
    }
  }

  function getCategoryStyle(cat: DemoActivityItem["category"]) {
    switch (cat) {
      case "INCIDENT":
        return "text-rose-400 bg-rose-950/40 border-rose-800/40";
      case "CLOCK_SYNC":
        return "text-amber-400 bg-amber-950/40 border-amber-800/40";
      case "DATA_QUALITY":
        return "text-yellow-400 bg-yellow-950/40 border-yellow-800/40";
      case "INVESTIGATION":
        return "text-violet-400 bg-violet-950/40 border-violet-800/40";
      case "TELEMETRY":
      default:
        return "text-cyan-400 bg-cyan-950/40 border-cyan-800/40";
    }
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-violet-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Incident Activity Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
          DEMO LOG STREAM
        </span>
      </div>

      <div className="space-y-3">
        {DEMO_ACTIVITY_FEED.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs flex items-start gap-2.5"
          >
            <div className="mt-0.5 shrink-0">{getSeverityIcon(item.severity)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-slate-200">{item.title}</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {item.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium ${getCategoryStyle(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
                {item.service && (
                  <span className="text-[10px] font-mono text-slate-500">
                    srv: {item.service}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

