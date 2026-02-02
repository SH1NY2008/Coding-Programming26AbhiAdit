"use client";

import { useApp } from "@/lib/context";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

export default function BookmarksPage() {
  const { businesses, bookmarks } = useApp();

  const bookmarkedBusinesses = businesses.filter((b) =>
    bookmarks.includes(b.id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <main className="container mx-auto px-4 py-12 sm:py-24 space-y-12">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
            Saved <span className="text-primary">Businesses</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Your personal collection of favorite local spots. Keep track of the businesses you love and want to visit again.
          </p>
        </div>

        {bookmarkedBusinesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl border-dashed animate-in fade-in zoom-in-95 duration-500 delay-200">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <Bookmark className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              No bookmarks yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Start exploring local businesses and bookmark your favorites to build your collection.
            </p>
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Businesses
                <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>
                You have {bookmarkedBusinesses.length} saved business
                {bookmarkedBusinesses.length !== 1 ? "es" : ""}
              </span>
            </div>
            <HoverEffect
              items={bookmarkedBusinesses.map((business) => ({
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
          </div>
        )}
      </main>
    </div>
  );
}
