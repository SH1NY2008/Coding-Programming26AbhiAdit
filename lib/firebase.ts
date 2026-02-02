import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAufYb_3y45jljQLIgeauVIAKtYEtGZqsw",
  authDomain: "coding-programming26.firebaseapp.com",
  projectId: "coding-programming26",
  storageBucket: "coding-programming26.firebasestorage.app",
  messagingSenderId: "104352134515",
  appId: "1:104352134515:web:9b7bf25aedf019eae00106",
  measurementId: "G-H30Y1J46KN"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with offline persistence (client-side only)
let db;
if (typeof window !== "undefined") {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    // If already initialized, use existing instance
    db = getFirestore(app);
  }
} else {
  db = getFirestore(app);
}

const realtimeDb = getDatabase(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, realtimeDb, analytics };
