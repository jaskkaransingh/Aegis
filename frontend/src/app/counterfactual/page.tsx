import React, { Suspense } from "react";
import { CounterfactualClient } from "./counterfactual-client";

export const metadata = {
  title: "Counterfactual Lab | AEGIS",
  description: "Explore alternative incident scenarios and their potential impact.",
};

export default function CounterfactualPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      }
    >
      <CounterfactualClient />
    </Suspense>
  );
}
