import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-amber-400" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-100 font-mono">404 — Resource Not Found</h2>
        <p className="text-xs text-slate-400 max-w-md">
          The requested route, service, or investigation asset does not exist or has been relocated.
        </p>
      </div>
      <Link
        href="/command-center"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-mono font-medium transition-colors shadow-lg shadow-white/10 border border-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Command Center</span>
      </Link>
    </div>
  );
}

