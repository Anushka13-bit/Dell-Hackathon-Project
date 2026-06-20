"use client";

import { useState } from "react";
import Link from "next/link";

export default function CreateHackathonStep2() {
  const [difficulty, setDifficulty] = useState("Intermediate");

  return (
    <div className="p-6 md:p-stack-lg max-w-container-max mx-auto w-full relative">
      {/* Floating Atmosphere Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-40">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-secondary-container/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-primary-container/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Stepper */}
      <div className="mb-stack-lg">
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-stack-sm">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center font-bold">1</div>
            <span className="font-label-sm text-label-sm">Basic Info</span>
          </div>
          <div className="flex-1 h-[2px] bg-outline-variant mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">2</div>
            <span className="font-label-md text-label-md text-primary font-bold">Problem Statements</span>
          </div>
          <div className="flex-1 h-[2px] bg-outline-variant/30 mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-10 h-10 rounded-full border-2 border-outline flex items-center justify-center font-bold">3</div>
            <span className="font-label-sm text-label-sm">Evaluation</span>
          </div>
        </div>
      </div>

      {/* Page Title Area */}
      <div className="mb-stack-lg">
        <h3 className="font-display-lg text-display-lg text-on-surface mb-2">Define Your Challenges</h3>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">Craft clear, compelling problem statements that will inspire participants and drive meaningful innovation.</p>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Problem Statements List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-stack-sm">
            <h4 className="font-headline-sm text-headline-sm">Current List</h4>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm">3 Statements</span>
          </div>

          <div className="ambient-card bg-surface-container-lowest p-5 rounded-2xl cursor-pointer border-l-4 border-l-primary hover:translate-x-1 transition-transform shadow-[0_10px_30px_-5px_rgba(214,203,191,0.4)] border border-[#D6CBBF]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-sm text-primary uppercase tracking-widest font-semibold">Sustainability</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
            </div>
            <h5 className="font-bold text-on-surface mb-1">Carbon Footprint Tracker</h5>
            <p className="text-label-md text-on-surface-variant line-clamp-2">Creating an API-driven solution for real-time logistics carbon monitoring...</p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-md text-[10px] font-bold">INTERMEDIATE</span>
            </div>
          </div>

          <div className="ambient-card bg-surface p-5 rounded-2xl cursor-pointer hover:bg-surface-container-highest transition-colors shadow-[0_10px_30px_-5px_rgba(214,203,191,0.4)] border border-[#D6CBBF]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-label-sm text-outline uppercase tracking-widest font-semibold">FinTech</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
            </div>
            <h5 className="font-bold text-on-surface mb-1">Micro-Lending for Artisans</h5>
            <p className="text-label-md text-on-surface-variant line-clamp-2">A decentralized platform for peer-to-peer lending in emerging markets.</p>
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-md text-[10px] font-bold">ADVANCED</span>
            </div>
          </div>

          <button className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
            Add Another Statement
          </button>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-8">
          <div className="ambient-card bg-surface-container-lowest p-8 md:p-stack-lg rounded-[32px] relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(214,203,191,0.4)] border border-[#D6CBBF]">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-stack-md">
                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm">Statement Details</h4>
              </div>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="flex flex-col gap-2 group">
                    <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Title</label>
                    <input className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md" placeholder="e.g. Smart Grid Optimization" type="text" />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Domain</label>
                    <select className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md cursor-pointer appearance-none">
                      <option>Sustainability</option>
                      <option>FinTech</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Cybersecurity</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-label-md text-on-surface-variant">Difficulty Level</label>
                  <div className="flex p-1 bg-surface-container rounded-2xl w-full max-w-md">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 rounded-xl font-label-md text-label-md transition-all ${
                          difficulty === level
                            ? "bg-white shadow-sm text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                        type="button"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Description</label>
                  <textarea className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md resize-none" placeholder="Describe the core problem, existing constraints, and expected outcome..." rows={6}></textarea>
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button className="flex items-center gap-2 text-primary font-bold font-label-md hover:underline transition-all" type="button">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Add Custom Requirements
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="mt-stack-lg pt-stack-md border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/organizer/hackathons/create/step-1">
          <button className="w-full md:w-auto px-8 py-3 rounded-xl border border-primary text-primary font-bold font-label-md flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Previous
          </button>
        </Link>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button className="w-full md:w-auto px-8 py-3 rounded-xl bg-surface-variant text-on-surface-variant font-bold font-label-md hover:opacity-80 transition-opacity">
            Save Draft
          </button>
          <Link href="/organizer/hackathons/create/step-3">
            <button className="w-full md:w-auto px-10 py-4 rounded-xl bg-tertiary text-on-tertiary font-bold font-label-md flex items-center justify-center gap-2 shadow-lg shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all">
              Next: Evaluation Rubrics
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Footer / Credits */}
      <footer className="mt-auto p-margin-desktop text-center">
        <p className="text-label-sm text-outline-variant font-label-sm">© 2024 HackOS Organizer Portal • Crafted for Organic Excellence</p>
      </footer>
    </div>
  );
}
