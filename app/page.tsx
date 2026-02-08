"use client"

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "motion/react"
import { ArrowUpRight, Search, MapPin, Layers, Maximize, Minimize, Plus, Minus, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { getBusinesses, getActiveDeals } from "@/lib/data"
import { useLocation } from "@/lib/location-context"

// Dynamically import Map components to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/ui/map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-md" />,
})
const MapTileLayer = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapTileLayer),
  { ssr: false }
)
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapMarker),
  { ssr: false }
)
const MapPopup = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapPopup),
  { ssr: false }
)
const MapZoomControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapZoomControl),
  { ssr: false }
)
const MapFullscreenControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapFullscreenControl),
  { ssr: false }
)
const MapLocateControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapLocateControl),
  { ssr: false }
)
const MapLayersControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapLayersControl),
  { ssr: false }
)
const MapMarkerClusterGroup = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapMarkerClusterGroup),
  { ssr: false }
)
const MapSearchControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapSearchControl),
  { ssr: false }
)

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const businesses = getBusinesses()
  const deals = getActiveDeals()
  const { latitude, longitude, locationInfo, osmBusinesses } = useLocation()
  const [isMapOpen, setIsMapOpen] = useState(false)
  
  // Default center if location is not available (Lafayette High School, Ballwin, MO)
  const defaultCenter: [number, number] = [38.59550, -90.63751]
  const mapCenter: [number, number] = latitude && longitude ? [latitude, longitude] : defaultCenter

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Merge static and OSM businesses for the map display
  const allBusinesses = [...businesses, ...osmBusinesses].filter(
    (b, i, self) => i === self.findIndex((t) => t.id === b.id)
  )

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20">
        <motion.div 
          style={{ y, opacity }}
          className="z-10 text-center max-w-5xl mx-auto"
        >
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-[10vw] md:text-[12vw] leading-[0.9] font-bold tracking-tighter uppercase mb-6"
          >
            Business
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Boost</span>
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light"
          >
            Discover local gems, unlock exclusive deals, and support the heartbeat of your community.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <div className="relative group w-full sm:w-auto">
              <Input 
                placeholder="Search businesses..." 
                className="h-12 w-full sm:w-80 bg-background/50 backdrop-blur-sm border-border text-foreground rounded-full px-6 focus:ring-1 focus:ring-primary transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            
            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full h-12 px-8 font-medium">
                  Explore Map
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] h-[90vh] p-0 gap-0 overflow-hidden border-none sm:rounded-xl bg-background">
                <div className="sr-only">
                  <DialogTitle>Explore Nearby Businesses</DialogTitle>
                </div>
                <div className="relative h-full w-full">
                  <Map
                    center={mapCenter}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <MapLayersControl position="top-right">
                      <MapTileLayer 
                        name="Dark Matter"
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                      <MapTileLayer 
                        name="Voyager"
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                      />
                    </MapLayersControl>
                    
                    <MapZoomControl position="bottom-right" />
                    <MapFullscreenControl position="top-right" />
                    <MapLocateControl position="bottom-right" />
                    
                    {/* User Location Marker */}
                    {latitude && longitude && (
                      <MapMarker position={[latitude, longitude]}>
                        <MapPopup>
                          <div className="p-2 min-w-[150px]">
                            <h3 className="font-bold text-sm mb-1">You are here</h3>
                            <p className="text-xs text-muted-foreground">{locationInfo?.city || "Current Location"}</p>
                          </div>
                        </MapPopup>
                      </MapMarker>
                    )}

                    {/* Business Clusters */}
                    <MapMarkerClusterGroup>
                      {allBusinesses.map((business) => {
                         // Ensure we have valid coordinates. 
                         // Note: The static data might not have lat/lon for all, so we mock some nearby points if missing for demo
                         // In a real app, you'd filter out businesses without coordinates.
                         const lat = business.latitude || defaultCenter[0] + (Math.random() - 0.5) * 0.05
                         const lng = business.longitude || defaultCenter[1] + (Math.random() - 0.5) * 0.05
                         
                         return (
                           <MapMarker 
                             key={business.id} 
                             position={[lat, lng]}
                           >
                             <MapPopup>
                               <div className="p-2 w-[200px]">
                                 <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                                   <Image 
                                     src={business.imageUrl || "/placeholder.jpg"} 
                                     alt={business.name}
                                     fill
                                     className="object-cover"
                                   />
                                 </div>
                                 <h3 className="font-bold text-sm mb-1">{business.name}</h3>
                                 <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{business.description}</p>
                                 <Link href={`/business/${business.id}`}>
                                   <Button size="sm" className="w-full h-7 text-xs">View Details</Button>
                                 </Link>
                               </div>
                             </MapPopup>
                           </MapMarker>
                         )
                      })}
                    </MapMarkerClusterGroup>

                  </Map>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-500/30 to-blue-500/30 rounded-full blur-[120px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
        </motion.div>
      </section>

      {/* Marquee Section */}
      <section className="py-20 border-y border-border overflow-hidden bg-muted/50">
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-20 items-center px-10"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 text-8xl font-bold text-muted-foreground/20 uppercase tracking-tighter select-none">
                <span>Support Local</span>
                <span className="text-muted-foreground/10">Find Deals</span>
                <span>Community First</span>
                <span className="text-muted-foreground/10">Grow Together</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Featured <br/> <span className="text-muted-foreground">Businesses</span></h2>
          </div>
          <Button variant="outline" className="hidden md:flex rounded-full group">
            View All <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.slice(0, 6).map((business, index) => (
            <CardItem key={business.id} business={business} index={index} />
          ))}
        </div>
        
         <div className="mt-12 flex justify-center md:hidden">
          <Button variant="outline" className="rounded-full">
            View All <ArrowUpRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Deals Section - Horizontal Scroll */}
      <section className="py-32 bg-muted/30 border-t border-border">
         <div className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-bold">Hot <span className="text-muted-foreground">Deals</span></h2>
         </div>
         
         <div className="overflow-x-auto pb-12 px-4 md:px-8 hide-scrollbar flex gap-6 snap-x snap-mandatory">
            {deals.map((deal, index) => (
              <motion.div 
                key={deal.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="min-w-[300px] md:min-w-[400px] snap-center"
              >
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-card mb-4 border border-border">
                  <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {deal.dealType === 'percentage' ? `${deal.discountPercent}% OFF` : 'SPECIAL OFFER'}
                  </div>
                  <div className="absolute inset-0 bg-muted/50 animate-pulse" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                     <Button className="rounded-full">Claim Deal</Button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{deal.title}</h3>
                <p className="text-muted-foreground text-sm">{deal.description}</p>
              </motion.div>
            ))}
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-4 text-center bg-primary text-primary-foreground relative overflow-hidden">
         <div className="max-w-4xl mx-auto relative z-10">
           <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8">Ready to Boost?</h2>
           <p className="text-xl md:text-2xl text-primary-foreground/80 mb-12 max-w-2xl mx-auto">Join thousands of local businesses and community members supporting the local economy.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button size="lg" variant="secondary" className="h-14 px-10 rounded-full text-lg">
               Get Started
             </Button>
             <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
               Learn More
             </Button>
           </div>
         </div>
      </section>
    </div>
  )
}

function CardItem({ business, index }: { business: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group"
      suppressHydrationWarning
    >
      <Link href={`/business/${business.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-card mb-4 border border-border">
          <Image 
            src={business.imageUrl || "/placeholder.jpg"} 
            alt={business.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">{business.category}</p>
                <h3 className="text-2xl font-bold text-white leading-tight">{business.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
