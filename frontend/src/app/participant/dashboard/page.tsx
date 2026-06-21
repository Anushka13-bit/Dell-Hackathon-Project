"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Code, Users, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useEffect, useState } from "react";

type Hack = {
  id: string;
  name: string;
  theme?: string | null;
  description?: string | null;
  event_start?: string | null;
  event_end?: string | null;
  targetSkills?: Record<string, number>;
}

function calculateMatch(participantVector: Record<string, number> | undefined, hackathonVector: Record<string, number>) {
  if (!participantVector) return 0;
  let score = 0;
  let maxPossible = 0;
  
  for (const [skill, weight] of Object.entries(hackathonVector)) {
    maxPossible += weight;
    if (participantVector[skill]) {
      score += participantVector[skill] * weight;
    }
  }
  
  if (maxPossible === 0) return 0;
  return Math.round((score / maxPossible) * 100);
}

export default function ParticipantDashboard() {
  const { fullName, aiData } = useOnboardingStore();
  const participantVector = aiData?.skill_vector;

  // Fetch hackathons from backend
  const [hackathons, setHackathons] = useState<Hack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    setLoading(true);
    fetch(`${apiUrl}/hackathons/`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // Map backend shape to frontend-friendly shape
        const mapped = (data || []).map((h: any) => ({
          id: h.id,
          name: h.name,
          theme: h.theme,
          description: h.description,
          event_start: h.event_start,
          event_end: h.event_end,
          targetSkills: h.target_skills || {},
        }));
        setHackathons(mapped);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Calculate scores and sort
  const sortedHackathons = [...hackathons].map(h => ({
    ...h,
    matchScore: calculateMatch(participantVector, (h.targetSkills as unknown) as Record<string, number> || {})
  })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const firstName = fullName ? fullName.split(" ")[0] : "Hacker";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-primary tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-on-surface-variant text-[16px] mt-2">Ready to build something amazing today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Stat Cards */}
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <p className="text-on-surface-variant text-[13px] font-bold uppercase tracking-widest">Points</p>
            <p className="text-[28px] font-bold text-on-surface">1,250</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Code className="w-7 h-7" />
          </div>
          <div>
            <p className="text-on-surface-variant text-[13px] font-bold uppercase tracking-widest">Commits</p>
            <p className="text-[28px] font-bold text-on-surface">34</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/30 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-on-surface-variant text-[13px] font-bold uppercase tracking-widest">Teammates</p>
            <p className="text-[28px] font-bold text-on-surface">3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          
          {/* Active Workspace */}
          <div className="mb-10">
            <h2 className="text-[20px] font-bold mb-4">Current Workspace</h2>
            <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 bg-primary-container relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)]" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[12px] font-bold rounded-full uppercase tracking-wider mb-3 inline-block">In Progress</span>
                    <h3 className="text-[24px] font-bold">Winter 2024 Tech Bloom</h3>
                    <p className="text-on-surface-variant text-[15px] mt-1">AI-driven solutions for a sustainable future.</p>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Link href="/participant/teams">
                    <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-primary/90 transition-colors">
                      Go to Workspace
                    </button>
                  </Link>
                  <Link href="/participant/challenges">
                    <button className="bg-surface-container-low text-primary border border-primary/20 px-6 py-2.5 rounded-xl font-bold text-[14px] hover:bg-primary/5 transition-colors">
                      View Challenges
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommended Hackathons */}
          <div className="mb-8">
            <h2 className="text-[20px] font-bold mb-4">AI Recommended Hackathons</h2>

            {loading ? (
              <div className="text-on-surface-variant">Loading hackathons...</div>
            ) : error ? (
              <div className="text-error">Failed to load hackathons: {error}</div>
            ) : sortedHackathons.length === 0 ? (
              <div className="text-on-surface-variant">No hackathons available.</div>
            ) : (
              <div className="space-y-4">
                {sortedHackathons.slice(0, 4).map((hack: any) => (
                  <div key={hack.id} className="bg-white p-4 rounded-2xl border border-outline-variant/20 flex items-start justify-between">
                    <div>
                      <div className="text-sm text-on-surface-variant mb-1">{hack.theme || 'General'}</div>
                      <h4 className="font-bold text-[16px]">{hack.name || hack.title}</h4>
                      <p className="text-on-surface-variant text-[13px] mt-1">{hack.description}</p>
                    </div>
                    <div className="text-right flex flex-col items-end justify-between">
                      <div className="text-[12px] text-on-surface-variant">Match</div>
                      <div className="font-bold text-[18px] text-primary">{hack.matchScore ?? 0}%</div>
                      <Link href={`/participant/hackathons/${hack.id}`} className="text-[13px] text-primary mt-3">View →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[20px] font-bold mb-4">Announcements</h2>
          <div className="space-y-4">
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                <span className="text-[12px] text-error font-bold uppercase tracking-widest">Urgent</span>
              </div>
              <h4 className="font-bold text-[15px] mb-1">Submission Deadline Extended</h4>
              <p className="text-[13px] text-on-surface-variant">The final submission deadline has been extended by 2 hours due to server loads.</p>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[12px] text-secondary font-bold uppercase tracking-widest">Update</span>
              </div>
              <h4 className="font-bold text-[15px] mb-1">Mentoring Sessions Open</h4>
              <p className="text-[13px] text-on-surface-variant">New slots available for the AI and Cloud architecture mentors.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
