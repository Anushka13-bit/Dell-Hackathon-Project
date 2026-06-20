"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ArrowRight, CheckCircle2, QrCode, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Step7Success() {
  const { fullName, updateData, aiData } = useOnboardingStore();
  const router = useRouter();
  const [participantId] = useState(() => {
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HK-24-${randomStr}`;
  });

  const handleFinish = () => {
    updateData({ onboardingComplete: true });
    router.push("/participant/dashboard");
  };

  // Convert skill_vector dict into an array and sort by value descending
  const skillVectorArray = aiData?.skill_vector 
    ? Object.entries(aiData.skill_vector)
        .map(([skill, score]) => ({ skill: skill.replace('_', ' '), score: score as number }))
        .sort((a, b) => b.score - a.score)
        .filter(item => item.score > 0) // Only show skills they actually have some score in
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-surface-container-low border border-outline-variant/20 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </motion.div>

        <h1 className="text-[36px] font-bold mb-2 tracking-tight leading-tight text-on-surface">You're ready to build.</h1>
        <p className="text-on-surface-variant text-[16px] mb-8 max-w-md">
          Your HackOS profile has been created securely. Welcome to the future of innovation, <span className="font-bold text-primary">{fullName.split(" ")[0] || "Hacker"}</span>.
        </p>

        {/* Digital Badge Preview */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface-container-high border border-outline-variant/30 p-4 rounded-3xl w-full max-w-sm mb-8 flex items-center gap-4 text-left"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Participant ID</p>
            <p className="text-[18px] font-mono font-bold text-on-surface">{participantId}</p>
          </div>
        </motion.div>

        {/* AI Skill Matrix */}
        {skillVectorArray.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-md mb-10 text-left"
          >
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-primary" />
              <h3 className="text-[16px] font-bold text-on-surface">Your AI Skill Matrix</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {skillVectorArray.slice(0, 6).map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-[12px] font-bold">
                    <span className="text-on-surface capitalize">{item.skill}</span>
                    <span className="text-primary">{Math.round(item.score * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.score * 100}%` }}
                      transition={{ delay: 0.8 + (idx * 0.1), duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {aiData?.parsed_resume?.raw_skills && aiData.parsed_resume.raw_skills.length > 0 && (
              <div className="mt-6">
                <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Extracted Core Skills</p>
                <div className="flex flex-wrap gap-2">
                  {aiData.parsed_resume.raw_skills.slice(0, 8).map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-[12px] font-bold rounded-full border border-primary/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <motion.button 
          onClick={handleFinish}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-md bg-primary text-white py-4 rounded-2xl font-bold text-[18px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          Enter Dashboard
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
