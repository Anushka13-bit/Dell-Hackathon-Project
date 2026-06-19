"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, Phone, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type OTPState = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function Step3Phone() {
  const { phone, updateData, nextStep } = useOnboardingStore();
  const [localPhone, setLocalPhone] = useState(phone);
  const [otpState, setOtpState] = useState<OTPState>("idle");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (localPhone.length < 5) return;
    updateData({ phone: localPhone });
    setOtpState("sending");
    
    // Simulate API call
    setTimeout(() => {
      setOtpState("sent");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // only take last char
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when complete
    if (index === 5 && value !== "" && newOtp.every(v => v !== "")) {
      setOtpState("verifying");
      setTimeout(() => {
        setOtpState("verified");
        updateData({ phoneVerified: true });
        setTimeout(() => {
          nextStep();
        }, 1500); // Wait for success animation
      }, 2000);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <StepWrapper>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Verify your phone</h1>
        <p className="text-on-surface-variant text-[16px]">For important event communication and alerts.</p>
      </div>

      <AnimatePresence mode="wait">
        {otpState === "idle" || otpState === "sending" ? (
          <motion.form 
            key="phone-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSendOTP} 
            className="space-y-6"
          >
            <div className="relative group flex">
              <div className="w-20 bg-surface-container-low border border-r-0 border-outline-variant/30 rounded-l-2xl flex items-center justify-center font-bold text-on-surface-variant">
                +1
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  value={localPhone}
                  onChange={(e) => setLocalPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant/30 rounded-r-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[18px] font-medium"
                  autoFocus
                  disabled={otpState === "sending"}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={otpState === "sending" || localPhone.length < 5}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {otpState === "sending" ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Send OTP <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="otp-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex justify-center gap-3 md:gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={otpState === "verifying" || otpState === "verified"}
                  className="w-12 h-14 md:w-14 md:h-16 bg-surface-container-low border border-outline-variant/30 rounded-xl text-center text-[24px] font-bold text-primary focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all disabled:opacity-50"
                  maxLength={1}
                />
              ))}
            </div>

            <div className="h-12 flex items-center justify-center">
              {otpState === "verifying" && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-primary font-medium"
                >
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Verifying code...
                </motion.div>
              )}
              {otpState === "verified" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600 font-bold"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  Verified successfully!
                </motion.div>
              )}
              {otpState === "sent" && (
                <p className="text-[13px] text-on-surface-variant font-medium">
                  Code sent to <span className="text-on-surface font-bold">+1 {localPhone}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepWrapper>
  );
}
