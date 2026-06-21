"use client";

import { useEffect, useState } from "react";

export default function OrganizerEvaluations() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  const handleComputeResults = async () => {
    try {
      setIsComputing(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/evaluations/compute-results/demo-hackathon-id`, { method: "POST" });
      if (res.ok) {
        alert("Result computation task queued successfully!");
      } else {
        alert("Failed to queue result computation.");
      }
    } catch (e) {
      console.error(e);
      alert("Error triggering computation");
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    // Micro-interactions
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        (card as HTMLElement).style.transform = 'translateY(-2px)';
        (card as HTMLElement).style.transition = 'all 0.3s ease';
      });
      card.addEventListener('mouseleave', () => {
        (card as HTMLElement).style.transform = 'translateY(0)';
      });
    });
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <style jsx>{`
        .serif-text { font-family: 'Playfair Display', serif; }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 0.5px solid #D6CBBF; }
      `}</style>

      <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto">
        {/* Center Column (Main Dashboard Content) */}
        <div className="flex-grow space-y-12 xl:max-w-[1000px]">
          {/* Section Header */}
          <div>
            <h3 className="font-display-lg text-[48px] serif-text text-primary leading-tight">Evaluation Intelligence T</h3>
            <p className="font-body-lg text-[18px] text-on-surface-variant mt-2 max-w-2xl">A holistic view of the judging ecosystem for the Winter 2024 Cycle. Monitor progress, review scores, and finalize rankings across 112 competing teams.</p>
          </div>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-[12px] font-label-sm text-outline uppercase">Completed</p>
              <p className="text-headline-sm text-[24px] font-bold text-primary mt-1">84<span className="text-[14px] text-outline font-normal">/112</span></p>
              <div className="w-full bg-surface-variant h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-primary h-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-[12px] font-label-sm text-outline uppercase">Pending</p>
              <p className="text-headline-sm text-[24px] font-bold text-secondary mt-1">28</p>
              <p className="text-[10px] text-secondary/60 mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> Awaiting Review</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-[12px] font-label-sm text-outline uppercase">Avg Score</p>
              <p className="text-headline-sm text-[24px] font-bold text-primary mt-1">8.4</p>
              <p className="text-[10px] text-primary/60 mt-1">Benchmark: 7.2</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-[12px] font-label-sm text-outline uppercase">Highest</p>
              <p className="text-headline-sm text-[24px] font-bold text-primary mt-1">9.7</p>
              <p className="text-[10px] text-tertiary mt-1">Team EcoStream</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-[12px] font-label-sm text-outline uppercase">Lowest</p>
              <p className="text-headline-sm text-[24px] font-bold text-outline mt-1">4.2</p>
              <p className="text-[10px] text-outline/60 mt-1">Outlier Detected</p>
            </div>
            <div className="glass-card p-4 rounded-2xl bg-primary-container/20 border-primary">
              <p className="text-[12px] font-label-sm text-primary uppercase">Finalized</p>
              <p className="text-headline-sm text-[24px] font-bold text-primary mt-1">75%</p>
              <p className="text-[10px] text-primary/80 mt-1">3/4 Phases Clear</p>
            </div>
          </div>

          {/* Featured Evaluation Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden group bg-white rounded-[24px] p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full"></div>
              <span className="material-symbols-outlined text-primary text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <h4 className="font-label-md text-[14px] text-outline uppercase tracking-wider">Top Scoring Team</h4>
              <p className="font-headline-sm text-[24px] serif-text text-on-surface mt-2">Team EcoStream</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-display-lg text-[48px] serif-text text-primary">9.7</span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-label-sm text-[12px]">Overall Lead</span>
              </div>
            </div>
            <div className="relative overflow-hidden group bg-white rounded-[24px] p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full"></div>
              <span className="material-symbols-outlined text-secondary text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h4 className="font-label-md text-[14px] text-outline uppercase tracking-wider">Highest Innovation</h4>
              <p className="font-headline-sm text-[24px] serif-text text-on-surface mt-2">Team TerraMind</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-display-lg text-[48px] serif-text text-secondary">9.8</span>
                <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-label-sm text-[12px]">Disruptor</span>
              </div>
            </div>
            <div className="relative overflow-hidden group bg-white rounded-[24px] p-6 shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full"></div>
              <span className="material-symbols-outlined text-tertiary text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
              <h4 className="font-label-md text-[14px] text-outline uppercase tracking-wider">Best Technical</h4>
              <p className="font-headline-sm text-[24px] serif-text text-on-surface mt-2">Team HydroPulse</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-display-lg text-[48px] serif-text text-tertiary">9.6</span>
                <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-label-sm text-[12px]">Architectural</span>
              </div>
            </div>
          </div>

          {/* Rubric Breakdown */}
          <section className="bg-surface-variant/30 rounded-[32px] p-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h4 className="font-headline-sm text-[24px] serif-text text-primary">Rubric Weightage</h4>
                <p className="text-label-md text-[14px] text-on-surface-variant">Standardized criteria for the 2024 Tech Bloom cohort.</p>
              </div>
              <button className="text-primary font-label-md text-[14px] hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">edit_note</span> Customize Rubric
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
                <p className="text-[12px] text-outline uppercase mb-1">Innovation</p>
                <p className="font-headline-sm text-[24px] font-bold text-primary">30%</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-2">Novelty and original problem-solving approaches.</p>
              </div>
              <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
                <p className="text-[12px] text-outline uppercase mb-1">Technical</p>
                <p className="font-headline-sm text-[24px] font-bold text-primary">30%</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-2">Complexity, scalability, and code quality.</p>
              </div>
              <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
                <p className="text-[12px] text-outline uppercase mb-1">Impact</p>
                <p className="font-headline-sm text-[24px] font-bold text-primary">20%</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-2">Social or market reach and effectiveness.</p>
              </div>
              <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
                <p className="text-[12px] text-outline uppercase mb-1">Feasibility</p>
                <p className="font-headline-sm text-[24px] font-bold text-primary">10%</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-2">Business model and execution potential.</p>
              </div>
              <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
                <p className="text-[12px] text-outline uppercase mb-1">Presentation</p>
                <p className="font-headline-sm text-[24px] font-bold text-primary">10%</p>
                <p className="text-[10px] text-on-surface-variant leading-tight mt-2">Visual clarity and pitching excellence.</p>
              </div>
            </div>
          </section>

          {/* Evaluation Table */}
          <div className="bg-white rounded-[32px] overflow-hidden border border-outline-variant shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input 
                    className="pl-10 pr-4 py-2 bg-surface-variant/20 border-none rounded-full text-[14px] w-64 focus:ring-2 focus:ring-primary/20" 
                    placeholder="Search teams or reviewers..." 
                    type="text"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-full text-[14px] hover:bg-surface-variant/10">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
                </button>
              </div>
              <button className="text-primary text-[14px] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">download</span> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/10 text-outline text-[12px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Team</th>
                    <th className="px-6 py-4 font-semibold">Reviewer</th>
                    <th className="px-6 py-4 font-semibold">Scores (I/T/F/I)</th>
                    <th className="px-6 py-4 font-semibold">Final</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[14px]">EcoStream</p>
                      <p className="text-[11px] text-outline truncate max-w-[150px]">Decentralized water filtration...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] text-on-primary">AT</div>
                        <span className="text-[14px]">Dr. Aris Thorne</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-[12px] font-medium">
                        <span className="text-secondary">9.8</span>
                        <span className="text-primary">9.4</span>
                        <span className="text-primary">9.2</span>
                        <span className="text-primary">9.9</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-headline-sm text-[24px] serif-text text-primary">9.7</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Finalized</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDrawerOpen(true)} className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2" title="View Full Feedback">comment</button>
                      <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[14px]">TerraMind</p>
                      <p className="text-[11px] text-outline truncate max-w-[150px]">AI-driven reforestation...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[10px] text-on-secondary-container">SJ</div>
                        <span className="text-[14px]">Sarah Jenkins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-[12px] font-medium">
                        <span className="text-secondary">9.8</span>
                        <span className="text-primary">8.2</span>
                        <span className="text-primary">7.5</span>
                        <span className="text-primary">8.8</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-headline-sm text-[24px] serif-text text-on-surface">8.9</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-tertiary-container/30 text-tertiary text-[10px] font-bold uppercase rounded-full">In Progress</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDrawerOpen(true)} className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2" title="View Full Feedback">comment</button>
                      <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[14px]">UrbanGrid</p>
                      <p className="text-[11px] text-outline truncate max-w-[150px]">Smart city energy sharing...</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] text-outline">MC</div>
                        <span className="text-[14px]">Mark Chen</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-outline-variant italic text-[12px]">
                      Scores pending...
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-headline-sm text-[24px] serif-text text-outline">—</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase rounded-full">Pending</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2" title="View Full Feedback">comment</button>
                      <button className="material-symbols-outlined text-outline hover:text-primary transition-colors">more_vert</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant flex justify-center">
              <button className="text-[14px] text-primary font-bold hover:underline">View All Teams</button>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Insights/Ranking) */}
        <aside className="w-full xl:w-[320px] space-y-6">
          {/* Ranking Panel */}
          <div className="bg-white rounded-[32px] p-6 border border-outline-variant shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-headline-sm text-[24px] serif-text text-primary">Live Rankings</h4>
              <span className="text-[10px] bg-error text-on-error px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="font-display-lg text-[32px] text-primary/20 serif-text group-hover:text-primary transition-colors">01</span>
                <div className="flex-grow">
                  <p className="font-bold text-[14px]">EcoStream</p>
                  <div className="w-full bg-surface-variant h-1 rounded-full mt-1">
                    <div className="bg-primary h-full" style={{ width: '97%' }}></div>
                  </div>
                </div>
                <span className="font-headline-sm text-[24px] serif-text text-primary">9.7</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="font-display-lg text-[32px] text-primary/20 serif-text group-hover:text-primary transition-colors">02</span>
                <div className="flex-grow">
                  <p className="font-bold text-[14px]">HydroPulse</p>
                  <div className="w-full bg-surface-variant h-1 rounded-full mt-1">
                    <div className="bg-primary h-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <span className="font-headline-sm text-[24px] serif-text text-primary">9.6</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="font-display-lg text-[32px] text-primary/20 serif-text group-hover:text-primary transition-colors">03</span>
                <div className="flex-grow">
                  <p className="font-bold text-[14px]">TerraMind</p>
                  <div className="w-full bg-surface-variant h-1 rounded-full mt-1">
                    <div className="bg-primary h-full" style={{ width: '89%' }}></div>
                  </div>
                </div>
                <span className="font-headline-sm text-[24px] serif-text text-primary">8.9</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="font-display-lg text-[32px] text-primary/20 serif-text group-hover:text-primary transition-colors">04</span>
                <div className="flex-grow">
                  <p className="font-bold text-[14px]">SolarNode</p>
                  <div className="w-full bg-surface-variant h-1 rounded-full mt-1">
                    <div className="bg-primary h-full" style={{ width: '86%' }}></div>
                  </div>
                </div>
                <span className="font-headline-sm text-[24px] serif-text text-primary">8.6</span>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer">
                <span className="font-display-lg text-[32px] text-primary/20 serif-text group-hover:text-primary transition-colors">05</span>
                <div className="flex-grow">
                  <p className="font-bold text-[14px]">KineticLink</p>
                  <div className="w-full bg-surface-variant h-1 rounded-full mt-1">
                    <div className="bg-primary h-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <span className="font-headline-sm text-[24px] serif-text text-primary">8.2</span>
              </div>
            </div>
            <button className="w-full mt-8 py-3 border border-primary text-primary rounded-full text-[14px] font-bold hover:bg-primary/5 transition-colors">View Deep Analytics</button>
          </div>

          {/* Reviewer Feedback Feed */}
          <div className="bg-primary-container/10 rounded-[32px] p-6 border border-primary-container/20">
            <h4 className="font-headline-sm text-[24px] serif-text text-primary mb-6">Recent Feedback</h4>
            <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-primary">Dr. Aris Thorne</span>
                  <span className="text-[10px] text-outline">2m ago</span>
                </div>
                <p className="text-[14px] italic text-on-surface-variant leading-relaxed">"The modular filtration stack in EcoStream is genuinely world-class. Technical execution is far beyond typical hackathon standards."</p>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 bg-white rounded text-[9px] text-primary font-bold uppercase">Technical</span>
                  <span className="px-2 py-0.5 bg-white rounded text-[9px] text-primary font-bold uppercase">Scalable</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-primary">Sarah Jenkins</span>
                  <span className="text-[10px] text-outline">15m ago</span>
                </div>
                <p className="text-[14px] italic text-on-surface-variant leading-relaxed">"TerraMind's UX is delightful, but I'm questioning the feasibility of their regional data partnership model. Needs more clarity."</p>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 bg-white rounded text-[9px] text-secondary font-bold uppercase">UX Design</span>
                  <span className="px-2 py-0.5 bg-white rounded text-[9px] text-secondary font-bold uppercase">Critique</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-primary">Mark Chen</span>
                  <span className="text-[10px] text-outline">1h ago</span>
                </div>
                <p className="text-[14px] italic text-on-surface-variant leading-relaxed">"Initial review of HydroPulse shows strong promise in backend stability. Waiting for the live demo for final scoring."</p>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 bg-white rounded text-[9px] text-tertiary font-bold uppercase">Pending Demo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Finalize CTA */}
          <div className="bg-surface rounded-[32px] p-8 border-2 border-dashed border-primary/30 text-center">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">verified</span>
            <h5 className="font-headline-sm text-[24px] serif-text text-on-surface">Ready to Finalize?</h5>
            <p className="text-[14px] text-on-surface-variant mt-2 mb-6">Finalizing the leaderboard will notify all participants and lock evaluations for this cycle.</p>
            <button 
              onClick={handleComputeResults}
              disabled={isComputing}
              className="w-full bg-on-surface text-surface py-4 rounded-full text-[14px] font-bold hover:bg-primary transition-colors disabled:opacity-50"
            >
              {isComputing ? "Computing..." : "Publish Final Results"}
            </button>
          </div>
        </aside>
      </div>

      {/* Feedback Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}></div>
          <aside className="absolute right-0 top-0 h-full w-[450px] bg-surface shadow-2xl flex flex-col border-l border-outline-variant animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm text-[24px] serif-text text-primary">Feedback Details</h3>
              <button className="material-symbols-outlined text-outline hover:text-primary" onClick={() => setDrawerOpen(false)}>close</button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-xl text-on-primary font-bold">AT</div>
                <div>
                  <p className="font-headline-sm text-[24px] serif-text text-on-surface">Dr. Aris Thorne</p>
                  <p className="text-[14px] text-outline">Reviewing <span className="text-primary font-bold">EcoStream</span></p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[12px] text-outline uppercase tracking-widest">Qualitative Feedback</h4>
                <p className="font-body-lg text-[18px] italic text-on-surface-variant leading-relaxed">"The modular filtration stack in EcoStream is genuinely world-class. Technical execution is far beyond typical hackathon standards. The integration of decentralized protocols for water quality monitoring shows deep architectural thinking."</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[12px] text-outline uppercase tracking-widest">Rubric Breakdown</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-on-surface-variant">Innovation</span>
                      <span className="font-bold text-primary">9.8/10</span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full"><div className="bg-primary h-full" style={{ width: '98%' }}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-on-surface-variant">Technical</span>
                      <span className="font-bold text-primary">9.4/10</span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full"><div className="bg-primary h-full" style={{ width: '94%' }}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-on-surface-variant">Impact</span>
                      <span className="font-bold text-primary">9.2/10</span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full"><div className="bg-primary h-full" style={{ width: '92%' }}></div></div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[14px]">
                      <span className="text-on-surface-variant">Feasibility</span>
                      <span className="font-bold text-primary">9.9/10</span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full"><div className="bg-primary h-full" style={{ width: '99%' }}></div></div>
                  </div>
                </div>
              </div>
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 flex justify-between items-center">
                <span className="font-headline-sm text-[24px] serif-text text-primary">Final Score</span>
                <span className="text-4xl font-bold text-primary serif-text">9.7</span>
              </div>
              <div className="pt-6 border-t border-outline-variant flex justify-between text-[12px] text-outline">
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> Started: 10:15 AM</div>
                <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> Completed: 10:45 AM</div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest">
              <button className="w-full bg-primary text-on-primary py-3 rounded-full text-[14px] font-bold hover:opacity-90 transition-all">Acknowledge Review</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
