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
      variantStyles =
        "bg-[#21173c]/70 text-[#b29aff] border-[#9875ff]/35";
      dotColor = "bg-[#9875ff]";
      break;
    case "cyan":
      variantStyles =
        "bg-[#102833]/70 text-[#7adcf5] border-[#7adcf5]/35";
      dotColor = "bg-[#7adcf5]";
      break;
    case "success":
      variantStyles =
        "bg-[#112b20]/70 text-[#76d6a4] border-[#76d6a4]/35";
      dotColor = "bg-[#76d6a4]";
      break;
    case "warning":
      variantStyles =
        "bg-[#332711]/70 text-[#f2c66d] border-[#f2c66d]/35";
      dotColor = "bg-[#f2c66d]";
      break;
    case "danger":
      variantStyles =
        "bg-[#33151a]/70 text-[#f27886] border-[#f27886]/35";
      dotColor = "bg-[#f27886]";
      break;
    case "neutral":
    default:
      variantStyles =
        "bg-[#101522] text-[#a3adc2] border-[#252d40]";
      dotColor = "bg-[#727f98]";
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

