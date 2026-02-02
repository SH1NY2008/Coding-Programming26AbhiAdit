"use client"

import React from "react"

/**
 * Landing Page Component
 * 
 * Main entry point for Byte-Sized Business Boost application.
 * Features hero section, category browsing, featured businesses,
 * and onboarding tutorial for new users.
 * 
 * @module HomePage
 */

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  ArrowRight,
  Star,
  Bookmark,
  Tag,
  Utensils,
  ShoppingBag,
  Briefcase,
  Music,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { BusinessCard } from "@/components/business-card"
import { Onboarding } from "@/components/onboarding"
import { useApp } from "@/lib/context"
import {
  getBusinesses,
  getActiveDeals,
  getReviews,
  CATEGORIES,
} from "@/lib/data"

/**
 * Category icon mapping
 */
const categoryIcons: { [key: string]: React.ElementType } = {
  food: Utensils,
  retail: ShoppingBag,
  services: Briefcase,
  entertainment: Music,
  education: GraduationCap,
}

/**
 * Stats counter display data
 */
interface StatsData {
  businesses: number
  reviews: number
  deals: number
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<StatsData>({ businesses: 0, reviews: 0, deals: 0 })
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { session, isLoading } = useApp()

  // Load stats
  useEffect(() => {
    const businesses = getBusinesses()
    const reviews = getReviews()
    const deals = getActiveDeals()

    // Set stats
    setStats({
      businesses: businesses.length,
      reviews: reviews.length,
      deals: deals.length,
    })
  }, [])

  // Show onboarding for new users
  useEffect(() => {
    if (!isLoading && session && !session.onboardingComplete) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, session])

  /**
   * Handles search form submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      {/* Onboarding Tutorial */}
      <Onboarding open={showOnboarding} onOpenChange={setShowOnboarding} />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-20 sm:pt-32 sm:pb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground text-balance">
              Discover & Support <br className="hidden sm:block" />
              <span className="text-primary relative inline-block">
                Local Businesses
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            {/* Search Bar */}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 view-animate">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Browse by Category</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore businesses organized by what you are looking for
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {CATEGORIES.map((category, index) => {
              const Icon = categoryIcons[category.id] || Briefcase
              return (
                <Link
                  key={category.id}
                  href={`/browse?category=${category.id}`}
                  className="group"
                >
                  <div className="h-full bg-background rounded-2xl p-6 text-center border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 mx-auto group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:rotate-3">
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                      {category.subcategories?.length || 0} subcategories
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              Everything You Need to Support Local
            </h2>
            <p className="text-background/70 text-lg max-w-2xl mx-auto">
              Our platform makes it easy to discover, engage with, and support the small
              businesses that make your community special.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "Search & Discover", desc: "Find businesses by name, category, location, or filter by rating and price." },
              { icon: Star, title: "Reviews & Ratings", desc: "Read authentic reviews and share your own experiences to help others." },
              { icon: Bookmark, title: "Save Favorites", desc: "Bookmark businesses you love and organize them into custom folders." },
              { icon: Tag, title: "Exclusive Deals", desc: "Find special offers and discounts from businesses in your area." }
            ].map((feature, index) => (
              <div key={index} className="bg-background/5 border border-background/10 rounded-2xl p-8 hover:bg-background/10 transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-background/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-background" />
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-background/70 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
