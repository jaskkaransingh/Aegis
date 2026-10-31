import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BackendProvider } from "@/lib/backend-context";

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
    <html lang="en" className="dark">
      <body className="bg-[#07090e] text-slate-100 flex min-h-screen antialiased selection:bg-violet-900 selection:text-violet-100">
        <BackendProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </BackendProvider>
      </body>
    </html>
  );
}
