"use client";

import { useState, useEffect, useCallback } from "react";

export default function HackathonEvaluations() {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComputing, setIsComputing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const pathParts = window.location.pathname.split('/');
      const hackathonId = pathParts[3]; // organizer/hackathons/[id]/evaluations

      const [evalRes, assignRes, subRes, teamRes, revRes] = await Promise.all([
        fetch(`${apiUrl}/evaluations/?hackathon_id=${hackathonId}`),
        fetch(`${apiUrl}/assignments/?hackathon_id=${hackathonId}`),
        fetch(`${apiUrl}/submissions/`),
        fetch(`${apiUrl}/teams/`),
        fetch(`${apiUrl}/reviewers/`),
      ]);
      const [evalData, assignData, subData, teamData, revData] = await Promise.all([
        evalRes.json(),
        assignRes.json(),
        subRes.json(),
        teamRes.json(),
        revRes.json(),
      ]);
      setEvaluations(evalData);
      setAssignments(assignData);
      setSubmissions(subData);
      setTeams(teamData);
      setReviewers(revData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="p-8 max-w-[1280px] mx-auto min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-[48px] text-primary">progress_activity</span>
          <p className="text-outline font-medium">Loading Evaluation Intelligence...</p>
        </div>
      </div>
    );
  }

  const completed = evaluations.length;
  const pending = Math.max(0, assignments.length - completed);
  const avgScore = completed > 0 ? (evaluations.reduce((a, b) => a + (b.score || 0), 0) / completed).toFixed(1) : "0.0";
  const highestScore = completed > 0 ? Math.max(...evaluations.map((e) => e.score || 0)).toFixed(1) : "0.0";

  const ideaScores: Record<string, { sum: number, count: number, max: number }> = {};
  evaluations.forEach((e) => {
    if (!e.idea_id) return;
    if (!ideaScores[e.idea_id]) ideaScores[e.idea_id] = { sum: 0, count: 0, max: 0 };
    ideaScores[e.idea_id].sum += (e.score || 0);
    ideaScores[e.idea_id].count += 1;
    if ((e.score || 0) > ideaScores[e.idea_id].max) ideaScores[e.idea_id].max = (e.score || 0);
  });

  const rankings = Object.keys(ideaScores).map((idea_id) => {
    const submission = submissions.find((s) => s.idea_id === idea_id);
    const team = teams.find((t) => (t.team_id || t.id) === submission?.team_id);
    const avg = ideaScores[idea_id].sum / ideaScores[idea_id].count;
    return {
      idea_id,
      team_name: team?.name || submission?.title || "Unknown Team",
      avg_score: avg,
      max_score: ideaScores[idea_id].max
    };
  }).sort((a, b) => b.avg_score - a.avg_score);

  const top3 = rankings.slice(0, 3);
  const bestTeamName = top3[0]?.team_name || "N/A";

  const handleExportCSV = () => {
    const headers = ["Team Name", "Problem Statement", "Reviewer Name", "Status", "Final Score", "Feedback"];
    const rows = assignments.map(assignment => {
      const evaluation = evaluations.find(e => e.idea_id === assignment.idea_id && e.reviewer_id === assignment.reviewer_id);
      const submission = submissions.find(s => (s.idea_id || s.id) === assignment.idea_id);
      const team = teams.find(t => (t.team_id || t.id) === submission?.team_id);
      const reviewer = reviewers.find(r => (r.reviewer_id || r.id) === assignment.reviewer_id);

      return [
        `"${team?.name || submission?.title || 'Unknown Team'}"`,
        `"${submission?.description || ''}"`,
        `"${reviewer?.name || 'Unknown Reviewer'}"`,
        evaluation ? "Finalized" : "Pending",
        evaluation?.score || "",
        `"${evaluation?.feedback || ''}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `evaluations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-[1280px] mx-auto min-h-screen flex flex-col lg:flex-row gap-6">
      {/* Center Column (Main Dashboard Content) */}
      <div className="w-full space-y-12">
        {/* Section Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline-md text-[48px] font-bold text-primary leading-tight">Evaluation Intelligence</h3>
            <p className="text-[18px] text-on-surface-variant mt-2 max-w-2xl font-medium">Track review progress, team scores, and judging insights across all submissions.</p>
          </div>
          <button 
            disabled={isComputing}
            onClick={async () => {
              setIsComputing(true);
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const pathParts = window.location.pathname.split('/');
              const hackathonId = pathParts[3] || "mock-hackathon";
              await fetch(`${apiUrl}/evaluations/compute-results/${hackathonId}`, { method: "POST" });
              setTimeout(() => {
                fetchData();
                setIsComputing(false);
              }, 4000);
            }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold font-label-md hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isComputing && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
            {isComputing ? "Computing Results..." : "Compute Final Results"}
          </button>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Completed</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">{completed}<span className="text-[14px] text-outline font-medium">/{assignments.length || 0}</span></p>
            <div className="w-full bg-surface-variant h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${assignments.length > 0 ? (completed / assignments.length) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Pending</p>
            <p className="font-headline-sm text-[24px] font-bold text-secondary mt-1">{pending}</p>
            <p className="text-[10px] font-medium text-secondary/60 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">schedule</span> Awaiting Review
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Avg Score</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">{avgScore}</p>
            <p className="text-[10px] font-medium text-primary/60 mt-1">Benchmark: 7.2</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/30">
            <p className="text-[12px] font-bold text-outline uppercase">Highest</p>
            <p className="font-headline-sm text-[24px] font-bold text-primary mt-1">{highestScore}</p>
            <p className="text-[10px] font-medium text-tertiary mt-1 truncate">Team {bestTeamName}</p>
          </div>
        </div>
      {/* Ranking Panel */}
<div className="bg-white rounded-[32px] p-8 border border-outline-variant/50 shadow-sm w-full">
  <div className="flex items-center justify-between mb-6">
    <h4 className="font-headline-sm text-[20px] font-bold text-primary">
      Live Rankings
    </h4>

    <span className="text-[10px] bg-error text-on-error px-2 py-0.5 rounded-full font-bold animate-pulse">
      LIVE
    </span>
  </div>

  <div className="space-y-6">
    {top3.length === 0 ? (
      <div className="text-center py-4 text-outline font-medium">No evaluations yet</div>
    ) : top3.map((rank, index) => (
      <div key={rank.idea_id} className="flex items-center gap-4 group cursor-pointer">
        <span className="text-[32px] font-bold text-primary/20 group-hover:text-primary transition-colors leading-none">
          0{index + 1}
        </span>
        <div className="flex-grow">
          <p className="font-bold text-[14px] text-on-surface truncate max-w-[200px]">
            {rank.team_name}
          </p>
          <div className="w-full bg-surface-variant h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-primary h-full"
              style={{ width: `${(rank.avg_score / 10) * 100}%` }}
            ></div>
          </div>
        </div>
        <span className="font-headline-sm text-[20px] font-bold text-primary leading-none">
          {rank.avg_score.toFixed(1)}
        </span>
      </div>
    ))}
  </div>
</div>

        {/* Featured Evaluation Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-primary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Top Scoring Team</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2 truncate">{top3[0]?.team_name || "N/A"}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-primary leading-none">{top3[0]?.avg_score?.toFixed(1) || "0.0"}</span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[12px] font-bold">Overall Lead</span>
            </div>
          </div>
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-secondary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Highest Innovation</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2 truncate">{top3[1]?.team_name || "N/A"}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-secondary leading-none">{top3[1]?.max_score?.toFixed(1) || "0.0"}</span>
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[12px] font-bold">Disruptor</span>
            </div>
          </div>
          <div className="relative overflow-hidden group bg-white rounded-[24px] p-4 shadow-sm border border-outline-variant/50 hover:shadow-md transition-shadow">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full"></div>
            <span className="material-symbols-outlined text-tertiary text-[32px] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>code</span>
            <h4 className="text-[14px] font-bold text-outline uppercase tracking-wider">Best Technical</h4>
            <p className="font-headline-sm text-[24px] font-bold text-on-surface mt-2 truncate">{top3[2]?.team_name || "N/A"}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-[36px] font-bold text-tertiary leading-none">{top3[2]?.avg_score?.toFixed(1) || "0.0"}</span>
              <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-[12px] font-bold">Architectural</span>
            </div>
          </div>
        </div>
        {/* Rubric Breakdown */}
        <section className="bg-surface-variant/30 rounded-[32px] p-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h4 className="font-headline-sm text-[24px] font-bold text-primary">Rubric Weightage</h4>
              <p className="text-[14px] font-medium text-on-surface-variant mt-1">Standardized criteria for the 2024 Tech Bloom cohort.</p>
            </div>
            <button className="text-primary text-[14px] font-medium hover:underline flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">edit_note</span> Customize Rubric
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Innovation</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">30%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Novelty and original problem-solving approaches.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Technical</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">30%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Complexity, scalability, and code quality.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Impact</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">20%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Social or market reach and effectiveness.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Feasibility</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">10%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Business model and execution potential.</p>
            </div>
            <div className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-outline-variant/50">
              <p className="text-[12px] font-bold text-outline uppercase mb-1">Presentation</p>
              <p className="font-headline-sm text-[24px] font-bold text-primary leading-none">10%</p>
              <p className="text-[10px] font-medium text-on-surface-variant leading-tight mt-2">Visual clarity and pitching excellence.</p>
            </div>
          </div>
        </section>

        {/* Evaluation Table */}
        <div className="bg-white rounded-[32px] overflow-hidden border border-outline-variant/50 shadow-sm">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input className="pl-10 pr-4 py-2 bg-surface-variant/20 border-none rounded-full text-[14px] font-medium w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Search teams or reviewers..." type="text"/>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/50 rounded-full text-[14px] font-medium hover:bg-surface-variant/10 transition-colors">
                <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
              </button>
            </div>
            <button onClick={handleExportCSV} className="text-primary text-[14px] font-bold flex items-center gap-2 hover:underline">
              <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-variant/10 text-outline text-[12px] font-bold uppercase tracking-wider border-b border-outline-variant/30">
                  <th className="px-6 py-4">Team</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Scores (I/T/F/P)</th>
                  <th className="px-6 py-4">Final</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-outline">No assignments or evaluations found</td>
                  </tr>
                ) : (
                  assignments.map(assignment => {
                    const evaluation = evaluations.find(e => e.idea_id === assignment.idea_id && e.reviewer_id === assignment.reviewer_id);
                    const submission = submissions.find(s => (s.idea_id || s.id) === assignment.idea_id);
                    const team = teams.find(t => (t.team_id || t.id) === submission?.team_id);
                    const reviewer = reviewers.find(r => (r.reviewer_id || r.id) === assignment.reviewer_id);

                    return (
                      <tr key={assignment.assignment_id || Math.random()} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[14px] text-on-surface">{team?.name || submission?.title || "Unknown Team"}</p>
                          <p className="text-[11px] font-medium text-outline truncate max-w-[150px] mt-1">{submission?.description || "No description provided."}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-outline">
                              {reviewer?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <span className="text-[14px] font-medium">{reviewer?.name || "Unknown Reviewer"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {evaluation ? (
                            <div className="flex gap-2 text-[12px] font-bold text-primary">
                              {evaluation.score}
                            </div>
                          ) : (
                            <span className="text-outline-variant italic text-[12px] font-bold">Scores pending...</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-headline-sm text-[24px] font-bold leading-none ${evaluation ? 'text-primary' : 'text-outline'}`}>
                            {evaluation ? evaluation.score : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {evaluation ? (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-full">Finalized</span>
                          ) : (
                            <span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase rounded-full">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="material-symbols-outlined text-outline hover:text-primary transition-colors mr-2 text-[20px]" title={evaluation?.feedback || "View Full Feedback"}>comment</button>
                          <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]">more_vert</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/30 flex justify-center">
            <button className="text-[14px] text-primary font-bold hover:underline">View All {teams.length} Teams</button>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Insights/Ranking) */}
      
    </div>
  );
}
