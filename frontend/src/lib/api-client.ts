/**
 * AEGIS Centralized REST API Client.
 * Connects to the FastAPI backend service via NEXT_PUBLIC_API_BASE_URL.
 * Handles network failures, non-2xx HTTP responses, and non-JSON payloads safely.
 */

import { config } from "./config";
import type {
  DependenciesResponse,
  HealthResponse,
  InvestigationResult,
  LogsFilterParams,
  LogsResponse,
  NormalizedEvent,
  ServicesResponse,
  TimelineEvent,
} from "../types";

export class ApiError extends Error {
  public readonly status?: number;
  public readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let url = `${config.apiBaseUrl.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const mergedHeaders: HeadersInit = {
    Accept: "application/json",
    ...headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network connection to backend failed";
    throw new ApiError(
      `Unable to reach AEGIS backend at ${config.apiBaseUrl}. Ensure the FastAPI server is running. (${message})`,
      0
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data: unknown;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    if (data && typeof data === "object" && "detail" in data) {
      errorMessage = String((data as { detail: unknown }).detail);
    } else if (data && typeof data === "object" && "message" in data) {
      errorMessage = String((data as { message: unknown }).message);
    } else if (typeof data === "string" && data.trim()) {
      errorMessage = data.slice(0, 200);
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  /**
   * Checks backend health and operational status.
   */
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>("api/health");
  },

  /**
   * Retrieves normalized incident logs with optional filtering and clock skew correction.
   */
  async getLogs(filters?: LogsFilterParams): Promise<LogsResponse> {
    return request<LogsResponse>("api/logs", {
      params: filters
        ? {
            service: filters.service,
            severity: filters.severity,
            trace_id: filters.trace_id,
            apply_clock_correction: filters.apply_clock_correction,
          }
        : undefined,
    });
  },

  /**
   * Fetches the registered microservice and infrastructure components.
   */
  /**
   * Retrieves cleaned, deduplicated, and timestamp-corrected logs directly from /api/logs/normalized.
   */
  async getNormalizedLogs(): Promise<NormalizedEvent[]> {
    return request<NormalizedEvent[]>("api/logs/normalized");
  },

  async getServices(): Promise<ServicesResponse> {
    return request<ServicesResponse>("api/services");
  },

  /**
   * Retrieves the NetworkX service dependency graph serialized as JSON.
   */
  async getDependencies(): Promise<DependenciesResponse> {
    return request<DependenciesResponse>("api/dependencies");
  },

  /**
   * Retrieves the time-corrected chronological incident timeline.
   */
  async getTimeline(): Promise<TimelineEvent[]> {
    return request<TimelineEvent[]>("api/timeline");
  },

  /**
   * Retrieves deterministic preliminary investigation report preview.
   */
  async getInvestigationPreview(): Promise<InvestigationResult> {
    return request<InvestigationResult>("api/investigation/preview");
  },
};

