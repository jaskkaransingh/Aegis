import React from "react";

export type AegisSurfaceElevation =
  | "base"       // Deep obsidian canvas: #07090f
  | "elevated"   // Secondary backplanes: #0b0e17
  | "raised"     // Panels & sections: #101522
  | "card"       // Foreground item tiles: #151b2a
  | "glass";     // Translucent HUD overlays

export type AegisSurfaceBorder =
  | "none"
  | "subtle"   // #1b2232
  | "default"  // #252d40
  | "strong"   // #36415b
  | "accent";  // Violet glow border

export interface AegisSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: AegisSurfaceElevation;
  border?: AegisSurfaceBorder;
  interactive?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}

export function AegisSurface({
  elevation = "raised",
  border = "default",
  interactive = false,
  as: Component = "div",
  children,
  className = "",
  ...props
}: AegisSurfaceProps) {
  // Elevation background & shadow mappings - frosted translucent glass allowing the 3D background wormhole to drift softly through
  let elevationStyles = "";
  switch (elevation) {
    case "base":
      elevationStyles = "bg-black/30 backdrop-blur-md";
      break;
    case "elevated":
      elevationStyles = "bg-black/35 backdrop-blur-lg border border-white/10";
      break;
    case "card":
      elevationStyles =
        "bg-black/45 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]";
      break;
    case "glass":
      elevationStyles =
        "bg-black/25 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6)]";
      break;
    case "raised":
    default:
      elevationStyles = "bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]";
      break;
  }

  // Border mappings
  let borderStyles = "";
  switch (border) {
    case "none":
      borderStyles = "border-0";
      break;
    case "subtle":
      borderStyles = "border border-white/5";
      break;
    case "strong":
      borderStyles = "border border-white/20";
      break;
    case "accent":
      borderStyles = "border border-white/30 shadow-[0_0_20px_-4px_rgba(255,255,255,0.15)]";
      break;
    case "default":
    default:
      borderStyles = "border border-white/10";
      break;
  }

  // Interactive hover classes
  const interactiveStyles = interactive
    ? "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] " +
      "hover:bg-white/[0.06] hover:border-white/25 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] cursor-pointer"
    : "";

  return (
    <Component
      className={`rounded-lg ${elevationStyles} ${borderStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

