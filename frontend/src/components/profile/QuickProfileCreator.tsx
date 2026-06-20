"use client";

import { useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { createDirectProfile } from "@/app/actions/registration";

export function QuickProfileCreator() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadText, setUploadText] = useState("Upload Resume (PDF)");
  const [errorText, setErrorText] = useState("");

  const handleMagicUpload = async (file: File) => {
    setIsUploading(true);
    setUploadText("Extracting skills...");
    setErrorText("");
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/participants/upload_resume`, {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        setUploadText("Building profile...");
        const data = await response.json();
        
        const parsed = data.parsed_resume;
        
        const res = await createDirectProfile({
          name: parsed.name || "",
          email: parsed.email || "",
          college: parsed.college_name || "N/A",
          github: parsed.github_url || "N/A",
          gender: "Prefer not to say",
          skills: parsed.raw_skills || [],
          skill_vector: data.skill_vector || {},
          raw_text: data.raw_text || ""
        });

        if (!res.success) {
            throw new Error(res.error);
        }
        
        setUploadText("Profile Created!");
        // The server action calls revalidatePath, so the page should refresh itself shortly!
    } catch (error: any) {
        console.error("Failed to process resume:", error);
        setErrorText(error.message || "Failed to process resume");
        setIsUploading(false);
        setUploadText("Upload Resume (PDF)");
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
    <div className="w-full max-w-md mt-6">
      <div 
        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden bg-primary/5 ${
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
        {!isUploading && <p className="text-on-surface-variant text-[13px] mt-1 text-center">We will instantly generate your profile from your resume</p>}
      </div>
      {errorText && (
          <div className="mt-4 p-3 bg-error/10 text-error rounded-xl text-sm font-medium text-center">
              {errorText}
          </div>
      )}
    </div>
  );
}
