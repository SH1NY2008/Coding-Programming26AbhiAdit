
import { mapDiscountToDealAndBusiness } from './discount-api';

/**
 * Data Layer for Business Boost
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

export interface BusinessWithDistance extends Business {
  distance: number | null
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
  coupons_left?: number
  coupons_avail?: number
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
const rawDiscounts = [ 
     { 
         "name": "Scraped Deal 1", 
         "description": "A fantastic deal scraped from the web.", 
         "shop": "Online Store", 
         "deal": "50% off", 
         "coupons_left": 25, 
         "coupons_avail": 25 
     }, 
     { 
         "name": "Scraped Deal 2", 
         "description": "Another great deal from another site.", 
         "shop": "Web Shop", 
         "deal": "$10 off", 
         "coupons_left": 10, 
         "coupons_avail": 10 
     }, 
     { 
         "name": "Weekend Special", 
         "description": "25% off all weekend.", 
         "shop": "The Gadget Hub", 
         "deal": "25% off", 
         "coupons_left": 150, 
         "coupons_avail": 150 
     }, 
     { 
         "name": "Student Discount", 
         "description": "10% off for students.", 
         "shop": "Bookworm's Paradise", 
         "deal": "10% off", 
         "coupons_left": 200, 
         "coupons_avail": 200 
     }, 
     { 
         "name": "Lunch Combo", 
         "description": "$5 off any lunch combo.", 
         "shop": "Quick Bites", 
         "deal": "$5 off", 
         "coupons_left": 75, 
         "coupons_avail": 75 
     }, 
     { 
         "name": "New Customer Offer", 
         "description": "15% off your first order.", 
         "shop": "Fresh Blooms", 
         "deal": "15% off", 
         "coupons_left": 120, 
         "coupons_avail": 120 
     }, 
     { 
         "name": "Clearance Sale", 
         "description": "Up to 70% off on select items.", 
         "shop": "Fashion Forward", 
         "deal": "Up to 70% off", 
         "coupons_left": 300, 
         "coupons_avail": 300 
     }, 
     { 
         "name": "Two for One Tuesdays", 
         "description": "Buy one get one free on all main courses.", 
         "shop": "The Italian Corner", 
         "deal": "BOGO", 
         "coupons_left": 40, 
         "coupons_avail": 40 
     }, 
     { 
         "name": "Morning Coffee Deal", 
         "description": "Coffee and a pastry for $5.", 
         "shop": "The Daily Grind", 
         "deal": "$5 combo", 
         "coupons_left": 90, 
         "coupons_avail": 90 
     }, 
     { 
         "name": "Tech Thursday", 
         "description": "$50 off any laptop.", 
         "shop": "The Gadget Hub", 
         "deal": "$50 off", 
         "coupons_left": 15, 
         "coupons_avail": 15 
     }, 
     { 
         "name": "Free Shipping", 
         "description": "Free shipping on all orders over $50.", 
         "shop": "Online Store", 
         "deal": "Free Shipping", 
         "coupons_left": 1000, 
         "coupons_avail": 1000 
     }, 
     { 
         "name": "Birthday Treat", 
         "description": "Free dessert on your birthday.", 
         "shop": "The Sweet Spot", 
         "deal": "Free Dessert", 
         "coupons_left": 500, 
         "coupons_avail": 500 
     }, 
     { 
         "name": "Family Pack", 
         "description": "Family meal for $30.", 
         "shop": "Quick Bites", 
         "deal": "$30 meal", 
         "coupons_left": 60, 
         "coupons_avail": 60 
     }, 
     { 
         "name": "Early Access", 
         "description": "30% off for members.", 
         "shop": "Fashion Forward", 
         "deal": "30% off", 
         "coupons_left": 100, 
         "coupons_avail": 100 
     }, 
     { 
         "name": "Holiday Special", 
         "description": "20% off all holiday items.", 
         "shop": "Fresh Blooms", 
         "deal": "20% off", 
         "coupons_left": 80, 
         "coupons_avail": 80 
     }, 
     { 
         "name": "Book Club Discount", 
         "description": "15% off for book club members.", 
         "shop": "Bookworm's Paradise", 
         "deal": "15% off", 
         "coupons_left": 110, 
         "coupons_avail": 110 
     }, 
     { 
         "name": "Happy Hour Drinks", 
         "description": "50% off all cocktails.", 
         "shop": "The Corner Bar", 
         "deal": "50% off", 
         "coupons_left": 30, 
         "coupons_avail": 30 
     }, 
     { 
         "name": "Gaming Deal", 
         "description": "Buy any 2 games, get 1 free.", 
         "shop": "The Gadget Hub", 
         "deal": "B2G1 Free", 
         "coupons_left": 20, 
         "coupons_avail": 20 
     }, 
     { 
         "name": "Subscription Offer", 
         "description": "First month free.", 
         "shop": "Online Store", 
         "deal": "First Month Free", 
         "coupons_left": 250, 
         "coupons_avail": 250 
     }, 
     { 
         "name": "Bulk Discount", 
         "description": "10% off on orders over $100.", 
         "shop": "Web Shop", 
         "deal": "10% off", 
         "coupons_left": 180, 
         "coupons_avail": 180 
     }, 
     { 
         "name": "Refer a Friend", 
         "description": "Get $10 credit for every friend you refer.", 
         "shop": "Online Store", 
         "deal": "$10 credit", 
         "coupons_left": 1000, 
         "coupons_avail": 1000 
     }, 
     { 
         "name": "Flash Sale", 
         "description": "40% off for the next hour.", 
         "shop": "Fashion Forward", 
         "deal": "40% off", 
         "coupons_left": 5, 
         "coupons_avail": 5 
     } 
 ];

const processedData = (() => {
    const deals: Deal[] = [];
    const businesses: Business[] = [];
    const businessIds = new Set<string>();

    rawDiscounts.forEach(discount => {
        const { deal, business } = mapDiscountToDealAndBusiness(discount);
        deals.push(deal);
        if (!businessIds.has(business.id)) {
            businesses.push(business);
            businessIds.add(business.id);
        }
    });

    return { deals, businesses };
})();

/**
 * Generates realistic mock business data for demonstration
 * Each business includes complete information for all features
 */
const generateMockBusinesses = (): Business[] => {
  return processedData.businesses;
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
  return processedData.deals;
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
  
  // Initialize businesses
  localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(generateMockBusinesses()))
  
  // Initialize reviews if not present
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(generateMockReviews()))
  }
  
  // Initialize deals
  localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(generateMockDeals()))
  
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
 * Saves a business to storage if it doesn't exist
 * Used when bookmarking businesses from external sources (e.g. OSM)
 * @param business - The business to save
 */
export const saveBusiness = (business: Business): void => {
  if (typeof window === 'undefined') return
  const businesses = getBusinesses()
  if (!businesses.find(b => b.id === business.id)) {
    businesses.push(business)
    localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses))
  }
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
 * Adds or updates a note for a bookmarked business
 * @param folderId - The folder ID
 * @param businessId - The business ID
 * @param note - The note content
 */
export const updateBookmarkNote = (folderId: string, businessId: string, note: string): void => {
  const folders = getBookmarkFolders()
  const folderIndex = folders.findIndex(f => f.id === folderId)
  if (folderIndex !== -1 && folders[folderIndex].businessIds.includes(businessId)) {
    folders[folderIndex].notes[businessId] = note
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(folders))
  }
}

/**
 * Checks if a business is bookmarked in any folder
 * @param businessId - The business ID to check
 * @returns True if bookmarked, false otherwise
 */
export const isBookmarked = (businessId: string): boolean => {
  const folders = getBookmarkFolders()
  return folders.some(f => f.businessIds.includes(businessId))
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
 * Saves a deal to storage if it doesn't exist
 * @param deal - The deal to save
 */
export const saveDeal = (deal: Deal): void => {
  if (typeof window === 'undefined') return
  const deals = getDeals()
  if (!deals.find(d => d.id === deal.id)) {
    deals.push(deal)
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals))
  }
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
 * @returns The user session object or null
 */
export const getSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.SESSION)
  return data ? JSON.parse(data) : null
}

/**
 * Updates the user session with new data
 * @param updates - Partial session data to update
 */
export const updateSession = (updates: Partial<UserSession>): void => {
  if (typeof window === 'undefined') return
  const session = getSession()
  if (session) {
    const newSession = { ...session, ...updates }
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession))
  }
}
