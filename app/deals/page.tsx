"use client";

import { useApp } from "@/lib/context";
import { useLocation } from "@/lib/location-context";
import { DealsGrid } from "@/components/deals-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Clock, Percent, Gift, Ticket, TrendingUp, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Business, Deal } from "@/lib/data";

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
        // Note: addBusiness checks internally if it exists, but we can check here to avoid unnecessary calls/renders
        const existingBusiness = businesses.find(b => b.id === osmBusiness.id);
        if (!existingBusiness) {
          addBusiness(osmBusiness);
        }

        // 2. Add deal if not exists for this business
        // We check if ANY deal exists for this business. If not, we create one.
        const existingDeals = deals.filter(d => d.businessId === osmBusiness.id);
        if (existingDeals.length === 0) {
           // Deterministic pseudo-random generation based on business ID
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
             expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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
    // If location is not available yet, we might want to show all or none.
    // Given the specific request for "5 mile radius", we'll filter.
    // But if loading, we wait. If error, maybe show all with a warning?
    // Let's filter if we can calculate distance.
    return deals.filter((deal) => {
      const business = businesses.find((b) => b.id === deal.businessId);
      if (!business) return false;
      
      const distance = getDistanceFromUser(business.latitude, business.longitude);
      
      // If distance is unknown (user location not set), show the deal (fallback) 
      // OR hide it? 
      // "check businesses in a 5 mile radius" -> implies filtering.
      if (distance === null) return true; // Fallback to showing all if location unknown
      
      // 5 miles = approx 8047 meters
      return distance <= 8047;
    });
  }, [deals, businesses, getDistanceFromUser]);

  const activeDeals = useMemo(() => {
    const now = new Date();
    return nearbyDeals.filter((deal) => {
      const start = new Date(deal.validFrom);
      const end = new Date(deal.expiresAt);
      return now >= start && now <= end && deal.isActive;
    });
  }, [nearbyDeals]);

  const filteredDeals = useMemo(() => {
    if (activeTab === "all") return activeDeals;
    return activeDeals.filter((deal) => deal.dealType === activeTab);
  }, [activeDeals, activeTab]);

  const dealCounts = useMemo(() => {
    return {
      all: activeDeals.length,
      percentage: activeDeals.filter((d) => d.dealType === "percentage").length,
      bogo: activeDeals.filter((d) => d.dealType === "bogo").length,
      fixed: activeDeals.filter((d) => d.dealType === "fixed").length,
      freebie: activeDeals.filter((d) => d.dealType === "freebie").length,
    };
  }, [activeDeals]);

  const getDealTypeIcon = (type: string) => {
    switch (type) {
      case "percentage":
        return <Percent className="h-4 w-4" aria-hidden="true" />;
      case "bogo":
        return <Gift className="h-4 w-4" aria-hidden="true" />;
      case "fixed":
        return <Tag className="h-4 w-4" aria-hidden="true" />;
      case "freebie":
        return <Ticket className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Tag className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <main className="container mx-auto px-4 py-12 sm:py-24 space-y-24">
        {/* Hero Section */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance">
              Exclusive <span className="text-primary">Local Deals</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Discover verified offers from small businesses in your community. Save money while supporting local entrepreneurs.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 w-fit px-4 py-2 rounded-full text-sm">
              <MapPin className="h-4 w-4" />
              <span>Showing deals within 5 miles of your location</span>
            </div>
          </div>


        </section>

        {/* Deals Feed */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold tracking-tight">Current Offers</h2>
              </div>
              <TabsList className="h-auto p-1 bg-muted/30 rounded-full flex-wrap justify-start">
                {[
                  { id: "all", label: "All", icon: Tag, count: dealCounts.all },
                  { id: "percentage", label: "% Off", icon: Percent, count: dealCounts.percentage },
                  { id: "bogo", label: "BOGO", icon: Gift, count: dealCounts.bogo },
                  { id: "fixed", label: "Fixed", icon: Tag, count: dealCounts.fixed },
                  { id: "freebie", label: "Freebies", icon: Ticket, count: dealCounts.freebie },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-full px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-[1.25rem] justify-center text-[10px]">
                        {tab.count}
                      </Badge>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
              {filteredDeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border rounded-3xl border-dashed">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    {getDealTypeIcon(activeTab)}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No active deals</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    {activeTab === "all"
                      ? "There are no active deals at the moment. Please check back later."
                      : `No ${activeTab} deals available right now. Try checking other categories.`}
                  </p>
                  {activeTab !== "all" && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("all")}
                      className="rounded-full"
                    >
                      View All Deals
                    </Button>
                  )}
                </div>
              ) : (
                <DealsGrid deals={filteredDeals} businesses={businesses} />
              )}
            </TabsContent>
          </Tabs>
        </section>


      </main>
    </div>
  );
}

function generateDealTitle(type: string, businessName: string): string {
  switch (type) {
    case "percentage":
      return "Special Discount";
    case "bogo":
      return "Buy One Get One Free";
    case "fixed":
      return "Fixed Price Deal";
    case "freebie":
      return "Free Gift with Purchase";
    default:
      return "Special Offer";
  }
}

function getDealTypeIcon(type: string) {
  switch (type) {
    case "percentage":
      return <Percent className="w-8 h-8 text-primary" />;
    case "bogo":
      return <Ticket className="w-8 h-8 text-primary" />;
    case "fixed":
      return <Tag className="w-8 h-8 text-primary" />;
    case "freebie":
      return <Gift className="w-8 h-8 text-primary" />;
    default:
      return <TrendingUp className="w-8 h-8 text-primary" />;
  }
}
