/**
 * AEGIS Motion System & Tactical Physics
 *
 * Provides centralized durations, bezier timing curves, and accessibility
 * helpers to ensure deliberate, cinematic, and non-distracting interactions.
 */

// Timing Durations (milliseconds)
export const DURATION_MICRO = 150;   // 100-180ms: quick toggles, icons, pill badges, micro-indicators
export const DURATION_HOVER = 200;   // 160-240ms: button hovers, card lift, border highlights
export const DURATION_PANEL = 300;   // 220-360ms: evidence drawers, collapsible inspector panels
export const DURATION_DRAWER = 450;  // 350-650ms: cupboard physical slides, modal envelopes

// Bezier Curves
export const EASE_STANDARD = "cubic-bezier(0.2, 0.0, 0.0, 1.0)";
export const EASE_DECELERATE = "cubic-bezier(0.0, 0.0, 0.2, 1.0)";
export const EASE_ACCELERATE = "cubic-bezier(0.3, 0.0, 1.0, 1.0)";
export const EASE_TACTILE = "cubic-bezier(0.16, 1.0, 0.3, 1.0)";

// Tailwind Utility Classes for standard components
export const MOTION_PRESETS = {
  micro: "transition-all duration-150 ease-[cubic-bezier(0.2,0.0,0.0,1.0)]",
  hover: "transition-all duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]",
  panel: "transition-all duration-300 ease-[cubic-bezier(0.2,0.0,0.0,1.0)]",
  drawer: "transition-all duration-500 ease-[cubic-bezier(0.16,1.0,0.3,1.0)]",
  colorOnly: "transition-colors duration-150 ease-[cubic-bezier(0.2,0.0,0.0,1.0)]",
  transformOnly: "transition-transform duration-200 ease-[cubic-bezier(0.0,0.0,0.2,1.0)]",
} as const;

/**
 * Checks if the user has requested reduced motion in their OS or browser settings.
 * Safe to call in both client and server rendering contexts.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

