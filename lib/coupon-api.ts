import { Deal, Business } from "./data";
import { CONFIG } from "./config";

export interface CouponApiOffer {
  offer_id: string | number;
  title: string;
  description: string;
  label: string;
  code: string;
  featured: string;
  source: string;
  affiliate_link: string;
  image_url: string | null;
  brand_logo: string;
  type: string;
  store: string;
  merchant_home_page: string;
  categories: string;
  start_date: string | null;
  end_date: string;
  status: string;
  primary_location: string;
  rating: number;
  coupons_left?: number;
  coupons_avail?: number;
}

export async function fetchCoupons(lat?: number, lon?: number): Promise<CouponApiOffer[]> {
  try {
    let url = '/api/coupons';
    if (typeof window !== 'undefined') {
      if (lat && lon) {
        url = `/api/coupons?lat=${lat}&lon=${lon}`;
      } else {
        // Fallback or error if location is required but not provided client-side
        console.warn("Fetching coupons without location data.");
      }
    } else {
      // Server-side rendering, direct call
      url = `${CONFIG.COUPON_API.BASE_URL}?API_KEY=${CONFIG.COUPON_API.KEY}&format=json`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch coupons:", response.statusText);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.offers || []);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export function mapCouponToDealAndBusiness(coupon: CouponApiOffer): { deal: Deal, business: Business } {
  const businessId = `coupon-api-${coupon.store.replace(/\s+/g, '-').toLowerCase()}`;
  
  // Format logo URL
  let logoUrl = coupon.brand_logo;
  if (logoUrl) {
    logoUrl = logoUrl.replace("[size]", "200").replace("[format]", "png");
  }

  const business: Business = {
    id: businessId,
    name: coupon.store,
    description: `Deals and offers from ${coupon.store}`,
    category: "Retail", // Default category
    subcategory: coupon.categories || "General",
    address: "Online",
    city: "Internet",
    state: "NA",
    zipCode: "00000",
    phone: "",
    email: "",
    website: coupon.merchant_home_page || "",
    imageUrl: logoUrl || "",
    hours: {},
    priceLevel: 2,
    averageRating: coupon.rating || 4,
    totalReviews: 0,
    latitude: 0,
    longitude: 0,
    tags: ["Online", "Coupon"],
    createdAt: new Date().toISOString(),
    isOpen: true
  };

  // Determine deal type and discount percent
  let dealType: Deal['dealType'] = 'fixed';
  let discountPercent = 0;
  
  const titleLower = coupon.title.toLowerCase();
  const labelLower = coupon.label.toLowerCase();
  
  if (titleLower.includes("%") || labelLower.includes("%")) {
    dealType = 'percentage';
    const percentMatch = (coupon.title + " " + coupon.label).match(/(\d+)%/);
    if (percentMatch) {
      discountPercent = parseInt(percentMatch[1], 10);
    }
  } else if (titleLower.includes("free") || labelLower.includes("free")) {
    dealType = 'freebie';
  } else if (titleLower.includes("bogo") || titleLower.includes("buy one")) {
    dealType = 'bogo';
  }

  const deal: Deal = {
    id: `coupon-${coupon.offer_id}`,
    businessId: businessId,
    title: coupon.title,
    description: coupon.description || coupon.label || coupon.title,
    discountPercent: discountPercent,
    code: coupon.code,
    termsAndConditions: "See merchant website for details.",
    expiresAt: coupon.end_date ? new Date(coupon.end_date).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    validFrom: coupon.start_date ? new Date(coupon.start_date).toISOString() : new Date().toISOString(),
    isActive: true,
    dealType: dealType,
    redemptions: 0,
    maxRedemptions: 1000,
    coupons_left: coupon.coupons_left,
    coupons_avail: coupon.coupons_avail,
    createdAt: new Date().toISOString()
  };

  return { deal, business };
}
