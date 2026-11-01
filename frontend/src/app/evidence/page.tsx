import React, { Suspense } from "react";
import { EvidenceClient } from "./evidence-client";

export const metadata = {
  title: "Evidence Explorer | AEGIS",
  description: "Inspect evidence, verify provenance, and trace incident signals.",
};

export default function EvidencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      }
    >
      <EvidenceClient />
    </Suspense>
  );
}
