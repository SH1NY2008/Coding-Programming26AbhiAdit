"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowUpRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"



export default function LandingPage() {


  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
          {/* Hero Section */}
          <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden px-4">
            <div
              className="z-10 text-center max-w-5xl mx-auto"
            >
              <h1
                className="text-[12vw] leading-[0.9] font-bold tracking-tighter uppercase mb-6 mix-blend-difference"
              >
                Business
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600">Boost</span>
              </h1>
              
              <p
                className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto mb-12 font-light"
              >
                Discover local gems, unlock exclusive deals, and support the heartbeat of your community.
              </p>

              <div
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
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0 z-0 opacity-20">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-900 to-blue-900 rounded-full blur-[120px]" />
            </div>
            
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500"
            >
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-500 to-transparent" />
            </div>
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
              <Button asChild variant="outline" className="hidden md:flex rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white group">
                <Link href="/browse">
                  View All <ArrowUpRight className="ml-2 w-4 h-4 group-hover:rotate-45 transition-transform" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <p className="text-neutral-500 col-span-full text-center">No businesses found.</p>
            </div>
            
             <div className="mt-12 flex justify-center md:hidden">
              <Button asChild variant="outline" className="rounded-full border-neutral-700 hover:bg-neutral-900 hover:text-white">
                <Link href="/browse">
                  View All <ArrowUpRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </section>
        </div>
  )
}


