import React from "react";
import { Loader2 } from "lucide-react";

export type AegisButtonVariant =
  | "primary"    // Tactical Violet Accent (Primary action, Run Analysis, Confirm)
  | "secondary"  // Obsidian Surface with subtle hairline border (Default action)
  | "ghost"      // Transparent background, hairline border on hover
  | "danger"     // Rose/Red border & subtle tint (Revoke, Abort, Critical action)
  | "subtle";    // Minimal background, low-key utility

export type AegisButtonSize = "xs" | "sm" | "md" | "lg";

export interface AegisButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AegisButtonVariant;
  size?: AegisButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}

export const AegisButton = React.forwardRef<HTMLButtonElement, AegisButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    // Base tactical button styles: high precision typography, zero rounding bloat, deliberate transitions
    const baseStyles =
      "inline-flex items-center justify-center font-medium font-mono text-center select-none rounded " +
      "transition-all duration-150 ease-[cubic-bezier(0.2,0.0,0.0,1.0)] " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9875ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090f] " +
      "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    // Size mappings
    let sizeStyles = "text-xs px-3.5 py-1.5 gap-2";
    let iconSize = "h-3.5 w-3.5";

    switch (size) {
      case "xs":
        sizeStyles = "text-[10px] px-2 py-0.5 gap-1.5";
        iconSize = "h-3 w-3";
        break;
      case "sm":
        sizeStyles = "text-[11px] px-2.5 py-1 gap-1.5";
        iconSize = "h-3 w-3";
        break;
      case "lg":
        sizeStyles = "text-sm px-5 py-2.5 gap-2.5 tracking-wide";
        iconSize = "h-4 w-4";
        break;
      case "md":
      default:
        sizeStyles = "text-xs px-3.5 py-1.5 gap-2";
        iconSize = "h-3.5 w-3.5";
        break;
    }

    // Variant styling
    let variantStyles = "";
    switch (variant) {
      case "primary":
        variantStyles =
          "bg-[#9875ff] text-[#07090f] font-semibold hover:bg-[#b29aff] " +
          "border border-[#b29aff]/60 shadow-[0_0_16px_-2px_rgba(152,117,255,0.4)]";
        break;
      case "secondary":
        variantStyles =
          "bg-[#101522] text-[#f1f4fb] hover:bg-[#151b2a] hover:text-white " +
          "border border-[#252d40] hover:border-[#36415b] shadow-sm";
        break;
      case "ghost":
        variantStyles =
          "bg-transparent text-[#a3adc2] hover:text-[#f1f4fb] hover:bg-[#101522]/60 " +
          "border border-transparent hover:border-[#252d40]";
        break;
      case "danger":
        variantStyles =
          "bg-[#33151a]/60 text-[#f27886] hover:bg-[#33151a] hover:text-rose-200 " +
          "border border-[#f27886]/40 hover:border-[#f27886]/70 shadow-sm";
        break;
      case "subtle":
        variantStyles =
          "bg-[#0b0e17] text-[#a3adc2] hover:text-[#f1f4fb] hover:bg-[#101522] " +
          "border border-[#1b2232] hover:border-[#252d40]";
        break;
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className={`${iconSize} animate-spin text-current`} />
        ) : (
          icon && iconPosition === "left" && (
            <span className={`inline-flex shrink-0 ${iconSize}`}>{icon}</span>
          )
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === "right" && (
          <span className={`inline-flex shrink-0 ${iconSize}`}>{icon}</span>
        )}
      </button>
    );
  }
);

AegisButton.displayName = "AegisButton";

