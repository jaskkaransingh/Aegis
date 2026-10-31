"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export function LandingNav() {
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
