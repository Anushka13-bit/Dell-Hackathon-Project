"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { motion } from "framer-motion";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const step = useOnboardingStore((state) => state.step);
  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
      {/* Dynamic Background Effects based on Step */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-container/20 blur-[140px] rounded-full pointer-events-none transition-all duration-1000 ease-in-out" 
           style={{ transform: `translate(${step * 2}%, ${step * 5}%)` }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tertiary-container/20 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 ease-in-out" 
           style={{ transform: `translate(-${step * 5}%, -${step * 2}%)` }} />

      {/* Progress Header */}
      <header className="w-full pt-8 px-6 md:px-12 flex flex-col items-center relative z-20">
        <div className="w-full max-w-3xl flex justify-between items-center mb-4">
          <div className="font-display-lg text-[20px] font-bold text-primary tracking-tight">HackOS</div>
          <div className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest">
            Step {step} of {totalSteps}
          </div>
        </div>
        <div className="w-full max-w-3xl bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative z-10 w-full">
        {children}
      </main>
    </div>
  );
}
