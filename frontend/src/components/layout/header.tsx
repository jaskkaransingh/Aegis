import React from "react";
import { Server, Terminal } from "lucide-react";
import { config } from "@/lib/config";

export function Header() {
  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#0a0e17]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-200 tracking-wide">
          {config.appName}
        </h1>
        <span className="text-slate-600">/</span>
        <span className="text-xs text-slate-400 font-mono">
          Foundation Console
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Target Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          <Server className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-[11px] text-slate-400">Target:</span>
          <span className="text-[11px] text-slate-200">{config.apiBaseUrl}</span>
        </div>

        {/* Runtime Badge */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
          <Terminal className="h-3 w-3 text-slate-500" />
          <span>Next.js 15 App Router</span>
        </div>
      </div>
    </header>
  );
}

