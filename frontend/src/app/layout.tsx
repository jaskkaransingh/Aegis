import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "AEGIS — Autonomous Evidence-Grounded Investigation System",
  description:
    "AI-powered incident investigation workstation for critical public infrastructure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#07090f] text-[#f1f4fb] flex min-h-screen antialiased selection:bg-[#9875ff]/30 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
