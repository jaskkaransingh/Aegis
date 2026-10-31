import React, { Suspense } from "react";
import { InvestigationWorkspaceClient } from "./workspace-client";

export default async function InvestigationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "INC-001";

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs font-mono text-slate-400">
          Loading investigation workspace {id}...
        </div>
      }
    >
      <InvestigationWorkspaceClient id={id} />
    </Suspense>
  );
}
