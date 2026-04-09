'use client'

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
  LogIn,
  LogOut,
  PlusCircle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/deals", label: "Deals" },
  { href: "/bookmarks", label: "Bookmarks" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signInWithGoogle, logout } = useAuth()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const NavLinks = ({ isMobile = false }) => (
    <nav className={cn(isMobile ? "flex flex-col gap-4" : "hidden lg:flex items-center gap-8 text-base")}>
      {navLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={cn(
            "transition-colors",
            isActive(link.href)
              ? "text-white font-medium"
              : "text-neutral-400 hover:text-white",
            isMobile && "text-lg"
          )}
          aria-current={isActive(link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )

  const AuthButtons = ({ isMobile = false }) => (
    <div className={cn("flex items-center gap-4", isMobile && "flex-col w-full")}>
      {user ? (
        <>
          {isMobile && <div className="border-t border-neutral-700 w-full pt-4" />}  
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-neutral-700">
                  <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                  <AvatarFallback>{user.displayName?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-white" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs leading-none text-neutral-400">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem onClick={logout} className="hover:bg-neutral-800 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <Button onClick={signInWithGoogle} variant="ghost" className="text-sm text-neutral-300 hover:text-white">
          Log in
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center justify-between gap-10 h-16 px-6 py-3 rounded-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-700/80 shadow-lg">
          <Link href="/" className="flex items-center gap-2 font-semibold text-white">
             <span>BOOST</span>
          </Link>
          <NavLinks />
          <AuthButtons />
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-foreground">
          <span>BYTE-SIZED<span className="text-primary">BOOST</span></span>
        </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-neutral-900 border-l-0 text-white">
              <SheetHeader className="border-b border-neutral-700 pb-4">
                <SheetTitle className="text-white text-center">Menu</SheetTitle>
                 <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-5 w-5" />
                 </Button>
              </SheetHeader>
              <div className="flex flex-col items-center justify-center h-full gap-8 -mt-16">
                  <NavLinks isMobile={true} />
                  <AuthButtons isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
