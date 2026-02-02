/**
 * Data Layer for Byte-Sized Business Boost
 * 
 * This module manages all data operations for the application using localStorage
 * for persistence. It includes type definitions, mock data generation, and CRUD
 * operations for businesses, reviews, bookmarks, and deals.
 * 
 * @module data
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a business category with optional subcategories
 */
export interface Category {
  id: string
  name: string
  icon: string
  subcategories?: string[]
}

/**
 * Represents a local business listing
 */
export interface Business {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  imageUrl: string
  hours: {
    [day: string]: { open: string; close: string } | null
  }
  priceLevel: 1 | 2 | 3 | 4
  averageRating: number
  totalReviews: number
  isOpen?: boolean
  latitude: number
  longitude: number
  tags: string[]
  createdAt: string
}

/**
 * Represents a user review for a business
 */
export interface Review {
  id: string
  businessId: string
  userId: string
  userName: string
  rating: number
  comment: string
  helpful: number
  createdAt: string
  verified: boolean
}

/**
 * Represents a bookmark folder for organizing saved businesses
 */
export interface BookmarkFolder {
  id: string
  name: string
  color: string
  businessIds: string[]
  notes: { [businessId: string]: string }
  createdAt: string
}

/**
 * Represents a promotional deal from a business
 */
export interface Deal {
  id: string
  businessId: string
  title: string
  description: string
  discountPercent: number
  originalPrice?: number
  dealPrice?: number
  code: string
  termsAndConditions: string
  expiresAt: string
  validFrom: string
  isActive: boolean
  dealType: 'percentage' | 'bogo' | 'fixed' | 'freebie'
  redemptions: number
  maxRedemptions: number
  createdAt: string
}

/**
 * User session data for tracking activity and rate limiting
 */
export interface UserSession {
  id: string
  reviewsThisHour: number
  lastReviewTime: string
  onboardingComplete: boolean
  highContrastMode: boolean
  createdAt: string
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Available business categories with icons and subcategories
 * Used for filtering and organizing business listings
 */
export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'utensils',
    subcategories: ['Restaurants', 'Cafes', 'Bakeries', 'Fast Food', 'Fine Dining', 'Food Trucks']
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: 'shopping-bag',
    subcategories: ['Clothing', 'Electronics', 'Books', 'Gifts', 'Home Goods', 'Sports']
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'briefcase',
    subcategories: ['Healthcare', 'Automotive', 'Home Services', 'Beauty & Spa', 'Legal', 'Financial']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'music',
    subcategories: ['Movies', 'Live Music', 'Gaming', 'Arts & Crafts', 'Fitness', 'Recreation']
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'graduation-cap',
    subcategories: ['Tutoring', 'Music Lessons', 'Language', 'Art Classes', 'STEM', 'Test Prep']
  }
]

/**
 * Storage keys for localStorage operations
 */
const STORAGE_KEYS = {
  BUSINESSES: 'bsbb_businesses',
  REVIEWS: 'bsbb_reviews',
  BOOKMARKS: 'bsbb_bookmarks',
  DEALS: 'bsbb_deals',
  SESSION: 'bsbb_session'
}

// ============================================================================
// Mock Data Generation
// ============================================================================

/**
 * Generates realistic mock business data for demonstration
 * Each business includes complete information for all features
 */
const generateMockBusinesses = (): Business[] => {
  const businesses: Business[] = [
    {
      id: '1',
      name: 'The Rustic Spoon',
      description: 'Farm-to-table dining featuring locally sourced ingredients and seasonal menus. Our chefs create innovative dishes that celebrate the flavors of our community.',
      category: 'food',
      subcategory: 'Restaurants',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(555) 123-4567',
      email: 'hello@rusticspoon.com',
      website: 'https://rusticspoon.com',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '11:00', close: '21:00' },
        tuesday: { open: '11:00', close: '21:00' },
        wednesday: { open: '11:00', close: '21:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '20:00' }
      },
      priceLevel: 3,
      averageRating: 4.7,
      totalReviews: 234,
      latitude: 39.7817,
      longitude: -89.6501,
      tags: ['Farm-to-table', 'Date Night', 'Outdoor Seating'],
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Bean & Brew Coffee House',
      description: 'Artisan coffee roasted in-house with cozy atmosphere perfect for studying or catching up with friends. We also serve fresh pastries daily.',
      category: 'food',
      subcategory: 'Cafes',
      address: '456 Oak Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      phone: '(555) 234-5678',
      email: 'info@beanandbrew.com',
      website: 'https://beanandbrew.com',
      imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '06:00', close: '20:00' },
        tuesday: { open: '06:00', close: '20:00' },
        wednesday: { open: '06:00', close: '20:00' },
        thursday: { open: '06:00', close: '20:00' },
        friday: { open: '06:00', close: '21:00' },
        saturday: { open: '07:00', close: '21:00' },
        sunday: { open: '07:00', close: '18:00' }
      },
      priceLevel: 2,
      averageRating: 4.8,
      totalReviews: 512,
      latitude: 39.7834,
      longitude: -89.6545,
      tags: ['WiFi', 'Study Spot', 'Pet Friendly'],
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '3',
      name: 'Sweet Delights Bakery',
      description: 'Family-owned bakery specializing in custom cakes, fresh bread, and European pastries made from scratch every morning.',
      category: 'food',
      subcategory: 'Bakeries',
      address: '789 Maple Drive',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      phone: '(555) 345-6789',
      email: 'orders@sweetdelights.com',
      website: 'https://sweetdelights.com',
      imageUrl: 'https://images.unsplash.com/photo-1517433670267-30f41c4f7df9?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '06:00', close: '18:00' },
        tuesday: { open: '06:00', close: '18:00' },
        wednesday: { open: '06:00', close: '18:00' },
        thursday: { open: '06:00', close: '18:00' },
        friday: { open: '06:00', close: '19:00' },
        saturday: { open: '07:00', close: '17:00' },
        sunday: null
      },
      priceLevel: 2,
      averageRating: 4.9,
      totalReviews: 389,
      latitude: 39.7789,
      longitude: -89.6478,
      tags: ['Custom Cakes', 'Gluten-Free Options', 'Wedding Cakes'],
      createdAt: '2024-01-05T10:00:00Z'
    },
    {
      id: '4',
      name: 'Tech Haven Electronics',
      description: 'Your local destination for the latest gadgets, computer repairs, and tech support. We offer personalized service that big box stores cannot match.',
      category: 'retail',
      subcategory: 'Electronics',
      address: '321 Technology Lane',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      phone: '(555) 456-7890',
      email: 'support@techhaven.com',
      website: 'https://techhaven.com',
      imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '09:00', close: '19:00' },
        tuesday: { open: '09:00', close: '19:00' },
        wednesday: { open: '09:00', close: '19:00' },
        thursday: { open: '09:00', close: '19:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '12:00', close: '17:00' }
      },
      priceLevel: 3,
      averageRating: 4.5,
      totalReviews: 156,
      latitude: 39.7856,
      longitude: -89.6612,
      tags: ['Repairs', 'Custom Builds', 'Trade-Ins'],
      createdAt: '2024-03-10T10:00:00Z'
    },
    {
      id: '5',
      name: 'Page Turner Books',
      description: 'Independent bookstore with curated selections, rare finds, and regular author events. Supporting local readers since 1985.',
      category: 'retail',
      subcategory: 'Books',
      address: '567 Library Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(555) 567-8901',
      email: 'hello@pageturnerbooks.com',
      website: 'https://pageturnerbooks.com',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '10:00', close: '18:00' },
        tuesday: { open: '10:00', close: '18:00' },
        wednesday: { open: '10:00', close: '18:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '09:00', close: '19:00' },
        sunday: { open: '11:00', close: '17:00' }
      },
      priceLevel: 2,
      averageRating: 4.9,
      totalReviews: 278,
      latitude: 39.7823,
      longitude: -89.6489,
      tags: ['Author Events', 'Kids Section', 'Book Club'],
      createdAt: '2024-01-20T10:00:00Z'
    },
    {
      id: '6',
      name: 'Bloom Boutique',
      description: 'Trendy clothing and accessories featuring local designers and sustainable fashion. Find your unique style with our personalized styling services.',
      category: 'retail',
      subcategory: 'Clothing',
      address: '890 Fashion Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      phone: '(555) 678-9012',
      email: 'style@bloomboutique.com',
      website: 'https://bloomboutique.com',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '10:00', close: '19:00' },
        tuesday: { open: '10:00', close: '19:00' },
        wednesday: { open: '10:00', close: '19:00' },
        thursday: { open: '10:00', close: '20:00' },
        friday: { open: '10:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '12:00', close: '17:00' }
      },
      priceLevel: 3,
      averageRating: 4.6,
      totalReviews: 198,
      latitude: 39.7801,
      longitude: -89.6534,
      tags: ['Sustainable', 'Local Designers', 'Personal Styling'],
      createdAt: '2024-02-15T10:00:00Z'
    },
    {
      id: '7',
      name: 'Wellness Center & Spa',
      description: 'Full-service spa offering massage therapy, facials, and holistic wellness treatments. Escape the everyday and find your inner peace.',
      category: 'services',
      subcategory: 'Beauty & Spa',
      address: '432 Serenity Lane',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      phone: '(555) 789-0123',
      email: 'relax@wellnessspa.com',
      website: 'https://wellnessspa.com',
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '08:00', close: '19:00' },
        sunday: { open: '10:00', close: '18:00' }
      },
      priceLevel: 4,
      averageRating: 4.8,
      totalReviews: 445,
      latitude: 39.7767,
      longitude: -89.6556,
      tags: ['Massage', 'Facials', 'Couples Packages'],
      createdAt: '2024-01-25T10:00:00Z'
    },
    {
      id: '8',
      name: 'Quick Fix Auto Care',
      description: 'Honest, reliable auto repair with transparent pricing. From oil changes to engine rebuilds, we treat every car like our own.',
      category: 'services',
      subcategory: 'Automotive',
      address: '765 Motor Way',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      phone: '(555) 890-1234',
      email: 'service@quickfixauto.com',
      website: 'https://quickfixauto.com',
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '07:00', close: '18:00' },
        tuesday: { open: '07:00', close: '18:00' },
        wednesday: { open: '07:00', close: '18:00' },
        thursday: { open: '07:00', close: '18:00' },
        friday: { open: '07:00', close: '18:00' },
        saturday: { open: '08:00', close: '14:00' },
        sunday: null
      },
      priceLevel: 2,
      averageRating: 4.7,
      totalReviews: 321,
      latitude: 39.7889,
      longitude: -89.6623,
      tags: ['Free Estimates', 'Loaner Cars', 'Same Day Service'],
      createdAt: '2024-02-05T10:00:00Z'
    },
    {
      id: '9',
      name: 'Harmony Music Studio',
      description: 'Music lessons for all ages and skill levels. Learn piano, guitar, violin, drums, and voice from experienced instructors in a supportive environment.',
      category: 'education',
      subcategory: 'Music Lessons',
      address: '234 Melody Court',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(555) 901-2345',
      email: 'lessons@harmonymusic.com',
      website: 'https://harmonymusic.com',
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '14:00', close: '21:00' },
        tuesday: { open: '14:00', close: '21:00' },
        wednesday: { open: '14:00', close: '21:00' },
        thursday: { open: '14:00', close: '21:00' },
        friday: { open: '14:00', close: '20:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: null
      },
      priceLevel: 2,
      averageRating: 4.9,
      totalReviews: 167,
      latitude: 39.7812,
      longitude: -89.6467,
      tags: ['All Ages', 'Recitals', 'Group Lessons'],
      createdAt: '2024-03-01T10:00:00Z'
    },
    {
      id: '10',
      name: 'FitLife Gym & Training',
      description: 'State-of-the-art fitness facility with personal training, group classes, and nutrition coaching. Your journey to better health starts here.',
      category: 'entertainment',
      subcategory: 'Fitness',
      address: '678 Health Blvd',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      phone: '(555) 012-3456',
      email: 'info@fitlifegym.com',
      website: 'https://fitlifegym.com',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '05:00', close: '23:00' },
        tuesday: { open: '05:00', close: '23:00' },
        wednesday: { open: '05:00', close: '23:00' },
        thursday: { open: '05:00', close: '23:00' },
        friday: { open: '05:00', close: '22:00' },
        saturday: { open: '06:00', close: '20:00' },
        sunday: { open: '07:00', close: '19:00' }
      },
      priceLevel: 3,
      averageRating: 4.6,
      totalReviews: 523,
      latitude: 39.7845,
      longitude: -89.6578,
      tags: ['Personal Training', '24/7 Access', 'Group Classes'],
      createdAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '11',
      name: 'Green Thumb Garden Center',
      description: 'Everything for your garden: plants, tools, soil, and expert advice. We help both beginners and experienced gardeners create beautiful outdoor spaces.',
      category: 'retail',
      subcategory: 'Home Goods',
      address: '999 Garden Path',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      phone: '(555) 123-9876',
      email: 'grow@greenthumb.com',
      website: 'https://greenthumb.com',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '08:00', close: '17:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      priceLevel: 2,
      averageRating: 4.8,
      totalReviews: 289,
      latitude: 39.7756,
      longitude: -89.6501,
      tags: ['Native Plants', 'Workshops', 'Delivery'],
      createdAt: '2024-02-28T10:00:00Z'
    },
    {
      id: '12',
      name: 'Bright Minds Tutoring',
      description: 'Personalized tutoring for K-12 students in all subjects. Our certified teachers help students build confidence and achieve academic success.',
      category: 'education',
      subcategory: 'Tutoring',
      address: '456 Scholar Way',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      phone: '(555) 234-8765',
      email: 'learn@brightminds.com',
      website: 'https://brightminds.com',
      imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&h=600&fit=crop',
      hours: {
        monday: { open: '15:00', close: '20:00' },
        tuesday: { open: '15:00', close: '20:00' },
        wednesday: { open: '15:00', close: '20:00' },
        thursday: { open: '15:00', close: '20:00' },
        friday: { open: '15:00', close: '19:00' },
        saturday: { open: '09:00', close: '15:00' },
        sunday: null
      },
      priceLevel: 3,
      averageRating: 4.9,
      totalReviews: 178,
      latitude: 39.7878,
      longitude: -89.6589,
      tags: ['SAT Prep', 'All Subjects', 'Online Options'],
      createdAt: '2024-03-05T10:00:00Z'
    }
  ]
  
  return businesses
}

/**
 * Generates mock reviews for all businesses
 * Creates realistic review data with varied ratings and comments
 */
const generateMockReviews = (): Review[] => {
  const reviews: Review[] = [
    {
      id: 'r1',
      businessId: '1',
      userId: 'u1',
      userName: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely amazing farm-to-table experience! The seasonal menu was creative and every dish was bursting with flavor. Our server was knowledgeable about the local farms they source from. Will definitely be back!',
      helpful: 24,
      createdAt: '2024-11-15T18:30:00Z',
      verified: true
    },
    {
      id: 'r2',
      businessId: '1',
      userId: 'u2',
      userName: 'Mike T.',
      rating: 4.5,
      comment: 'Great food and atmosphere. The only minor issue was the wait time, but the quality made up for it. The roasted beet salad was incredible!',
      helpful: 15,
      createdAt: '2024-11-10T19:45:00Z',
      verified: true
    },
    {
      id: 'r3',
      businessId: '2',
      userId: 'u3',
      userName: 'Emily R.',
      rating: 5,
      comment: 'Best coffee in town! The atmosphere is perfect for working or studying. Staff is always friendly and remembers my order. Their house roast is phenomenal.',
      helpful: 42,
      createdAt: '2024-11-20T10:15:00Z',
      verified: true
    },
    {
      id: 'r4',
      businessId: '2',
      userId: 'u4',
      userName: 'David L.',
      rating: 4.5,
      comment: 'Love the cozy vibe and the pastries are fresh daily. Sometimes gets crowded during peak hours but worth the wait.',
      helpful: 18,
      createdAt: '2024-11-18T14:20:00Z',
      verified: true
    },
    {
      id: 'r5',
      businessId: '3',
      userId: 'u5',
      userName: 'Jennifer K.',
      rating: 5,
      comment: 'They made our wedding cake and it was absolutely stunning AND delicious! Everyone asked where we got it. The team was so easy to work with.',
      helpful: 67,
      createdAt: '2024-10-28T11:00:00Z',
      verified: true
    },
    {
      id: 'r6',
      businessId: '4',
      userId: 'u6',
      userName: 'Chris P.',
      rating: 4,
      comment: 'Fixed my laptop when other places said it was beyond repair. Fair prices and honest assessment. They explained everything in terms I could understand.',
      helpful: 31,
      createdAt: '2024-11-05T16:30:00Z',
      verified: true
    },
    {
      id: 'r7',
      businessId: '5',
      userId: 'u7',
      userName: 'Amanda B.',
      rating: 5,
      comment: 'A book lovers paradise! The staff recommendations are always spot-on and they host wonderful author events. Supporting local bookstores matters!',
      helpful: 45,
      createdAt: '2024-11-12T13:00:00Z',
      verified: true
    },
    {
      id: 'r8',
      businessId: '6',
      userId: 'u8',
      userName: 'Lisa H.',
      rating: 4.5,
      comment: 'Found the most unique pieces here! Love that they support local designers. The personal styling service helped me find exactly what I needed.',
      helpful: 22,
      createdAt: '2024-11-08T15:45:00Z',
      verified: true
    },
    {
      id: 'r9',
      businessId: '7',
      userId: 'u9',
      userName: 'Robert G.',
      rating: 5,
      comment: 'The hot stone massage was exactly what I needed after a stressful month. The spa is immaculate and the staff is professional. Already booked my next appointment!',
      helpful: 38,
      createdAt: '2024-11-16T17:00:00Z',
      verified: true
    },
    {
      id: 'r10',
      businessId: '8',
      userId: 'u10',
      userName: 'Tom W.',
      rating: 5,
      comment: 'Finally found an honest mechanic! They diagnosed the issue quickly, showed me what was wrong, and the price was exactly what they quoted. No surprises!',
      helpful: 56,
      createdAt: '2024-11-19T09:30:00Z',
      verified: true
    },
    {
      id: 'r11',
      businessId: '9',
      userId: 'u11',
      userName: 'Maria S.',
      rating: 5,
      comment: 'My daughter has been taking piano lessons here for a year and her progress is amazing! The teachers are patient, encouraging, and truly talented.',
      helpful: 29,
      createdAt: '2024-11-14T18:00:00Z',
      verified: true
    },
    {
      id: 'r12',
      businessId: '10',
      userId: 'u12',
      userName: 'Jake M.',
      rating: 4,
      comment: 'Great equipment and variety of classes. The personal trainers know their stuff. Can get busy during peak hours but they keep everything clean.',
      helpful: 19,
      createdAt: '2024-11-17T07:15:00Z',
      verified: true
    }
  ]
  
  return reviews
}

/**
 * Generates mock deals for promotional offers
 * Creates realistic deal data with various discount types
 */
const generateMockDeals = (): Deal[] => {
  const now = new Date()
  const deals: Deal[] = [
    {
      id: 'd1',
      businessId: '1',
      title: 'Weeknight Special',
      description: 'Enjoy 20% off your entire bill on Monday through Wednesday evenings',
      discountPercent: 20,
      code: 'WEEKNIGHT20',
      termsAndConditions: 'Valid Monday-Wednesday after 5pm. Cannot be combined with other offers. Dine-in only. Excludes alcohol and gratuity.',
      expiresAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      dealType: 'percentage',
      redemptions: 45,
      maxRedemptions: 100,
      createdAt: '2024-11-01T10:00:00Z'
    },
    {
      id: 'd2',
      businessId: '2',
      title: 'Morning Boost Bundle',
      description: 'Get a free pastry with any large coffee purchase before 9am',
      discountPercent: 0,
      originalPrice: 8.50,
      dealPrice: 5.50,
      code: 'EARLYBIRD',
      termsAndConditions: 'Valid before 9am only. One per customer per day. While supplies last.',
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      dealType: 'freebie',
      redemptions: 234,
      maxRedemptions: 500,
      createdAt: '2024-11-01T10:00:00Z'
    },
    {
      id: 'd3',
      businessId: '3',
      title: 'Birthday Cake Special',
      description: 'Order a custom birthday cake and get 15% off plus free delivery',
      discountPercent: 15,
      code: 'BIRTHDAY15',
      termsAndConditions: 'Minimum order $50. Free delivery within 10 miles. Order at least 48 hours in advance.',
      expiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      dealType: 'percentage',
      redemptions: 28,
      maxRedemptions: 100,
      createdAt: '2024-10-15T10:00:00Z'
    },
    {
      id: 'd4',
      businessId: '4',
      title: 'Student Tech Discount',
      description: '10% off all repairs with valid student ID',
      discountPercent: 10,
      code: 'STUDENT10',
      termsAndConditions: 'Must present valid student ID at time of service. Cannot be combined with other offers.',
      expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: '2024-09-01T10:00:00Z',
      isActive: true,
      dealType: 'percentage',
      redemptions: 67,
      maxRedemptions: 200,
      createdAt: '2024-09-01T10:00:00Z'
    },
    {
      id: 'd5',
      businessId: '5',
      title: 'Book Club Bundle',
      description: 'Buy 3 books, get the 4th free (equal or lesser value)',
      discountPercent: 25,
      code: 'BOOKCLUB4',
      termsAndConditions: 'Free book must be equal or lesser value to lowest priced book in purchase. Excludes textbooks and special editions.',
      expiresAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      dealType: 'bogo',
      redemptions: 156,
      maxRedemptions: 300,
      createdAt: '2024-11-01T10:00:00Z'
    },
    {
      id: 'd6',
      businessId: '7',
      title: 'First Visit Relaxation',
      description: '30% off your first spa treatment',
      discountPercent: 30,
      code: 'FIRSTVISIT30',
      termsAndConditions: 'New customers only. One per customer. Cannot be combined with other offers or packages.',
      expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: '2024-10-20T10:00:00Z',
      isActive: true,
      dealType: 'percentage',
      redemptions: 89,
      maxRedemptions: 150,
      createdAt: '2024-10-20T10:00:00Z'
    },
    {
      id: 'd7',
      businessId: '8',
      title: 'Oil Change Special',
      description: 'Synthetic oil change for only $39.99 (regularly $59.99)',
      discountPercent: 33,
      originalPrice: 59.99,
      dealPrice: 39.99,
      code: 'OIL40',
      termsAndConditions: 'Includes up to 5 quarts synthetic oil and filter. Additional charges for vehicles requiring more oil.',
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      dealType: 'fixed',
      redemptions: 112,
      maxRedemptions: 200,
      createdAt: '2024-11-01T10:00:00Z'
    },
    {
      id: 'd8',
      businessId: '10',
      title: 'New Year Fitness Special',
      description: 'Join now and get 2 months free with annual membership',
      discountPercent: 17,
      code: 'NEWYEAR2FREE',
      termsAndConditions: 'New members only. Annual membership required. Includes full gym access and group classes.',
      expiresAt: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      validFrom: '2024-12-01T10:00:00Z',
      isActive: true,
      dealType: 'freebie',
      redemptions: 45,
      maxRedemptions: 100,
      createdAt: '2024-12-01T10:00:00Z'
    }
  ]
  
  return deals
}

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Initializes data storage with mock data if empty
 * Called on application startup to ensure data exists
 */
export const initializeData = (): void => {
  if (typeof window === 'undefined') return
  
  // Initialize businesses if not present
  if (!localStorage.getItem(STORAGE_KEYS.BUSINESSES)) {
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(generateMockBusinesses()))
  }
  
  // Initialize reviews if not present
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(generateMockReviews()))
  }
  
  // Initialize deals if not present
  if (!localStorage.getItem(STORAGE_KEYS.DEALS)) {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(generateMockDeals()))
  }
  
  // Initialize bookmarks if not present
  if (!localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) {
    const defaultFolders: BookmarkFolder[] = [
      {
        id: 'default',
        name: 'Favorites',
        color: '#3b82f6',
        businessIds: [],
        notes: {},
        createdAt: new Date().toISOString()
      }
    ]
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(defaultFolders))
  }
  
  // Initialize session if not present
  if (!localStorage.getItem(STORAGE_KEYS.SESSION)) {
    const session: UserSession = {
      id: crypto.randomUUID(),
      reviewsThisHour: 0,
      lastReviewTime: '',
      onboardingComplete: false,
      highContrastMode: false,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  }
}

// ============================================================================
// Business Operations
// ============================================================================

/**
 * Retrieves all businesses from storage
 * @returns Array of all business listings
 */
export const getBusinesses = (): Business[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.BUSINESSES)
  return data ? JSON.parse(data) : []
}

/**
 * Retrieves a single business by ID
 * @param id - The business ID to look up
 * @returns The business object or undefined if not found
 */
export const getBusinessById = (id: string): Business | undefined => {
  const businesses = getBusinesses()
  return businesses.find(b => b.id === id)
}

/**
 * Filters businesses based on search criteria
 * @param filters - Object containing filter parameters
 * @returns Filtered array of businesses
 */
export const filterBusinesses = (filters: {
  search?: string
  category?: string
  subcategory?: string
  priceLevel?: number[]
  minRating?: number
  sortBy?: 'rating' | 'reviews' | 'name' | 'price'
  sortOrder?: 'asc' | 'desc'
}): Business[] => {
  let businesses = getBusinesses()
  
  // Text search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    businesses = businesses.filter(b => 
      b.name.toLowerCase().includes(searchLower) ||
      b.description.toLowerCase().includes(searchLower) ||
      b.tags.some(t => t.toLowerCase().includes(searchLower))
    )
  }
  
  // Category filter
  if (filters.category) {
    businesses = businesses.filter(b => b.category === filters.category)
  }
  
  // Subcategory filter
  if (filters.subcategory) {
    businesses = businesses.filter(b => b.subcategory === filters.subcategory)
  }
  
  // Price level filter
  if (filters.priceLevel && filters.priceLevel.length > 0) {
    businesses = businesses.filter(b => filters.priceLevel!.includes(b.priceLevel))
  }
  
  // Minimum rating filter
  if (filters.minRating) {
    businesses = businesses.filter(b => b.averageRating >= filters.minRating!)
  }
  
  // Sorting
  if (filters.sortBy) {
    const order = filters.sortOrder === 'asc' ? 1 : -1
    businesses.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.averageRating - a.averageRating) * order
        case 'reviews':
          return (b.totalReviews - a.totalReviews) * order
        case 'name':
          return a.name.localeCompare(b.name) * order
        case 'price':
          return (a.priceLevel - b.priceLevel) * order
        default:
          return 0
      }
    })
  }
  
  return businesses
}

/**
 * Checks if a business is currently open based on hours
 * @param business - The business to check
 * @returns Boolean indicating if currently open
 */
export const isBusinessOpen = (business: Business): boolean => {
  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[now.getDay()]
  const hours = business.hours[today]
  
  if (!hours) return false
  
  const currentTime = now.getHours() * 100 + now.getMinutes()
  const openTime = parseInt(hours.open.replace(':', ''))
  const closeTime = parseInt(hours.close.replace(':', ''))
  
  return currentTime >= openTime && currentTime <= closeTime
}

// ============================================================================
// Review Operations
// ============================================================================

/**
 * Retrieves all reviews from storage
 * @returns Array of all reviews
 */
export const getReviews = (): Review[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.REVIEWS)
  return data ? JSON.parse(data) : []
}

/**
 * Retrieves reviews for a specific business
 * @param businessId - The business ID to get reviews for
 * @returns Array of reviews for that business
 */
export const getReviewsByBusiness = (businessId: string): Review[] => {
  return getReviews().filter(r => r.businessId === businessId)
}

/**
 * Adds a new review with rate limiting and spam prevention
 * @param review - The review data to add
 * @returns Object with success status and message
 */
export const addReview = (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'verified'>): {
  success: boolean
  message: string
} => {
  // Check rate limiting
  const session = getSession()
  
  if (!session) {
    return {
      success: false,
      message: 'Session not initialized'
    }
  }

  const now = new Date()
  const lastReview = session.lastReviewTime ? new Date(session.lastReviewTime) : null
  
  if (lastReview) {
    const hoursSinceLastReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60)
    if (hoursSinceLastReview < 1 && session.reviewsThisHour >= 5) {
      return {
        success: false,
        message: 'You have reached the maximum of 5 reviews per hour. Please try again later.'
      }
    }
    if (hoursSinceLastReview >= 1) {
      session.reviewsThisHour = 0
    }
  }
  
  // Basic spam detection
  const spamPatterns = [
    /(.)\1{4,}/i, // Repeated characters
    /https?:\/\//i, // URLs
    /<[^>]+>/i // HTML tags
  ]
  
  if (spamPatterns.some(pattern => pattern.test(review.comment))) {
    return {
      success: false,
      message: 'Your review contains content that appears to be spam. Please revise and try again.'
    }
  }
  
  // Create new review
  const newReview: Review = {
    ...review,
    id: crypto.randomUUID(),
    createdAt: now.toISOString(),
    helpful: 0,
    verified: false
  }
  
  // Save review
  const reviews = getReviews()
  reviews.unshift(newReview)
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
  
  // Update business average rating
  const businessReviews = reviews.filter(r => r.businessId === review.businessId)
  const avgRating = businessReviews.reduce((sum, r) => sum + r.rating, 0) / businessReviews.length
  const businesses = getBusinesses()
  const businessIndex = businesses.findIndex(b => b.id === review.businessId)
  if (businessIndex !== -1) {
    businesses[businessIndex].averageRating = Math.round(avgRating * 10) / 10
    businesses[businessIndex].totalReviews = businessReviews.length
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses))
  }
  
  // Update session
  session.reviewsThisHour += 1
  session.lastReviewTime = now.toISOString()
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  
  return {
    success: true,
    message: 'Your review has been submitted successfully!'
  }
}

/**
 * Marks a review as helpful
 * @param reviewId - The review ID to mark
 */
export const markReviewHelpful = (reviewId: string): void => {
  const reviews = getReviews()
  const reviewIndex = reviews.findIndex(r => r.id === reviewId)
  if (reviewIndex !== -1) {
    reviews[reviewIndex].helpful += 1
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
  }
}

// ============================================================================
// Bookmark Operations
// ============================================================================

/**
 * Retrieves all bookmark folders
 * @returns Array of bookmark folders
 */
export const getBookmarkFolders = (): BookmarkFolder[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
  return data ? JSON.parse(data) : []
}

/**
 * Creates a new bookmark folder
 * @param name - Folder name
 * @param color - Folder color (hex)
 * @returns The created folder
 */
export const createBookmarkFolder = (name: string, color: string): BookmarkFolder => {
  const folders = getBookmarkFolders()
  const newFolder: BookmarkFolder = {
    id: crypto.randomUUID(),
    name,
    color,
    businessIds: [],
    notes: {},
    createdAt: new Date().toISOString()
  }
  folders.push(newFolder)
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
  return newFolder
}

/**
 * Adds a business to a bookmark folder
 * @param folderId - The folder ID
 * @param businessId - The business ID to bookmark
 */
export const addBookmark = (folderId: string, businessId: string): void => {
  const folders = getBookmarkFolders()
  const folderIndex = folders.findIndex(f => f.id === folderId)
  if (folderIndex !== -1 && !folders[folderIndex].businessIds.includes(businessId)) {
    folders[folderIndex].businessIds.push(businessId)
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
  }
}

/**
 * Removes a business from a bookmark folder
 * @param folderId - The folder ID
 * @param businessId - The business ID to remove
 */
export const removeBookmark = (folderId: string, businessId: string): void => {
  const folders = getBookmarkFolders()
  const folderIndex = folders.findIndex(f => f.id === folderId)
  if (folderIndex !== -1) {
    folders[folderIndex].businessIds = folders[folderIndex].businessIds.filter(id => id !== businessId)
    delete folders[folderIndex].notes[businessId]
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
  }
}

/**
 * Checks if a business is bookmarked in any folder
 * @param businessId - The business ID to check
 * @returns Boolean indicating if bookmarked
 */
export const isBookmarked = (businessId: string): boolean => {
  const folders = getBookmarkFolders()
  return folders.some(f => f.businessIds.includes(businessId))
}

/**
 * Updates the note for a bookmarked business
 * @param folderId - The folder ID
 * @param businessId - The business ID
 * @param note - The note text
 */
export const updateBookmarkNote = (folderId: string, businessId: string, note: string): void => {
  const folders = getBookmarkFolders()
  const folderIndex = folders.findIndex(f => f.id === folderId)
  if (folderIndex !== -1) {
    folders[folderIndex].notes[businessId] = note
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
  }
}

/**
 * Deletes a bookmark folder
 * @param folderId - The folder ID to delete
 */
export const deleteBookmarkFolder = (folderId: string): void => {
  if (folderId === 'default') return // Prevent deleting default folder
  const folders = getBookmarkFolders().filter(f => f.id !== folderId)
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
}

// ============================================================================
// Deal Operations
// ============================================================================

/**
 * Retrieves all deals from storage
 * @returns Array of all deals
 */
export const getDeals = (): Deal[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.DEALS)
  return data ? JSON.parse(data) : []
}

/**
 * Retrieves active deals (not expired, not fully redeemed)
 * @returns Array of active deals
 */
export const getActiveDeals = (): Deal[] => {
  const now = new Date()
  return getDeals().filter(d => 
    new Date(d.expiresAt) > now && 
    d.redemptions < d.maxRedemptions
  )
}

/**
 * Retrieves deals for a specific business
 * @param businessId - The business ID
 * @returns Array of deals for that business
 */
export const getDealsByBusiness = (businessId: string): Deal[] => {
  return getActiveDeals().filter(d => d.businessId === businessId)
}

/**
 * Redeems a deal (increments redemption count)
 * @param dealId - The deal ID to redeem
 * @returns Success status
 */
export const redeemDeal = (dealId: string): boolean => {
  const deals = getDeals()
  const dealIndex = deals.findIndex(d => d.id === dealId)
  if (dealIndex !== -1 && deals[dealIndex].redemptions < deals[dealIndex].maxRedemptions) {
    deals[dealIndex].redemptions += 1
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals))
    return true
  }
  return false
}

// ============================================================================
// Session Operations
// ============================================================================

/**
 * Retrieves the current user session
 * @returns The session object
 */
export const getSession = (): UserSession | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const data = localStorage.getItem(STORAGE_KEYS.SESSION)
  return data ? JSON.parse(data) : null
}

/**
 * Updates the session data
 * @param updates - Partial session data to update
 */
export const updateSession = (updates: Partial<UserSession>): void => {
  const session = getSession()
  const updated = { ...session, ...updates }
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updated))
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Report data structure for analytics
 */
export interface ReportData {
  totalBusinesses: number
  totalReviews: number
  averageRating: number
  categoryBreakdown: { category: string; count: number; avgRating: number }[]
  ratingDistribution: { rating: number; count: number }[]
  topRatedBusinesses: Business[]
  mostReviewedBusinesses: Business[]
  recentReviews: Review[]
  dealStats: {
    totalDeals: number
    totalRedemptions: number
    avgDiscountPercent: number
  }
}

/**
 * Generates a comprehensive report of all data
 * @param filters - Optional filters for the report
 * @returns ReportData object with analytics
 */
export const generateReport = (filters?: {
  startDate?: string
  endDate?: string
  category?: string
  minRating?: number
}): ReportData => {
  let businesses = getBusinesses()
  let reviews = getReviews()
  const deals = getDeals()
  
  // Apply filters
  if (filters?.category) {
    businesses = businesses.filter(b => b.category === filters.category)
    const businessIds = new Set(businesses.map(b => b.id))
    reviews = reviews.filter(r => businessIds.has(r.businessId))
  }
  
  if (filters?.minRating) {
    businesses = businesses.filter(b => b.averageRating >= filters.minRating!)
  }
  
  if (filters?.startDate) {
    reviews = reviews.filter(r => new Date(r.createdAt) >= new Date(filters.startDate!))
  }
  
  if (filters?.endDate) {
    reviews = reviews.filter(r => new Date(r.createdAt) <= new Date(filters.endDate!))
  }
  
  // Calculate category breakdown
  const categoryMap = new Map<string, { count: number; totalRating: number }>()
  businesses.forEach(b => {
    const cat = CATEGORIES.find(c => c.id === b.category)?.name || b.category
    const existing = categoryMap.get(cat) || { count: 0, totalRating: 0 }
    categoryMap.set(cat, {
      count: existing.count + 1,
      totalRating: existing.totalRating + b.averageRating
    })
  })
  
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    avgRating: Math.round((data.totalRating / data.count) * 10) / 10
  }))
  
  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach(r => {
    const bucket = Math.min(Math.floor(r.rating) - 1, 4)
    if (bucket >= 0) ratingCounts[bucket]++
  })
  
  const ratingDistribution = ratingCounts.map((count, i) => ({
    rating: i + 1,
    count
  }))
  
  // Get top rated businesses
  const topRatedBusinesses = [...businesses]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5)
  
  // Get most reviewed businesses
  const mostReviewedBusinesses = [...businesses]
    .sort((a, b) => b.totalReviews - a.totalReviews)
    .slice(0, 5)
  
  // Get recent reviews
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
  
  // Calculate deal stats
  const dealStats = {
    totalDeals: deals.length,
    totalRedemptions: deals.reduce((sum, d) => sum + d.redemptions, 0),
    avgDiscountPercent: Math.round(
      deals.reduce((sum, d) => sum + d.discountPercent, 0) / deals.length
    )
  }
  
  return {
    totalBusinesses: businesses.length,
    totalReviews: reviews.length,
    averageRating: Math.round(
      (businesses.reduce((sum, b) => sum + b.averageRating, 0) / businesses.length) * 10
    ) / 10,
    categoryBreakdown,
    ratingDistribution,
    topRatedBusinesses,
    mostReviewedBusinesses,
    recentReviews,
    dealStats
  }
}

/**
 * Exports report data in specified format
 * @param data - The report data to export
 * @param format - Export format (csv, json)
 * @returns Formatted string for download
 */
export const exportReport = (data: ReportData, format: 'csv' | 'json'): string => {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }
  
  // CSV format
  const lines: string[] = [
    'Byte-Sized Business Boost Report',
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    'Summary Statistics',
    `Total Businesses,${data.totalBusinesses}`,
    `Total Reviews,${data.totalReviews}`,
    `Average Rating,${data.averageRating}`,
    '',
    'Category Breakdown',
    'Category,Count,Average Rating'
  ]
  
  data.categoryBreakdown.forEach(cat => {
    lines.push(`${cat.category},${cat.count},${cat.avgRating}`)
  })
  
  lines.push('', 'Rating Distribution', 'Stars,Count')
  data.ratingDistribution.forEach(dist => {
    lines.push(`${dist.rating},${dist.count}`)
  })
  
  lines.push('', 'Top Rated Businesses', 'Name,Rating,Reviews')
  data.topRatedBusinesses.forEach(b => {
    lines.push(`"${b.name}",${b.averageRating},${b.totalReviews}`)
  })
  
  return lines.join('\n')
}
