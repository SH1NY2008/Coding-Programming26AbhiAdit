"use client"

/**
 * Browse Businesses Page
 * 
 * Main business discovery page with search, filtering, and sorting.
 * Includes hierarchical category filters and multiple view options.
 * 
 * @module BrowsePage
 */

import { useState, useEffect, useCallback, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Grid,
  List,
  MapPin,
  RefreshCw,
  Loader2,
  Navigation,
  Map,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BusinessCard } from "@/components/business-card"
import { HoverEffect } from "@/components/ui/card-hover-effect"
import {
  filterBusinesses,
  CATEGORIES,
  type Business,
} from "@/lib/data"
import { useLocation } from "@/lib/location-context"
import { forwardGeocode } from "@/lib/geoapify"
import { validateSearchQuery } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

/**
 * Sort options for business listings
 */
const sortOptions = [
  { value: "distance-asc", label: "Nearest First" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "rating-asc", label: "Lowest Rated" },
  { value: "reviews-desc", label: "Most Reviewed" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

/**
 * Search radius options in meters
 */
const radiusOptions = [
  { value: 500, label: "0.3 mi" },
  { value: 1000, label: "0.6 mi" },
  { value: 2000, label: "1.2 mi" },
  { value: 5000, label: "3 mi" },
  { value: 10000, label: "6 mi" },
]

/**
 * Rating filter options
 */
const ratingOptions = [
  { value: 4.5, label: "4.5+ stars" },
  { value: 4, label: "4+ stars" },
  { value: 3.5, label: "3.5+ stars" },
  { value: 3, label: "3+ stars" },
]

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Location context for real OSM data
  const {
    latitude,
    longitude,
    locationInfo,
    locationError,
    isLoadingLocation,
    osmBusinesses,
    isLoadingBusinesses,
    businessError,
    searchRadius,
    setSearchRadius,
    refreshLocation,
    refreshBusinesses,
    getDistanceFromUser,
    useManualLocation,
  } = useLocation()

  // State for filters and results
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "")
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "distance-asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [dataSource, setDataSource] = useState<"osm" | "mock">("osm")
  const [businesses, setBusinesses] = useState<Business[]>([])

  // Location Picker State
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)

  /**
   * Handles manual location submission
   */
  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationQuery.trim()) return

    setIsGeocoding(true)
    setGeocodeError(null)

    try {
      const result = await forwardGeocode(locationQuery)
      if (result) {
        useManualLocation(result.lat, result.lon)
        setLocationDialogOpen(false)
        setLocationQuery("")
      } else {
        setGeocodeError("Location not found. Please try a different address or city.")
      }
    } catch (error) {
      setGeocodeError("An error occurred. Please try again.")
    } finally {
      setIsGeocoding(false)
    }
  }

  /**
   * Handles using current location
   */
  const handleUseCurrentLocation = () => {
    refreshLocation()
    setLocationDialogOpen(false)
  }


  /**
   * Filters and sorts business data from either OSM or mock source
   */
  const filteredBusinesses = useMemo(() => {
    // Choose data source
    let sourceData: Business[] = dataSource === "osm" ? osmBusinesses : []
    
    // If OSM has no results, fall back to mock data
    if (dataSource === "osm" && osmBusinesses.length === 0 && !isLoadingBusinesses) {
      const mockResults = filterBusinesses({})
      sourceData = mockResults
    }
    
    // Apply search filter
    const validation = validateSearchQuery(searchQuery)
    const sanitizedSearch = validation.isValid ? validation.sanitized?.toLowerCase() : ""
    
    let results = sourceData.filter((business) => {
      // Search filter
      if (sanitizedSearch) {
        const searchableText = `${business.name} ${business.description} ${business.tags.join(" ")}`.toLowerCase()
        if (!searchableText.includes(sanitizedSearch)) return false
      }
      
      // Category filter
      if (selectedCategory && business.category !== selectedCategory) return false
      
      // Subcategory filter
      if (selectedSubcategory && business.subcategory !== selectedSubcategory) return false
      
      // Price filter
      if (selectedPriceLevels.length > 0 && !selectedPriceLevels.includes(business.priceLevel)) return false
      
      // Rating filter
      if (minRating > 0 && business.averageRating < minRating) return false
      
      return true
    })
    
    // Add distance to each business
    results = results.map((business) => ({
      ...business,
      distance: getDistanceFromUser(business.latitude, business.longitude),
    }))
    
    // Sort results
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
          comparison = a.averageRating - b.averageRating
          break
        case "reviews":
          comparison = a.totalReviews - b.totalReviews
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison = a.priceLevel - b.priceLevel
          break
        default:
          comparison = 0
      }
      
      return sortOrder === "desc" ? -comparison : comparison
    })
    
    return results
  }, [
    dataSource,
    osmBusinesses,
    isLoadingBusinesses,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedPriceLevels,
    minRating,
    sortBy,
    getDistanceFromUser,
  ])

  // Update URL with filter parameters
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedSubcategory) params.set("subcategory", selectedSubcategory)
    if (sortBy !== "rating-desc") params.set("sortBy", sortBy)

    const newUrl = params.toString() ? `/browse?${params.toString()}` : "/browse"
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy, router])

  /**
   * Toggles price level filter
   */
  const togglePriceLevel = (level: number) => {
    setSelectedPriceLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }

  /**
   * Clears all active filters
   */
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedSubcategory("")
    setSelectedPriceLevels([])
    setMinRating(0)
    setSortBy("rating-desc")
  }

  /**
   * Gets count of active filters
   */
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedCategory) count++
    if (selectedSubcategory) count++
    if (selectedPriceLevels.length > 0) count++
    if (minRating > 0) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Get subcategories for selected category
  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory)
  const subcategories = currentCategory?.subcategories || []

  /**
   * Filter panel content (shared between desktop and mobile)
   */
  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Search Radius */}
      <div>
        <Label className="font-semibold">Search Radius</Label>
        <div className="mt-3 space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Distance</span>
            <span className="font-medium text-foreground">
              {radiusOptions.find(r => r.value === searchRadius)?.label || `${(searchRadius / 1609.34).toFixed(1)} mi`}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {radiusOptions.map((option) => (
              <Button
                key={option.value}
                variant={searchRadius === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchRadius(option.value)}
                className={searchRadius !== option.value ? "bg-transparent" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Accordion type="single" collapsible defaultValue="category">
        <AccordionItem value="category" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="font-semibold">Category</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory("")
                  setSelectedSubcategory("")
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setSelectedSubcategory("")
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Subcategory Filter */}
      {subcategories.length > 0 && (
        <Accordion type="single" collapsible defaultValue="subcategory">
          <AccordionItem value="subcategory" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="font-semibold">Subcategory</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setSelectedSubcategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    !selectedSubcategory
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  All {currentCategory?.name}
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      selectedSubcategory === sub
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Rating Filter */}
      <div>
        <Label className="font-semibold">Minimum Rating</Label>
        <div className="space-y-2 mt-3">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setMinRating(minRating === option.value ? 0 : option.value)
              }
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                minRating === option.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  minRating === option.value
                    ? "text-primary-foreground"
                    : "text-amber-400"
                )}
                fill="currentColor"
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Level Filter */}
      <div>
        <Label className="font-semibold">Price Level</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${level}`}
                checked={selectedPriceLevels.includes(level)}
                onCheckedChange={() => togglePriceLevel(level)}
              />
              <Label
                htmlFor={`price-${level}`}
                className="text-sm font-normal cursor-pointer"
              >
                {"$".repeat(level)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full bg-transparent"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
      {/* Page Header with Location */}
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
          Browse <span className="text-primary">Businesses</span>
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          {isLoadingLocation ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Detecting your location...
            </span>
          ) : locationInfo ? (
            <span>
              Showing businesses near <strong className="text-foreground font-semibold">{locationInfo.city}{locationInfo.state && `, ${locationInfo.state}`}</strong>
            </span>
          ) : locationError ? (
            <span className="text-amber-600">
              {locationError}
            </span>
          ) : (
            <span>Discover local small businesses in your community</span>
          )}
          {!isLoadingLocation && (
            <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-sm font-medium"
                  aria-label="Update location"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Update Location
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Location</DialogTitle>
                  <DialogDescription>
                    Enter a city, zip code, or address to see businesses in that area.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleManualLocationSubmit} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        placeholder="e.g. San Francisco, CA"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        disabled={isGeocoding}
                      />
                      <Button type="submit" disabled={isGeocoding || !locationQuery.trim()}>
                        {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                      </Button>
                    </div>
                    {geocodeError && (
                      <p className="text-sm text-destructive">{geocodeError}</p>
                    )}
                  </div>
                </form>
                <DialogFooter className="sm:justify-start">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleUseCurrentLocation}
                    className="w-full sm:w-auto"
                  >
                    <Map className="mr-2 h-4 w-4" />
                    Use Current Location
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Location Loading/Error State */}
      {(isLoadingBusinesses || businessError) && (
        <div className={cn(
          "mb-6 p-4 rounded-lg flex items-center gap-3",
          businessError ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-muted"
        )}>
          {isLoadingBusinesses ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading nearby businesses from OpenStreetMap...</span>
            </>
          ) : businessError ? (
            <>
              <span>{businessError}</span>
              <Button variant="outline" size="sm" onClick={refreshBusinesses} className="ml-auto bg-transparent">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </>
          ) : null}
        </div>
      )}

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search businesses"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className="h-8 w-8"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden bg-transparent">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {(searchQuery || selectedCategory || selectedSubcategory || selectedPriceLevels.length > 0 || minRating > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              <button
                onClick={() => {
                  setSelectedCategory("")
                  setSelectedSubcategory("")
                }}
                className="ml-1 hover:text-destructive"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedSubcategory && (
            <Badge variant="secondary" className="gap-1">
              {selectedSubcategory}
              <button
                onClick={() => setSelectedSubcategory("")}
                className="ml-1 hover:text-destructive"
                aria-label="Remove subcategory filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              {minRating}+ stars
              <button
                onClick={() => setMinRating(0)}
                className="ml-1 hover:text-destructive"
                aria-label="Remove rating filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedPriceLevels.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Price: {selectedPriceLevels.map((l) => "$".repeat(l)).join(", ")}
              <button
                onClick={() => setSelectedPriceLevels([])}
                className="ml-1 hover:text-destructive"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <div className="pb-4 border-b">
              <h2 className="font-bold text-xl tracking-tight">FILTERS</h2>
            </div>
            <FiltersContent />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {/* Results Count */}
          <p className="text-sm font-medium text-muted-foreground mb-6">
            Showing <span className="text-foreground font-semibold">{filteredBusinesses.length}</span> business{filteredBusinesses.length !== 1 && "es"}
          </p>

          {/* Business Grid/List */}
          {filteredBusinesses.length > 0 ? (
            viewMode === "grid" ? (
              <HoverEffect
                items={filteredBusinesses.map((business) => ({
                  title: business.name,
                  description: business.description,
                  link: `/business?id=${business.id}`,
                  image: business.imageUrl || "/placeholder.svg",
                  category: business.subcategory || business.category,
                  rating: business.averageRating,
                  reviews: business.totalReviews,
                  location: `${business.city}, ${business.state}`,
                  priceLevel: business.priceLevel,
                  tags: business.tags,
                }))}
              />
            ) : (
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {filteredBusinesses.map((business, index) => (
                  <div
                    key={business.id}
                    className="h-full"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <BusinessCard
                      business={business}
                      className="h-full flex-row"
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No businesses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you are looking for.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
