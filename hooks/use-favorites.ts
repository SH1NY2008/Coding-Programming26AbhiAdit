"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }

    const favoritesRef = ref(realtimeDb, `users/${user.uid}/favorites`);
    
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Assuming data is an object where keys are businessIds
        // Example: { "business-1": true, "business-2": true }
        setFavoriteIds(Object.keys(data));
      } else {
        setFavoriteIds([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching favorites:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleFavorite = async (businessId: string) => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const favoriteRef = ref(realtimeDb, `users/${user.uid}/favorites/${businessId}`);
    const isFavorite = favoriteIds.includes(businessId);

    try {
      if (isFavorite) {
        await remove(favoriteRef);
        toast.success("Removed from favorites");
      } else {
        // We can store a boolean true, or a timestamp, or the full business object.
        // For now, storing 'true' is efficient if we just need IDs.
        await set(favoriteRef, {
            addedAt: Date.now()
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorite: (id: string) => favoriteIds.includes(id)
  };
}
