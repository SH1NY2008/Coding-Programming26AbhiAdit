
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTRO_KEY = 'has_seen_intro_v2'; // Using a new key to bust the old session storage
const TEXT_TO_SCRAMBLE = "Discover Local";
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function Intro() {
  const [status, setStatus] = useState<'pending' | 'playing' | 'finished'>('pending');

  // Step 1: Check session storage once the component mounts on the client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = sessionStorage.getItem(INTRO_KEY);
      if (hasSeen) {
        setStatus('finished');
      } else {
        setStatus('playing');
        sessionStorage.setItem(INTRO_KEY, 'true');
      }
    }
  }, []);

  // Step 2: Render nothing if the animation is not supposed to play
  if (status !== 'playing') {
    return null;
  }

  // Step 3: If status is 'playing', render the animation component
  return <AnimationSequence onComplete={() => setStatus('finished')} />;
}

function AnimationSequence({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'start' | 'shrink' | 'reveal' | 'fadeout'>('start');
  const [scrambledText, setScrambledText] = useState(TEXT_TO_SCRAMBLE);

  // Animation timeline effect
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setStep('shrink'), 500));    // Shrink after 0.5s
    timers.push(setTimeout(() => setStep('reveal'), 1200));   // Reveal text after 1.2s
    timers.push(setTimeout(() => setStep('fadeout'), 3500));  // Fade out after 3.5s
    timers.push(setTimeout(onComplete, 4000));                 // Mark as finished after 4s

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Scramble effect, runs only during the 'reveal' step
  useEffect(() => {
    let scrambleInterval: NodeJS.Timeout | null = null;

    if (step === 'reveal') {
      let revealIndex = 0;
      scrambleInterval = setInterval(() => {
        if (revealIndex >= TEXT_TO_SCRAMBLE.length) {
          if (scrambleInterval) clearInterval(scrambleInterval);
          setScrambledText(TEXT_TO_SCRAMBLE);
          return;
        }

        let newText = '';
        for (let i = 0; i < TEXT_TO_SCRAMBLE.length; i++) {
          if (i < revealIndex) {
            newText += TEXT_TO_SCRAMBLE[i];
          } else {
            newText += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setScrambledText(newText);

        if (Math.random() < 0.3) { // Stagger the reveal
          revealIndex++;
        }
      }, 70);
    }

    return () => {
      if (scrambleInterval) clearInterval(scrambleInterval);
    };
  }, [step]);

  return (
    <AnimatePresence>
      {step !== 'fadeout' && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            className="absolute bg-emerald-600"
            layoutId="intro-card"
            animate={{
              width: step === 'start' ? '100vw' : '500px',
              height: step === 'start' ? '100vh' : '200px',
              borderRadius: step === 'start' ? '0px' : '1.5rem',
            }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          />
          <AnimatePresence>
            {step === 'reveal' && (
              <motion.h1
                className="relative z-10 text-4xl font-bold text-white text-center tracking-wider font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {scrambledText}
              </motion.h1>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
