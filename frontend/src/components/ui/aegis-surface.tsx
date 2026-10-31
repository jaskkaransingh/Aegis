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
  // Elevation background & shadow mappings
  let elevationStyles = "";
  switch (elevation) {
    case "base":
      elevationStyles = "bg-[#07090f]";
      break;
    case "elevated":
      elevationStyles = "bg-[#0b0e17] shadow-sm";
      break;
    case "card":
      elevationStyles =
        "bg-[#151b2a] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]";
      break;
    case "glass":
      elevationStyles =
        "bg-[#101522]/80 backdrop-blur-md shadow-[0_8px_32px_-4px_rgba(0,0,0,0.7)]";
      break;
    case "raised":
    default:
      elevationStyles = "bg-[#101522] shadow-sm";
      break;
  }

  // Border mappings
  let borderStyles = "";
  switch (border) {
    case "none":
      borderStyles = "border-0";
      break;
    case "subtle":
      borderStyles = "border border-[#1b2232]";
      break;
    case "strong":
      borderStyles = "border border-[#36415b]";
      break;
    case "accent":
      borderStyles = "border border-[#9875ff]/40 shadow-[0_0_20px_-4px_rgba(152,117,255,0.2)]";
      break;
    case "default":
    default:
      borderStyles = "border border-[#252d40]";
      break;
  }

  // Interactive hover classes
  const interactiveStyles = interactive
    ? "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)] " +
      "hover:bg-[#1a2233] hover:border-[#36415b] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] cursor-pointer"
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

