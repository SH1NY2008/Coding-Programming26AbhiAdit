"use client"

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { ArrowUpRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BusinessCard } from "@/components/business-card"
import { getBusinesses, getActiveDeals } from "@/lib/data"
import { SplashScreen } from "@/components/splash-screen"
import { AnimatePresence } from "motion/react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && <LandingPage />}
    </>
  )
}

function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const businesses = getBusinesses()
  const deals = getActiveDeals()
  
  // Hero Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
          {/* Hero Section */}
          <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-4">
            <motion.div 
              style={{ y, opacity }}
              className="z-10 text-center max-w-5xl mx-auto"
            >
              <motion.h1 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="text-[12vw] leading-[0.9] font-bold tracking-tighter uppercase mb-6 mix-blend-difference"
              >
                Business
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">Boost</span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light"
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
                    className="h-12 w-full sm:w-80 bg-neutral-900/50 border-neutral-800 text-white rounded-full px-6 focus:ring-1 focus:ring-white transition-all duration-300"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                </div>
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-neutral-200 h-12 px-8 font-medium">
                  Explore Map
                </Button>
              </motion.div>
            </motion.div>

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 opacity-20">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-900 to-blue-900 rounded-full blur-[120px]" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
            >
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-500 to-transparent" />
            </motion.div>
          </section>

          {/* Marquee Section */}
          <section className="py-20 border-y border-neutral-900 overflow-hidden bg-black">
            <div className="flex whitespace-nowrap overflow-hidden">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                className="flex gap-20 items-center px-10"
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-20 text-8xl font-bold text-neutral-900 uppercase tracking-tighter select-none">
                    <span>Support Local</span>
                    <span className="text-neutral-800">Find Deals</span>
                    <span>Community First</span>
                    <span className="text-neutral-800">Grow Together</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Featured Grid */}
          <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-4">Featured <br/> <span className="text-neutral-500">Businesses</span></h2>
              </div>
              <Button variant="outline" className="hidden md:flex rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white group">
                View All <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.slice(0, 6).map((business, index) => (
                <CardItem key={business.id} business={business} index={index} />
              ))}
            </div>
            
             <div className="mt-12 flex justify-center md:hidden">
              <Button variant="outline" className="rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white">
                View All <ArrowUpRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </section>

          {/* Deals Section - Horizontal Scroll */}
          <section className="py-32 bg-neutral-950 border-t border-neutral-900">
             <div className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
                <h2 className="text-4xl md:text-6xl font-bold">Hot <span className="text-neutral-500">Deals</span></h2>
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
                    <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900 mb-4 border border-neutral-800">
                      <div className="absolute top-4 left-4 z-10 bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
                        {deal.dealType === 'percentage' ? `${deal.discountPercent}% OFF` : 'SPECIAL OFFER'}
                      </div>
                      <div className="absolute inset-0 bg-neutral-800 animate-pulse" /> {/* Placeholder */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                         <Button className="rounded-full bg-white text-black hover:bg-neutral-200">Claim Deal</Button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{deal.title}</h3>
                    <p className="text-neutral-500 text-sm">{deal.description}</p>
                  </motion.div>
                ))}
             </div>
          </section>

          {/* CTA Section */}
          <section className="py-40 px-4 text-center bg-white text-black relative overflow-hidden">
             <div className="max-w-4xl mx-auto relative z-10">
               <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8">Ready to Boost?</h2>
               <p className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-2xl mx-auto">Join thousands of local businesses and community members supporting the local economy.</p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button size="lg" className="h-14 px-10 rounded-full text-lg bg-black text-white hover:bg-neutral-800">
                   Get Started
                 </Button>
                 <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg border-neutral-300 hover:bg-neutral-100">
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
    >
      <Link href={`/business/${business.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900 mb-4 border border-neutral-800">
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
