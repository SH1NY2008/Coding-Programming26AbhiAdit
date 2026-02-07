"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 500) // Wait for exit animation
    }, 2000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-primary">
              <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary-foreground">
                BB
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Business Boost
              </h1>
              <p className="mt-2 text-muted-foreground">Discover Local Gems</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
