"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { AnimatePresence, motion } from "framer-motion";

// Placeholder components for the 8 steps. We will implement these in separate files soon.
import Step1Resume from "./steps/Step1Resume";
import Step2Profile from "./steps/Step2Profile";
import Step3Email from "./steps/Step3Email";
import Step4Phone from "./steps/Step4Phone";
import Step5FaceVerify from "./steps/Step5FaceVerify";
import Step6Pipeline from "./steps/Step7Pipeline"; // Renamed import locally for sequence
import Step7Success from "./steps/Step7Success"; // Renamed import locally for sequence

export default function ParticipantOnboardingWizard() {
  const step = useOnboardingStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Resume key="step1" />;
      case 2: return <Step2Profile key="step2" />;
      case 3: return <Step3Email key="step3" />;
      case 4: return <Step4Phone key="step4" />;
      case 5: return <Step5FaceVerify key="step5" />;
      case 6: return <Step6Pipeline key="step6" />;
      case 7: return <Step7Success key="step7" />;
      default: return <Step1Resume key="step1" />;
    }
  };

  return (
    <div className="w-full max-w-2xl px-6">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
