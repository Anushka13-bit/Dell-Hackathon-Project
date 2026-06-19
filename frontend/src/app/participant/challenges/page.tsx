"use client";

import { Trophy, Code2, Leaf, Sparkles } from "lucide-react";

export default function ParticipantChallenges() {
  const challenges = [
    {
      id: 1,
      title: "Best Use of AI & ML",
      sponsor: "Google Cloud",
      prize: "$5,000",
      description: "Build an innovative application that utilizes advanced AI models to solve a real-world problem.",
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      color: "bg-primary-container text-on-primary-container",
      tags: ["AI", "Machine Learning", "GCP"]
    },
    {
      id: 2,
      title: "Sustainability Hack",
      sponsor: "Dell Technologies",
      prize: "$3,500",
      description: "Create a solution that promotes environmental sustainability, reduces waste, or optimizes energy consumption.",
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      color: "bg-green-100 text-green-800",
      tags: ["Green Tech", "IoT", "Data"]
    },
    {
      id: 3,
      title: "Open Source Contributor",
      sponsor: "GitHub",
      prize: "$2,000",
      description: "The team that makes the most significant contribution to an existing open-source project during the event.",
      icon: <Code2 className="w-8 h-8 text-blue-600" />,
      color: "bg-blue-100 text-blue-800",
      tags: ["Open Source", "Community"]
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-primary tracking-tight">Challenges & Prizes</h1>
        <p className="text-on-surface-variant text-[16px] mt-2 max-w-2xl">
          Explore the tracks you can submit your project to. You can select multiple tracks during your final submission.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 group">
            <div className={`h-24 ${challenge.color} flex items-center justify-between px-6`}>
              <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform">
                {challenge.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[12px] font-bold uppercase tracking-wider opacity-80">Prize Pool</span>
                <span className="text-[24px] font-bold">{challenge.prize}</span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4">
                <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Sponsored by {challenge.sponsor}</span>
                <h3 className="text-[20px] font-bold text-on-surface leading-tight">{challenge.title}</h3>
              </div>
              
              <p className="text-[14px] text-on-surface-variant mb-6 flex-1">
                {challenge.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {challenge.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container-low text-on-surface text-[11px] font-bold rounded-lg uppercase tracking-wider border border-outline-variant/20">
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full bg-surface-container-low border border-outline-variant/30 py-3 rounded-xl font-bold text-[14px] text-primary hover:bg-primary/5 transition-colors">
                View Requirements
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Overall Grand Prize */}
      <div className="mt-12 bg-gradient-to-r from-primary/10 to-tertiary/10 border border-primary/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Trophy className="w-10 h-10 text-tertiary" />
          </div>
          <div>
            <h3 className="text-[24px] font-bold text-on-surface">Grand Prize Winner</h3>
            <p className="text-on-surface-variant max-w-xl">Awarded to the best overall project combining innovation, technical complexity, and impact.</p>
          </div>
        </div>
        <div className="text-center md:text-right shrink-0">
          <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-[36px] font-bold text-primary">$15,000</p>
        </div>
      </div>
    </div>
  );
}
