"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  return (
    <main 
      id="main-content" 
      className={cn(
        "min-h-screen",
        !isAuthPage && "pt-20"
      )}
    >
      {children}
    </main>
  )
}
