import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { CONFIG } from "./config";

// Initialize Firebase
const app = !getApps().length ? initializeApp(CONFIG.FIREBASE) : getApp();
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
  
  // Initialize App Check
  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true
      });
      console.log("App Check initialized");
    } catch (e) {
      console.error("Error initializing App Check:", e);
    }
  }
}

export { app, auth, db, realtimeDb, analytics };
