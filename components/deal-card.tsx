"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Store,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type Deal, type Business, getBusinessById, redeemDeal } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DealCardProps {
  deal: Deal;
  business?: Business;
  showBusiness?: boolean;
  className?: string;
}

export function DealCard({ deal, business: providedBusiness, showBusiness = true, className }: DealCardProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const business = providedBusiness || (showBusiness ? getBusinessById(deal.businessId) : null);
  const redemptionPercent = (deal.redemptions / deal.maxRedemptions) * 100;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(deal.expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else setTimeLeft(`${minutes}m`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [deal.expiresAt]);

  const handleRevealCode = () => {
    if (!codeRevealed && !isExpired) {
      redeemDeal(deal.id);
      setCodeRevealed(true);
      toast.success("Code revealed!");
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(deal.code);
      setCodeCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between h-full bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-neutral-800/50",
        isExpired && "opacity-60 grayscale",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5">
            {showBusiness && business && (
              <Link href={`/business?id=${business.id}`} className="flex items-center gap-2 text-neutral-400 text-xs font-medium uppercase tracking-wider hover:text-white transition-colors">
                <Store className="h-3 w-3" />
                <span>{business.name}</span>
              </Link>
            )}
            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-emerald-400 transition-colors">
              {deal.title}
            </h3>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-full px-3 py-1 font-mono text-xs tracking-wider border",
              deal.dealType === "percentage" 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}
          >
            {deal.discountPercent > 0 ? `-${deal.discountPercent}%` : "DEAL"}
          </Badge>
        </div>

        {/* Pricing */}
        {deal.originalPrice && deal.dealPrice && (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-white">
              ${deal.dealPrice.toFixed(2)}
            </span>
            <span className="text-lg text-neutral-600 line-through decoration-neutral-600">
              ${deal.originalPrice.toFixed(2)}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
          {deal.description}
        </p>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-500 uppercase tracking-wider font-medium">
            <span>Availability</span>
            <span>{Math.max(0, deal.maxRedemptions - deal.redemptions)} left</span>
          </div>
          <Progress 
            value={redemptionPercent} 
            className="h-1 bg-neutral-800" 
            indicatorClassName={isExpired ? "bg-red-500" : "bg-emerald-500"} 
          />
        </div>
      </div>

      {/* Footer / Action Area */}
      <div className="p-6 pt-0 mt-auto">
         {/* Code Reveal / Action Button */}
         {!isExpired && (
          <div className="mt-4">
            {codeRevealed ? (
              <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-full border border-white/10">
                <code className="flex-1 text-center font-mono text-lg text-white font-bold tracking-widest px-4">
                  {deal.code}
                </code>
                <Button
                  size="icon"
                  onClick={handleCopyCode}
                  className="rounded-full h-9 w-9 bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                >
                  {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRevealCode}
                className="w-full rounded-full bg-white text-black hover:bg-neutral-200 font-bold h-12 tracking-wide transition-all group-hover:translate-y-0 translate-y-0 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                disabled={deal.redemptions >= deal.maxRedemptions}
              >
                {deal.redemptions >= deal.maxRedemptions ? "SOLD OUT" : "REVEAL CODE"}
              </Button>
            )}
          </div>
        )}

        {/* Footer Meta */}
        <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 font-medium border-t border-white/5 pt-4">
          <div className={cn("flex items-center gap-1.5", isExpired && "text-red-500")}>
            <Clock className="h-3.5 w-3.5" />
            <span>{isExpired ? "Expired" : timeLeft}</span>
          </div>
          <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
            <CollapsibleTrigger className="hover:text-white transition-colors flex items-center gap-1">
              Terms <ChevronDown className={cn("h-3 w-3 transition-transform", termsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute bottom-full left-0 right-0 p-4 bg-neutral-800 border-t border-white/10 text-neutral-300 text-xs shadow-xl z-10 mx-6 mb-2 rounded-xl">
               {deal.termsAndConditions}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
