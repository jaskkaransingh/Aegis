import React, { Suspense } from "react";
import { ReportsClient } from "./reports-client";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Investigation Report | AEGIS",
  description: "Forensic post-mortem incident investigation report with full evidence grounding.",
};

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      }
    >
      <ReportsClient />
    </Suspense>
  );
}
