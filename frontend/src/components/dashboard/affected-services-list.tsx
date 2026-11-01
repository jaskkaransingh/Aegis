"use client";

import React, { useEffect, useState } from "react";
import { Server, CheckCircle2, AlertTriangle, AlertCircle, Database, Shield, Radio, Activity } from "lucide-react";
import { DEMO_SERVICES_STATUS, DemoServiceStatus } from "@/lib/demo-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { apiClient } from "@/lib/api-client";
import { useBackend } from "@/lib/backend-context";

export function AffectedServicesList() {
  const { status: backendStatus } = useBackend();
  const [services, setServices] = useState<DemoServiceStatus[]>(DEMO_SERVICES_STATUS);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (backendStatus === "connected") {
      apiClient
        .getServices()
        .then((res) => {
          if (!isMounted || !res || !res.services) return;
          // Overlay backend service list with demonstration symptom metadata
          const mapped: DemoServiceStatus[] = res.services.map((s) => {
            const demoMatch = DEMO_SERVICES_STATUS.find((d) => d.id === s.id);
            return {
              id: s.id,
              name: s.name,
              tier: s.tier as DemoServiceStatus["tier"],
              status: demoMatch ? demoMatch.status : "OPERATIONAL",
              isAffected: demoMatch ? demoMatch.isAffected : false,
              description: s.description || demoMatch?.description || "",
              observedSymptom: demoMatch?.observedSymptom,
            };
          });
          setServices(mapped);
          setIsLive(true);
        })
        .catch(() => {
          if (isMounted) {
            setIsLive(false);
          }
        });
    } else {
      setIsLive(false);
    }
    return () => {
      isMounted = false;
    };
  }, [backendStatus]);

  function getTierIcon(tier: string) {
    switch (tier) {
      case "data_persistence":
        return <Database className="h-3.5 w-3.5 text-white" />;
      case "security":
        return <Shield className="h-3.5 w-3.5 text-amber-400" />;
      case "integration":
        return <Radio className="h-3.5 w-3.5 text-white" />;
      default:
        return <Server className="h-3.5 w-3.5 text-white/60" />;
    }
  }

  function getStatusVariant(status: string): "critical" | "warning" | "success" | "neutral" {
    switch (status) {
      case "CRITICAL":
        return "critical";
      case "DEGRADED":
      case "WARNING":
        return "warning";
      case "OPERATIONAL":
        return "success";
      default:
        return "neutral";
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40/50 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90 font-mono">
            Infrastructure &amp; Services Status
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-white/60">Total: {services.length}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white/60 border border-white/20/60">
            {isLive ? "CATALOG: VERIFIED BACKEND" : "DEMO DATASET"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className="h-6 w-6 rounded bg-slate-800/70 border border-white/20/60 flex items-center justify-center shrink-0 mt-0.5">
                {getTierIcon(srv.tier)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white/90 truncate">
                    {srv.name}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 bg-black/40 px-1.5 py-0.2 rounded border border-white/10">
                    {srv.id}
                  </span>
                  <span className="text-[10px] font-mono text-white/60 uppercase">
                    [{srv.tier}]
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mt-0.5 line-clamp-1">
                  {srv.description}
                </p>
                {srv.observedSymptom && (
                  <p className="text-[10px] font-mono text-amber-300/80 mt-1 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Symptom: {srv.observedSymptom}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <StatusBadge
                label={srv.status}
                variant={getStatusVariant(srv.status)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

