"use client"

import React from "react"

/**
 * Business Card Component
 * 
 * Displays a business listing in card format with image, rating,
 * category, and quick action buttons. Used in search results and listings.
 * 
 * @module BusinessCard
 */

import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Clock,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Tag,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StarRating } from "@/components/star-rating"
import { useApp } from "@/lib/context"
import {
  type Business,
  isBusinessOpen,
  getDealsByBusiness,
} from "@/lib/data"
import { cn } from "@/lib/utils"

interface BusinessCardProps {
  business: Business
  onBookmarkChange?: () => void
  className?: string
}

/**
 * Business Card Component
 * Displays business information in a compact card format
 * 
 * @param business - Business data to display
 * @param onBookmarkChange - Callback when bookmark status changes
 * @param className - Additional CSS classes
 */
export function BusinessCard({
  business,
  onBookmarkChange,
  className,
}: BusinessCardProps) {
  const { bookmarks, toggleBookmark } = useApp()
  const bookmarked = bookmarks.includes(business.id)
  const isOpen = isBusinessOpen(business)
  const deals = getDealsByBusiness(business.id)
  const hasDeals = deals.length > 0

  /**
   * Handles bookmark toggle action
   * Adds to or removes from default favorites folder
   */
  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toggleBookmark(business.id, business)
    onBookmarkChange?.()
  }

  /**
   * Renders price level indicator with dollar signs
   */
  const renderPriceLevel = () => {
    return (
      <span
        className="inline-flex"
        aria-label={`Price level ${business.priceLevel} out of 4`}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <DollarSign
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < business.priceLevel
                ? "text-emerald-600"
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </span>
    )
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4",
        className
      )}
    >
      <Link
        href={`/business/${business.id}`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View ${business.name} details`}
      >
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={business.imageUrl || "/placeholder.svg"}
            alt={`${business.name} storefront`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Open/Closed Badge */}
          <Badge
            variant={isOpen ? "default" : "secondary"}
            className={cn(
              "absolute top-3 left-3",
              isOpen
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="mr-1 h-3 w-3" />
            {isOpen ? "Open Now" : "Closed"}
          </Badge>

          {/* Deal Badge */}
          {hasDeals && (
            <Badge
              className="absolute top-3 right-12 bg-orange-500 hover:bg-orange-500 text-white"
            >
              <Tag className="mr-1 h-3 w-3" />
              Deal
            </Badge>
          )}

          {/* Bookmark Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "absolute top-2 right-2 h-8 w-8 rounded-full shadow-md",
                    bookmarked && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={handleBookmarkToggle}
                  aria-label={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  {bookmarked ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {bookmarked ? "Remove from favorites" : "Add to favorites"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Content Section */}
        <CardContent className="p-4">
          {/* Category */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {business.subcategory}
          </p>

          {/* Business Name */}
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 mb-1 text-balance">
            {business.name}
          </h3>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={business.averageRating} size="sm" />
            <span className="text-sm font-medium">{business.averageRating}</span>
            <span className="text-sm text-muted-foreground">
              ({business.totalReviews} reviews)
            </span>
          </div>

          {/* Location and Price */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1 line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {business.city}, {business.state}
            </span>
            {renderPriceLevel()}
          </div>

          {/* Tags */}
          {business.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {business.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
