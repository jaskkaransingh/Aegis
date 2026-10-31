/**
 * AEGIS Frontend Configuration.
 * Centralizes runtime environment variables with robust fallback defaults.
 */

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  appName: "AEGIS",
  appSubtitle: "Autonomous Evidence-Grounded Investigation System",
  version: "0.1.0",
} as const;

