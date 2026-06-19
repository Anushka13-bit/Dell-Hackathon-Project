"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, CheckCircle2, Camera } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";

type FaceState = "waiting" | "detected" | "scanning" | "verified" | "error";

export default function Step4FaceVerify() {
  const { updateData, nextStep } = useOnboardingStore();
  const [faceState, setFaceState] = useState<FaceState>("waiting");
  const webcamRef = useRef<Webcam>(null);

  // Simulate face detection pipeline
  const simulateDetection = useCallback(() => {
    if (faceState === "verified") return;

    setFaceState("detected");
    setTimeout(() => {
      setFaceState("scanning");
      setTimeout(() => {
        setFaceState("verified");
        updateData({ faceVerified: true });
        setTimeout(() => {
          nextStep();
        }, 2000);
      }, 3000); // 3s scan
    }, 1000); // 1s wait after detection
  }, [faceState, nextStep, updateData]);

  useEffect(() => {
    // Start simulation after component mounts
    const timer = setTimeout(() => simulateDetection(), 2000);
    return () => clearTimeout(timer);
  }, [simulateDetection]);

  return (
    <StepWrapper>
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Identity Verification</h1>
        <p className="text-on-surface-variant text-[16px]">Confirm your participation by capturing your face.</p>
      </div>

      <div className="relative w-full max-w-[320px] mx-auto aspect-square rounded-full overflow-hidden border-4 border-surface-container-high bg-black">
        {/* Webcam feed */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-full object-cover"
        />

        {/* Overlays based on state */}
        <AnimatePresence>
          {faceState === "waiting" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 border-[8px] border-dashed border-white/50 rounded-full m-4"
            />
          )}

          {faceState === "detected" && (
            <motion.div 
              initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 border-[6px] border-primary rounded-full m-2 transition-all"
            />
          )}

          {faceState === "scanning" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-full"
            >
              <div className="w-full h-full rounded-full border-[8px] border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]" />
            </motion.div>
          )}

          {faceState === "verified" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-green-500/80 backdrop-blur-sm flex flex-col items-center justify-center text-white"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="w-20 h-20 mb-2" />
              </motion.div>
              <span className="font-bold text-[18px]">Verified</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-12 mt-8 flex items-center justify-center">
        {faceState === "waiting" && <p className="text-on-surface-variant font-medium">Please frame your face in the circle.</p>}
        {faceState === "detected" && <p className="text-primary font-bold">Face detected. Hold still.</p>}
        {faceState === "scanning" && <p className="text-primary font-bold animate-pulse">Analyzing biometric data...</p>}
        {faceState === "verified" && <p className="text-green-600 font-bold">Identity confirmed securely.</p>}
      </div>
    </StepWrapper>
  );
}
