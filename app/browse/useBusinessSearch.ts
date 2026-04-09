'use client'

import { useMemo } from "react"
import { Business, filterBusinesses } from "@/lib/data"
import { useLocation } from "@/lib/location-context"
import { validateSearchQuery } from "@/lib/validation"

interface BusinessSearchOptions {
  searchQuery: string
  selectedCategory: string
  sortBy: string
}

export function useBusinessSearch({
  searchQuery,
  selectedCategory,
  sortBy,
}: BusinessSearchOptions) {
  const { osmBusinesses, isLoadingBusinesses, getDistanceFromUser } = useLocation()

  const filteredBusinesses = useMemo(() => {
    let sourceData: Business[] = osmBusinesses

    const validation = validateSearchQuery(searchQuery)
    const sanitizedSearch = validation.isValid ? validation.sanitized?.toLowerCase() : ""

    let results = sourceData.filter(business => {
      if (sanitizedSearch) {
        const searchableText = `${business.name} ${business.description} ${business.tags.join(
          " "
        )}`.toLowerCase()
        if (!searchableText.includes(sanitizedSearch)) return false
      }
      if (selectedCategory && business.category !== selectedCategory) return false
      return true
    })

    results = results.map(business => ({
      ...business,
      distance: getDistanceFromUser(business.latitude, business.longitude),
    }))

    const [sortField, sortOrder] = sortBy.split("-") as [string, "asc" | "desc"]

    results.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "distance":
          const distA = (a as Business & { distance: number | null }).distance ?? 999
          const distB = (b as Business & { distance: number | null }).distance ?? 999
          comparison = distA - distB
          break
        case "rating":
          comparison =
            sortOrder === "asc"
              ? a.averageRating - b.averageRating
              : b.averageRating - a.averageRating
          break
        case "reviews":
          comparison = b.totalReviews - a.totalReviews
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison =
            sortOrder === "asc" ? a.priceLevel - b.priceLevel : b.priceLevel - a.priceLevel
          break
        default:
          comparison = 0
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

    return results
  }, [
    osmBusinesses,
    isLoadingBusinesses,
    searchQuery,
    selectedCategory,
    sortBy,
    getDistanceFromUser,
  ])

  return filteredBusinesses
}
