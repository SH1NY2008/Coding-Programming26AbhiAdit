"use client";

import { useApp } from "@/lib/context";
import { useLocation } from "@/lib/location-context";
import { DealsGrid } from "@/components/deals-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Clock, Percent, Gift, Ticket, TrendingUp, MapPin, ArrowUpRight } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Business, Deal } from "@/lib/data";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

import { Marquee } from "@/components/marquee";

export default function DealsPage() {
  const { deals, businesses, addBusiness, addDeal } = useApp();
  const { getDistanceFromUser, locationError, isLoadingLocation, osmBusinesses, setSearchRadius } = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  // Set search radius to 5 miles (approx 8047 meters) on mount
  useEffect(() => {
    setSearchRadius(8047);
  }, [setSearchRadius]);

  // Automatically onboard OSM businesses and create deals for them if missing
  useEffect(() => {
    if (osmBusinesses.length > 0) {
      osmBusinesses.forEach(osmBusiness => {
        // 1. Add business if not exists
        const existingBusiness = businesses.find(b => b.id === osmBusiness.id);
        if (!existingBusiness) {
          addBusiness(osmBusiness);
        }

        // 2. Add deal if not exists for this business
        const existingDeals = deals.filter(d => d.businessId === osmBusiness.id);
        if (existingDeals.length === 0) {
           const seed = osmBusiness.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
           const dealTypes: Deal["dealType"][] = ["percentage", "bogo", "fixed", "freebie"];
           const type = dealTypes[seed % dealTypes.length];
           
           const deal: Deal = {
             id: `osm-deal-${osmBusiness.id}`,
             businessId: osmBusiness.id,
             title: generateDealTitle(type, osmBusiness.name),
             description: `Special offer at ${osmBusiness.name}! Visit us to redeem.`,
             discountPercent: type === "percentage" ? (seed % 5 + 1) * 10 : 0,
             dealPrice: type === "fixed" ? (seed % 20 + 5) : undefined,
             originalPrice: type === "fixed" ? (seed % 20 + 25) : undefined,
             code: `LOCAL${seed % 1000}`,
             termsAndConditions: "Valid for in-store purchases only.",
             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
             validFrom: new Date().toISOString(),
             isActive: true,
             dealType: type,
             redemptions: 0,
             maxRedemptions: 100,
             createdAt: new Date().toISOString(),
           };
           addDeal(deal);
        }
      });
    }
  }, [osmBusinesses, businesses, deals, addBusiness, addDeal]);

  const nearbyDeals = useMemo(() => {
    return deals.filter((deal) => {
      const business = businesses.find((b) => b.id === deal.businessId);
      if (!business) return false;

      // Filter by location if available
      const distance = getDistanceFromUser(business.latitude, business.longitude);
      // Show deals within 10 miles for better demo population
      return distance !== null && distance <= 16093.4; // 10 miles
    });
  }, [deals, businesses, getDistanceFromUser]);

  const filteredDeals = useMemo(() => {
    // If we have nearby deals, use those. Otherwise fallback to all deals for demo purposes if location fails
    const sourceDeals = nearbyDeals.length > 0 ? nearbyDeals : deals;
    
    if (activeTab === "all") return sourceDeals;
    return sourceDeals.filter((deal) => deal.dealType === activeTab);
  }, [nearbyDeals, deals, activeTab]);

  const dealCounts = useMemo(() => {
    const sourceDeals = nearbyDeals.length > 0 ? nearbyDeals : deals;
    return {
      all: sourceDeals.length,
      percentage: sourceDeals.filter((d) => d.dealType === "percentage").length,
      bogo: sourceDeals.filter((d) => d.dealType === "bogo").length,
      fixed: sourceDeals.filter((d) => d.dealType === "fixed").length,
      freebie: sourceDeals.filter((d) => d.dealType === "freebie").length,
    };
  }, [nearbyDeals, deals]);

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case "percentage": return <Percent className="h-8 w-8 text-muted-foreground" />;
      case "bogo": return <Gift className="h-8 w-8 text-muted-foreground" />;
      case "fixed": return <Tag className="h-8 w-8 text-muted-foreground" />;
      case "freebie": return <Ticket className="h-8 w-8 text-muted-foreground" />;
      default: return <Tag className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground selection:bg-emerald-500/30">
      <Marquee text="EXCLUSIVE DEALS • LIMITED TIME OFFERS • LOCAL BUSINESSES • SAVE BIG • DISCOVER NEW PLACES •" />
      
      <main className="container mx-auto px-4 pt-16 pb-24">
        {/* Header Section */}
        <section className="mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
            <div>
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-6">
                THE VAULT
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed">
                Curated deals and exclusive offers from the best local businesses. 
                Unlock savings on food, services, and experiences near you.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-4">
               {isLoadingLocation && (
                <div className="flex items-center gap-2 text-neutral-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm">Locating nearby offers...</span>
                </div>
               )}
               <div className="text-right">
                 <div className="text-4xl font-bold text-emerald-500">{filteredDeals.length}</div>
                 <div className="text-sm text-neutral-500 uppercase tracking-widest">Active Deals</div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Filters & Grid */}
        <section className="space-y-8">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-4 z-40 flex items-center justify-between mb-12">
              <div className="bg-neutral-900/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full inline-flex">
                <TabsList className="h-auto bg-transparent p-0 gap-1">
                  {[
                    { id: "all", label: "All" },
                    { id: "percentage", label: "% Off" },
                    { id: "bogo", label: "BOGO" },
                    { id: "fixed", label: "Fixed" },
                    { id: "freebie", label: "Freebies" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-black hover:text-white transition-all"
                    >
                      {tab.label} <span className="ml-2 opacity-50 text-xs">{dealCounts[tab.id as keyof typeof dealCounts]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
              <AnimatePresence mode="wait">
                {filteredDeals.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-32 text-center border border-white/5 rounded-3xl bg-neutral-900/20"
                  >
                    <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                      {getDealTypeIcon(activeTab)}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No active deals</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-8">
                      {activeTab === "all"
                        ? "There are no active deals at the moment. Please check back later."
                        : `No ${activeTab} deals available right now. Try checking other categories.`}
                    </p>
                    {activeTab !== "all" && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("all")}
                        className="rounded-full border-white/10 hover:bg-white hover:text-black transition-colors"
                      >
                        View All Deals
                      </Button>
                    )}
                  </motion.div>
                ) : (
                  <DealsGrid deals={filteredDeals} businesses={businesses} />
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
}

function generateDealTitle(type: Deal["dealType"], businessName: string): string {
  switch (type) {
    case "percentage": return `Discount at ${businessName}`;
    case "bogo": return `Buy One Get One at ${businessName}`;
    case "fixed": return `Special Price at ${businessName}`;
    case "freebie": return `Free Gift at ${businessName}`;
    default: return `Deal at ${businessName}`;
  }
}
