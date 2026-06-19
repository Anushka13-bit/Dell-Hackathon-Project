"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ArrowRight, CheckCircle2, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Step8Success() {
  const { fullName, updateData } = useOnboardingStore();
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");

  useEffect(() => {
    // Generate a random ID like "HK-2024-X7B9"
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    setParticipantId(`HK-24-${randomStr}`);
  }, []);

  const handleFinish = () => {
    updateData({ onboardingComplete: true });
    router.push("/participant/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-primary text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden text-center"
    >
      {/* Background patterns */}
      <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </div>
        </motion.div>

        <h1 className="text-[40px] font-bold mb-4 tracking-tight leading-tight">You're ready to build.</h1>
        <p className="text-white/80 text-[18px] mb-12 max-w-md">
          Your HackOS profile has been created securely. Welcome to the future of innovation, {fullName.split(" ")[0] || "Hacker"}.
        </p>

        {/* Digital Badge Preview */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full max-w-sm mb-12 flex items-center gap-6 text-left"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-widest text-white/60 font-bold mb-1">Participant ID</p>
            <p className="text-[20px] font-mono font-bold">{participantId}</p>
          </div>
        </motion.div>

        <motion.button 
          onClick={handleFinish}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-sm bg-white text-primary py-4 rounded-2xl font-bold text-[18px] flex items-center justify-center gap-2 hover:shadow-xl transition-all"
        >
          Enter Dashboard
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
