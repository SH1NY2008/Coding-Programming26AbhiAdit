"use client";

import { useApp } from "@/lib/context";
import { DealCard } from "@/components/deal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Clock, Percent, Gift, Ticket, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";

export default function DealsPage() {
  const { deals, businesses } = useApp();
  const [activeTab, setActiveTab] = useState("all");

  const activeDeals = useMemo(() => {
    const now = new Date();
    return deals.filter((deal) => {
      const start = new Date(deal.validFrom);
      const end = new Date(deal.expiresAt);
      return now >= start && now <= end && deal.isActive;
    });
  }, [deals]);

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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-300">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Tag className="h-5 w-5" />
                <span className="text-sm font-medium">Active Deals</span>
              </div>
              <p className="text-3xl font-bold">{activeDeals.length}</p>
            </div>
            <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-300">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Percent className="h-5 w-5" />
                <span className="text-sm font-medium">% Off</span>
              </div>
              <p className="text-3xl font-bold">{dealCounts.percentage}</p>
            </div>
            <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-300">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Gift className="h-5 w-5" />
                <span className="text-sm font-medium">BOGO</span>
              </div>
              <p className="text-3xl font-bold">{dealCounts.bogo}</p>
            </div>
            <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors duration-300">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Ending Soon</span>
              </div>
              <p className="text-3xl font-bold">
                {
                  activeDeals.filter((d) => {
                    const daysLeft = Math.ceil(
                      (new Date(d.expiresAt).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return daysLeft <= 3;
                  }).length
                }
              </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredDeals.map((deal, index) => {
                    const business = businesses.find(
                      (b) => b.id === deal.businessId
                    );
                    if (!business) return null;
                    return (
                      <div
                        key={deal.id}
                        className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <DealCard deal={deal} business={business} />
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        {/* How it Works */}
        <section className="py-12 border-t border-border/50 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">1. Find a Deal</h3>
              <p className="text-muted-foreground leading-relaxed">
                Browse through our curated list of exclusive offers from verified local businesses. Filter by category to find exactly what you need.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">2. Get Your Code</h3>
              <p className="text-muted-foreground leading-relaxed">
                Click "Get Code" to reveal your unique redemption code. We'll verify the deal is still active and available for you.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">3. Redeem & Save</h3>
              <p className="text-muted-foreground leading-relaxed">
                Show the code at the business location or use it during checkout. Enjoy your savings while supporting the local community.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
