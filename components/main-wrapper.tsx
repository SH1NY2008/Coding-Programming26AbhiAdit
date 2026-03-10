"use client"

import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/context"
import { Onboarding } from "@/components/onboarding"
import { useState, useEffect } from "react"

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { session } = useApp()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  useEffect(() => {
    if (session && !session.onboardingComplete && !isAuthPage) {
      setShowOnboarding(true)
    }
  }, [session, isAuthPage])

  return (
    <main 
      id="main-content" 
      className={cn(
        "min-h-screen",
        !isAuthPage && "pt-20"
      )}
    >
      {children}
      <Onboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
    </main>
  )
}
