
import { Deal, Business } from './data';

export function mapDiscountToDealAndBusiness(discount: any): { deal: Deal; business: Business } {
  const businessId = `business-${discount.shop.replace(/\s+/g, '-').toLowerCase()}`;
  const dealType = getDealType(discount.deal);
  const discountPercent = dealType === 'percentage' ? parseInt(discount.deal.match(/(\d+)/)?.[0] || '0') : 0;

  const business: Business = {
    id: businessId,
    name: discount.shop,
    description: 'A great shop with many deals.',
    category: 'retail',
    subcategory: 'other',
    address: 'Online',
    city: 'Internet',
    state: 'Web',
    zipCode: '00000',
    phone: 'N/A',
    email: 'contact@onlinestore.com',
    website: 'https://onlinestore.com',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    hours: {},
    priceLevel: 2,
    averageRating: 4.5,
    totalReviews: 100,
    latitude: 0,
    longitude: 0,
    tags: ['online', 'deals'],
    createdAt: new Date().toISOString(),
  };

  const deal: Deal = {
    id: `discount-${discount.name.replace(/\s+/g, '-').toLowerCase()}`,
    businessId: businessId,
    title: discount.name,
    description: discount.description,
    discountPercent: discountPercent,
    code: `SAVE${discountPercent}`,
    termsAndConditions: 'Terms and conditions apply.',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    validFrom: new Date().toISOString(),
    isActive: true,
    dealType: dealType,
    redemptions: discount.coupons_avail - discount.coupons_left,
    maxRedemptions: discount.coupons_avail,
    coupons_left: discount.coupons_left,
    coupons_avail: discount.coupons_avail,
    createdAt: new Date().toISOString(),
  };

  return { deal, business };
}

function getDealType(deal: string): Deal['dealType'] {
  if (deal.includes('%')) {
    return 'percentage';
  } else if (deal.toLowerCase().includes('bogo')) {
    return 'bogo';
  } else if (deal.toLowerCase().includes('free')) {
    return 'freebie';
  } else {
    return 'fixed';
  }
}
