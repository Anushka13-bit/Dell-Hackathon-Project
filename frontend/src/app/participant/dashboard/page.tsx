"use client";

import Link from "next/link";
import { ArrowRight, Trophy, Code, Users, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import { useOnboardingStore } from "@/store/useOnboardingStore";

const MOCK_HACKATHONS = [
  {
    id: "h1",
    title: "GenAI Innovate 2024",
    description: "Build the next generation of AI-native applications using LLMs and vector databases.",
    targetSkills: { ai_ml: 1.0, backend: 0.6, cloud: 0.4 },
    date: "Aug 15 - Aug 17",
    prizePool: "₹5,00,000",
    tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    theme: "purple"
  },
  {
    id: "h2",
    title: "FinTech Disrupt",
    description: "Secure, scalable financial solutions for the modern economy.",
    targetSkills: { backend: 0.8, cybersecurity: 0.8, data_engineering: 0.5 },
    date: "Sep 01 - Sep 03",
    prizePool: "₹2,50,000",
    tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    theme: "blue"
  },
  {
    id: "h3",
    title: "Web3 Buildathon",
    description: "Decentralized applications, smart contracts, and the future of the web.",
    targetSkills: { frontend: 0.8, backend: 0.6, cybersecurity: 0.5 },
    date: "Oct 12 - Oct 14",
    prizePool: "₹1,00,000",
    tagColor: "bg-orange-100 text-orange-700 border-orange-200",
    theme: "orange"
  },
  {
    id: "h4",
    title: "Mobile Innovation Jam",
    description: "Creating beautiful, high-performance mobile experiences.",
    targetSkills: { mobile: 1.0, ui_ux: 0.8, frontend: 0.4 },
    date: "Nov 05 - Nov 07",
    prizePool: "₹3,00,000",
    tagColor: "bg-pink-100 text-pink-700 border-pink-200",
    theme: "pink"
  },
  {
    id: "h5",
    title: "IoT Hardware Hack",
    description: "Connecting the physical and digital worlds through embedded systems.",
    targetSkills: { hardware: 1.0, devops: 0.6, backend: 0.3 },
    date: "Dec 01 - Dec 03",
    prizePool: "₹1,50,000",
    tagColor: "bg-teal-100 text-teal-700 border-teal-200",
    theme: "teal"
  }
];

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

  // Calculate scores and sort
  const sortedHackathons = [...MOCK_HACKATHONS].map(h => ({
    ...h,
    matchScore: calculateMatch(participantVector, h.targetSkills as unknown as Record<string, number>)
  })).sort((a, b) => b.matchScore - a.matchScore);

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
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[20px] font-bold">Upcoming Hackathons</h2>
              {participantVector && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 border border-primary/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Matchmaking Active
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              {sortedHackathons.map((hackathon, index) => {
                const isBestMatch = index === 0 && hackathon.matchScore > 50;
                
                return (
                  <div key={hackathon.id} className={`bg-white rounded-2xl border ${isBestMatch ? 'border-primary shadow-md' : 'border-outline-variant/30 shadow-sm'} p-6 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden`}>
                    
                    {isBestMatch && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl tracking-wider uppercase shadow-sm">
                        Top Recommendation
                      </div>
                    )}
                    
                    <div className="flex-1 pt-2 md:pt-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${hackathon.tagColor}`}>
                          {hackathon.prizePool}
                        </span>
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[13px] font-medium">
                          <CalendarIcon className="w-4 h-4" />
                          {hackathon.date}
                        </div>
                      </div>
                      <h3 className="text-[20px] font-bold text-on-surface mb-1">{hackathon.title}</h3>
                      <p className="text-[14px] text-on-surface-variant line-clamp-2 mb-3">{hackathon.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(hackathon.targetSkills).sort((a, b) => b[1] - a[1]).map(([skill], i) => (
                          <span key={i} className="px-2 py-0.5 bg-surface-container-high border border-outline-variant/30 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded">
                            {skill.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 shrink-0 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
                      {hackathon.matchScore > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">Match Score</span>
                          <span className={`text-[18px] font-bold ${isBestMatch ? 'text-primary' : 'text-on-surface'}`}>
                            {hackathon.matchScore}%
                          </span>
                        </div>
                      )}
                      
                      <button className={`px-6 py-2.5 rounded-xl font-bold text-[14px] transition-colors w-full md:w-auto ${
                        isBestMatch 
                          ? 'bg-primary text-white hover:bg-primary/90' 
                          : 'bg-surface-container-low text-primary border border-primary/20 hover:bg-primary/5'
                      }`}>
                        Register Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
