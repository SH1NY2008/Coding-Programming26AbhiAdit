/**
 * Global configuration constants for the application.
 */

export const CONFIG = {
  COUPON_API: {
    KEY: "39de6e3eba52240526d8acdc257f7fd7",
    BASE_URL: "https://couponapi.org/api/getFeed/",
  },
  GEOAPIFY: {
    KEY: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "",
    BASE_URL: "https://api.geoapify.com/v2/places",
    DETAILS_URL: "https://api.geoapify.com/v2/place-details",
    GEOCODE_URL: "https://api.geoapify.com/v1/geocode/search",
    REVERSE_GEOCODE_URL: "https://api.geoapify.com/v1/geocode/reverse",
  },
  FIREBASE: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  },
} as const;
