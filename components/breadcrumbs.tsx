"use client"

/**
 * Breadcrumb Navigation Component
 * 
 * Shows the user's current location in the site hierarchy
 * with clickable links to parent pages.
 * 
 * @module Breadcrumbs
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Route label mappings for breadcrumb display
 */
const routeLabels: { [key: string]: string } = {
  browse: "Browse Businesses",
  bookmarks: "My Favorites",
  deals: "Deals",
  reports: "Reports",
  help: "Help",
  business: "Business",
}

interface BreadcrumbsProps {
  customSegments?: { label: string; href?: string }[]
  className?: string
}

/**
 * Breadcrumbs Component
 * Displays hierarchical navigation based on current route
 * 
 * @param customSegments - Override automatic breadcrumb generation
 * @param className - Additional CSS classes
 */
export function Breadcrumbs({ customSegments, className }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Build breadcrumb segments from path
  const buildSegments = () => {
    if (customSegments) return customSegments

    const paths = pathname.split("/").filter(Boolean)
    const segments: { label: string; href: string }[] = []

    let currentPath = ""
    for (const path of paths) {
      currentPath += `/${path}`
      const label = routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1)
      segments.push({ label, href: currentPath })
    }

    return segments
  }

  const segments = buildSegments()

  // Don't render on home page
  if (pathname === "/" || segments.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {/* Home link */}
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {/* Path segments */}
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          return (
            <li key={segment.href || index} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              {isLast || !segment.href ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {segment.label}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
