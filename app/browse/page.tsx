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
import { Marquee } from "@/components/marquee"
import { motion, AnimatePresence } from "motion/react"

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
    <div className="space-y-8">
      {/* Search Radius */}
      <div>
        <Label className="font-semibold text-neutral-300">Search Radius</Label>
        <div className="mt-3 space-y-3">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Distance</span>
            <span className="font-medium text-emerald-400">
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
                className={cn(
                  "rounded-full transition-all",
                  searchRadius === option.value 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent" 
                    : "bg-transparent text-neutral-400 border-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Accordion type="single" collapsible defaultValue="category" className="w-full">
        <AccordionItem value="category" className="border-b border-white/10">
          <AccordionTrigger className="py-4 hover:no-underline text-neutral-300 hover:text-white transition-colors">
            <span className="font-semibold">Category</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2 pb-4">
              <button
                onClick={() => {
                  setSelectedCategory("")
                  setSelectedSubcategory("")
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  !selectedCategory
                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
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
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    selectedCategory === category.id
                      ? "bg-emerald-500/10 text-emerald-400 font-medium"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
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
        <Accordion type="single" collapsible defaultValue="subcategory" className="w-full">
          <AccordionItem value="subcategory" className="border-b border-white/10">
            <AccordionTrigger className="py-4 hover:no-underline text-neutral-300 hover:text-white transition-colors">
              <span className="font-semibold">Subcategory</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2 pb-4">
                <button
                  onClick={() => setSelectedSubcategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                    !selectedSubcategory
                      ? "bg-emerald-500/10 text-emerald-400 font-medium"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  All {currentCategory?.name}
                </button>
                {subcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200",
                      selectedSubcategory === sub
                        ? "bg-emerald-500/10 text-emerald-400 font-medium"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white"
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
        <Label className="font-semibold text-neutral-300">Minimum Rating</Label>
        <div className="space-y-2 mt-3">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setMinRating(minRating === option.value ? 0 : option.value)
              }
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                minRating === option.value
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  minRating === option.value
                    ? "text-emerald-400"
                    : "text-neutral-600"
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
        <Label className="font-semibold text-neutral-300">Price Level</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[1, 2, 3, 4].map((level) => (
            <div key={level} className="flex items-center space-x-2">
              <Checkbox
                id={`price-${level}`}
                checked={selectedPriceLevels.includes(level)}
                onCheckedChange={() => togglePriceLevel(level)}
                className="border-white/20 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <Label
                htmlFor={`price-${level}`}
                className="text-sm font-normal cursor-pointer text-neutral-400 hover:text-white transition-colors"
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
          className="w-full bg-transparent border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all"
        >
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground selection:bg-emerald-500/30">
      <Marquee text="DISCOVER LOCAL • SUPPORT SMALL BUSINESS • FIND GEMS • EXPLORE • CONNECT •" />
      
      <div className="container mx-auto px-4 pt-16 pb-24">
        {/* Header Section */}
        <section className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-6">
                BROWSE
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-lg text-neutral-400">
                <MapPin className="h-5 w-5 text-emerald-500" />
                {isLoadingLocation ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Locating...
                  </span>
                ) : locationInfo ? (
                  <span>
                    Near <strong className="text-white font-semibold">{locationInfo.city}{locationInfo.state && `, ${locationInfo.state}`}</strong>
                  </span>
                ) : locationError ? (
                  <span className="text-red-400">
                    {locationError}
                  </span>
                ) : (
                  <span>Discover local gems</span>
                )}
                {!isLoadingLocation && (
                  <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-sm font-medium text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                        aria-label="Update location"
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-white">Update Location</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                          Enter a city, zip code, or address to see businesses in that area.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleManualLocationSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-neutral-300">Location</Label>
                          <div className="flex gap-2">
                            <Input
                              id="location"
                              placeholder="e.g. San Francisco, CA"
                              value={locationQuery}
                              onChange={(e) => setLocationQuery(e.target.value)}
                              disabled={isGeocoding}
                              className="bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-emerald-500"
                            />
                            <Button type="submit" disabled={isGeocoding || !locationQuery.trim()} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                              {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                            </Button>
                          </div>
                          {geocodeError && (
                            <p className="text-sm text-red-400">{geocodeError}</p>
                          )}
                        </div>
                      </form>
                      <DialogFooter className="sm:justify-start">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleUseCurrentLocation}
                          className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20"
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
            
            <div className="flex flex-col items-end gap-2">
               <div className="text-right">
                 <div className="text-4xl font-bold text-emerald-500">{filteredBusinesses.length}</div>
                 <div className="text-sm text-neutral-500 uppercase tracking-widest">Businesses Found</div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Location Loading/Error State */}
        {(isLoadingBusinesses || businessError) && (
          <div className={cn(
            "mb-8 p-4 rounded-xl flex items-center gap-3 border",
            businessError ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-neutral-900/50 border-white/5 text-neutral-400"
          )}>
            {isLoadingBusinesses ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                <span>Loading nearby businesses from OpenStreetMap...</span>
              </>
            ) : businessError ? (
              <>
                <span>{businessError}</span>
                <Button variant="outline" size="sm" onClick={refreshBusinesses} className="ml-auto bg-transparent border-red-500/30 hover:bg-red-500/10 hover:text-red-300 text-red-400">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 bg-neutral-900/50 border border-white/5 backdrop-blur-sm rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6 text-white">
                <SlidersHorizontal className="h-5 w-5 text-emerald-500" />
                <h2 className="font-bold text-xl">Filters</h2>
              </div>
              <FiltersContent />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 bg-neutral-900/50 border border-white/5 p-4 rounded-2xl backdrop-blur-sm">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  placeholder="Search businesses, categories, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-neutral-950 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-emerald-500 h-11 rounded-xl"
                />
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden h-11 bg-neutral-950 border-white/10 text-white hover:bg-neutral-800">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[350px] bg-neutral-900 border-r-white/10 text-white">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-white text-2xl font-bold">Filters</SheetTitle>
                  </SheetHeader>
                  <FiltersContent />
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] h-11 bg-neutral-950 border-white/10 text-white focus:ring-emerald-500 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Grid */}
            <div className="min-h-[400px]">
               {filteredBusinesses.length === 0 ? (
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl bg-neutral-900/20"
                 >
                   <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/5">
                     <Search className="h-8 w-8 text-neutral-600" />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-2">No businesses found</h3>
                   <p className="text-neutral-500 max-w-md mx-auto mb-8">
                     We couldn't find any businesses matching your criteria. Try adjusting your filters or search radius.
                   </p>
                   <Button
                     onClick={clearFilters}
                     className="rounded-full bg-white text-black hover:bg-neutral-200 px-8"
                   >
                     Clear Filters
                   </Button>
                 </motion.div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredBusinesses.map((business, idx) => (
                     <motion.div
                       key={business.id}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.4, delay: idx * 0.05 }}
                     >
                       <BusinessCard 
                         business={business} 
                         className="h-full bg-neutral-900 border-white/10 text-white hover:bg-neutral-800/50 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50"
                       />
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
