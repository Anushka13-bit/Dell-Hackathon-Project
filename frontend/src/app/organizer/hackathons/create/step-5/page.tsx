"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore } from "@/store/useHackathonStore";

export default function CreateHackathonStep5() {
  const router = useRouter();
  const { draftId, basicInfo, problemStatements, rubrics, reviewers, resetStore } = useHackathonStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handlePublish = async () => {
    if (!draftId) return;
    setIsPublishing(true);
    try {
      // MOCKED FOR MVP: Normally we'd PUT to /publish here
      // but the backend schema for Hackathon relations is currently simplified.
      setShowOverlay(true);
      // Wait a bit, then redirect
      setTimeout(() => {
        resetStore(); // Clear drafts
        router.push("/organizer/dashboard");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Error publishing");
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg w-full">
      {/* Stepper Container */}
      <div className="flex items-center justify-between mb-stack-lg max-w-3xl mx-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Details</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Challenges</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Rubrics</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            <span className="material-symbols-outlined text-sm">check</span>
          </div>
          <span className="text-xs font-label-sm text-outline">Reviewers</span>
        </div>
        <div className="h-[1px] flex-1 bg-outline-variant mx-4"></div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-tertiary/20">5</div>
          <span className="text-xs font-label-sm text-tertiary font-bold">Publish</span>
        </div>
      </div>

      {/* Page Title Area */}
      <div className="mb-stack-lg text-center">
        <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Publish Summary</h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Review your hackathon configuration before going live. All settings except core dates can be modified after publishing.</p>
      </div>

      {/* Summary Content (Bento Style) */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Section: Basic Info */}
        <div className="col-span-12 lg:col-span-8 bg-white/70 backdrop-blur-md rounded-[24px] p-8 relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <span className="material-symbols-outlined text-[120px] text-primary">info</span>
          </div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Basic Info</h3>
              <p className="text-sm text-on-surface-variant">Core identity and scheduling</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors group">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary">edit</span>
              <span className="text-sm font-label-md text-on-surface">Edit</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Hackathon Name</label>
                <p className="text-body-lg font-bold text-on-surface">{basicInfo.name || "Untitled Hackathon"}</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Description</label>
                <p className="text-body-md text-on-surface-variant italic">"{basicInfo.description || 'No description provided'}"</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Registration Timeline</label>
                <div className="flex items-center gap-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                  <span>{basicInfo.registration_start ? new Date(basicInfo.registration_start).toLocaleDateString() : "TBD"} — {basicInfo.registration_end ? new Date(basicInfo.registration_end).toLocaleDateString() : "TBD"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Theme Color</label>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tertiary"></div>
                  <span className="text-sm font-mono text-on-surface">#3B4ED6 (Indigo)</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Team Size</label>
                <p className="text-body-md text-on-surface">{basicInfo.min_team_size} - {basicInfo.max_team_size} Hackers</p>
              </div>
              <div>
                <label className="block text-xs font-label-sm uppercase tracking-wider text-outline mb-1">Visibility</label>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/20 text-on-primary-container rounded-full border border-primary-container/30">
                  <span className="material-symbols-outlined text-[16px]">public</span>
                  <span className="text-xs font-label-sm">Public Listing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Media Preview */}
        <div className="col-span-12 lg:col-span-4 bg-white/70 backdrop-blur-md rounded-[24px] overflow-hidden group shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="h-full min-h-[240px] relative">
            <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Hero banner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1eTeCfBKA6YHWIq9uR3aezWb3zdh8pwM2K-7zUIU02PI8MPBVGv1pTCeAVbVS8oV5OP89fla_RNcCZLzGZlDNd8BAt489Ocqma0CcDLZO6bw0bt0klf4vlwOOR6dMVl3180e_t9PWU9QRC7-TyiRLGXjucgZQbNhO0EPyAMWJXoVHCrlafORjSmiV_ozmc-ROzhY0Zt7_S75Zyu-wVwVMrbHJ9sRbQ7D6PgCllK1OqMtI7WRWSwoaK2I4Nx7KeZ0A1PjqoXB7HMk"/>
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h4 className="font-headline-sm text-headline-sm">Event Cover</h4>
              <p className="text-sm opacity-80">Banner-1920x1080.png</p>
            </div>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <span className="material-symbols-outlined">fullscreen</span>
            </button>
          </div>
        </div>

        {/* Section: Problem Statements */}
        <div className="col-span-12 md:col-span-6 bg-white/70 backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Problem Statements</h3>
            <button className="text-primary hover:underline font-label-md text-label-md">Edit All</button>
          </div>
          <ul className="space-y-4">
            {problemStatements.map((stmt, idx) => (
              <li key={idx} className="p-4 rounded-xl border border-outline-variant bg-white/40 flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-lg bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-secondary-container">eco</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">{stmt.title}</h4>
                  <p className="text-sm text-on-surface-variant">{stmt.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Section: Rubrics & Scoring */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-low backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Rubrics</h3>
            <button className="text-primary hover:underline font-label-md text-label-md">Edit Rubrics</button>
          </div>
          <div className="space-y-6">
            {rubrics.map((r) => (
              <div key={r.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-label-md text-on-surface">{r.name}</span>
                  <span className="font-bold text-primary">{r.weight}%</span>
                </div>
                <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${r.weight}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Reviewers */}
        <div className="col-span-12 bg-white/70 backdrop-blur-md rounded-[24px] p-8 shadow-[0_10px_30px_-10px_rgba(214,203,191,0.3)] border border-outline-variant">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Reviewers (4)</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant hover:bg-surface-variant transition-colors group">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span className="text-sm font-label-md">Manage Panel</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviewers.map((reviewer, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-outline-variant/50 hover:bg-white transition-all">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-tertiary-container text-on-tertiary-container font-bold text-lg">
                  {reviewer.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-on-surface truncate">{reviewer.email}</p>
                  <p className="text-xs text-on-surface-variant truncate">{reviewer.institution || reviewer.expertise_domains.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
          <p className="text-sm">By publishing, you agree to the <Link href="#" className="underline font-bold">Organizer Terms of Service</Link>.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/organizer/hackathons/create/step-4" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-margin-mobile md:px-8 py-3 rounded-full border border-outline text-on-surface-variant font-label-md hover:bg-surface-variant transition-all">
              Previous Step
            </button>
          </Link>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full md:w-auto px-margin-mobile md:px-12 py-3 rounded-full bg-tertiary text-white font-bold font-label-md shadow-xl shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all ${isPublishing ? 'animate-pulse' : ''}`}
          >
            {isPublishing ? 'Publishing...' : 'Publish Hackathon'}
          </button>
        </div>
      </div>

      {/* Overlay Notification */}
      {showOverlay && (
        <div className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[100] flex items-center justify-center transition-opacity duration-500">
          <div className="text-center p-stack-lg max-w-md">
            <div className="w-24 h-24 bg-primary text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
              <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">It's Official!</h2>
            <p className="text-body-lg text-on-surface-variant mb-8">NexusAI Innovation Summit 2024 is now live and accepting registrations.</p>
            <div className="flex flex-col gap-3">
              <Link href="/organizer/dashboard" className="w-full">
                <button className="w-full px-8 py-3 bg-primary text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
