"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { InvestigationHeader } from "@/components/investigation/investigation-header";
import { InvestigationSummary } from "@/components/investigation/investigation-summary";
import {
  InvestigationNavigation,
  type InvestigationTab,
} from "@/components/investigation/investigation-navigation";
import { InvestigationActivity } from "@/components/investigation/investigation-activity";
import { InvestigationActions } from "@/components/investigation/investigation-actions";
import { apiClient } from "@/lib/api-client";
import { useBackend } from "@/lib/backend-context";
import {
  PRIMARY_DEMO_INCIDENT,
  DEMO_INVESTIGATIONS,
  DEMO_INVESTIGATION_PREVIEW,
} from "@/lib/demo-data";
import type { InvestigationResult, LogsResponse } from "@/types";

interface WorkspaceClientProps {
  id: string;
}

export function InvestigationWorkspaceClient({ id }: WorkspaceClientProps) {
  const router = useRouter();
  const rawId = (id || "INC-001").toUpperCase();

  const { status: backendStatus, refresh: probeBackend } = useBackend();
  const [activeTab, setActiveTab] = useState<InvestigationTab>("overview");
  const [investigationData, setInvestigationData] =
    useState<InvestigationResult | null>(null);
  const [logsData, setLogsData] = useState<LogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Attempt to load preview and normalized logs from the backend
      const [preview, logs] = await Promise.all([
        apiClient.getInvestigationPreview(),
        apiClient.getLogs({ apply_clock_correction: true }),
      ]);
      setInvestigationData(preview);
      setLogsData(logs);
      setIsDemoFallback(false);
    } catch (err) {
      // Backend is unavailable; fall back safely to centralized demonstration fixtures
      setInvestigationData(DEMO_INVESTIGATION_PREVIEW);
      setIsDemoFallback(true);
      setFetchError(
        err instanceof Error
          ? err.message
          : "Backend unavailable; serving offline demonstration fixtures."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, backendStatus]);

  // Derive metadata from loaded data or demonstration defaults
  const incidentId = PRIMARY_DEMO_INCIDENT.id;
  const incidentTitle =
    investigationData?.incident_name || PRIMARY_DEMO_INCIDENT.title;
  const severity = PRIMARY_DEMO_INCIDENT.severity;
  const status = investigationData?.status || PRIMARY_DEMO_INCIDENT.status;
  const environment = PRIMARY_DEMO_INCIDENT.environment;
  const description = PRIMARY_DEMO_INCIDENT.description;

  const totalEvents =
    logsData?.total_count ??
    investigationData?.total_normalized_events ??
    PRIMARY_DEMO_INCIDENT.evidenceCount;

  const warnings =
    investigationData?.warnings ??
    DEMO_INVESTIGATION_PREVIEW.warnings;

  const affectedServices = PRIMARY_DEMO_INCIDENT.affectedServices;
  const clockOffsetActive = true;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Investigation Header */}
      <InvestigationHeader
        incidentId={incidentId}
        incidentTitle={incidentTitle}
        severity={severity}
        status={status}
        environment={environment}
        isBackendConnected={backendStatus === "connected" && !isDemoFallback}
        isDemoData={isDemoFallback}
        onRefresh={loadData}
        isRefreshing={isLoading}
      />

      {/* Backend Offline Callout Notice */}
      {isDemoFallback && (
        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
            <span>
              Backend Server Offline: Rendering centralized synthetic demonstration fixtures for incident {incidentId}.
            </span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-2.5 py-1 rounded bg-amber-900/50 border border-amber-700/60 text-amber-200 hover:bg-amber-800 transition text-[11px] self-start sm:self-auto shrink-0"
          >
            Retry Backend Connection
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <InvestigationNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "timeline") {
            router.push(`/timeline?incident=${incidentId}`);
          } else {
            setActiveTab(tab);
          }
        }}
        timelineCount={totalEvents}
      />

      {/* Main Workspace Body */}
      <div className="space-y-6">
        {/* Investigation Summary */}
        <InvestigationSummary
          description={description}
          affectedServices={affectedServices}
          totalEvents={totalEvents}
          warningsCount={warnings.length}
          status={status}
          clockOffsetActive={clockOffsetActive}
          isDemoData={isDemoFallback}
        />

        {/* Data Quality & Activity Audit */}
        <InvestigationActivity
          warnings={warnings}
          isDemoData={isDemoFallback}
        />

        {/* Actions & Navigation */}
        <InvestigationActions incidentId={incidentId} />
      </div>
    </div>
  );
}

