/**
 * Geoapify Places API Integration Service
 * 
 * Fetches real business data from Geoapify Places API
 * based on user location. Transforms Geoapify data into our Business format.
 * 
 * @module lib/geoapify
 */

import type { Business } from "./data"

// ============================================================================
// Types
// ============================================================================

interface GeoapifyProperties {
  name?: string
  street?: string
  housenumber?: string
  postcode?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  opening_hours?: string
  categories: string[]
  datasource?: {
    raw?: {
      osm_id?: number
      [key: string]: any
    }
  }
  formatted?: string
  [key: string]: any
}

interface GeoapifyFeature {
  type: "Feature"
  properties: GeoapifyProperties
  geometry: {
    type: "Point"
    coordinates: [number, number] // lon, lat
  }
}

interface GeoapifyResponse {
  type: "FeatureCollection"
  features: GeoapifyFeature[]
}

// ============================================================================
// Constants
// ============================================================================

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ""
const BASE_URL = "https://api.geoapify.com/v2/places"
const DETAILS_URL = "https://api.geoapify.com/v2/place-details"
const GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search"
const REVERSE_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/reverse"

/**
 * Mapping of Geoapify categories to our category system
 */
const CATEGORY_MAP: Record<string, { category: string; subcategory: string }> = {
  // Food & Dining
  "catering.restaurant": { category: "food", subcategory: "Restaurants" },
  "catering.cafe": { category: "food", subcategory: "Cafes" },
  "catering.fast_food": { category: "food", subcategory: "Fast Food" },
  "catering.pub": { category: "food", subcategory: "Restaurants" },
  "catering.bar": { category: "food", subcategory: "Restaurants" },
  "catering.ice_cream": { category: "food", subcategory: "Cafes" },
  
  // Retail
  "commercial.supermarket": { category: "retail", subcategory: "Home Goods" },
  "commercial.shopping_mall": { category: "retail", subcategory: "Shopping Mall" },
  "commercial.clothing": { category: "retail", subcategory: "Clothing" },
  "commercial.electronics": { category: "retail", subcategory: "Electronics" },
  "commercial.gift": { category: "retail", subcategory: "Gifts" },
  "commercial.books": { category: "retail", subcategory: "Books" },
  
  // Services
  "healthcare": { category: "services", subcategory: "Healthcare" },
  "healthcare.doctor": { category: "services", subcategory: "Healthcare" },
  "healthcare.pharmacy": { category: "services", subcategory: "Healthcare" },
  "healthcare.hospital": { category: "services", subcategory: "Healthcare" },
  "healthcare.dentist": { category: "services", subcategory: "Healthcare" },
  "service.vehicle": { category: "services", subcategory: "Automotive" },
  "service.beauty": { category: "services", subcategory: "Beauty & Spa" },
  "service.hairdresser": { category: "services", subcategory: "Beauty & Spa" },
  "service.financial": { category: "services", subcategory: "Financial" },
  
  // Entertainment
  "entertainment": { category: "entertainment", subcategory: "Recreation" },
  "entertainment.cinema": { category: "entertainment", subcategory: "Movies" },
  "entertainment.culture.theatre": { category: "entertainment", subcategory: "Live Music" },
  "entertainment.museum": { category: "entertainment", subcategory: "Arts & Crafts" },
  "leisure.park": { category: "entertainment", subcategory: "Recreation" },
  "sport.fitness": { category: "entertainment", subcategory: "Fitness" },
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Fetches nearby businesses from Geoapify
 * @param lat - Latitude
 * @param lon - Longitude
 * @param radius - Search radius in meters
 * @returns Array of mapped businesses
 */
export async function fetchNearbyBusinesses(
  lat: number,
  lon: number,
  radius: number = 2000
): Promise<Business[]> {
  if (!API_KEY) {
    console.warn("Geoapify API key not found")
    return []
  }

  // Categories to search for (comma-separated)
  const categories = Object.keys(CATEGORY_MAP).join(",")
  
  const url = `${BASE_URL}?categories=${categories}&filter=circle:${lon},${lat},${radius}&limit=30&apiKey=${API_KEY}`
  
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.statusText}`)
    }
    
    const data: GeoapifyResponse = await response.json()
    return data.features.map(transformGeoapifyToBusiness)
  } catch (error) {
    console.error("Error fetching businesses from Geoapify:", error)
    throw error
  }
}

/**
 * Transforms a Geoapify feature into our Business format
 */
function transformGeoapifyToBusiness(feature: GeoapifyFeature): Business {
  const props = feature.properties
  
  // Determine category and subcategory
  let category = "services"
  let subcategory = "Other"
  
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (props.categories.includes(key)) {
      category = value.category
      subcategory = value.subcategory
      break
    }
  }
  
  // Construct hours object if available
  // Geoapify returns hours string like "Mo-Fr 08:00-18:00; Sa 09:00-17:00"
  // This is a simplified parser - a real one would be more complex
  const hours: Record<string, any> = {
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { open: "10:00", close: "15:00" },
    sunday: null
  }
  
  return {
    id: `geoapify-${props.place_id || Math.random().toString(36).substr(2, 9)}`,
    name: props.name || props.formatted?.split(",")[0] || "Unknown Business",
    description: props.description || `A local ${subcategory} business in ${props.city || "your area"}.`,
    category,
    subcategory,
    address: `${props.housenumber || ""} ${props.street || ""}`.trim() || props.formatted?.split(",")[0] || "",
    city: props.city || "",
    state: props.state || "",
    zipCode: props.postcode || "",
    phone: props.phone || "",
    email: props.email || "",
    website: props.website || "",
    imageUrl: `https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=80`, // Placeholder
    hours,
    priceLevel: 2, // Default
    averageRating: 0, // Geoapify doesn't provide ratings in standard tier
    totalReviews: 0,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    tags: props.categories.map(c => c.split(".").pop() || "").filter(Boolean),
    createdAt: new Date().toISOString()
  }
}

/**
 * Reverse geocodes coordinates to address details
 * @param lat - Latitude
 * @param lon - Longitude
 */
export async function reverseGeocode(lat: number, lon: number) {
  if (!API_KEY) return null
  
  const url = `${REVERSE_GEOCODE_URL}?lat=${lat}&lon=${lon}&apiKey=${API_KEY}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data: GeoapifyResponse = await response.json()
    if (data.features.length > 0) {
      return data.features[0]
    }
    return null
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return null
  }
}

/**
 * Fetches detailed information for a specific place by ID
 * @param placeId - The Geoapify place ID
 * @returns Mapped business object or null if not found
 */
export async function fetchPlaceDetails(placeId: string): Promise<Business | null> {
  if (!API_KEY) {
    console.warn("Geoapify API key not found")
    return null
  }

  const url = `${DETAILS_URL}?id=${placeId}&apiKey=${API_KEY}`

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error(`Geoapify API error: ${response.statusText}`)
      return null
    }
    
    const data: GeoapifyResponse = await response.json()
    
    if (data.features && data.features.length > 0) {
      return transformGeoapifyToBusiness(data.features[0])
    }
    
    return null
  } catch (error) {
    console.error("Error fetching place details from Geoapify:", error)
    return null
  }
}

/**
 * Geocodes an address string to coordinates
 * @param query - Address or place name
 */
export async function forwardGeocode(query: string) {
  if (!API_KEY) return null
  
  const encodedQuery = encodeURIComponent(query)
  const url = `${GEOCODE_URL}?text=${encodedQuery}&apiKey=${API_KEY}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data: GeoapifyResponse = await response.json()
    if (data.features.length > 0) {
      const feature = data.features[0]
      return {
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        displayName: feature.properties.formatted || feature.properties.name
      }
    }
    return null
  } catch (error) {
    console.error("Forward geocoding error:", error)
    return null
  }
}
