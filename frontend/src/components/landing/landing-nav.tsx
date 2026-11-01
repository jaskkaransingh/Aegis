"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function LandingNav() {
  const { isAdmin, adminProfile, user, openLoginModal, logout } = useAuth();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-transparent border-none px-6 lg:px-14 flex items-center justify-between pointer-events-none">
      {/* Brand Wordmark (Left) */}
      <Link href="/" className="pointer-events-auto flex items-center gap-2.5 group">
        <div className="h-7 w-7 rounded-md bg-white/5 border border-white/15 flex items-center justify-center text-white shadow-sm group-hover:border-white/30 transition">
          <Shield className="h-4 w-4" />
        </div>
        <span className="font-mono font-bold text-sm tracking-wider text-white">
          AEGIS
        </span>
      </Link>

      {/* Nav Links (Center) */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-8 text-xs font-normal text-white/70">
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="hover:text-white transition-colors"
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("detect")}
          className="hover:text-white transition-colors"
        >
          Detect
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("connect")}
          className="hover:text-white transition-colors"
        >
          Connect
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("investigate")}
          className="hover:text-white transition-colors"
        >
          Investigate
        </button>
        <button
          type="button"
          onClick={() => scrollToSection("explain")}
          className="hover:text-white transition-colors"
        >
          Explain
        </button>
        <Link
          href="/reports"
          className="hover:text-white transition-colors"
        >
          Reports
        </Link>
      </nav>

      {/* Action Button (Right) */}
      <div className="pointer-events-auto flex items-center gap-3">
        {isAdmin ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-[#22c55e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-semibold text-[11px] truncate max-w-[120px]">
              {adminProfile?.displayName || user?.email?.split("@")[0] || "ADMIN"}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              className="text-white/40 hover:text-red-400 ml-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="hidden sm:flex px-3.5 py-1.5 rounded-full text-xs font-mono text-white/80 hover:text-white border border-white/15 bg-black/40 hover:bg-white/10 transition-all items-center gap-1.5"
          >
            <Lock className="w-3 h-3 text-white/60" />
            <span>ADMIN LOGIN</span>
          </button>
        )}

        <Link
          href="/command-center"
          className="px-4 py-1.5 rounded-full text-xs font-mono text-white/90 border border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 transition-all flex items-center gap-1.5 group"
        >
          <span>GET STARTED</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </header>
  );
}
