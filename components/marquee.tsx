"use client";

import { motion } from "motion/react";

export const Marquee = ({ text }: { text: string }) => {
  return (
    <div className="relative flex overflow-x-hidden border-b border-white/10 bg-neutral-950 py-3">
      <motion.div 
        className="flex min-w-full shrink-0 items-center py-1"
        animate={{ x: "-100%" }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: 30 
        }}
      >
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
      </motion.div>
      <motion.div 
        className="flex min-w-full shrink-0 items-center py-1"
        animate={{ x: "-100%" }}
        transition={{ 
          repeat: Infinity, 
          ease: "linear", 
          duration: 30 
        }}
      >
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
        <span className="mx-4 text-sm font-medium tracking-widest text-neutral-400 uppercase">{text}</span>
      </motion.div>
    </div>
  );
};
