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
      style = "bg-rose-950/60 text-rose-300 border-rose-800/60";
      icon = <AlertCircle className="h-3 w-3 text-rose-400" />;
      break;
    case "warning":
      style = "bg-amber-950/60 text-amber-300 border-amber-800/60";
      icon = <AlertTriangle className="h-3 w-3 text-amber-400" />;
      break;
    case "success":
      style = "bg-emerald-950/60 text-emerald-300 border-emerald-800/60";
      icon = <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
      break;
    case "info":
      style = "bg-cyan-950/60 text-cyan-300 border-cyan-800/60";
      icon = <Info className="h-3 w-3 text-cyan-400" />;
      break;
    case "violet":
      style = "bg-violet-950/60 text-violet-300 border-violet-800/60";
      icon = <Clock className="h-3 w-3 text-violet-400" />;
      break;
    case "neutral":
    default:
      style = "bg-slate-800/80 text-slate-300 border-slate-700/60";
      icon = <Info className="h-3 w-3 text-slate-400" />;
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

