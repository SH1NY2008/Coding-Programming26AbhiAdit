import React from "react"
import type { Metadata, Viewport } from 'next'

import { Anton, Poppins, Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})
 
const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})
import { ClientProviders } from "./client-providers"
import './globals.css'



const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Business Boost | Support Local Small Businesses',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background text-foreground ${anton.variable} ${poppins.variable} ${inter.variable} ${roboto_mono.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
