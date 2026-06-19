"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock, Building2 } from "lucide-react";

export default function OrganizerAuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth & redirect directly to dashboard
    router.push("/organizer/dashboard");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/50"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-tertiary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-tertiary" />
        </div>
        <h1 className="text-[28px] font-bold text-on-surface mb-2 tracking-tight">Organizer Portal</h1>
        <p className="text-on-surface-variant text-[14px]">Manage your hackathons with precision.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-container-low p-1 rounded-full mb-8 relative">
        <button
          onClick={() => setIsSignIn(true)}
          className={`flex-1 py-2.5 text-[14px] font-bold rounded-full transition-all z-10 ${isSignIn ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Sign In
        </button>
        <button
          onClick={() => setIsSignIn(false)}
          className={`flex-1 py-2.5 text-[14px] font-bold rounded-full transition-all z-10 ${!isSignIn ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
        >
          Create Account
        </button>
        {/* Animated Background Tab */}
        <motion.div 
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm"
          initial={false}
          animate={{ x: isSignIn ? 4 : "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.form 
          key={isSignIn ? "signin" : "signup"}
          initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isSignIn ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleAuth}
          className="space-y-4"
        >
          {!isSignIn && (
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
              <input 
                type="text" 
                placeholder="Organization Name" 
                required 
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
            <input 
              type="email" 
              placeholder="Work Email" 
              required 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-tertiary text-on-tertiary py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-tertiary/90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 mt-6"
          >
            {isSignIn ? "Sign In to Dashboard" : "Create Organizer Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>
      </AnimatePresence>

      <div className="mt-8 text-center">
        <Link href="/" className="text-[13px] text-on-surface-variant hover:text-tertiary transition-colors font-medium">
          ← Back to HackFlow
        </Link>
      </div>
    </motion.div>
  );
}
