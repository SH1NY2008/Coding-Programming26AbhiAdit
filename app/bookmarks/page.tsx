"use client";

import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { Marquee } from "@/components/marquee";
import { motion } from "motion/react";
import { BusinessCard } from "@/components/business-card";

export default function BookmarksPage() {
  const { businesses, bookmarks } = useApp();

  const bookmarkedBusinesses = businesses.filter((b) =>
    bookmarks.includes(b.id)
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30">
      <Marquee text="YOUR FAVORITES • SAVED PLACES • LOCAL GEMS • VISIT AGAIN • SUPPORT LOCAL •" />
      
      <main className="container mx-auto px-4 pt-16 pb-24">
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
                SAVED
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
                Your personal collection of favorite local spots. Keep track of the businesses you love and want to visit again.
              </p>
            </div>
            
            {bookmarkedBusinesses.length > 0 && (
              <div className="flex items-center gap-2 text-neutral-500 mb-2">
                <Heart className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  {bookmarkedBusinesses.length} Saved {bookmarkedBusinesses.length === 1 ? "Place" : "Places"}
                </span>
              </div>
            )}
          </motion.div>
        </section>

        {bookmarkedBusinesses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center py-32 text-center border border-white/5 rounded-3xl bg-neutral-900/20"
          >
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-white/10">
              <Bookmark className="h-8 w-8 text-neutral-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No bookmarks yet
            </h2>
            <p className="text-neutral-500 mb-8 max-w-md mx-auto leading-relaxed">
              Start exploring local businesses and bookmark your favorites to build your collection.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-500 text-white border-0 font-medium">
              <Link href="/browse">
                <Search className="h-4 w-4 mr-2" />
                Browse Businesses
                <ArrowRight className="h-4 w-4 ml-2 opacity-50" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarkedBusinesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <BusinessCard business={business} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
