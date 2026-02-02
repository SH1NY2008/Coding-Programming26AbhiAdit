"use client"

/**
 * Application Context Provider
 * 
 * Manages global application state including user session, theme preferences,
 * and provides data access methods to all components.
 * 
 * @module context
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import {
  initializeData,
  getSession,
  updateSession,
  getBusinesses,
  getDeals,
  getReviews,
  getBookmarkFolders,
  addBookmark,
  removeBookmark,
  isBookmarked,
  type UserSession,
  type Business,
  type Deal,
  type Review,
} from "./data"

/**
 * Application context value interface
 */
interface AppContextValue {
  session: UserSession | null
  highContrastMode: boolean
  toggleHighContrast: () => void
  completeOnboarding: () => void
  isLoading: boolean
  businesses: Business[]
  deals: Deal[]
  reviews: Review[]
  bookmarks: string[]
  toggleBookmark: (businessId: string) => void
  refreshData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

/**
 * Application Context Provider Component
 * Initializes data and manages global state
 * 
 * @param children - Child components to wrap
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])

  /**
   * Refreshes all data from localStorage
   */
  const refreshData = useCallback(() => {
    setBusinesses(getBusinesses())
    setDeals(getDeals())
    setReviews(getReviews())
    const folders = getBookmarkFolders()
    const allBookmarkedIds = folders.flatMap(f => f.businessIds)
    setBookmarks(allBookmarkedIds)
  }, [])

  // Initialize data and session on mount
  useEffect(() => {
    initializeData()
    const currentSession = getSession()
    setSession(currentSession)
    setHighContrastMode(currentSession?.highContrastMode || false)
    refreshData()
    setIsLoading(false)
  }, [refreshData])

  // Apply high contrast mode to document
  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }, [highContrastMode])

  /**
   * Toggles high contrast mode for accessibility
   */
  const toggleHighContrast = () => {
    const newValue = !highContrastMode
    setHighContrastMode(newValue)
    updateSession({ highContrastMode: newValue })
    setSession((prev) => (prev ? { ...prev, highContrastMode: newValue } : null))
  }

  /**
   * Marks onboarding as complete for the current session
   */
  const completeOnboarding = () => {
    updateSession({ onboardingComplete: true })
    setSession((prev) => (prev ? { ...prev, onboardingComplete: true } : null))
  }

  /**
   * Toggles bookmark status for a business
   */
  const toggleBookmark = useCallback((businessId: string) => {
    const folders = getBookmarkFolders()
    const defaultFolder = folders.find(f => f.id === 'default') || folders[0]
    
    if (defaultFolder) {
      if (isBookmarked(businessId)) {
        removeBookmark(defaultFolder.id, businessId)
      } else {
        addBookmark(defaultFolder.id, businessId)
      }
      refreshData()
    }
  }, [refreshData])

  return (
    <AppContext.Provider
      value={{
        session,
        highContrastMode,
        toggleHighContrast,
        completeOnboarding,
        isLoading,
        businesses,
        deals,
        reviews,
        bookmarks,
        toggleBookmark,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook to access application context
 * @returns AppContextValue
 * @throws Error if used outside AppProvider
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
