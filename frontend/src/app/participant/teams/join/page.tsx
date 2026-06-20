"use client";

import Link from "next/link";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const MOCK_OPEN_TEAMS = [
  {
    id: "t1",
    name: "EcoStream",
    domain: "Urban Tech",
    description: "Real-time monitoring of urban water waste using IoT sensors and edge computing for smarter city management.",
    readiness: "Robust",
    readinessColor: "text-primary",
    theme: "primary",
    skills: ["Python", "React", "IoT"],
    missingRole: "Frontend Fit",
    requiredVector: { frontend: 0.8, hardware: 0.3, backend: 0.5 } as Record<string, number>,
  },
  {
    id: "t2",
    name: "BioSynth AI",
    domain: "Biotech",
    description: "Using generative AI to accelerate the discovery of plastic-eating enzymes for industrial recycling.",
    readiness: "Growing",
    readinessColor: "text-secondary",
    theme: "secondary",
    skills: ["GenAI", "Python", "Bioinformatics"],
    missingRole: "Domain Expert",
    requiredVector: { ai_ml: 0.9, data_science: 0.6, biotech: 0.8 } as Record<string, number>,
  },
  {
    id: "t3",
    name: "Urban Canopy",
    domain: "Urban Tech",
    description: "AI-driven rooftop garden optimization for heat island reduction.",
    readiness: "Robust",
    readinessColor: "text-primary",
    theme: "primary",
    skills: ["Python", "React Native", "GIS"],
    missingRole: "Mobile Developer",
    requiredVector: { mobile: 0.8, ui_ux: 0.5, data_science: 0.4 } as Record<string, number>,
  },
  {
    id: "t4",
    name: "Solar Trace",
    domain: "Sustainability",
    description: "Blockchain ledger for transparent community solar energy sharing.",
    readiness: "Forming",
    readinessColor: "text-tertiary",
    theme: "tertiary",
    skills: ["Solidity", "Node.js"],
    missingRole: "Backend Dev",
    requiredVector: { blockchain: 0.9, backend: 0.8 } as Record<string, number>,
  }
];

function calculateMatch(participantVector: Record<string, number> | undefined, requiredVector: Record<string, number>) {
  if (!participantVector) return 0;
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

export default function JoinTeam() {
  const { aiData } = useOnboardingStore();
  const participantVector = aiData?.skill_vector;

  const sortedTeams = [...MOCK_OPEN_TEAMS].map(team => ({
    ...team,
    matchScore: calculateMatch(participantVector, team.requiredVector)
  })).sort((a, b) => b.matchScore - a.matchScore);

  const recommendedTeams = sortedTeams.filter(t => t.matchScore >= 50);
  const otherTeams = sortedTeams.filter(t => t.matchScore < 50);

  return (
    <div className="flex max-w-[1280px] mx-auto">
      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-margin-desktop bg-background min-h-[calc(100vh-80px)]">
        <div className="flex flex-col gap-stack-lg">
          {/* Hero Section */}
          <header>
            <h1 className="font-display-lg text-[32px] md:text-[48px] mb-2">Find Your Perfect Squad</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl">Our AI analyzes your unique skill set to match you with teams tackling the world's most pressing sustainability and biotech challenges.</p>
          </header>

          {/* Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Available Teams</span>
              <div className="text-[32px] font-headline-md mt-1">{MOCK_OPEN_TEAMS.length}</div>
            </div>
            <div className="bg-primary-container/20 p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-primary/10">
              <span className="text-label-sm text-primary uppercase tracking-widest">AI Recommended</span>
              <div className="text-[32px] font-headline-md mt-1 text-primary">{recommendedTeams.length}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Open Roles</span>
              <div className="text-[32px] font-headline-md mt-1">12</div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] border border-surface-container-highest">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">Requests Sent</span>
              <div className="text-[32px] font-headline-md mt-1">0</div>
            </div>
          </div>

          {/* AI Recommended Teams Section */}
          {recommendedTeams.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-sm text-[24px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Recommended for You
                </h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {recommendedTeams.map((team, idx) => (
                  <div key={team.id} className="group relative bg-white rounded-[32px] overflow-hidden border border-surface-container-highest transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    <div className={`h-32 bg-${team.theme}-container/10 flex items-end p-6`}>
                      <div className="flex justify-between w-full items-end">
                        <div className={`bg-${team.theme} text-white px-3 py-1 rounded-full text-label-sm font-semibold`}>{team.matchScore}% Match</div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-headline-sm text-[24px]">{team.name}</h3>
                          <span className={`inline-block mt-1 px-2 py-0.5 bg-${team.theme}-container text-on-${team.theme}-container rounded text-label-sm font-semibold`}>{team.missingRole} Needed</span>
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-body-md line-clamp-2">{team.description}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between text-label-sm text-on-surface-variant">
                          <span>Team Skill Coverage</span>
                          <span className="font-bold">{team.matchScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                          <div className={`h-full bg-${team.theme}`} style={{ width: `${team.matchScore}%` }}></div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 flex justify-center py-3 px-4 rounded-2xl bg-primary text-white font-medium hover:opacity-90 transition-all">
                          Request to Join
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Available Teams List */}
          <section>
            <h2 className="font-headline-sm text-[24px] mb-6">Available Teams</h2>
            <div className="flex flex-col gap-6">
              {otherTeams.map(team => (
                <div key={team.id} className="bg-white p-6 rounded-[32px] border border-surface-container-highest hover:border-primary-container transition-all grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-3">
                    <h4 className="font-semibold text-body-lg">{team.name}</h4>
                    <p className={`text-label-sm ${team.readinessColor} font-medium`}>{team.domain}</p>
                  </div>
                  <div className="md:col-span-4">
                    <p className="text-on-surface-variant text-label-md line-clamp-1">{team.description}</p>
                    <div className="flex gap-1 mt-2">
                      {team.skills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-surface-container-low rounded-full text-[10px] uppercase tracking-tighter">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex flex-col items-center">
                    <span className="text-label-sm text-on-surface-variant">Readiness</span>
                    <span className={`font-bold ${team.readinessColor}`}>{team.readiness}</span>
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2">
                    <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant rounded-full text-[12px] font-bold flex items-center">{team.matchScore}% Match</span>
                    <button className="px-4 py-2 bg-surface-container-high text-on-surface font-medium rounded-xl hover:bg-surface-container-highest transition-all">Request</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Right Side Panel (AI Insights) */}
      <aside className="hidden lg:block w-96 p-6 sticky top-0 h-screen overflow-y-auto bg-surface-container-lowest border-l border-outline-variant/30">
        <div className="flex flex-col gap-6">
          {/* AI Insights Card */}
          {recommendedTeams.length > 0 && (
            <div className="bg-primary text-white p-8 rounded-[40px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.3)] relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="text-label-sm font-semibold uppercase tracking-widest">Personal Analysis</span>
                </div>
                <div>
                  <p className="text-white/80 text-label-sm mb-1 uppercase tracking-wider">Top Recommendation</p>
                  <p className="font-headline-sm text-[24px] leading-tight italic">"Your skills strongly match {recommendedTeams[0].name}."</p>
                </div>
                <p className="text-body-md text-white/90">This team is currently missing a {recommendedTeams[0].missingRole} to finalize their product.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
