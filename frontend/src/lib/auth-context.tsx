"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

export interface AdminProfile {
  email: string | null;
  displayName: string | null;
  uid: string;
  role: "SEC-OPS LEAD" | "INCIDENT COMMANDER" | "PLATFORM SRE";
  enclaveAccess: string;
  isDemoAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: (role?: AdminProfile["role"]) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [demoAdmin, setDemoAdmin] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Synchronize Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          setDemoAdmin(null); // Clear mock if real user signed in
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Firebase auth state change error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const openLoginModal = useCallback(() => {
    setError(null);
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      console.error("Firebase login error:", err);
      // Clean up common Firebase error codes into readable text
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid admin credentials. Check your email & password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Access temporarily throttled due to multiple failed attempts. Try again in 60s.");
      } else {
        setError(err.message || "Failed to authenticate with Firebase.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      console.error("Firebase registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An admin account with this email already exists. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Failed to create admin credential.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoginModalOpen(false);
    } catch (err: any) {
      console.error("Firebase Google login error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google Authentication failed.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Instant one-click Admin credential for evaluation & incident drills
  const loginAsDemoAdmin = (role: AdminProfile["role"] = "INCIDENT COMMANDER") => {
    const mockAdmin: AdminProfile = {
      uid: "aegis-sec-admin-01",
      email: "commander@aegis.enclave.internal",
      displayName: "Jaskaran (Incident Commander)",
      role,
      enclaveAccess: "LEVEL-5 FORENSIC READ/WRITE",
      isDemoAdmin: true,
    };
    setDemoAdmin(mockAdmin);
    setIsLoginModalOpen(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (user) {
        await fbSignOut(auth);
      }
      setDemoAdmin(null);
      setUser(null);
      router.push("/");
    } catch (err: any) {
      console.error("Firebase sign out error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Build current active admin profile
  const adminProfile: AdminProfile | null = user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "AEGIS Administrator",
        role: "INCIDENT COMMANDER",
        enclaveAccess: "LEVEL-5 FORENSIC READ/WRITE",
        isDemoAdmin: false,
      }
    : demoAdmin;

  const isAdmin = Boolean(user || demoAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        isAdmin,
        isLoading,
        error,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDemoAdmin,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

