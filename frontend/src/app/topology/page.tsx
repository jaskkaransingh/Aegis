import React, { Suspense } from "react";
import { TopologyClient } from "./topology-client";

export const metadata = {
  title: "Service Topology | AEGIS",
  description: "Interactive architecture dependency graph and failure propagation paths",
};

export default function TopologyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      }
    >
      <TopologyClient />
    </Suspense>
  );
}
