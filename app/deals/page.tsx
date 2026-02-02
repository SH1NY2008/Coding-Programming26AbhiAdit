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


      </main>
    </div>
  );
}
