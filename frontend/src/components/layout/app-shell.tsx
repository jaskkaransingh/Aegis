"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BackendProvider } from "@/lib/backend-context";
import { AuthProvider } from "@/lib/auth-context";
import { AdminLoginModal } from "@/components/auth/admin-login-modal";

// Dynamically import 3D Wormhole Background for client-only WebGL execution
const WormholeBackground = dynamic(
  () => import("@/components/landing/wormhole-background"),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on public landing page ("/") — render full-screen immersive experience
  // STRICT RULE: Do not alter the landing page branch.
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <AuthProvider>
        <BackendProvider>
          <div className="relative isolate min-h-screen w-full bg-black text-[#f1f4fb]">
            {children}
            <AdminLoginModal />
          </div>
        </BackendProvider>
      </AuthProvider>
    );
  }

  // Workstation / Dashboard layout with blurred glassmorphism wormhole backdrop
  return (
    <AuthProvider>
      <BackendProvider>
        <div className="relative flex min-h-screen w-full bg-[#07090f] text-[#f1f4fb] isolate">
          {/* Soft, Blurred 3D Wormhole Background with Glassmorphism Veil */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-85">
            <WormholeBackground />
            {/* Frosted Transparent Glassmorphic Diffusion Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[1] bg-[#07090f]/45 backdrop-blur-[14px]" />
            {/* Subtle Radial Vignette for Depth */}
            <div
              className="fixed inset-0 pointer-events-none z-[2]"
              style={{
                background:
                  "radial-gradient(circle at 50% 35%, transparent 35%, rgba(7, 9, 15, 0.45) 75%, rgba(7, 9, 15, 0.8) 100%)",
              }}
            />
          </div>

          {/* Workstation Application Shell */}
          <div className="relative z-10 flex w-full min-h-screen">
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

          {/* Global Admin Login Modal */}
          <AdminLoginModal />
        </div>
      </BackendProvider>
    </AuthProvider>
  );
}
