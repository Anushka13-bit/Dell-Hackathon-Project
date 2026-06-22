"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getApiBaseUrl } from "@/lib/api";

type Participant = {
  id: string;
  name?: string;
  avatar?: string;
  declared_skills?: string[];
  skill_vector?: Record<string, number>;
}

function buildRequiredVector(skills: string[]) {
  return skills.reduce((acc, skill) => {
    acc[skill.toLowerCase().replace(/\s+/g, '_')] = 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateRecruitMatch(participantSkills: string[], requiredSkills: string[]) {
  if (!requiredSkills || requiredSkills.length === 0) return 0;
  
  const lowerParticipantSkills = (participantSkills || []).map((s: string) => s.toLowerCase().trim());
  if (lowerParticipantSkills.length === 0) return 0;
  
  let matchCount = 0;
  for (const reqSkill of requiredSkills) {
    if (lowerParticipantSkills.includes(reqSkill.toLowerCase().trim())) {
      matchCount++;
    }
  }
  
  return Math.round((matchCount / requiredSkills.length) * 100);
}

export default function CreateTeam() {
  const [teamSize, setTeamSize] = useState(4);
  const [activeTab, setActiveTab] = useState("Invite Friends");
  const [teamName, setTeamName] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Python", "UI/UX"]);
  const [newSkill, setNewSkill] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [invitedMemberIds, setInvitedMemberIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleInvite = async (recruit: any) => {
    setInvitedMemberIds(prev => [...prev, recruit.id]);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const apiBase = getApiBaseUrl();
      
      if (session?.user?.id) {
        const pRes = await fetch(`${apiBase}/participants/${session.user.id}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.team_id) {
            await fetch(`${apiBase}/teams/${pData.team_id}/add_member`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ participant_id: recruit.id })
            });
          } else {
            await fetch(`${apiBase}/teams/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: teamName || "Unnamed Team",
                member_ids: [session.user.id, ...invitedMemberIds, recruit.id]
              })
            });
          }
        }
      }
    } catch (e) {
      console.error("Auto-save failed", e);
    }

    await loadTeam();

    setToastMessage(`${recruit.name} was added to the team!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCreateTeam = async () => {
    try {
      setIsCreating(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const apiBase = getApiBaseUrl();
      
      if (session?.user?.id) {
        const pRes = await fetch(`${apiBase}/participants/${session.user.id}`);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.team_id) {
            if (teamName) {
              await fetch(`${apiBase}/teams/${pData.team_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: teamName })
              });
            }
            router.push("/participant/teams/workspace");
            return;
          }
        }
      }
      
      const payload = {
        name: teamName || "Unnamed Team",
        member_ids: session?.user?.id ? [session.user.id, ...invitedMemberIds] : [...invitedMemberIds]
      };

      const res = await fetch(`${apiBase}/teams/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        router.push("/participant/teams/workspace");
      } else {
        console.error("Failed to create team");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const [recruits, setRecruits] = useState<Participant[]>([]);
  const [loadingRecruits, setLoadingRecruits] = useState(true);
  const [teamCoverage, setTeamCoverage] = useState(0);
  const [teamMembers, setTeamMembers] = useState<{id: string, name: string}[]>([]);

  const loadTeam = async () => {
    const apiBase = getApiBaseUrl();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    
    try {
      const pRes = await fetch(`${apiBase}/participants/${session.user.id}`);
      if (!pRes.ok) return;
      const pData = await pRes.json();
      
      if (pData.team_id) {
        const tRes = await fetch(`${apiBase}/teams/${pData.team_id}`);
        if (tRes.ok) {
          const tData = await tRes.json();
          if (tData.member_ids && tData.member_ids.length > 0) {
            const members = [];
            for (const mid of tData.member_ids) {
              const mRes = await fetch(`${apiBase}/participants/${mid}`);
              if (mRes.ok) {
                const mData = await mRes.json();
                members.push({ id: mData.id, name: mData.name || 'Unknown' });
              }
            }
            setTeamMembers(members);
          }
        }
      } else {
        setTeamMembers([{ id: pData.id, name: pData.name || 'You' }]);
      }
    } catch (e) {
      console.error("Failed to load team data:", e);
    }
  };

  useEffect(() => {
    const apiBase = getApiBaseUrl();
    setLoadingRecruits(true);
    fetch(`${apiBase}/participants/`)
      .then(async (r) => { if (!r.ok) throw new Error(`Status ${r.status}`); return r.json(); })
      .then((data) => setRecruits(data || []))
      .catch((e) => console.error("Failed to load participants:", e))
      .finally(() => setLoadingRecruits(false));

    loadTeam();
  }, []);

  useEffect(() => {
    if (!requiredSkills || requiredSkills.length === 0) {
      setTeamCoverage(0);
      return;
    }
    
    const teamSkills = new Set<string>();
    
    // Get all valid team member IDs including currently invited ones
    const allMemberIds = new Set(teamMembers.map(m => m.id));
    invitedMemberIds.forEach(id => allMemberIds.add(id));
    
    for (const p of recruits) {
      if (allMemberIds.has(p.id)) {
        const skills = p.declared_skills || (p as any).skills || [];
        skills.forEach((s: string) => teamSkills.add(s.toLowerCase().trim()));
      }
    }
    
    let matchCount = 0;
    for (const reqSkill of requiredSkills) {
      if (teamSkills.has(reqSkill.toLowerCase().trim())) {
        matchCount++;
      }
    }
    
    setTeamCoverage(Math.round((matchCount / requiredSkills.length) * 100));
  }, [teamMembers, recruits, requiredSkills, invitedMemberIds]);

  const sortedRecruits = [...recruits].map(p => ({
    ...p,
    matchScore: calculateRecruitMatch(p.declared_skills || (p as any).skills || [], requiredSkills)
  })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

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
                  <input 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-tertiary focus:border-transparent outline-none transition-all font-body-md" 
                    placeholder="e.g. Project Verdant" 
                    type="text" 
                  />
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-headline-sm text-[24px] text-primary">Required Skills</h2>
                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const skill = newSkill.trim();
                        if (skill && !requiredSkills.includes(skill)) {
                          setRequiredSkills([...requiredSkills, skill]);
                        }
                        setNewSkill('');
                      }
                    }}
                    className="w-full sm:w-72 bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-tertiary outline-none"
                    placeholder="Add a new skill"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const skill = newSkill.trim();
                      if (!skill) return;
                      if (!requiredSkills.includes(skill)) {
                        setRequiredSkills([...requiredSkills, skill]);
                      }
                      setNewSkill('');
                    }}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {requiredSkills.length === 0 ? (
                  <div className="text-on-surface-variant">No skills added yet. Add a skill to define your team’s needs.</div>
                ) : (
                  <div className="space-y-3">
                    {requiredSkills.map((skill) => (
                      <div key={skill} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary text-[18px]">{skill.charAt(0).toUpperCase()}</span>
                          <div>
                            <p className="font-label-md font-bold text-on-surface">{skill}</p>
                            <p className="text-[12px] text-on-surface-variant">This skill is required for your team.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[12px] uppercase tracking-wider text-on-surface-variant font-bold">Required</span>
                          <button
                            type="button"
                            onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== skill))}
                            className="text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <circle className="text-primary" cx="18" cy="18" fill="transparent" r="16" stroke="currentColor" strokeDasharray={`${teamCoverage} 100`} strokeDashoffset="0" strokeLinecap="round" strokeWidth="2.5"></circle>
                    <text className="text-[8px] font-bold fill-primary rotate-90 origin-center" textAnchor="middle" x="18" y="21">{teamCoverage}%</text>
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
                  <div className="flex flex-col gap-2">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="font-label-md text-on-surface px-3 py-2 bg-surface-container-low border border-outline-variant/10 rounded-md">
                        {member.name}
                      </div>
                    ))}
                    {recruits.filter(r => invitedMemberIds.includes(r.id) && !teamMembers.find(m => m.id === r.id)).map((member) => (
                      <div key={member.id} className="font-label-md text-on-surface px-3 py-2 bg-surface-container-low border border-primary/20 rounded-md flex justify-between items-center">
                        <span>{member.name} <span className="text-[12px] text-tertiary ml-2">(Added)</span></span>
                        <button 
                          onClick={() => setInvitedMemberIds(prev => prev.filter(id => id !== member.id))}
                          className="text-on-surface-variant hover:text-error transition-colors flex items-center"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
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
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-label-md font-bold text-on-surface">{recruit.name}</h3>
                        <p className="text-[12px] text-tertiary font-bold">{recruit.matchScore}% Match</p>
                      </div>
                      <button 
                        onClick={() => handleInvite(recruit)}
                        disabled={invitedMemberIds.includes(recruit.id)}
                        className={`text-[12px] px-3 py-1.5 rounded-full font-bold hover:scale-105 transition-transform ${invitedMemberIds.includes(recruit.id) ? "bg-surface-variant text-on-surface-variant" : "bg-primary text-white"}`}
                      >
                        {invitedMemberIds.includes(recruit.id) ? "Invited" : "Invite"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(recruit.declared_skills || (recruit as any).skills || []).map((skill) => (
                        <span key={skill} className="text-[10px] px-2 py-1 bg-surface-container-low rounded-md">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recruitment Panel */}
            
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
            <button 
              onClick={handleCreateTeam}
              disabled={isCreating}
              className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-label-md font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Team"}
            </button>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-surface-container-high text-on-surface px-6 py-3 rounded-full shadow-lg border border-outline-variant/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 z-[60]">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          <span className="font-label-md">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
