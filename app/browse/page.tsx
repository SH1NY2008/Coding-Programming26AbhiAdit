'use client'

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Business, CATEGORIES } from "@/lib/data"
import { useLocation } from "@/lib/location-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Loader2,
  Map,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react"

import { BusinessList } from "./components/BusinessList"

import { useBusinessSearch } from "./useBusinessSearch"

function BrowseContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    locationInfo,
    locationError,
    isLoadingLocation,
    businessError,
    searchRadius,
    setSearchRadius,
    refreshLocation,
    refreshBusinesses,
    useManualLocation,
  } = useLocation()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "")
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<number[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "distance-asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [dataSource, setDataSource] = useState<"osm" | "mock">("osm")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)

  const filteredBusinesses = useBusinessSearch({
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedPriceLevels,
    minRating,
    sortBy,
    dataSource,
  })

  const handleManualLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationQuery.trim()) return

    setIsGeocoding(true)
    setGeocodeError(null)
    setIsGeocoding(false)
  }

  const handleUseCurrentLocation = () => {
    refreshLocation()
    setLocationDialogOpen(false)
  }

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedSubcategory) params.set("subcategory", selectedSubcategory)
    if (sortBy !== "rating-desc") params.set("sortBy", sortBy)

    const newUrl = params.toString() ? `/browse?${params.toString()}` : "/browse"
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy, router])

  const togglePriceLevel = (level: number) => {
    setSelectedPriceLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedSubcategory("")
    setSelectedPriceLevels([])
    setMinRating(0)
    setSortBy("rating-desc")
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (selectedCategory) count++
    if (selectedSubcategory) count++
    if (selectedPriceLevels.length > 0) count++
    if (minRating > 0) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  const { isLoadingBusinesses } = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1">
              <form onSubmit={e => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses, services, or products..."
                    className="pl-10 w-full max-w-md bg-transparent"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => setLocationDialogOpen(true)}>
                <Map className="mr-2 h-4 w-4" />
                {locationInfo ? `${locationInfo.city}, ${locationInfo.state}` : "Set Location"}
              </Button>
              <Button variant="ghost">
                <a href="/deals">Deals</a>
              </Button>
              <Button variant="ghost">
                <a href="/bookmarks">Bookmarks</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 flex-grow">
        <div className="flex gap-8 py-8">
          

          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">

              
            </div>

            {isLoadingBusinesses || isLoadingLocation ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : businessError || locationError ? (
              <div className="text-destructive text-center h-96 flex flex-col justify-center items-center">
                <p>{businessError || locationError}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <BusinessList businesses={[]} viewMode={viewMode} />
                
              </>
            )}
          </main>
        </div>
      </div>
      
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  )
}
