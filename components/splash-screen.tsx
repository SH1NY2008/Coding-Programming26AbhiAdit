"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState(0) // 0: Text, 1: Splash, 2: Complete

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 2500) // Show text for 2.5s
    const timer2 = setTimeout(() => {
      onComplete()
    }, 3500) // Total duration

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [onComplete])

  const [particles, setParticles] = useState<{ x: number; y: number; scale: number }[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setParticles(
        [...Array(20)].map(() => ({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          scale: Math.random() * 0.5 + 0.5,
        }))
      )
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {stage === 0 && (
          <motion.div
            key="text-container"
            className="relative z-10 flex flex-col items-center"
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-4 relative"
            >
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse" />
              <motion.h1 
                className="text-4xl md:text-7xl font-bold text-white tracking-tighter text-center"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
              >
                <span className="inline-block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  Business
                </span>{" "}
                <span className="inline-block text-white">Boost</span>
              </motion.h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-gray-400 text-sm md:text-lg tracking-widest uppercase"
            >
              Empowering Local Communities
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splash Effects */}
      <AnimatePresence>
        {stage === 1 && (
          <>
            {/* Central explosion/splash */}
            <motion.div
              key="splash-circle"
              className="absolute inset-0 bg-white"
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(150% at 50% 50%)" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // Custom cubic-bezier for aggressive splash
            />
            {/* Secondary ripple */}
            <motion.div
              key="splash-ripple"
              className="absolute inset-0 bg-blue-500/20"
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(140% at 50% 50%)" }}
              transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            />
          </>
        )}
      </AnimatePresence>
      
      {/* Background Particles (Simple CSS/SVG dots for aesthetic) */}
      {stage === 0 && (
         <div className="absolute inset-0 z-0 opacity-30">
            {particles.map((particle, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                initial={{
                  x: particle.x,
                  y: particle.y,
                  scale: particle.scale,
                }}
                animate={{
                  y: [null, Math.random() * -100],
                  opacity: [null, 0]
                }}
                transition={{
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                }}
              />
            ))}
         </div>
      )}
    </motion.div>
  )
}
