"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { GoogleLogo } from "@/components/ui/tech-logos";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    adminProfile,
    isAdmin,
    loginWithEmail,
    loginWithGoogle,
    logout,
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
      router.push("/command-center");
    } catch {
      // Error in context
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      router.push("/command-center");
    } catch {
      // Error in context
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-black/55 backdrop-blur-md p-7 sm:p-9 shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] space-y-6 text-[#f8fafc]">
        {/* Back Link */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </Link>
          <span className="font-mono text-xs text-white/50 tracking-wider">
            SECURE PORTAL
          </span>
        </div>

        {/* Header with increased font sizes */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-white/10 border border-white/20 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
              {isAdmin ? "Admin Session Active" : "Admin Authentication"}
            </h1>
          </div>
          <p className="text-sm text-slate-300 font-sans leading-relaxed">
            {isAdmin
              ? "Your session is cleared with Level-5 forensic permissions."
              : "Sign in with administrator credentials to manage incident investigations."}
          </p>
        </div>

        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/15 space-y-2">
              <div className="text-xs font-mono uppercase text-slate-400">Active Identity</div>
              <div className="font-mono font-bold text-white text-base">
                {adminProfile?.displayName || user?.email}
              </div>
              <div className="text-xs font-mono text-white/80">
                ROLE: {adminProfile?.role}
              </div>
              <div className="text-xs font-mono text-slate-400">
                Clearance: {adminProfile?.enclaveAccess}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/command-center"
                className="py-3 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm uppercase text-center transition-colors shadow-sm"
              >
                Command Center
              </Link>
              <button
                type="button"
                onClick={logout}
                className="py-3 px-4 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-[#ef4444] font-mono font-bold text-sm uppercase transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Error Alert Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0 mt-0.5" />
                <div className="flex-1 font-mono">{error}</div>
              </div>
            )}

            {/* Form */}
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

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/15 w-full" />
              <span className="bg-black/80 px-3 font-mono text-xs text-slate-400 uppercase">
                Or Authenticate With
              </span>
              <div className="border-t border-white/15 w-full" />
            </div>

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
          </>
        )}

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Confidential Workstation</span>
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
