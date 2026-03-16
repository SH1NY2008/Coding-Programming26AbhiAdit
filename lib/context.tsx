
"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { auth } from "./firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import {
  initializeData,
  getBusinesses,
  getDeals,
  getReviews,
  getBookmarkFolders,
  addBookmark,
  removeBookmark,
  isBookmarked,
  saveBusiness,
  saveDeal,
  type Business,
  type Deal,
  type Review,
} from "./data"

interface AppContextValue {
  user: User | null
  loading: boolean
  businesses: Business[]
  deals: Deal[]
  reviews: Review[]
  bookmarks: string[]
  toggleBookmark: (businessId: string, business?: Business) => void
  addBusiness: (business: Business) => void
  addDeal: (deal: Deal) => void
  refreshData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const refreshData = useCallback(() => {
    setBusinesses(getBusinesses())
    setDeals(getDeals())
    setReviews(getReviews())
    const folders = getBookmarkFolders()
    const allBookmarkedIds = folders.flatMap(f => f.businessIds)
    setBookmarks(allBookmarkedIds)
  }, [])

  useEffect(() => {
    if (!loading) {
      initializeData()
      refreshData()
    }
  }, [loading, refreshData])

  const toggleBookmark = useCallback(
    (businessId: string, business?: Business) => {
      const folders = getBookmarkFolders()
      const defaultFolder = folders.find(f => f.id === "default") || folders[0]

      if (defaultFolder) {
        if (isBookmarked(businessId)) {
          removeBookmark(defaultFolder.id, businessId)
        } else {
          if (business) {
            saveBusiness(business)
          }
          addBookmark(defaultFolder.id, businessId)
        }
        refreshData()
      }
    },
    [refreshData]
  )

  const addBusiness = useCallback(
    (business: Business) => {
      saveBusiness(business)
      refreshData()
    },
    [refreshData]
  )

  const addDeal = useCallback(
    (deal: Deal) => {
      saveDeal(deal)
      refreshData()
    },
    [refreshData]
  )

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        businesses,
        deals,
        reviews,
        bookmarks,
        toggleBookmark,
        addBusiness,
        addDeal,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
