"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, User } from "lucide-react";
import { useState } from "react";

export default function Step1Name() {
  const { fullName, updateData, nextStep } = useOnboardingStore();
  const [localName, setLocalName] = useState(fullName);
  const [error, setError] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (localName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    updateData({ fullName: localName.trim() });
    nextStep();
  };

  return (
    <StepWrapper>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">What should we call you?</h1>
        <p className="text-on-surface-variant text-[16px]">Let's start with your identity.</p>
      </div>

      <form onSubmit={handleContinue} className="space-y-6">
        <div className="relative group">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Full Name" 
            value={localName}
            onChange={(e) => {
              setLocalName(e.target.value);
              setError("");
            }}
            className={`w-full pl-14 pr-4 py-4 bg-surface-container-low border ${error ? 'border-error' : 'border-outline-variant/30'} rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[18px] font-medium`}
            autoFocus
          />
          {error && <p className="text-error text-sm mt-2 font-medium">{error}</p>}
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-lg transform hover:-translate-y-0.5 mt-8"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </StepWrapper>
  );
}
