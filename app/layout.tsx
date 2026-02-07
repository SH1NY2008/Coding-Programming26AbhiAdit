import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/context'
import { AuthProvider } from '@/lib/auth-context'
import { LocationProvider } from '@/lib/location-context'
import { Header } from '@/components/header'
import { SiteFooter } from '@/components/site-footer'
import { HelpChat } from '@/components/help-chat'
import { Toaster } from "@/components/ui/sonner"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { SmoothScroll } from "@/components/smooth-scroll"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Byte-Sized Business Boost | Support Local Small Businesses',
  description: 'Discover, review, and support local small businesses in your community. Find deals, save favorites, and help local entrepreneurs thrive.',
  keywords: ['local business', 'small business', 'reviews', 'deals', 'community', 'support local'],
  authors: [{ name: 'FBLA Chapter' }],
  generator: 'Next.js',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-black text-white">
        <SmoothScroll>
          <AuthProvider>
            <AppProvider>
              <LocationProvider>
                <Header />
                <main id="main-content" className="min-h-screen pt-20">{children}</main>
                <SiteFooter />
                <HelpChat />
              </LocationProvider>
            </AppProvider>
          </AuthProvider>
        </SmoothScroll>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
