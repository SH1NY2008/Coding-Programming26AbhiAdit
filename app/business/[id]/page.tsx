"use client"

/**
 * Business Detail Page
 * 
 * Displays comprehensive business information including photos,
 * details, reviews, deals, and booking actions.
 * 
 * @module BusinessDetailPage
 */

import { useState, useEffect, use, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Share2,
  ChevronDown,
  ThumbsUp,
  Tag,
  ExternalLink,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { StarRating } from "@/components/star-rating"
import { ReviewForm } from "@/components/review-form"
import { DealCard } from "@/components/deal-card"
import { useApp } from "@/lib/context"
import {
  getBusinessById,
  getReviewsByBusiness,
  getDealsByBusiness,
  isBusinessOpen,
  markReviewHelpful,
  CATEGORIES,
  type Business,
  type Review,
  type Deal,
} from "@/lib/data"
import { cn } from "@/lib/utils"
import { fetchPlaceDetails } from "@/lib/geoapify"

/**
 * Formats business hours for display
 */
const formatHours = (hours: { open: string; close: string } | null): string => {
  if (!hours) return "Closed"
  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    const hour = h % 12 || 12
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
  }
  return `${formatTime(hours.open)} - ${formatTime(hours.close)}`
}

/**
 * Day order for hours display
 */
const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]

export default function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { bookmarks, toggleBookmark } = useApp()
  const [business, setBusiness] = useState<Business | null>(() => {
    if (id.startsWith("geoapify-")) return null
    const result = getBusinessById(id)
    return result || null
  })
  const [loading, setLoading] = useState(id.startsWith("geoapify-"))
  const [reviews, setReviews] = useState<Review[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set())
  const [showAllHours, setShowAllHours] = useState(false)
  const [reviewsLimit, setReviewsLimit] = useState(5)

  const bookmarked = business ? bookmarks.includes(business.id) : false


  // Calculate display rating/reviews to prefer local data over mock Geoapify data
  const displayedRating = useMemo(() => {
    if (id.startsWith("geoapify-") && reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0)
      return Math.round((total / reviews.length) * 10) / 10
    }
    return business?.averageRating || 0
  }, [business, reviews, id])

  const displayedReviewCount = useMemo(() => {
    if (id.startsWith("geoapify-") && reviews.length > 0) {
      return reviews.length
    }
    return business?.totalReviews || 0
  }, [business, reviews, id])

  useEffect(() => {
    async function loadBusiness() {
      if (id.startsWith("geoapify-")) {
        try {
          const placeId = id.replace("geoapify-", "")
          const data = await fetchPlaceDetails(placeId)
          if (data) {
            setBusiness(data)
          }
        } catch (error) {
          console.error("Failed to load business details:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (id.startsWith("geoapify-")) {
      loadBusiness()
    }
  }, [id])

  // Load data
  useEffect(() => {
    if (business) {
      setReviews(getReviewsByBusiness(id))
      setDeals(getDealsByBusiness(id))
    }
  }, [id, business])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading business details...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    notFound()
  }

  const isOpen = isBusinessOpen(business)
  const categoryName =
    CATEGORIES.find((c) => c.id === business.category)?.name || business.category

  /**
   * Handles bookmark toggle
   */
  const handleBookmarkToggle = () => {
    if (business) {
      toggleBookmark(business.id, business)
    }
  }

  /**
   * Handles share action
   */
  const handleShare = async () => {
    const shareData = {
      title: business.name,
      text: `Check out ${business.name} on Byte-Sized Business Boost!`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch {
      // User cancelled or share failed silently
    }
  }

  /**
   * Handles marking a review as helpful
   */
  const handleHelpful = (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) return
    markReviewHelpful(reviewId)
    setHelpfulReviews((prev) => new Set([...prev, reviewId]))
    setReviews(getReviewsByBusiness(id))
  }

  /**
   * Refreshes reviews after new submission
   */
  const handleReviewSubmitted = () => {
    setReviews(getReviewsByBusiness(id))
    // Refresh business data for updated rating
    if (!id.startsWith("geoapify-")) {
      const updatedBusiness = getBusinessById(id)
      if (updatedBusiness) {
        setBusiness(updatedBusiness)
      }
    }
  }

  /**
   * Renders price level with dollar signs
   */
  const PriceLevel = () => (
    <span className="inline-flex" aria-label={`Price level ${business.priceLevel} out of 4`}>
      {Array.from({ length: 4 }, (_, i) => (
        <DollarSign
          key={i}
          className={cn(
            "h-4 w-4",
            i < business.priceLevel ? "text-emerald-600" : "text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  )

  // Get current day's hours
  const today = dayOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
  const todayHours = business.hours[today]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-[45vh] min-h-[400px] mt-8 w-full group overflow-hidden">
        <Image
          src={business.imageUrl || "/placeholder.svg"}
          alt={`${business.name} storefront`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />

        <div className="absolute inset-0 container mx-auto px-6 lg:px-12 flex flex-col justify-end pb-12">
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground font-semibold px-3 py-1">
                  {business.subcategory}
                </Badge>
                <Badge
                  className={cn(
                    "font-semibold px-3 py-1 shadow-sm transition-colors",
                    isOpen
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  )}
                >
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  {isOpen ? "Open Now" : "Closed"}
                </Badge>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight mb-6 text-foreground text-balance max-w-5xl">
                {business.name}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <StarRating rating={displayedRating} size="lg" showValue />
                  <span className="text-muted-foreground font-medium">
                    ({displayedReviewCount} reviews)
                  </span>
                </div>
                <div className="h-6 w-px bg-border hidden sm:block" />
                <PriceLevel />
                <div className="h-6 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{business.city}, {business.state}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="lg"
                  onClick={handleBookmarkToggle}
                  className={cn(
                    "shadow-sm transition-all h-14 px-8 text-base rounded-full",
                    bookmarked ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent border-2"
                  )}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="mr-2 h-5 w-5" />
                  ) : (
                    <Bookmark className="mr-2 h-5 w-5" />
                  )}
                  {bookmarked ? "Saved to Favorites" : "Save to Favorites"}
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare} className="shadow-sm bg-background hover:bg-accent h-14 px-8 text-base rounded-full border-2">
                  <Share2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-24">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-3xl font-bold">About</h2>
                {deals.length > 0 && (
                  <Badge className="bg-orange-500 hover:bg-orange-500 text-white ml-2">
                    <Tag className="mr-1 h-3 w-3" />
                    {deals.length} Deal{deals.length > 1 && "s"} Available
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed text-pretty">{business.description}</p>

              {/* Tags */}
              {business.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {business.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-secondary/50 text-secondary-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Tabs: Reviews & Deals */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <Tabs defaultValue="reviews" className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 gap-4 mb-8">
                  <TabsTrigger 
                    value="reviews"
                    className="rounded-full px-6 py-3 border border-border data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all"
                  >
                    Reviews ({reviews.length})
                  </TabsTrigger>
                  {deals.length > 0 && (
                    <TabsTrigger 
                      value="deals"
                      className="rounded-full px-6 py-3 border border-border data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all"
                    >
                      Deals ({deals.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-12">
                  {/* Write Review */}
                  <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                    <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                    <ReviewForm
                      businessId={business.id}
                      onSuccess={handleReviewSubmitted}
                    />
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-2xl">
                        Customer Reviews
                      </h3>
                    </div>

                    {reviews.length > 0 ? (
                      <>
                        {reviews.slice(0, reviewsLimit).map((review) => (
                          <div key={review.id} className="bg-background border border-border/50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-lg">{review.userName}</span>
                                  {review.verified && (
                                    <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                                      Verified Customer
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <StarRating rating={review.rating} size="sm" />
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-base text-muted-foreground leading-relaxed mb-6">
                              {review.comment}
                            </p>

                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleHelpful(review.id)}
                                disabled={helpfulReviews.has(review.id)}
                                className={cn(
                                  "text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent",
                                  helpfulReviews.has(review.id) && "text-emerald-600 font-medium"
                                )}
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Helpful ({review.helpful})
                              </Button>
                            </div>
                          </div>
                        ))}

                        {reviews.length > reviewsLimit && (
                          <Button
                            variant="outline"
                            onClick={() => setReviewsLimit((prev) => prev + 5)}
                            className="w-full h-14 text-base font-medium rounded-xl"
                          >
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Load More Reviews
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
                        <p className="text-muted-foreground text-lg">
                          No reviews yet. Be the first to share your experience!
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Deals Tab */}
                {deals.length > 0 && (
                  <TabsContent value="deals" className="grid gap-6">
                    {deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} showBusiness={false} />
                    ))}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          {/* Right Column: Contact & Hours */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            {/* Contact Card */}
            <div className="rounded-2xl border border-border/50 p-6 shadow-sm bg-background">
              <h3 className="font-bold text-xl mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{business.address}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {business.city}, {business.state} {business.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <a
                    href={`tel:${business.phone}`}
                    className="hover:text-primary transition-colors font-medium"
                  >
                    {business.phone}
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <a
                    href={`mailto:${business.email}`}
                    className="hover:text-primary transition-colors truncate font-medium"
                  >
                    {business.email}
                  </a>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center gap-1 truncate font-medium"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="rounded-2xl border border-border/50 p-6 shadow-sm bg-background">
              <h3 className="font-bold text-xl mb-6">Business Hours</h3>
              
              {/* Today's Hours */}
              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-xl">
                <span className="font-medium">Today</span>
                <span
                  className={cn(
                    "font-bold",
                    isOpen ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {formatHours(todayHours)}
                </span>
              </div>

              {/* All Hours */}
              <Collapsible open={showAllHours} onOpenChange={setShowAllHours}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-10 border-dashed">
                    {showAllHours ? "Hide" : "Show"} Full Schedule
                    {showAllHours ? (
                      <ChevronUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-3 mt-6">
                    {dayOrder.map((day) => {
                      const hours = business.hours[day]
                      const isToday = day === today
                      return (
                        <div
                          key={day}
                          className={cn(
                            "flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0 pb-2",
                            isToday && "font-bold text-primary"
                          )}
                        >
                          <span className="capitalize">{day}</span>
                          <span
                            className={cn(
                              hours ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {formatHours(hours)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
