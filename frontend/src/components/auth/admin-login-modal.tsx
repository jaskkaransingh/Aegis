"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  KeyRound,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogo } from "@/components/ui/tech-logos";

export function AdminLoginModal() {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginWithEmail,
    loginWithGoogle,
    isLoading,
    error,
  } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await loginWithEmail(email, password);
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch {
      // Error handled in AuthContext
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-[5px] animate-in fade-in duration-200">
      {/* Semi-Transparent Frosted Glass Card */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-black/55 backdrop-blur-md p-7 sm:p-9 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-6 text-[#f8fafc]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-white/10 border border-white/20 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-white/70 font-semibold">
              AEGIS // ADMIN ACCESS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            Admin Authentication
          </h2>
          <p className="text-sm text-slate-300 font-sans leading-relaxed">
            Authorized sign in grants Level-5 telemetry inspection, counterfactual overrides, and incident reports.
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
            <div className="flex-1 font-mono">{error}</div>
          </div>
        )}

        {/* Email & Password Form */}
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

          {/* Submit Button */}
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

        {/* Google Sign In */}
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

        {/* Security Footer Note */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Confidential Workstation</span>
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
