"use client";
import { useState, useEffect, useCallback } from "react";

export default function HackathonReviewers() {
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedReviewer, setSelectedReviewer] = useState<any>(null);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [resRev, resAss] = await Promise.all([
        fetch(`${apiUrl}/reviewers/`),
        fetch(`${apiUrl}/assignments/`)
      ]);
      if (resRev.ok) setReviewers(await resRev.json());
      if (resAss.ok) setAssignments(await resAss.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunAssignment = async () => {
    setIsAssigning(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/assignments/generate`, { method: "POST" });
      setTimeout(async () => {
        await fetchData();
        setIsAssigning(false);
      }, 4000);
    } catch (e) {
      console.error(e);
      setIsAssigning(false);
    }
  };

  const handleExportCSV = useCallback(() => {
    const headers = ["Name,Email,Expertise,Assigned Teams"];
    const rows = reviewers.map(r => {
      const reviewerAssignments = assignments.filter((a) => a.reviewer_id === r.reviewer_id);
      return `"${r.name}","${r.email || ''}","${r.primary_specialization || 'General'}","${reviewerAssignments.length}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reviewers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [reviewers, assignments]);

  return (
    <div className="px-8 py-10 max-w-[1280px] mx-auto min-h-screen">
      {/* Metrics Section */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Total Reviewers</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">{reviewers.length}</h3>
            <span className="text-primary font-bold text-[12px]">+4</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Active</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">{reviewers.length > 0 ? reviewers.length - 1 : 0}</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-2"></div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Assigned</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">{assignments.length}</h3>
            <span className="material-symbols-outlined text-outline">assignment</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Pending</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">0</h3>
            <div className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] mb-1 font-bold">CLEAR</div>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform border-error/20">
          <p className="text-error text-[12px] font-bold uppercase mb-2">Risk Alerts</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none text-error">3</h3>
            <span className="material-symbols-outlined text-error">warning</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 hover:-translate-y-1 transition-transform">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Avg Time</p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline-md text-[32px] font-bold leading-none">1.2<span className="text-[12px] ml-1 opacity-50">d</span></h3>
            <span className="material-symbols-outlined text-outline">speed</span>
          </div>
        </div>
      </section>


      {/* Main Workspace: Table & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Table Section */}
        <div className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-headline-sm text-[20px] font-bold">Reviewer Management</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunAssignment}
                  disabled={isAssigning}
                  className="px-4 py-2 bg-secondary text-white rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-secondary/90 transition-all disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isAssigning ? 'animate-spin' : ''}`}>
                    {isAssigning ? 'sync' : 'auto_awesome'}
                  </span>
                  {isAssigning ? 'Optimizing...' : 'Run Optimizer'}
                </button> 
                <div className="flex items-center gap-3">
                <button onClick={() => alert("Filter clicked")} className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span> Filter
                </button>
                <button onClick={handleExportCSV} className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] font-medium flex items-center gap-2 hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-[20px]">download</span> Export CSV
                </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-surface-container-low/50 text-outline uppercase text-[11px] font-bold tracking-widest border-b border-outline-variant/20">
                  <tr>
                    <th className="px-8 py-4">Reviewer</th>
                    <th className="px-4 py-4">Expertise</th>
                    <th className="px-4 py-4 text-center">Assigned Teams</th>
                    <th className="px-4 py-4 text-center">Done</th>
                    <th className="px-4 py-4 text-center">Avg. Score</th>
                    <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">Loading reviewers...</td>
                    </tr>
                  ) : reviewers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-outline">No reviewers found</td>
                    </tr>
                  ) : (
                    reviewers.map((reviewer) => {
                      const reviewerAssignments = assignments.filter((a) => a.reviewer_id === reviewer.reviewer_id);
                      return (
                        <tr key={reviewer.reviewer_id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                                {reviewer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[14px]">{reviewer.name}</p>
                                <p className="text-[11px] text-outline font-medium">ID: {reviewer.reviewer_id.split('-')[0]}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">
                              {reviewer.primary_specialization || "General"}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-center font-bold">{reviewerAssignments.length}</td>
                          <td className="px-4 py-5 text-center text-primary font-bold">0</td>
                          <td className="px-4 py-5 text-center font-bold">-</td>
                          <td className="px-8 py-5 text-center ">
                            <button 
                              onClick={() => {
                                setSelectedReviewer(reviewer);
                                setIsTeamsModalOpen(true);
                              }}
                              className="text-primary hover:text-primary/70 font-bold text-[12px] flex items-center gap-1 inline-flex"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>Teams
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/20 flex items-center justify-between">
              <p className="text-[12px] text-on-surface-variant font-medium">Showing {reviewers.length} reviewers</p>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-outline transition-all disabled:opacity-30 flex items-center justify-center" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="text-[12px] font-bold px-2">Page 1 of 1</span>
                <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-on-surface transition-all flex items-center justify-center disabled:opacity-30" disabled>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Insights Panel */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Risk Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/20">
            <h4 className="font-headline-sm text-[18px] font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">analytics</span> Risk Analysis
            </h4>
            <div className="mb-8">
              <p className="text-[12px] font-bold text-on-surface-variant mb-4 uppercase tracking-tighter">Score Distribution</p>
              <div className="flex items-end gap-1 h-24 mb-2 px-2">
                <div className="flex-1 bg-primary/10 rounded-t-sm h-[30%]"></div>
                <div className="flex-1 bg-primary/20 rounded-t-sm h-[45%]"></div>
                <div className="flex-1 bg-primary/40 rounded-t-sm h-[80%]"></div>
                <div className="flex-1 bg-primary/100 rounded-t-sm h-[100%]"></div>
                <div className="flex-1 bg-primary/60 rounded-t-sm h-[65%]"></div>
                <div className="flex-1 bg-primary/30 rounded-t-sm h-[40%]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-outline font-bold">
                <span>POOR</span>
                <span>AVERAGE</span>
                <span>ELITE</span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[12px] font-bold text-on-surface-variant uppercase tracking-tighter">Bias Indicators</p>
              <div className="flex items-center justify-between p-3 bg-error-container/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">trending_up</span>
                  <span className="text-[12px] font-bold">Lenient Grading</span>
                </div>
                <span className="text-[12px] font-bold text-error">8% inc.</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">diversity_1</span>
                  <span className="text-[12px] font-bold">Domain Favoritism</span>
                </div>
                <span className="text-[12px] font-bold text-primary">Stable</span>
              </div>
            </div>
          </div>
          {/* Strategic Insights */}
          
        </aside>
      </div>

      {isTeamsModalOpen && selectedReviewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Teams for {selectedReviewer.name}</h3>
              <button onClick={() => setIsTeamsModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2">
              {assignments.filter(a => a.reviewer_id === selectedReviewer.reviewer_id).length === 0 ? (
                <p className="text-on-surface-variant">No teams assigned yet.</p>
              ) : (
                assignments.filter(a => a.reviewer_id === selectedReviewer.reviewer_id).map(a => (
                  <div key={a.assignment_id} className="p-3 border border-outline-variant/30 rounded-lg">
                    <p className="text-sm font-bold">Idea ID: <span className="font-normal text-outline break-all">{a.idea_id}</span></p>
                    <p className="text-xs text-outline mt-1">Assignment ID: {a.assignment_id}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
