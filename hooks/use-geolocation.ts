/**
 * Geolocation Hook
 * 
 * Uses Browser Geolocation API to get the user's current location.
 * Handles permissions, errors, and loading states.
 * 
 * @module hooks/use-geolocation
 */

"use client"

import { useState, useEffect, useCallback } from "react"

export interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  isLoading: boolean
  isSupported: boolean
  permissionState: PermissionState | null
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes cache
}

/**
 * Custom hook for accessing browser geolocation
 * 
 * @param options - Geolocation API options
 * @returns Geolocation state and refresh function
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: true,
    isSupported: typeof window !== "undefined" && "geolocation" in navigator,
    permissionState: null,
  })

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  /**
   * Handles successful geolocation response
   */
  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      isLoading: false,
    }))
  }, [])

  /**
   * Handles geolocation errors
   */
  const onError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable location access in your browser settings."
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable. Please try again."
        break
      case error.TIMEOUT:
        errorMessage = "Location request timed out. Please try again."
        break
      default:
        errorMessage = "An unknown error occurred while getting your location."
    }

    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
    }))
  }, [])

  /**
   * Requests the user's current location
   */
  const requestLocation = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
        isLoading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: mergedOptions.enableHighAccuracy,
      timeout: mergedOptions.timeout,
      maximumAge: mergedOptions.maximumAge,
    })
  }, [state.isSupported, onSuccess, onError, mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge])

  /**
   * Checks and updates permission state
   */
  const checkPermission = useCallback(async () => {
    if (typeof navigator !== "undefined" && "permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" })
        setState((prev) => ({ ...prev, permissionState: permission.state }))
        
        permission.addEventListener("change", () => {
          setState((prev) => ({ ...prev, permissionState: permission.state }))
        })
      } catch {
        // Permissions API not fully supported
      }
    }
  }, [])

  // Initial location request on mount
  useEffect(() => {
    checkPermission()
    requestLocation()
  }, [checkPermission, requestLocation])

  return {
    ...state,
    requestLocation,
  }
}

/**
 * Default location (New York City) for fallback
 */
export const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.006,
  city: "New York",
  state: "NY",
}
