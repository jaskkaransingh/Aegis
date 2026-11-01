import React from "react";

export type AegisBadgeVariant =
  | "neutral"  // Structural slate
  | "violet"   // AI & Deep Inferences
  | "cyan"     // Telemetry & Verified Facts
  | "success"  // Healthy / Baseline
  | "warning"  // Skew / Latency / Divergence
  | "danger";  // Critical failure / Outage

export type AegisBadgeSize = "xs" | "sm" | "md";

export interface AegisBadgeProps {
  variant?: AegisBadgeVariant;
  size?: AegisBadgeSize;
  dot?: boolean;
  pulse?: boolean;
  mono?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function AegisBadge({
  variant = "neutral",
  size = "sm",
  dot = false,
  pulse = false,
  mono = true,
  children,
  className = "",
}: AegisBadgeProps) {
  // Size classes
  let sizeStyles = "text-[11px] px-2 py-0.5 gap-1.5";
  let dotSize = "h-1.5 w-1.5";

  switch (size) {
    case "xs":
      sizeStyles = "text-[10px] px-1.5 py-0.2 gap-1";
      dotSize = "h-1 w-1";
      break;
    case "md":
      sizeStyles = "text-xs px-2.5 py-1 gap-2";
      dotSize = "h-2 w-2";
      break;
    case "sm":
    default:
      sizeStyles = "text-[11px] px-2 py-0.5 gap-1.5";
      dotSize = "h-1.5 w-1.5";
      break;
  }

  // Variant styling
  let variantStyles = "";
  let dotColor = "";

  switch (variant) {
    case "violet":
    case "cyan":
      // Platinum Enterprise Accent (Replaces AI violet/cyan)
      variantStyles =
        "bg-white/10 text-white border-white/20";
      dotColor = "bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]";
      break;
    case "success":
      // Telemetric Green (Healthy / Baseline / Verified)
      variantStyles =
        "bg-[#052e16]/80 text-[#22c55e] border-[#22c55e]/40";
      dotColor = "bg-[#22c55e] shadow-[0_0_6px_#22c55e]";
      break;
    case "warning":
      // Telemetric Amber (Skew / Latency / Divergence)
      variantStyles =
        "bg-[#451a03]/80 text-[#f59e0b] border-[#f59e0b]/40";
      dotColor = "bg-[#f59e0b]";
      break;
    case "danger":
      // Telemetric Red (Critical failure / Outage / Anomaly)
      variantStyles =
        "bg-[#450a0a]/80 text-[#ef4444] border-[#ef4444]/40";
      dotColor = "bg-[#ef4444] shadow-[0_0_6px_#ef4444]";
      break;
    case "neutral":
    default:
      variantStyles =
        "bg-[#101522] text-[#cbd5e1] border-[#252d40]";
      dotColor = "bg-[#94a3b8]";
      break;
  }

  return (
    <span
      className={`inline-flex items-center font-medium select-none rounded border tracking-tight ${
        mono ? "font-mono" : "font-sans"
      } ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && (
        <span className="relative flex shrink-0 items-center justify-center">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full ${dotSize} ${dotColor}`} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

