import { NextResponse } from 'next/server';
import { CONFIG } from '@/lib/config';

export async function GET() {
  try {
    const response = await fetch(`${CONFIG.COUPON_API.BASE_URL}?API_KEY=${CONFIG.COUPON_API.KEY}&format=json`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch coupons: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
