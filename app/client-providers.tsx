"use client"

import React from "react"
import { motion } from "framer-motion"
import { Analytics } from "@vercel/analytics/react"
import { AppProvider } from "@/lib/context"
import { LocationProvider } from "@/lib/location-context"
import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { HelpChatController } from "@/components/help-chat-controller"
import { MainWrapper } from "@/components/main-wrapper"
import { Toaster } from "@/components/ui/sonner"
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <SmoothScrollProvider>
          <AppProvider>
            <LocationProvider>
              <Header />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ ease: "easeInOut", duration: 0.5 }}
              >
                <MainWrapper>{children}</MainWrapper>
              </motion.div>
              <SiteFooter />
              <HelpChatController />
            </LocationProvider>
          </AppProvider>
        </SmoothScrollProvider>
      </ThemeProvider>
      <Toaster />
      <Analytics />
    </GoogleReCaptchaProvider>
  )
}