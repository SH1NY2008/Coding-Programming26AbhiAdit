"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Deal, Business } from "@/lib/data";
import { DealCard } from "@/components/deal-card";

export const DealsGrid = ({
  deals,
  businesses,
  className,
}: {
  deals: Deal[];
  businesses: Business[];
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {deals.map((deal, idx) => {
        const business = businesses.find((b) => b.id === deal.businessId);
        if (!business) return null;

        return (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="h-full w-full"
          >
            <DealCard
              deal={deal}
              business={business}
              className="h-full w-full"
            />
          </motion.div>
        );
      })}
    </div>
  );
};
