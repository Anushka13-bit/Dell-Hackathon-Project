"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function StepWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[32px] shadow-2xl border border-white/50"
    >
      {children}
    </motion.div>
  );
}
