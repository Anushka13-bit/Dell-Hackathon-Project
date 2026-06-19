"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";

export default function ParticipantAuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignIn) {
      // Simulate login for existing user -> dashboard
      router.push("/participant/dashboard");
    } else {
      // Create Account -> Start Onboarding
      router.push("/onboarding/participant");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl border border-white/50 w-full"
    >
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-primary mb-2 tracking-tight">Welcome to HackOS</h1>
        <p className="text-on-surface-variant text-[15px]">The operating system for modern hackathons.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low p-1.5 rounded-2xl mb-8 relative">
        <button
          onClick={() => setIsSignIn(true)}
          className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all z-10 ${isSignIn ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignIn(false)}
          className={`flex-1 py-3 text-[14px] font-bold rounded-xl transition-all z-10 ${!isSignIn ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Create Account
        </button>
        {/* Animated Background Tab */}
        <motion.div 
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm"
          initial={false}
          animate={{ x: isSignIn ? 6 : "100%" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.form 
          key={isSignIn ? "signin" : "signup"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleAuth}
          className="space-y-4"
        >
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
            <input 
              type="email" 
              placeholder="Email address" 
              required 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[15px]"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[15px]"
            />
          </div>

          {isSignIn && (
            <div className="flex justify-end pt-1">
              <button type="button" className="text-[13px] font-bold text-primary hover:underline">
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 mt-6"
          >
            {isSignIn ? "Sign In" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.form>
      </AnimatePresence>

      <div className="mt-8 text-center">
        <Link href="/" className="text-[13px] text-on-surface-variant hover:text-primary transition-colors font-medium">
          ← Back to HackFlow
        </Link>
      </div>
    </motion.div>
  );
}
