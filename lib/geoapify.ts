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
  
  // Education
  "education": { category: "education", subcategory: "Tutoring" },
  "education.school": { category: "education", subcategory: "Tutoring" },
  "education.library": { category: "education", subcategory: "Tutoring" },
}

/**
 * Stock images for different business categories
 */
const CATEGORY_IMAGES: Record<string, string[]> = {
  food: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop",
  ],
  retail: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=600&fit=crop",
  ],
  services: [
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
  ],
  entertainment: [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
  ],
  education: [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

function isValidCoordinate(lat: number, lon: number): boolean {
  return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

/**
 * Generates a deterministic rating between 3.5 and 5.0 based on string input
 */
function generateRating(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  const normalize = (Math.abs(hash) % 15) + 35 // 35-49
  return normalize / 10
}

/**
 * Generates deterministic review count
 */
function generateReviewCount(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash |= 0
  }
  return (Math.abs(hash) % 400) + 10
}

/**
 * Gets a category-appropriate image
 */
function getCategoryImage(category: string): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.retail
  return images[Math.floor(Math.random() * images.length)]
}

/**
 * Determines category from Geoapify categories
 */
function getCategoryFromTags(categories: string[]): { category: string; subcategory: string } {
  if (!categories || categories.length === 0) return { category: "services", subcategory: "Home Services" }
  
  for (const cat of categories) {
    if (CATEGORY_MAP[cat]) {
      return CATEGORY_MAP[cat]
    }
    // Check for partial match (e.g. catering.restaurant.italian -> catering.restaurant)
    const parts = cat.split('.')
    while (parts.length > 0) {
      const key = parts.join('.')
      if (CATEGORY_MAP[key]) {
        return CATEGORY_MAP[key]
      }
      parts.pop()
    }
  }
  
  // Default fallback
  return { category: "services", subcategory: "Home Services" }
}

/**
 * Generates business description
 */
function generateDescription(props: GeoapifyProperties, categoryInfo: { category: string; subcategory: string }): string {
  const parts: string[] = []
  
  if (props.formatted) {
    parts.push(`Located at ${props.formatted}.`)
  }
  
  if (props.website) {
    parts.push(`Visit our website for more information.`)
  }
  
  if (parts.length === 0 || parts.length < 2) {
    const descriptions: Record<string, string[]> = {
      food: [
        "A local favorite serving quality food in a welcoming atmosphere.",
        "Bringing delicious flavors to the community with every dish.",
        "Where great food meets friendly service.",
      ],
      retail: [
        "Your neighborhood destination for quality products.",
        "Curated selection of products for every need.",
        "Shopping made easy with great selection and service.",
      ],
      services: [
        "Professional services delivered with care and expertise.",
        "Trusted by the community for reliable service.",
        "Quality service you can count on.",
      ],
      entertainment: [
        "Creating memorable experiences for everyone.",
        "Your go-to spot for fun and entertainment.",
        "Where good times happen.",
      ],
      education: [
        "Empowering learners to achieve their goals.",
        "Quality education in a supportive environment.",
        "Helping you reach your full potential.",
      ],
    }
    
    const categoryDescs = descriptions[categoryInfo.category] || descriptions.services
    parts.push(categoryDescs[Math.floor(Math.random() * categoryDescs.length)])
  }
  
  return parts.join(" ")
}

/**
 * Generates default business hours
 */
function generateDefaultHours(): Business["hours"] {
  return {
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { open: "10:00", close: "16:00" },
    sunday: null,
  }
}

/**
 * Generates tags from properties
 */
function generateTags(props: GeoapifyProperties, categoryInfo: { category: string; subcategory: string }): string[] {
  const result: string[] = [categoryInfo.subcategory]
  
  // Add category-specific tags
  const categoryTags: Record<string, string[]> = {
    food: ["Local Favorite", "Dine-in", "Takeout"],
    retail: ["Local Shop", "Quality Products"],
    services: ["Professional", "Trusted"],
    entertainment: ["Family Friendly", "Fun"],
    education: ["Learning", "Skill Building"],
  }
  
  const extras = categoryTags[categoryInfo.category] || []
  result.push(extras[Math.floor(Math.random() * extras.length)])
  
  if (props.categories) {
      props.categories.forEach(cat => {
          const parts = cat.split('.');
          if (parts.length > 1) {
              result.push(parts[parts.length - 1].replace(/_/g, ' '));
          }
      });
  }

  return [...new Set(result)].slice(0, 4)
}

/**
 * Transforms Geoapify feature to Business object
 */
function transformFeatureToBusiness(feature: GeoapifyFeature, index: number = 0): Business {
  const props = feature.properties
  const categoryInfo = getCategoryFromTags(props.categories || [])
  const [lon, lat] = feature.geometry.coordinates
  
  const address = props.formatted || 
                 `${props.housenumber || ''} ${props.street || ''}`.trim() || 
                 "Address unavailable"

  return {
    id: `geoapify-${props.place_id || index}`,
    name: props.name || "Local Business",
    description: generateDescription(props, categoryInfo),
    category: categoryInfo.category,
    subcategory: categoryInfo.subcategory,
    address,
    city: props.city || "Nearby",
    state: props.state || "",
    zipCode: props.postcode || "",
    phone: props.phone || "",
    email: props.email || "",
    website: props.website || "",
    imageUrl: getCategoryImage(categoryInfo.category),
    hours: generateDefaultHours(), // Geoapify opening_hours format is complex, using default for now
    priceLevel: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 | 4,
    averageRating: generateRating(props.place_id || props.name || "default"),
    totalReviews: generateReviewCount(props.place_id || props.name || "default"),
    isOpen: true,
    latitude: lat,
    longitude: lon,
    tags: generateTags(props, categoryInfo),
    createdAt: new Date().toISOString(),
  }
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Fetches businesses from Geoapify within a radius of the given location
 * 
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusMeters - Search radius in meters (default 2000m)
 * @returns Array of Business objects
 */
export async function fetchNearbyBusinesses(
  latitude: number,
  longitude: number,
  radiusMeters: number = 2000
): Promise<Business[]> {
  
  const categories = [
      "catering",
      "commercial.supermarket",
      "commercial.shopping_mall",
      "commercial.clothing",
      "commercial.electronics",
      "commercial.gift",
      "commercial.books",
      "healthcare",
      "service.beauty",
      "service.vehicle",
      "entertainment",
      "education",
      "leisure",
      "tourism"
  ].join(",");

  const url = `${BASE_URL}?categories=${categories}&filter=circle:${longitude},${latitude},${radiusMeters}&limit=50&apiKey=${API_KEY}`;

  console.log("Fetching Geoapify with URL:", url.replace(API_KEY, "HIDDEN_KEY"));
  console.log("Params:", { latitude, longitude, radiusMeters });

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`)
    }

    const data: GeoapifyResponse = await response.json()
    
    // Transform Geoapify features to Business objects
    const businesses: Business[] = data.features
      .map((feature, index) => transformFeatureToBusiness(feature, index))
      .filter(b => b.name !== "Local Business") // Filter out unnamed businesses if possible, though "Local Business" is our fallback

    return businesses
  } catch (error) {
    console.error("Error fetching from Geoapify:", error)
    throw error
  }
}

/**
 * Fetches details for a specific place by ID
 * 
 * @param placeId - The Geoapify place_id
 * @returns Business object or null if not found
 */
export async function fetchPlaceDetails(placeId: string): Promise<Business | null> {
  const url = `${DETAILS_URL}?id=${placeId}&apiKey=${API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`)
    }

    const data: GeoapifyResponse = await response.json()
    
    if (!data.features || data.features.length === 0) {
      return null
    }

    return transformFeatureToBusiness(data.features[0])
  } catch (error) {
    console.error("Error fetching place details from Geoapify:", error)
    return null
  }
}


/**
 * Geocodes a free-form text address
 * 
 * @param text - Address text to search for
 * @returns Array of GeoapifyFeature objects
 */
export async function geocode(text: string): Promise<GeoapifyFeature[]> {
  const url = `${GEOCODE_URL}?text=${encodeURIComponent(text)}&apiKey=${API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`)
    }

    const data: GeoapifyResponse = await response.json()
    return data.features
  } catch (error) {
    console.error("Error geocoding address:", error)
    return []
  }
}

/**
 * Reverse geocodes coordinates to an address
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns GeoapifyFeature or null if not found
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeoapifyFeature | null> {
  const url = `${REVERSE_GEOCODE_URL}?lat=${lat}&lon=${lon}&apiKey=${API_KEY}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Geoapify API error: ${response.status}`)
    }

    const data: GeoapifyResponse = await response.json()
    
    if (!data.features || data.features.length === 0) {
      return null
    }

    return data.features[0]
  } catch (error) {
    console.error("Error reverse geocoding coordinates:", error)
    return null
  }
}

