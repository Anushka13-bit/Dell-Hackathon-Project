"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { AnimatePresence, motion } from "framer-motion";

// Placeholder components for the 8 steps. We will implement these in separate files soon.
import Step1Name from "./steps/Step1Name";
import Step2Email from "./steps/Step2Email";
import Step3Phone from "./steps/Step3Phone";
import Step4FaceVerify from "./steps/Step4FaceVerify";
import Step5Profile from "./steps/Step5Profile";
import Step6Resume from "./steps/Step6Resume";
import Step7Pipeline from "./steps/Step7Pipeline";
import Step8Success from "./steps/Step8Success";

export default function ParticipantOnboardingWizard() {
  const step = useOnboardingStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Name key="step1" />;
      case 2: return <Step2Email key="step2" />;
      case 3: return <Step3Phone key="step3" />;
      case 4: return <Step4FaceVerify key="step4" />;
      case 5: return <Step5Profile key="step5" />;
      case 6: return <Step6Resume key="step6" />;
      case 7: return <Step7Pipeline key="step7" />;
      case 8: return <Step8Success key="step8" />;
      default: return <Step1Name key="step1" />;
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
