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
      }, 800) // Wait for slide up animation
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#004e3e] text-white"
        >
          {/* Background Pattern (Optional subtle texture) */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
               <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-[#c2fe81] shadow-2xl"
              >
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                  className="text-5xl font-extrabold text-[#004e3e] font-[family-name:var(--font-anton)]"
                >
                  BB
                </motion.span>
              </motion.div>
            </motion.div>

            <div className="flex flex-col items-center text-center">
              <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                className="text-5xl font-bold tracking-tight sm:text-7xl font-[family-name:var(--font-anton)] uppercase"
              >
                Business Boost
              </motion.h1>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100px" }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="h-1 bg-[#c2fe81] mt-4 rounded-full"
              />
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-4 text-xl font-light tracking-widest uppercase font-[family-name:var(--font-poppins)]"
              >
                Discover Local Gems
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
