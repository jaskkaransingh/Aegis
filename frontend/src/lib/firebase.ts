/**
 * AEGIS Firebase Configuration & SDK Initialization.
 * Configured with project: aegis-55c77
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCgWlNHpAuYARYY3bSfrR1FBy_WCEVvXrY",
  authDomain: "aegis-55c77.firebaseapp.com",
  databaseURL: "https://aegis-55c77-default-rtdb.firebaseio.com",
  projectId: "aegis-55c77",
  storageBucket: "aegis-55c77.firebasestorage.app",
  messagingSenderId: "67166391961",
  appId: "1:67166391961:web:5791136885043a82f9f208",
  measurementId: "G-H2WL2VTGC3",
};

// Next.js SSR-safe Firebase App singleton
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
export const auth: Auth = getAuth(app);
export const rtdb: Database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

