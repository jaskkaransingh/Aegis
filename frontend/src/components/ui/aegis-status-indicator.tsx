import React from "react";

export type AegisInvestigationStatus =
  | "healthy"
  | "warning"
  | "degraded"
  | "critical"
  | "unknown"
  | "investigating"
  | "hypothesis"
  | "verified_evidence";

export interface AegisStatusIndicatorProps {
  status: AegisInvestigationStatus;
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export function AegisStatusIndicator({
  status,
  label,
  showLabel = true,
  size = "md",
  pulse = false,
  className = "",
}: AegisStatusIndicatorProps) {
  let colorBg = "bg-[#727f98]";
  let colorGlow = "shadow-[0_0_8px_rgba(114,127,152,0.4)]";
  let defaultLabel = "Unknown";
  let textColor = "text-[#a3adc2]";

  switch (status) {
    case "healthy":
      colorBg = "bg-[#76d6a4]";
      colorGlow = "shadow-[0_0_10px_rgba(118,214,164,0.5)]";
      defaultLabel = "Healthy / Nominal";
      textColor = "text-[#76d6a4]";
      break;
    case "warning":
      colorBg = "bg-[#f2c66d]";
      colorGlow = "shadow-[0_0_10px_rgba(242,198,109,0.5)]";
      defaultLabel = "Warning / Latency";
      textColor = "text-[#f2c66d]";
      break;
    case "degraded":
      colorBg = "bg-[#f2c66d]";
      colorGlow = "shadow-[0_0_10px_rgba(242,198,109,0.5)]";
      defaultLabel = "Degraded Service";
      textColor = "text-[#f2c66d]";
      break;
    case "critical":
      colorBg = "bg-[#f27886]";
      colorGlow = "shadow-[0_0_12px_rgba(242,120,134,0.6)]";
      defaultLabel = "Critical Failure";
      textColor = "text-[#f27886]";
      break;
    case "investigating":
      colorBg = "bg-[#9875ff]";
      colorGlow = "shadow-[0_0_12px_rgba(152,117,255,0.6)]";
      defaultLabel = "Investigating";
      textColor = "text-[#b29aff]";
      break;
    case "hypothesis":
      colorBg = "bg-[#9875ff]";
      colorGlow = "shadow-[0_0_8px_rgba(152,117,255,0.4)]";
      defaultLabel = "Hypothesis";
      textColor = "text-[#b29aff]";
      break;
    case "verified_evidence":
      colorBg = "bg-[#7adcf5]";
      colorGlow = "shadow-[0_0_10px_rgba(122,220,245,0.5)]";
      defaultLabel = "Verified Evidence";
      textColor = "text-[#7adcf5]";
      break;
    case "unknown":
    default:
      colorBg = "bg-[#727f98]";
      colorGlow = "shadow-none";
      defaultLabel = "Unknown";
      textColor = "text-[#a3adc2]";
      break;
  }

  // Size mappings
  let beaconSize = "h-2 w-2";
  let textSize = "text-xs";

  switch (size) {
    case "sm":
      beaconSize = "h-1.5 w-1.5";
      textSize = "text-[11px]";
      break;
    case "lg":
      beaconSize = "h-2.5 w-2.5";
      textSize = "text-sm";
      break;
    case "md":
    default:
      beaconSize = "h-2 w-2";
      textSize = "text-xs";
      break;
  }

  const displayLabel = label ?? defaultLabel;

  return (
    <div
      className={`inline-flex items-center gap-2 font-mono select-none ${className}`}
      aria-label={`Status: ${displayLabel}`}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        {pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${colorBg}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${beaconSize} ${colorBg} ${colorGlow}`}
        />
      </span>
      {showLabel && (
        <span className={`font-medium ${textSize} ${textColor}`}>
          {displayLabel}
        </span>
      )}
    </div>
  );
}

