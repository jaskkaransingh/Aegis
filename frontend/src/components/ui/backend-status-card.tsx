"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Server, ArrowRight } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api-client";
import { config } from "@/lib/config";
import type { HealthResponse } from "@/types";

export function BackendStatusCard() {
  const [loading, setLoading] = useState<boolean>(false);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckHealth() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.checkHealth();
      setHealthData(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred while probing backend health.");
      }
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Server className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Backend Connectivity Probe
            </h3>
            <p className="text-[11px] text-slate-400">
              Target: <span className="font-mono text-slate-300">{config.apiBaseUrl}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-violet-900/40"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Probing..." : "Test Health"}</span>
        </button>
      </div>

      <div className="mt-4">
        {loading && (
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
            Connecting to GET /api/health...
          </div>
        )}

        {!loading && healthData && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-medium pb-2 border-b border-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Backend Connected Successfully</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2.5 font-mono text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500">Service: </span>
                <span>{healthData.service}</span>
              </div>
              <div>
                <span className="text-slate-500">Version: </span>
                <span>{healthData.version}</span>
              </div>
              <div>
                <span className="text-slate-500">Status: </span>
                <span className="text-emerald-400">{healthData.status}</span>
              </div>
              <div>
                <span className="text-slate-500">Environment: </span>
                <span>{healthData.environment}</span>
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/30 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-medium">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>Backend Unreachable or Returned Error</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 font-mono leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {!loading && !healthData && !error && (
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Click &quot;Test Health&quot; to probe the FastAPI backend service.</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
          </div>
        )}
      </div>
    </div>
  );
}

