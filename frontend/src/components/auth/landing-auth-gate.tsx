"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogo } from "@/components/ui/tech-logos";

export function LandingAuthGate() {
  const {
    loginWithEmail,
    loginWithGoogle,
    isLoading,
    error,
  } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await loginWithEmail(email, password);
    } catch {
      // Handled in context
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/25 backdrop-blur-[3px] animate-in fade-in duration-300">
      {/* Semi-Transparent Glassmorphism Login Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black/50 backdrop-blur-md p-7 sm:p-9 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-6 text-[#f8fafc]">
        {/* Top Branding Strip - Clean monochrome, no green, no firebase text */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-mono font-bold tracking-wider text-sm text-white">
              AEGIS // ADMIN ACCESS
            </span>
          </div>
          <span className="font-mono text-xs text-white/50 tracking-wider">
            SECURE PORTAL
          </span>
        </div>

        {/* Title & Description with Increased Font Size */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            Admin Authentication
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-sans">
            Sign in with authorized administrator credentials to access the incident investigation workstation.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
            <div className="flex-1 font-mono">{error}</div>
          </div>
        )}

        {/* Login Form with Increased Font Size & Comfortable Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase font-semibold">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aegis.enclave"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/20 focus:border-white text-sm font-mono text-white placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-mono text-slate-200 uppercase font-semibold">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-xl bg-black/60 border border-white/20 focus:border-white text-sm font-mono text-white placeholder:text-slate-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit Action - Larger Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-50 text-black font-mono font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>Sign In to Enclave</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/15 w-full" />
          <span className="bg-black/80 px-3 font-mono text-xs text-slate-400 uppercase">
            Or Authenticate With
          </span>
          <div className="border-t border-white/15 w-full" />
        </div>

        {/* Google Sign In - Clean monochrome, no green, no instant text */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-white/20 bg-black/50 hover:bg-white/10 text-sm font-mono text-white flex items-center justify-center gap-3 transition-colors"
          >
            <GoogleLogo className="w-4 h-4" />
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Security Strip - Clean, monochrome, no green, no firebase text */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Confidential Workstation</span>
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
