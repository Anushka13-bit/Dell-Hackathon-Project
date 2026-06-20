"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import StepWrapper from "@/components/onboarding/StepWrapper";
import { ArrowRight, User } from "lucide-react";
import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";

export default function Step1Resume() {
  const { updateData, nextStep } = useOnboardingStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadText, setUploadText] = useState("Magic Resume Auto-Fill");

  const handleSkip = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handleMagicUpload = async (file: File) => {
    setIsUploading(true);
    setUploadText("Extracting skills...");
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("http://localhost:8000/participants/upload_resume", {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        setUploadText("Building profile...");
        const data = await response.json();
        
        // Auto-fill store with parsed data
        const parsed = data.parsed_resume;
        
        updateData({ 
            fullName: parsed.name || "",
            email: parsed.email || "",
            phone: parsed.phone || "",
            collegeInfo: {
                college: parsed.college_name || "",
                degree: parsed.degree || "",
                year: parsed.year || ""
            },
            links: {
                github: parsed.github_url || "",
                linkedin: parsed.linkedin_url || ""
            },
            aiData: {
                parsed_resume: data.parsed_resume,
                skill_vector: data.skill_vector,
                semantic_embedding: data.semantic_embedding,
                raw_text: data.raw_text
            }
        });
        
        setUploadText("Magic complete!");
        setTimeout(() => nextStep(), 1000);
        
    } catch (error: any) {
        console.error("Failed to process resume:", error);
        alert(`Failed to parse resume: ${error.message || "Please ensure the file is a valid PDF and the backend is running."}`);
        setIsUploading(false);
        setUploadText("Magic Resume Auto-Fill");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isUploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleMagicUpload(file);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const file = e.target.files?.[0];
    if (file) handleMagicUpload(file);
  };

  return (
    <StepWrapper>
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-on-surface mb-2 tracking-tight">Let's build your profile</h1>
        <p className="text-on-surface-variant text-[16px]">Upload your resume to magic auto-fill, or enter manually.</p>
      </div>

      <div 
        className={`mb-8 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-primary/5 ${
          isDragOver ? "border-primary bg-primary/10" : "border-primary/30 hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
      >
        <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={onChange} disabled={isUploading} />
        
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        ) : (
          <UploadCloud className="w-8 h-8 text-primary mb-3" />
        )}
        <h3 className="font-bold text-[16px] text-primary">{uploadText}</h3>
        {!isUploading && <p className="text-on-surface-variant text-[13px] mt-1">Upload PDF to skip manual entry</p>}
      </div>

      <button 
        onClick={handleSkip}
        className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface py-4 rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all"
        disabled={isUploading}
      >
        Enter manually instead
        <ArrowRight className="w-5 h-5" />
      </button>
    </StepWrapper>
  );
}
