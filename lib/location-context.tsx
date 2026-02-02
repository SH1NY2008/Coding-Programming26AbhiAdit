"use client"

/**
 * Location Context Provider
 * 
 * Manages user location state and fetches nearby businesses from OpenStreetMap.
 * Combines Browser Geolocation API with OSM Overpass API.
 * 
 * @module lib/location-context
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useGeolocation, DEFAULT_LOCATION } from "@/hooks/use-geolocation"
import {
  fetchNearbyBusinesses as fetchOSMBusinesses,
  reverseGeocode as reverseGeocodeOSM,
  calculateDistance,
} from "./openstreetmap"
import { 
  fetchNearbyBusinesses as fetchGeoapifyBusinesses,
  reverseGeocode as reverseGeocodeGeoapify 
} from "./geoapify"
import type { Business } from "./data"

// ============================================================================
// Types
// ============================================================================

interface LocationInfo {
  city: string
  state: string
  displayName: string
}

interface LocationContextValue {
  // Location state
  latitude: number | null
  longitude: number | null
  locationInfo: LocationInfo | null
  locationError: string | null
  isLoadingLocation: boolean
  
  // Business state
  osmBusinesses: Business[]
  isLoadingBusinesses: boolean
  businessError: string | null
  
  // Search radius
  searchRadius: number
  setSearchRadius: (radius: number) => void
  
  // Actions
  refreshLocation: () => void
  refreshBusinesses: () => void
  
  // Utility
  getDistanceFromUser: (lat: number, lon: number) => number | null
  
  // Permission
  permissionState: PermissionState | null
  useManualLocation: (lat: number, lon: number) => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const geo = useGeolocation()
  
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)
  const [osmBusinesses, setOsmBusinesses] = useState<Business[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false)
  const [businessError, setBusinessError] = useState<string | null>(null)
  const [searchRadius, setSearchRadius] = useState(2000) // meters
  const [manualLocation, setManualLocation] = useState<{ lat: number; lon: number } | null>(null)
  
  // Effective coordinates (manual or from geolocation)
  const effectiveLat = manualLocation?.lat ?? geo.latitude
  const effectiveLon = manualLocation?.lon ?? geo.longitude

  /**
   * Fetches location name via reverse geocoding
   */
  const fetchLocationInfo = useCallback(async (lat: number, lon: number) => {
    try {
      // Try Geoapify first
      const geoapifyResult = await reverseGeocodeGeoapify(lat, lon)
      if (geoapifyResult) {
        const props = geoapifyResult.properties
        setLocationInfo({
          city: props.city || props.town || props.village || "Your Area",
          state: props.state || "",
          displayName: props.formatted || "Your Location",
        })
        return
      }

      // Fallback to OSM
      const info = await reverseGeocodeOSM(lat, lon)
      setLocationInfo(info)
    } catch {
      setLocationInfo({
        city: "Your Area",
        state: "",
        displayName: "Your Location",
      })
    }
  }, [])

  /**
   * Fetches nearby businesses from Geoapify (with OSM fallback)
   */
  const fetchBusinesses = useCallback(async (lat: number, lon: number, radius: number) => {
    setIsLoadingBusinesses(true)
    setBusinessError(null)
    
    try {
      // Try Geoapify first
      try {
        const businesses = await fetchGeoapifyBusinesses(lat, lon, radius)
        setOsmBusinesses(businesses)
      } catch (geoapifyError) {
        console.warn("Geoapify failed, falling back to OSM:", geoapifyError)
        // Fallback to OSM
        const businesses = await fetchOSMBusinesses(lat, lon, radius)
        setOsmBusinesses(businesses)
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error)
      setBusinessError("Unable to load nearby businesses. Please try again.")
      setOsmBusinesses([])
    } finally {
      setIsLoadingBusinesses(false)
    }
  }, [])

  /**
   * Refreshes businesses with current location and radius
   */
  const refreshBusinesses = useCallback(() => {
    if (effectiveLat !== null && effectiveLon !== null) {
      fetchBusinesses(effectiveLat, effectiveLon, searchRadius)
    }
  }, [effectiveLat, effectiveLon, searchRadius, fetchBusinesses])

  /**
   * Uses manual coordinates instead of geolocation
   */
  const useManualLocation = useCallback((lat: number, lon: number) => {
    setManualLocation({ lat, lon })
  }, [])

  /**
   * Calculates distance from user to a point
   */
  const getDistanceFromUser = useCallback((lat: number, lon: number): number | null => {
    if (effectiveLat === null || effectiveLon === null) return null
    return calculateDistance(effectiveLat, effectiveLon, lat, lon)
  }, [effectiveLat, effectiveLon])

  // Fetch location info when coordinates change
  useEffect(() => {
    if (effectiveLat !== null && effectiveLon !== null) {
      fetchLocationInfo(effectiveLat, effectiveLon)
    }
  }, [effectiveLat, effectiveLon, fetchLocationInfo])

  // Fetch businesses when location or radius changes
  useEffect(() => {
    if (effectiveLat !== null && effectiveLon !== null) {
      fetchBusinesses(effectiveLat, effectiveLon, searchRadius)
    }
  }, [effectiveLat, effectiveLon, searchRadius, fetchBusinesses])

  /**
   * Fetches location from IP address as a fallback
   */
  const fetchIpLocation = useCallback(async () => {
    try {
      const response = await fetch("https://ipwho.is/")
      const data = await response.json()
      
      if (data.success) {
        setManualLocation({
          lat: data.latitude,
          lon: data.longitude,
        })
      } else {
        throw new Error("IP geolocation failed")
      }
    } catch (error) {
      console.warn("IP location failed, falling back to default:", error)
      setManualLocation({
        lat: DEFAULT_LOCATION.latitude,
        lon: DEFAULT_LOCATION.longitude,
      })
    }
  }, [])

  // Use IP location or default if geolocation fails after timeout
  useEffect(() => {
    if (!geo.isLoading && geo.error && !manualLocation) {
      fetchIpLocation()
    }
  }, [geo.isLoading, geo.error, manualLocation, fetchIpLocation])

  return (
    <LocationContext.Provider
      value={{
        latitude: effectiveLat,
        longitude: effectiveLon,
        locationInfo,
        locationError: manualLocation ? null : geo.error,
        isLoadingLocation: geo.isLoading && !manualLocation,
        
        osmBusinesses,
        isLoadingBusinesses,
        businessError,
        
        searchRadius,
        setSearchRadius,
        
        refreshLocation: geo.requestLocation,
        refreshBusinesses,
        
        getDistanceFromUser,
        
        permissionState: geo.permissionState,
        useManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access location context
 */
export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
