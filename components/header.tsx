"use client"

/**
 * Header Navigation Component
 * 
 * Sticky header with main navigation, accessibility toggles,
 * and mobile-responsive hamburger menu.
 * 
 * @module Header
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  Home,
  Search,
  Bookmark,
  Tag,
  BarChart3,
  HelpCircle,
  Contrast,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useApp } from "@/lib/context"
import { cn } from "@/lib/utils"

/**
 * Navigation link configuration
 */
const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/browse", label: "Browse Businesses", icon: Search },
  { href: "/bookmarks", label: "My Favorites", icon: Bookmark },
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/help", label: "Help", icon: HelpCircle },
]

/**
 * Header Component with Navigation
 * Provides sticky navigation with mobile support and accessibility features
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { highContrastMode, toggleHighContrast } = useApp()

  /**
   * Checks if a navigation link is currently active
   */
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <nav
        className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          aria-label="Byte-Sized Business Boost - Home"
        >
          <span>BYTE-SIZED<span className="text-primary">BOOST</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide transition-colors relative group py-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100",
                  active && "scale-x-100"
                )} />
              </Link>
            )
          })}
        </div>

        {/* Right Section: Accessibility & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* High Contrast Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={highContrastMode ? "default" : "ghost"}
                  size="icon"
                  onClick={toggleHighContrast}
                  aria-label={`High contrast mode is ${highContrastMode ? "on" : "off"}. Click to toggle.`}
                  aria-pressed={highContrastMode}
                >
                  <Contrast className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {highContrastMode ? "Disable" : "Enable"} high contrast
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6" aria-label="Mobile navigation">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
