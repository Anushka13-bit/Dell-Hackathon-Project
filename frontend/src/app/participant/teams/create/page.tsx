"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const MOCK_PARTICIPANTS = [
  {
    id: "p1",
    name: "Alex Rivera",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEo20hrQSF2YwwJS4Ye6B9OV12dT1HKGMTA_Ve13ZF1kqyHYbl-qk8jbZKq35_fPbv6v3kb6Q8Q0e2PR9BYATQ7AtKp5fQZYab5C2eJKCA5V1_k84icV4JlehdKbVGL0L4N9NWSJ7Yf_dLvrUrqUUKzzWCLP6x48MnbtyxVbVZLMzPISgtav3qyvjyo8xutGO01T-u0ak5lBmRdNI6_CoFd2Ho_Ou8HVVM_Erfu2Mg51cBVehmQH_r5AsDJHVgKRePb9FO6UarPY8",
    skills: ["TensorFlow", "Rust", "MLOps"],
    skill_vector: { ai_ml: 0.9, backend: 0.8, hardware: 0.3 } as Record<string, number>
  },
  {
    id: "p2",
    name: "Jordan Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5-WSK9nwbsH03xvjPu3LdIislU7f8HM9ABzU_pqrFjgp-7jjXWRKzxjeyV8YQJuvAKuts8JXpIOTtrxFfWXiHoqW1WoIqlpleSmvI__qCmWOwfpkGLpB85tDfIGEQS0b0pK-a9d6GtDIfb6We51nIDcKUaBNhzI28bGFlIH4lmOWrnmPEQeBth7l4UrBHd0XJyEvKILwGQQOFk8MjdK25CwazyXF1atpAULSOoHBmOp4bGfjc_cYuDOX9rJQxVNangaph7vJFbLk",
    skills: ["Go", "Distributed Systems", "PostgreSQL"],
    skill_vector: { backend: 0.9, cloud: 0.8, database: 0.9 } as Record<string, number>
  },
  {
    id: "p3",
    name: "Samira Tariq",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCy6hLar6lVOcFsOiDN0W40PpfburCY8toVgMujwoyT-x1w9auzVkVjN7BVvJc8V665ZoVcMRvlH_-qrenXGlQN-rfcF-x4eVwry6uhkT9Btn-f0q8gKWs4hcm0cWiazxqXakf8Fikbq7NrFeuoZPGNoXkFnNxUAEsNq7PMlFNY5julvEMr4F99Er9RFO_ZVRJXKAWpynPlZk5eQRz_rRVoq0hKGAK-GDdQ92ud2gD3DhAKhNnTrtMYwv2nhiAYgNfwrOhksxnO0r8",
    skills: ["Figma", "React", "User Research"],
    skill_vector: { ui_ux: 0.9, frontend: 0.7, design: 0.9 } as Record<string, number>
  }
];

// In a real scenario, this is derived from the team's needs + problem statement
const TEAM_REQUIRED_VECTOR: Record<string, number> = { ai_ml: 0.8, backend: 0.6, ui_ux: 0.5 };

function calculateRecruitMatch(participantVector: Record<string, number>, requiredVector: Record<string, number>) {
  let score = 0;
  let maxPossible = 0;
  
  for (const [skill, weight] of Object.entries(requiredVector)) {
    maxPossible += weight;
    if (participantVector[skill]) {
      score += participantVector[skill] * weight;
    }
  }
  
  if (maxPossible === 0) return 0;
  return Math.round((score / maxPossible) * 100);
}

export default function CreateTeam() {
  const [teamSize, setTeamSize] = useState(4);
  const [activeTab, setActiveTab] = useState("Invite Friends");

  const sortedRecruits = [...MOCK_PARTICIPANTS].map(p => ({
    ...p,
    matchScore: calculateRecruitMatch(p.skill_vector, TEAM_REQUIRED_VECTOR)
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <>
      <main className="max-w-[1280px] mx-auto px-6 py-stack-lg pb-32">
        {/* Header Section */}
        <section className="mb-stack-lg text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-stack-sm">Architect Your Squad</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Define your mission and find the perfect collaborators to bring your vision to life.</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-md items-start">
          {/* Left Column: Team Architecting */}
          <div className="lg:col-span-7 space-y-stack-md">
            {/* Team Identity Card */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <h2 className="font-headline-sm text-[24px] text-primary mb-6">Team Identity</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Team Name</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary focus:border-transparent outline-none transition-all font-body-md" placeholder="e.g. Project Verdant" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Team Description</label>
                  <textarea className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary focus:border-transparent outline-none transition-all font-body-md" placeholder="Describe your team's mission, culture, and goals..." rows={4}></textarea>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Problem Statement Selection</label>
                  <select className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary outline-none font-body-md appearance-none">
                    <option>AI for Carbon Sequestration</option>
                    <option>Decentralized Energy Grids</option>
                    <option>Ethical Data Markets</option>
                    <option>Sustainable Urban Mobility</option>
                  </select>
                </div>
              </div>
            </div>

            
            {/* Required Skills Module */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-[24px] text-primary">Required Skills</h2>
                <button className="flex items-center gap-2 text-primary font-label-md hover:opacity-70 transition-opacity">
                  <span className="material-symbols-outlined">add_circle</span>
                  Add Skill
                </button>
              </div>
              <div className="space-y-4">
                {/* Skill Item 1 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">code</span>
                    </span>
                    <div>
                      <p className="font-label-md font-bold text-on-surface">Python Specialist</p>
                      <p className="text-[12px] text-on-surface-variant">Data processing & backend</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] uppercase tracking-wider text-on-surface-variant font-bold">Crucial</span>
                      <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-secondary block">1/2 Open</span>
                      <div className="w-24 h-1 bg-outline-variant rounded-full mt-1 overflow-hidden">
                        <div className="bg-secondary w-1/2 h-full"></div>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                {/* Skill Item 2 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">palette</span>
                    </span>
                    <div>
                      <p className="font-label-md font-bold text-on-surface">UI/UX Designer</p>
                      <p className="text-[12px] text-on-surface-variant">High-fidelity prototyping</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] uppercase tracking-wider text-on-surface-variant font-bold">Preferred</span>
                      <div className="w-10 h-5 bg-outline-variant rounded-full relative cursor-pointer">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-secondary block">0/1 Open</span>
                      <div className="w-24 h-1 bg-outline-variant rounded-full mt-1 overflow-hidden">
                        <div className="bg-secondary w-full h-full"></div>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligence & Recruitment */}
          <aside className="lg:col-span-5 space-y-stack-md">
            {/* Team Health & Skill Gap Analysis */}
            <div className="bg-surface-container-lowest rounded-xl p-stack-md border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <h2 className="font-headline-sm text-[24px] text-primary mb-6">Readiness Analysis</h2>
              <div className="flex items-center justify-between mb-8">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-surface-container-high" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeWidth="2.5"></circle>
                    <circle className="text-primary" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100 100" strokeDashoffset="35" strokeLinecap="round" strokeWidth="2.5"></circle>
                    <text className="text-[8px] font-bold fill-primary rotate-90 origin-center" textAnchor="middle" x="18" y="21">65%</text>
                  </svg>
                </div>
                <div className="flex-1 ml-6">
                  <p className="font-label-md text-on-surface-variant mb-1">Coverage Score</p>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-secondary"></span>
                    <span className="font-label-md font-bold text-on-surface">Forming Stage</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Current Members</p>
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVy5KoRSnIDJytOfYh6f5b8jSt-NzIQkXHQAMZKM58R4GqZ8BLUUQ7jlaaHBNn0tdRKn34Hh2QvoVkt57XWeQFXT67eYj9Ue7ZPsltIYZzQzgq0NbWlJwk71eFWXIOmKYJixoB1E3saeevLzTj4PEZpRhXwbW3eeqGdD4rhDkAZIr_Dv4lKtFyL4O0nKNSBhuOJivKVVMEVmqPl1SL_WFl_QG0097uYyT3Rv03PTpO4iAWwuv3IVq9qjT3BVoYe7qSbelQsHK8u3w" alt="Member 1" />
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIFbJu0MS0mKNfCUUvZPsa-Itd1xSS7urJRM9GlRUMn1C2PH24-G0OV2wkY4v6rouLjgi6SOqnIT_-kP78W3dX9E6nP5i2rqlNdYEBi1AZ3QyfF37-dBySsXfi8UKOgRp0G-n17RR1J0nUMzUE2fwQv7RFdRrdlKpyR_qYQyXx7bUTu1Fl923G1bNvrTBZTgzcqKjLrQ_JhlfWyzDGZbMqSQOU2PVWEqSd-VI22T2tijpL3LunDuhsu1ffF55PINl5ATMiuOBD-Ls" alt="Member 2" />
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+2</div>
                  </div>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-3">Missing Critical Roles</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-error-container/20 text-error text-[12px] font-bold rounded-full border border-error/10">Lead Backend</span>
                    <span className="px-3 py-1 bg-error-container/20 text-error text-[12px] font-bold rounded-full border border-error/10">Data Scientist</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recruitment Suggestions */}
            <div className="bg-surface-container-highest/30 rounded-xl p-stack-md border border-outline-variant/10 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)]">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-tertiary">psychology</span>
                <h2 className="font-headline-sm text-[24px] text-primary">AI Matchmaking</h2>
              </div>
              <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2">
                {sortedRecruits.map((recruit) => (
                  <div key={recruit.id} className="bg-white p-4 rounded-xl border border-outline-variant/20 hover:border-primary/50 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <img className="w-12 h-12 rounded-lg object-cover bg-surface-variant" src={recruit.avatar} alt={recruit.name} />
                        <div>
                          <h3 className="font-label-md font-bold text-on-surface">{recruit.name}</h3>
                          <p className="text-[12px] text-tertiary font-bold">{recruit.matchScore}% Match</p>
                        </div>
                      </div>
                      <button className="bg-primary text-white text-[12px] px-3 py-1.5 rounded-full font-bold hover:scale-105 transition-transform">Invite</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recruit.skills.map((skill) => (
                        <span key={skill} className="text-[10px] px-2 py-1 bg-surface-container-low rounded-md">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Panel */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-[0_20px_40px_-15px_rgba(214,203,191,0.4)] overflow-hidden">
              <div className="flex border-b border-outline-variant/10">
                {["Invite Friends", "By Email", "Requests Sent"].map((tab) => (
                  <button 
                    key={tab}
                    className={`flex-1 py-3 font-label-sm transition-colors ${
                      activeTab === tab ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-stack-md">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <span className="font-label-md font-bold text-on-surface">sarah.j@tech.io</span>
                    </div>
                    <span className="px-2 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold rounded-full">Invited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <span className="font-label-md font-bold text-on-surface">marcus_v@ucla.edu</span>
                    </div>
                    <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded-full">Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer/Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-lg border-t border-outline-variant/30 py-4 px-6 z-50">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">verified</span>
            <p className="font-label-md text-on-surface-variant">Your team blueprint is 65% complete. Ready for phase 1?</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/participant/teams">
              <button className="w-full md:w-auto px-6 py-2.5 rounded-lg border border-outline-variant text-primary font-label-md font-bold hover:bg-surface-container-low transition-colors">
                Save Draft
              </button>
            </Link>
            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-lg bg-primary-container/20 text-on-primary-container font-label-md font-bold hover:bg-primary-container/40 transition-colors">
              Invite Participants
            </button>
            <Link href="/participant/teams/workspace">
              <button className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-label-md font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Create Team
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
