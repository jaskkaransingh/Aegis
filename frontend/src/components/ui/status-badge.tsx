import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Clock } from "lucide-react";

export type BadgeVariant =
  | "critical"
  | "warning"
  | "success"
  | "info"
  | "neutral"
  | "violet";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function StatusBadge({
  label,
  variant = "neutral",
  size = "sm",
  showIcon = true,
}: StatusBadgeProps) {
  let style = "bg-slate-800 text-slate-300 border-slate-700";
  let icon = <Info className="h-3 w-3" />;

  switch (variant) {
    case "critical":
      style = "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/40";
      icon = <AlertCircle className="h-3 w-3 text-[#ef4444]" />;
      break;
    case "warning":
      style = "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40";
      icon = <AlertTriangle className="h-3 w-3 text-[#f59e0b]" />;
      break;
    case "success":
      style = "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40";
      icon = <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />;
      break;
    case "info":
    case "violet":
      // Platinum Enterprise Accent (Replaces AI cyan and violet)
      style = "bg-white/10 text-white border border-white/20";
      icon = <Clock className="h-3 w-3 text-white/80" />;
      break;
    case "neutral":
    default:
      style = "bg-white/[0.06] text-white/80 border border-white/15";
      icon = <Info className="h-3 w-3 text-white/60" />;
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-2";

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded border ${sizeClasses} ${style}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
}

