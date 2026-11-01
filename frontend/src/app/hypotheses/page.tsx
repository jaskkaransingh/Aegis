import React, { Suspense } from "react";
import { HypothesesClient } from "./hypotheses-client";

export const metadata = {
  title: "Hypothesis Arena | AEGIS",
  description: "Compare competing explanations against available evidence.",
};

export default function HypothesesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      }
    >
      <HypothesesClient />
    </Suspense>
  );
}
