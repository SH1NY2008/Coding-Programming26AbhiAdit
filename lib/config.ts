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
} as const;
