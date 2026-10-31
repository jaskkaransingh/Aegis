"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BackendProvider } from "@/lib/backend-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on public landing page ("/") — render full-screen immersive experience
  // without the workstation sidebar and header chrome.
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <BackendProvider>
        <div className="relative isolate min-h-screen w-full bg-black text-[#f1f4fb]">
          {children}
        </div>
      </BackendProvider>
    );
  }

  // Otherwise — render the full technical workstation layout with smooth route entry
  return (
    <BackendProvider>
      <div className="flex min-h-screen w-full bg-[#07090f] text-[#f1f4fb]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </BackendProvider>
  );
}
