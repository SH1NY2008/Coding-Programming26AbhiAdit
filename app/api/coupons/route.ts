import { NextRequest, NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';
import { fetchNearbyBusinesses } from '@/lib/geoapify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Fetch both businesses and coupons in parallel
    const [businesses, couponResponse] = await Promise.all([
      fetchNearbyBusinesses(parseFloat(lat), parseFloat(lon)),
      fetch(`${CONFIG.COUPON_API.BASE_URL}?API_KEY=${CONFIG.COUPON_API.KEY}&format=json`)
    ]);

    if (!couponResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch coupons: ${couponResponse.statusText}` },
        { status: couponResponse.status }
      );
    }

    let couponData = await couponResponse.json();

    if (Array.isArray(couponData.offers)) {
      const businessNames = new Set(businesses.map(b => b.name.toLowerCase()));

      // Filter coupons to match business names
      const matchedOffers = couponData.offers.filter((offer: any) => 
        businessNames.has(offer.store.toLowerCase())
      );

      // Shuffle the matched offers
      for (let i = matchedOffers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matchedOffers[i], matchedOffers[j]] = [matchedOffers[j], matchedOffers[i]];
      }

      // Get a random number of coupons between 20 and 50
      const numberOfCoupons = Math.floor(Math.random() * (31)) + 20; // 20 to 50
      couponData.offers = matchedOffers.slice(0, numberOfCoupons);
    }

    return NextResponse.json(couponData);
  } catch (error) {
    console.error("Error fetching coupons or businesses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
