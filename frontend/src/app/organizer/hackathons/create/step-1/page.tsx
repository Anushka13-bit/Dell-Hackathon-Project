"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore } from "@/store/useHackathonStore";

export default function CreateHackathonStep1() {
  const router = useRouter();
  const { basicInfo, setBasicInfo, setDraftId } = useHackathonStore();

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hackathons/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicInfo)
      });
      if (!res.ok) throw new Error("Failed to create draft");
      const data = await res.json();
      setDraftId(data.id);
      router.push("/organizer/hackathons/create/step-2");
    } catch (err) {
      console.error(err);
      alert("Error saving draft hackathon");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-margin-desktop py-stack-lg w-full">
      {/* Horizontal Stepper */}
      <div className="mb-16">
        <div className="flex justify-between items-center relative">
          {/* Lines */}
          <div className="absolute top-5 left-0 w-full h-[2px] bg-outline-variant -z-10"></div>
          <div className="absolute top-5 left-0 w-1/4 h-[2px] bg-primary -z-10 transition-all duration-700 ease-in-out"></div>
          
          {/* Steps */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md">1</div>
            <span className="font-label-md text-primary font-bold">Basic Info</span>
          </div>
          <div className="flex flex-col items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold">2</div>
            <span className="font-label-md text-on-surface-variant">Problem Statements</span>
          </div>
          <div className="flex flex-col items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold">3</div>
            <span className="font-label-md text-on-surface-variant">Rubrics</span>
          </div>
          <div className="flex flex-col items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold">4</div>
            <span className="font-label-md text-on-surface-variant">Reviewers</span>
          </div>
          <div className="flex flex-col items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold">5</div>
            <span className="font-label-md text-on-surface-variant">Summary</span>
          </div>
        </div>
      </div>

      {/* Wizard Section Header */}
      <div className="mb-stack-lg border-l-4 border-primary pl-6">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2 italic">Foundations</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Establish the core identity and timeline of your hackathon. This information will be visible to all participants on the landing page.
        </p>
      </div>

      {/* Form Container */}
      <form className="space-y-stack-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Left Column */}
          <div className="space-y-stack-md">
            <div className="group">
              <label className="block font-label-md text-on-surface mb-2 font-bold group-focus-within:text-primary transition-colors">Hackathon Name</label>
              <input required value={basicInfo.name} onChange={e => setBasicInfo({ name: e.target.value })} className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-4 px-5 font-body-md transition-all focus:border-primary focus:ring-0" placeholder="e.g. Sustainable Futures 2024" type="text" />
            </div>
            <div className="group">
              <label className="block font-label-md text-on-surface mb-2 font-bold group-focus-within:text-primary transition-colors">Theme</label>
              <select value={basicInfo.theme} onChange={e => setBasicInfo({ theme: e.target.value })} className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-4 px-5 font-body-md transition-all focus:border-primary focus:ring-0 appearance-none">
                <option>Social Impact</option>
                <option>Artificial Intelligence</option>
                <option>Fintech Innovation</option>
                <option>Green Energy</option>
                <option>Health & Longevity</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block font-label-md text-on-surface mb-2 font-bold group-focus-within:text-primary transition-colors">Min Team Size</label>
                <input value={basicInfo.min_team_size} onChange={e => setBasicInfo({ min_team_size: parseInt(e.target.value) })} className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-4 px-5 font-body-md transition-all focus:border-primary focus:ring-0" min="1" type="number" />
              </div>
              <div className="group">
                <label className="block font-label-md text-on-surface mb-2 font-bold group-focus-within:text-primary transition-colors">Max Team Size</label>
                <input value={basicInfo.max_team_size} onChange={e => setBasicInfo({ max_team_size: parseInt(e.target.value) })} className="w-full bg-surface-container-lowest border-outline-variant rounded-xl py-4 px-5 font-body-md transition-all focus:border-primary focus:ring-0" min="1" type="number" />
              </div>
            </div>
          </div>
          
          {/* Right Column: Description */}
          <div className="group">
            <label className="block font-label-md text-on-surface mb-2 font-bold group-focus-within:text-primary transition-colors">Description</label>
            <textarea value={basicInfo.description} onChange={e => setBasicInfo({ description: e.target.value })} className="w-full h-full min-h-[280px] bg-surface-container-lowest border-outline-variant rounded-xl py-4 px-5 font-body-md transition-all focus:border-primary focus:ring-0 resize-none" placeholder="Tell your story. What makes this hackathon unique? What are the overarching goals?"></textarea>
          </div>
        </div>

        {/* Date Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter pt-stack-md">
          {/* Registration Dates */}
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined">how_to_reg</span>
              <h3 className="font-label-md font-bold uppercase tracking-widest">Registration Window</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block font-label-sm text-on-surface-variant mb-1">Start Date</label>
                <input value={basicInfo.registration_start} onChange={e => setBasicInfo({ registration_start: e.target.value })} className="w-full bg-surface border-outline-variant rounded-lg py-2 px-3 font-body-md focus:border-primary focus:ring-0" type="date" />
              </div>
              <div className="group">
                <label className="block font-label-sm text-on-surface-variant mb-1">End Date</label>
                <input value={basicInfo.registration_end} onChange={e => setBasicInfo({ registration_end: e.target.value })} className="w-full bg-surface border-outline-variant rounded-lg py-2 px-3 font-body-md focus:border-primary focus:ring-0" type="date" />
              </div>
            </div>
          </div>

          {/* Event Dates */}
          <div className="p-6 bg-white rounded-3xl shadow-sm border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-2 text-secondary mb-2">
              <span className="material-symbols-outlined">calendar_today</span>
              <h3 className="font-label-md font-bold uppercase tracking-widest">Event Timeline</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label className="block font-label-sm text-on-surface-variant mb-1">Start Date</label>
                <input value={basicInfo.event_start} onChange={e => setBasicInfo({ event_start: e.target.value })} className="w-full bg-surface border-outline-variant rounded-lg py-2 px-3 font-body-md focus:border-primary focus:ring-0" type="date" />
              </div>
              <div className="group">
                <label className="block font-label-sm text-on-surface-variant mb-1">End Date</label>
                <input value={basicInfo.event_end} onChange={e => setBasicInfo({ event_end: e.target.value })} className="w-full bg-surface border-outline-variant rounded-lg py-2 px-3 font-body-md focus:border-primary focus:ring-0" type="date" />
              </div>
            </div>
          </div>
        </div>

        {/* Visual Accent: Premium Image */}
        <div className="relative w-full h-48 rounded-3xl overflow-hidden mt-stack-lg group">
          <img className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="A cinematic workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDECRXnbWmyPKHujCs___fgZef5YWGU-Vo9BHs7eywqARQmOb6K9-5Jl5YGNJZJggqhrurZVEsoZd3e4gd-fDZNCv4Kxp2wvkunoL9mie7lBQeiB1HGZkme1NIyJSGYzjLP_iUrIByaYYiCGh_ZHAmTSyGaUDOw-HxdTAxcLQJ09o3l1rWJDwecdFrFkedpmohByZQsENGLT-eEb967RVIjzLA9hdVmT5jN554MrwDQlo8phh-9YOd8XVBx9p78I9mZ9F-kEt9ZBuI" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-8">
            <div className="text-white">
              <p className="font-headline-sm italic opacity-90 leading-tight">"The best way to predict the future is to create it."</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-stack-lg border-t border-outline-variant mt-12 pb-12">
          <button className="px-8 py-3 rounded-full font-label-md text-on-surface-variant border border-outline hover:bg-surface-container transition-colors flex items-center gap-2" type="button">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Save Draft
          </button>
          <button onClick={handleNext} className="px-10 py-4 rounded-full font-label-md bg-tertiary text-white hover:bg-tertiary-fixed-variant shadow-lg shadow-tertiary/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3" type="button">
            Next: Problem Statements
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </div>
  );
}
