'use client'

import { BusinessCard } from '@/components/business-card'
import { HoverEffect } from '@/components/ui/card-hover-effect'
import { type Business } from '@/lib/data'

interface BusinessListProps {
  businesses: Business[]
  viewMode: 'grid' | 'list'
}

export function BusinessList({ businesses, viewMode }: BusinessListProps) {
  if (businesses.length === 0) {
    return <p className="text-muted-foreground">No businesses found.</p>
  }

  if (viewMode === 'grid') {
    return (
      <HoverEffect
        items={businesses.map(b => ({
          title: b.name,
          description: b.description,
          link: `/business/${b.id}`,
          image: b.imageUrl,
          category: b.category,
          rating: b.averageRating,
          reviews: b.totalReviews,
          location: b.address,
          priceLevel: b.priceLevel,
          tags: b.tags,
        }))}
      />
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map(business => (
        <BusinessCard key={business.id} business={business} />
      ))}
    </div>
  )
}
