"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore } from "@/store/useHackathonStore";

export default function CreateHackathonStep3() {
  const router = useRouter();
  const { draftId, rubrics, setRubrics } = useHackathonStore();

  useEffect(() => {
    if (rubrics.length === 0) {
      setRubrics([
        { id: Date.now().toString() + "-1", name: "Innovation & Originality", weight: 30, score_min: 0, score_max: 10 },
        { id: Date.now().toString() + "-2", name: "Technical Execution", weight: 40, score_min: 0, score_max: 10 },
        { id: Date.now().toString() + "-3", name: "User Experience (UX)", weight: 15, score_min: 0, score_max: 10 },
      ]);
    }
  }, [rubrics.length, setRubrics]);

  const totalWeight = rubrics.reduce((acc, curr) => acc + curr.weight, 0);

  const handleWeightChange = (id: string, value: string) => {
    const parsedValue = parseInt(value) || 0;
    setRubrics(
      rubrics.map((r) => (r.id === id ? { ...r, weight: parsedValue } : r))
    );
  };

  const handleNameChange = (id: string, value: string) => {
    setRubrics(rubrics.map((r) => (r.id === id ? { ...r, name: value } : r)));
  };

  const addRubric = () => {
    setRubrics([
      ...rubrics,
      { id: Date.now().toString(), name: "Presentation & Pitch", weight: 0, score_min: 0, score_max: 10 },
    ]);
  };

  const deleteRubric = (id: string) => {
    setRubrics(rubrics.filter((r) => r.id !== id));
  };

  const handleNext = async () => {
    if (!draftId) {
      alert("Missing draft Hackathon ID. Please return to step 1 and save.");
      return;
    }
    
    if (totalWeight !== 100) {
      alert("Weights must sum to 100%");
      return;
    }
    
    // MOCKED FOR MVP: Normally we'd PUT to /rubric here
    // but the backend schema for Hackathon relations is currently simplified.
    router.push("/organizer/hackathons/create/step-4");
  };

  return (
    <div className="flex-1 px-margin-desktop py-stack-lg max-w-[1000px] mx-auto w-full">
      {/* Horizontal Stepper */}
      <div className="mb-stack-lg">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"></div>
          
          <div className="relative z-10 flex flex-col items-center group">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-md border-4 border-background">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="mt-2 font-label-sm text-primary">General</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-md border-4 border-background">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="mt-2 font-label-sm text-primary">Tracks</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold ring-4 ring-primary-container shadow-xl border-4 border-background">3</div>
            <span className="mt-2 font-label-sm text-on-surface font-bold">Rubrics</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold border-4 border-background">4</div>
            <span className="mt-2 font-label-sm text-on-surface-variant">Reviewers</span>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-stack-md">
        <h3 className="font-display-lg text-display-lg text-on-surface mb-2">Evaluation Rubrics</h3>
        <p className="font-body-lg text-on-surface-variant max-w-2xl">Define the criteria and weighting for project assessment. Ensure the total weights sum to exactly 100% to proceed.</p>
      </div>

      {/* Rubric Builder Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(214,203,191,0.4)] border border-[#D6CBBF] overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_60px] gap-gutter px-6 py-4 bg-surface-container-low border-b border-outline-variant/30">
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Criteria Name</span>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Weight</span>
          <span></span>
        </div>
        <div className="divide-y divide-outline-variant/20">
          {rubrics.map((rubric) => (
            <div key={rubric.id!} className="grid grid-cols-[1fr_120px_60px] gap-gutter px-6 py-4 items-center hover:bg-surface/50 transition-colors">
              <input 
                className="bg-transparent border-none p-0 font-body-md text-on-surface placeholder:text-outline focus:ring-0 w-full" 
                placeholder="e.g., Technical Complexity" 
                type="text" 
                value={rubric.name}
                onChange={(e) => handleNameChange(rubric.id!, e.target.value)}
              />
              <div className="relative flex items-center justify-end">
                <input 
                  className="w-20 bg-surface-variant/30 border border-outline-variant rounded-lg px-2 py-1.5 text-right font-label-md focus:border-primary transition-all" 
                  max="100" 
                  min="0" 
                  type="number" 
                  value={rubric.weight}
                  onChange={(e) => handleWeightChange(rubric.id!, e.target.value)}
                />
                <span className="ml-2 text-on-surface-variant font-label-md">%</span>
              </div>
              <button 
                onClick={() => deleteRubric(rubric.id!)}
                className="text-on-surface-variant hover:text-error transition-colors flex justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Criterion */}
        <button 
          onClick={addRubric}
          className="w-full py-4 flex items-center justify-center gap-2 text-primary font-label-md hover:bg-primary/5 transition-colors border-t border-dashed border-outline-variant"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Evaluation Criterion
        </button>

        {/* Footer Summary */}
        <div className="p-6 bg-surface-container-high/50 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-outline-variant/30">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-md text-on-surface">Total Weight:</span>
              <span className={`font-headline-sm ${totalWeight === 100 ? 'text-primary' : 'text-error'}`}>
                {totalWeight}%
              </span>
            </div>
            {totalWeight !== 100 && (
              <p className="text-error font-label-sm mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                Total must equal 100%
              </p>
            )}
          </div>
          <div className="bg-surface p-3 rounded-xl border border-outline-variant flex items-center gap-4 max-w-xs">
            <div className="h-10 w-1 bg-primary rounded-full"></div>
            <p className="font-label-sm text-on-surface-variant leading-tight">
              Weighted averages help judges focus on the most important aspects of a hack.
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-stack-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/organizer/hackathons/create/step-2">
          <button className="px-8 py-3 w-full md:w-auto text-on-surface-variant font-label-md hover:text-on-surface transition-colors flex items-center justify-center gap-2 group border border-outline-variant md:border-none rounded-xl md:rounded-none">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Previous
          </button>
        </Link>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button className="w-full md:w-auto px-8 py-3 border border-outline-variant text-primary font-label-md rounded-xl hover:bg-surface-variant transition-colors">
            Save Draft
          </button>
          <button 
            onClick={handleNext}
            disabled={totalWeight !== 100}
            className="w-full md:w-auto px-10 py-3 bg-primary text-on-primary font-label-md rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
          >
            Next: Reviewers
          </button>
        </div>
      </div>
    </div>
  );
}
