"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore, ReviewerInvite } from "@/store/useHackathonStore";

export default function CreateHackathonStep4() {
  const router = useRouter();
  const { draftId, reviewers, setReviewers } = useHackathonStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(line => line.trim() !== '');
      const newReviewers: ReviewerInvite[] = [];
      
      const hasHeader = lines[0].toLowerCase().includes('email');
      const startIdx = hasHeader ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        // Handle simple CSV without escaped commas
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 2) {
          const name = parts[0] || '';
          const email = parts[1] || '';
          const institution = parts.length > 2 ? parts[2] : '';
          const expertiseStr = parts.length > 3 ? parts[3] : 'AI & ML';
          
          if (email) {
            newReviewers.push({
              name,
              email,
              institution,
              expertise_domains: [expertiseStr]
            });
          }
        }
      }

      setReviewers([...reviewers, ...newReviewers]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const removeReviewer = (index: number) => {
    const updated = [...reviewers];
    updated.splice(index, 1);
    setReviewers(updated);
  };

  const handleNext = async () => {
    if (!draftId) {
      alert("Missing draft Hackathon ID. Please return to step 1 and save.");
      return;
    }
    
    // MOCKED FOR MVP: Normally we'd POST to /team here
    // but the backend schema for Hackathon relations is currently simplified.
    router.push("/organizer/hackathons/create/step-5");
  };
  return (
    <div className="p-margin-desktop max-w-container-max mx-auto w-full">
      {/* Stepper Container */}
      <section className="mb-stack-lg">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto relative">
          {/* Progress Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 z-0"></div>
          {/* Active Progress Line */}
          <div className="absolute top-1/2 left-0 w-[75%] h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Basics</span>
          </div>
          
          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Tracks</span>
          </div>
          
          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Criteria</span>
          </div>
          
          {/* Step 4 (Current) */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white ring-4 ring-primary-container/30 flex items-center justify-center font-bold">4</div>
            <span className="font-label-sm text-primary">Reviewers</span>
          </div>
          
          {/* Step 5 */}
          <div className="relative z-10 flex flex-col items-center gap-2 opacity-40">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-outline text-on-surface flex items-center justify-center font-bold">5</div>
            <span className="font-label-sm text-on-surface-variant">Summary</span>
          </div>
        </div>
      </section>

      {/* Main Task Grid (Asymmetric Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Left: Invitation Form */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
          <div className="bg-white rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.2)] hover:shadow-[0_30px_40px_-15px_rgba(214,203,191,0.3)] transition-all duration-300 p-8 border border-outline-variant/30 h-full">
            <header className="flex flex-col h-full justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[32px] text-primary">upload_file</span>
              </div>
              <h2 className="font-headline-md text-on-surface mb-3">Bulk Add Experts</h2>
              <p className="font-body-md text-on-surface-variant mb-8">Upload a CSV file containing your reviewers. The file should have the following headers: <br/><br/><code>Name, Email, Organization, Expertise</code></p>
              
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mx-auto w-full max-w-xs bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>cloud_upload</span>
                Upload Reviewers CSV
              </button>
            </header>
          </div>
        </div>

        {/* Right: Added Reviewers List */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.2)] hover:shadow-[0_30px_40px_-15px_rgba(214,203,191,0.3)] transition-all duration-300 p-8 border border-outline-variant/30 min-h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-headline-md text-on-surface mb-1">Added Reviewers</h2>
                <p className="font-label-md text-on-surface-variant">Reviewers added to this hackathon.</p>
              </div>
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm">{reviewers.length} Added</span>
            </div>
            
            <div className="space-y-4">
              {reviewers.map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-tertiary-container text-on-tertiary-container font-bold text-lg">
                      {reviewer.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{reviewer.email}</h4>
                      <div className="flex gap-2 mt-1">
                        {reviewer.expertise_domains.map(domain => (
                          <span key={domain} className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold uppercase tracking-wider">{domain}</span>
                        ))}
                        {reviewer.institution && (
                          <span className="px-2 py-0.5 bg-on-surface-variant/10 text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider">{reviewer.institution}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeReviewer(index)} className="w-10 h-10 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {reviewers.length === 0 && (
                <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-outline">group_add</span>
                  </div>
                  <p className="font-label-md text-on-surface-variant">Recommended: 5-8 reviewers for your hackathon scale.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="mt-stack-lg flex flex-col md:flex-row items-center justify-between border-t border-outline-variant pt-8 gap-4">
        <Link href="/organizer/hackathons/create/step-3" className="w-full md:w-auto">
          <button className="w-full px-8 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-bold hover:bg-outline-variant/30 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>
        </Link>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button className="w-full md:w-auto px-8 py-3 border border-outline text-on-surface-variant rounded-xl font-bold hover:bg-surface-variant transition-all">
            Save Draft
          </button>
          <button onClick={handleNext} className="w-full md:w-auto px-10 py-3 bg-tertiary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            Next: Review Summary
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
