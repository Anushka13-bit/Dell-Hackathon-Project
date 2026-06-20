"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { submitRegistration } from "@/app/actions/registration";

export default function Step7Pipeline() {
  const state = useOnboardingStore();
  const { emailVerified, phoneVerified, faceVerified, resumeUploaded, nextStep } = state;
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClient();

  const pipeline = [
    { label: "Name Verified", condition: true },
    { label: "Email Verified", condition: emailVerified },
    { label: "Phone Verified", condition: phoneVerified },
    { label: "Face Verified", condition: faceVerified },
    { label: "Resume Processed", condition: resumeUploaded },
    { label: "Participant Profile Created", condition: true },
    { label: "Generating Participant ID", condition: true },
    { label: "Generating QR Badge", condition: true },
    { label: "Creating Dashboard", condition: true },
  ];

  useEffect(() => {
    if (currentStep < pipeline.length) {
      if (currentStep === 5) { // Participant Profile Created
        submitRegistration({
          name: state.fullName || "Anonymous Participant",
          email: state.email || "",
          college: state.collegeInfo.college || "N/A",
          github: state.links.github || "N/A",
          gender: state.gender || "Prefer not to say",
          skills: state.aiData?.parsed_resume?.raw_skills || [],
          skill_vector: state.aiData?.skill_vector || {},
          raw_text: state.aiData?.raw_text || "",
        }).then(res => {
          if (!res.success) {
            console.error("Failed to register participant via server action:", res.error);
          }
        }).catch(err => {
          console.error("Error calling submitRegistration:", err);
        });
      }
      
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 600); // 600ms per step for a smooth but quick pipeline feel
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        nextStep();
      }, 1000);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStep, pipeline.length, nextStep]);

  return (
    <StepWrapper>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Creating your HackOS Identity</h1>
        <p className="text-on-surface-variant text-[16px]">Provisioning resources and generating your profile.</p>
      </div>

      <div className="space-y-4 pl-4 md:pl-10">
        {pipeline.map((item, index) => {
          const isActive = currentStep === index;
          const isComplete = currentStep > index;
          const isPending = currentStep < index;

          if (!item.condition) return null; // Skip if condition not met (e.g. they somehow skipped a step)

          return (
            <div key={index} className="flex items-center gap-4">
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                )}
              </div>
              
              <span className={`font-medium transition-colors duration-300 ${
                isActive ? 'text-primary font-bold text-[16px]' : 
                isComplete ? 'text-on-surface text-[15px]' : 
                'text-on-surface-variant/40 text-[15px]'
              }`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </StepWrapper>
  );
}
