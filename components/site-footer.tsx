"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, Store } from "lucide-react"

export function SiteFooter() {
  const pathname = usePathname()
  
  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  return (
    <footer className="relative bg-background pt-24 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center pt-20 pb-80">
        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-x-20 gap-y-4 mb-16 text-sm font-bold uppercase tracking-wide">
          <Link href="/browse" className="hover:text-primary transition-colors">
            Browse
          </Link>
          <Link href="/deals" className="hover:text-primary transition-colors">
            Deals
          </Link>
          <Link href="/docs" className="hover:text-primary transition-colors">
            Resources
          </Link>
          <Link href="/help" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        {/* Legal & Copyright */}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-xs text-muted-foreground">
          <span>© 2026 Byte-Sized Boost</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>

      {/* Giant Text Footer - Removed for cleaner look */}
    </footer>
  )
}
