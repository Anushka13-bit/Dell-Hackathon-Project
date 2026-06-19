"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ProcessState = "idle" | "uploading" | "extracting" | "analyzing" | "building" | "generating" | "complete";

const PIPELINE_STEPS = [
  { id: "extracting", label: "Extracting Skills" },
  { id: "analyzing", label: "Analyzing Experience" },
  { id: "building", label: "Building Participant Profile" },
  { id: "generating", label: "Generating Skill Graph" },
];

export default function Step6Resume() {
  const { updateData, nextStep } = useOnboardingStore();
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [isDragOver, setIsDragOver] = useState(false);

  const simulateProcessing = () => {
    setProcessState("uploading");
    
    setTimeout(() => setProcessState("extracting"), 1500);
    setTimeout(() => setProcessState("analyzing"), 3000);
    setTimeout(() => setProcessState("building"), 4500);
    setTimeout(() => setProcessState("generating"), 6000);
    
    setTimeout(() => {
      setProcessState("complete");
      updateData({ resumeUploaded: true });
      setTimeout(() => nextStep(), 2000);
    }, 7500);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (processState !== "idle") return;
    const file = e.dataTransfer.files[0];
    if (file) simulateProcessing();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (processState !== "idle") return;
    const file = e.target.files?.[0];
    if (file) simulateProcessing();
  };

  return (
    <StepWrapper>
      <div className="text-center mb-8">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Upload your resume</h1>
        <p className="text-on-surface-variant text-[16px]">We'll automatically extract skills and interests.</p>
      </div>

      <AnimatePresence mode="wait">
        {processState === "idle" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-surface-container-low ${
              isDragOver ? "border-primary bg-primary-container/10" : "border-outline-variant/50 hover:border-primary/50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
          >
            <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={onChange} />
            
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center text-primary mb-4 pointer-events-none">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-[18px] text-on-surface mb-2">Click to upload or drag and drop</h3>
            <p className="text-on-surface-variant text-[14px]">PDF or DOCX (max 5MB)</p>
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-outline-variant/20">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-on-surface">resume_v2.pdf</h3>
                <p className="text-[13px] text-on-surface-variant font-medium">Uploaded successfully</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-green-500 ml-auto" />
            </div>

            <div className="space-y-5">
              <div className="text-[13px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">AI Pipeline Active</div>
              
              {PIPELINE_STEPS.map((step, index) => {
                const isComplete = 
                  processState === "complete" || 
                  PIPELINE_STEPS.findIndex(s => s.id === processState) > index;
                const isActive = processState === step.id;
                
                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center relative">
                      {isComplete ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                          <CheckCircle2 className="w-5 h-5" />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                      )}
                    </div>
                    <span className={`font-medium transition-colors ${isActive ? 'text-primary font-bold' : isComplete ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </StepWrapper>
  );
}
