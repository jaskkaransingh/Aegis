"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient, ApiError } from "./api-client";
import { config } from "./config";
import type { HealthResponse } from "@/types";

export type ConnectionStatus = "connected" | "disconnected" | "checking";

interface BackendContextType {
  status: ConnectionStatus;
  healthData: HealthResponse | null;
  error: string | null;
  apiUrl: string;
  refresh: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType>({
  status: "checking",
  healthData: null,
  error: null,
  apiUrl: config.apiBaseUrl,
  refresh: async () => {},
});

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setStatus("checking");
    setError(null);
    try {
      const data = await apiClient.checkHealth();
      setHealthData(data);
      setStatus("connected");
    } catch (err) {
      setHealthData(null);
      setStatus("disconnected");
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Backend unreachable at " + config.apiBaseUrl);
      }
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <BackendContext.Provider
      value={{
        status,
        healthData,
        error,
        apiUrl: config.apiBaseUrl,
        refresh: checkHealth,
      }}
    >
      {children}
    </BackendContext.Provider>
  );
}

export function useBackend() {
  return useContext(BackendContext);
}

