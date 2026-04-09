/**
 * OpenStreetMap Integration Service
 * 
 * Fetches real business data from OpenStreetMap's Overpass API
 * based on user location. Transforms OSM data into our Business format.
 * 
 * @module lib/openstreetmap
 */

import type { Business } from "./data"

// ============================================================================
// Types
// ============================================================================

interface OSMElement {
  type: "node" | "way" | "relation"
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: {
    name?: string
    amenity?: string
    shop?: string
    tourism?: string
    leisure?: string
    office?: string
    craft?: string
    healthcare?: string
    "addr:street"?: string
    "addr:housenumber"?: string
    "addr:city"?: string
    "addr:state"?: string
    "addr:postcode"?: string
    phone?: string
    email?: string
    website?: string
    description?: string
    cuisine?: string
    opening_hours?: string
    brand?: string
    operator?: string
    [key: string]: string | undefined
  }
}

interface OverpassResponse {
  elements: OSMElement[]
}

// ============================================================================
// Constants
// ============================================================================

const OVERPASS_API = "https://overpass-api.de/api/interpreter"

/**
 * Mapping of OSM tags to our category system
 */
const CATEGORY_MAP: Record<string, { category: string }> = {
  // Food & Dining
  restaurant: { category: "food" },
  cafe: { category: "food" },
  bakery: { category: "food" },
  fast_food: { category: "food" },
  bar: { category: "food" },
  pub: { category: "food" },
  ice_cream: { category: "food" },
  food_court: { category: "food" },
  
  // Retail
  clothes: { category: "retail" },
  shoes: { category: "retail" },
  electronics: { category: "retail" },
  books: { category: "retail" },
  gift: { category: "retail" },
  furniture: { category: "retail" },
  sports: { category: "retail" },
  toys: { category: "retail" },
  jewelry: { category: "retail" },
  florist: { category: "retail" },
  convenience: { category: "retail" },
  supermarket: { category: "retail" },
  hardware: { category: "retail" },
  department_store: { category: "retail" },
  mobile_phone: { category: "retail" },
  computer: { category: "retail" },
  
  // Services
  doctors: { category: "services" },
  dentist: { category: "services" },
  pharmacy: { category: "services" },
  hospital: { category: "services" },
  clinic: { category: "services" },
  veterinary: { category: "services" },
  car_repair: { category: "services" },
  car_wash: { category: "services" },
  fuel: { category: "services" },
  hairdresser: { category: "services" },
  beauty: { category: "services" },
  spa: { category: "services" },
  tattoo: { category: "services" },
  massage: { category: "services" },
  bank: { category: "services" },
  lawyer: { category: "services" },
  insurance: { category: "services" },
  estate_agent: { category: "services" },
  accountant: { category: "services" },
  
  // Entertainment
  cinema: { category: "entertainment" },
  theatre: { category: "entertainment" },
  nightclub: { category: "entertainment" },
  casino: { category: "entertainment" },
  arts_centre: { category: "entertainment" },
  gallery: { category: "entertainment" },
  museum: { category: "entertainment" },
  fitness_centre: { category: "entertainment" },
  gym: { category: "entertainment" },
  swimming_pool: { category: "entertainment" },
  bowling_alley: { category: "entertainment" },
  amusement_arcade: { category: "entertainment" },
  
  // Education
  school: { category: "education" },
  driving_school: { category: "education" },
  language_school: { category: "education" },
  music_school: { category: "education" },
  dance: { category: "education" },
  dojo: { category: "education" },
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

/**
 * Generates a random rating between 3.0 and 5.0
 */
function generateRating(): number {
  return Math.round((3 + Math.random() * 2) * 10) / 10
}

/**
 * Generates random review count
 */
function generateReviewCount(): number {
  return Math.floor(Math.random() * 200) + 5
}

/**
 * Gets a category-appropriate image
 */
function getCategoryImage(category: string): string {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.retail
  return images[Math.floor(Math.random() * images.length)]
}

/**
 * Determines category from OSM tags
 */
function getCategoryFromTags(tags: OSMElement["tags"]): string {
  if (!tags) return "services"
  
  // Check amenity tag first
  if (tags.amenity && CATEGORY_MAP[tags.amenity]) {
    return CATEGORY_MAP[tags.amenity].category
  }
  
  // Check shop tag
  if (tags.shop && CATEGORY_MAP[tags.shop]) {
    return CATEGORY_MAP[tags.shop].category
  }
  
  // Check leisure tag
  if (tags.leisure && CATEGORY_MAP[tags.leisure]) {
    return CATEGORY_MAP[tags.leisure].category
  }
  
  // Check healthcare tag
  if (tags.healthcare && CATEGORY_MAP[tags.healthcare]) {
    return CATEGORY_MAP[tags.healthcare].category
  }
  
  // Check tourism tag
  if (tags.tourism && CATEGORY_MAP[tags.tourism]) {
    return CATEGORY_MAP[tags.tourism].category
  }
  
  // Check craft tag
  if (tags.craft) {
    return "services"
  }
  
  // Check office tag
  if (tags.office) {
    return "services"
  }
  
  // Default fallback
  return "services"
}

/**
 * Generates business description from tags
 */
function generateDescription(tags: OSMElement["tags"], category: string): string {
  const parts: string[] = []
  
  if (tags?.cuisine) {
    parts.push(`Serving delicious ${tags.cuisine.replace(/;/g, ", ")} cuisine.`)
  }
  
  if (tags?.brand) {
    parts.push(`Part of the ${tags.brand} family.`)
  }
  
  if (tags?.description) {
    parts.push(tags.description)
  }
  
  if (parts.length === 0) {
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
    
    const categoryDescs = descriptions[category] || descriptions.services
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
 * Generates tags from OSM data
 */
function generateTags(tags: OSMElement["tags"], category: string): string[] {
  const result: string[] = []
  
  if (tags?.cuisine) {
    result.push(...tags.cuisine.split(";").slice(0, 2).map(c => c.trim()))
  }
  
  if (tags?.brand) {
    result.push(tags.brand)
  }
  
  // Add category-specific tags
  const categoryTags: Record<string, string[]> = {
    food: ["Local Favorite", "Dine-in", "Takeout"],
    retail: ["Local Shop", "Quality Products"],
    services: ["Professional", "Trusted"],
    entertainment: ["Family Friendly", "Fun"],
    education: ["Learning", "Skill Building"],
  }
  
  const extras = categoryTags[category] || []
  result.push(extras[Math.floor(Math.random() * extras.length)])
  
  return [...new Set(result)].slice(0, 4)
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Fetches businesses from OpenStreetMap within a radius of the given location
 * 
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radiusMeters - Search radius in meters (default 2000m = ~1.2 miles)
 * @returns Array of Business objects
 */
export async function fetchNearbyBusinesses(
  latitude: number,
  longitude: number,
  radiusMeters: number = 2000
): Promise<Business[]> {
  // Overpass QL query to find businesses
  const query = `
    [out:json][timeout:25];
    (
      node["name"]["amenity"~"restaurant|cafe|pharmacy|bank"](around:${radiusMeters},${latitude},${longitude});
      node["name"]["shop"](around:${radiusMeters},${latitude},${longitude});
      way["name"]["amenity"~"restaurant|cafe|pharmacy|bank"](around:${radiusMeters},${latitude},${longitude});
      way["name"]["shop"](around:${radiusMeters},${latitude},${longitude});
    );
    out center;
  `

  try {
    const response = await fetch(OVERPASS_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data: OverpassResponse = await response.json()
    
    // Transform OSM elements to Business objects
    const businesses: Business[] = data.elements
      .filter((el) => el.tags?.name) // Only include named businesses
      .map((el, index) => {
        const tags = el.tags || {}
        const category = getCategoryFromTags(tags)
        const lat = el.lat ?? el.center?.lat ?? latitude
        const lon = el.lon ?? el.center?.lon ?? longitude
        
        // Build address
        const addressParts: string[] = []
        if (tags["addr:housenumber"]) addressParts.push(tags["addr:housenumber"])
        if (tags["addr:street"]) addressParts.push(tags["addr:street"])
        const address = addressParts.length > 0 
          ? addressParts.join(" ") 
          : `${Math.floor(Math.random() * 999) + 1} Local Street`

        return {
          id: `osm-${el.id}`,
          name: tags.name || "Local Business",
          description: generateDescription(tags, category),
          category: category,
          address,
          city: tags["addr:city"] || "Nearby",
          state: tags["addr:state"] || "",
          zipCode: tags["addr:postcode"] || "",
          phone: tags.phone || "",
          email: tags.email || "",
          website: tags.website || "",
          imageUrl: getCategoryImage(category),
          hours: generateDefaultHours(),
          priceLevel: (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 | 4,
          averageRating: generateRating(),
          totalReviews: generateReviewCount(),
          isOpen: true,
          latitude: lat,
          longitude: lon,
          tags: generateTags(tags, category),
          createdAt: new Date().toISOString(),
        }
      })
      .slice(0, 100) // Limit to 100 businesses

    return businesses
  } catch (error) {
    console.error("Error fetching from OpenStreetMap:", error)
    throw error
  }
}

/**
 * Performs reverse geocoding to get location name from coordinates
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Location name object with city and state
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; state: string; displayName: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      {
        headers: {
          "User-Agent": "ByteSizedBusinessBoost/1.0",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      city: data.address?.city || data.address?.town || data.address?.village || "Your Area",
      state: data.address?.state || "",
      displayName: data.display_name || "Your Location",
    }
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return {
      city: "Your Area",
      state: "",
      displayName: "Your Location",
    }
  }
}

/**
 * Calculates distance between two coordinates in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}
