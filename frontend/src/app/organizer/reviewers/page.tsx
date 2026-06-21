"use client";

import { useState, useEffect } from "react";

const hackathons = [
  {
    id: "1",
    title: "Global AI Hackathon",
    endDate: "2026-07-15",
  },
  {
    id: "2",
    title: "Winter Tech Bloom",
    endDate: "2026-06-28",
  },
  {
    id: "3",
    title: "Future Innovators",
    endDate: "2026-06-20",
  },
]; //Need to be replaced with api call from backend

const today = new Date();

const validHackathons = hackathons.filter((hackathon) => {
  return new Date(hackathon.endDate) >= today;
});


export default function OrganizerReviewers() {

  const [showAssignReviewerModal, setShowAssignReviewerModal] = useState(false);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewerForm, setReviewerForm] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
    hackathonId: "",
  });

  const [dragActive, setDragActive] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      setReviewerForm({
        ...reviewerForm,
        resume: e.dataTransfer.files[0],
      });
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      setReviewerForm({
        ...reviewerForm,
        resume: e.target.files[0],
      });
    }
  };

  const handleAssignReviewer = () => {
    if (
      !reviewerForm.name ||
      !reviewerForm.email ||
      !reviewerForm.phone ||
      !reviewerForm.resume ||
      !reviewerForm.hackathonId
    ) {
      alert("Please fill all fields");
      return;
    }

    const selectedHackathon =
      validHackathons.find(
        h => h.id === reviewerForm.hackathonId
      );

    if (!selectedHackathon) {
      alert("Invalid hackathon selected");
      return;
    }

    console.log(reviewerForm);

    setShowAssignReviewerModal(false);
    setReviewerForm({ name: "", email: "", phone: "", resume: null, hackathonId: "" });
  };

  useEffect(() => {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  Promise.all([
    fetch(`${apiUrl}/reviewers/`).then((r) => r.json()),
    fetch(`${apiUrl}/assignments/`).then((r) => r.json()),
  ])
    .then(([reviewersData, assignmentsData]) => {
      setReviewers(reviewersData || []);
      setAssignments(assignmentsData || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

  useEffect(() => {
    // Subtle entry animations
    const cards = document.querySelectorAll('.metric-card-hover, .bg-white');
    cards.forEach((card, index) => {
      (card as HTMLElement).style.opacity = '0';
      (card as HTMLElement).style.transform = 'translateY(10px)';
      setTimeout(() => {
        (card as HTMLElement).style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        (card as HTMLElement).style.opacity = '1';
        (card as HTMLElement).style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }, []);

  const reviewerRows = reviewers.map((reviewer) => {
  const reviewerAssignments = assignments.filter(
    (a) => a.reviewer_id === reviewer.reviewer_id
  );

  return {
    ...reviewer,
    assignedTeams: reviewerAssignments.length,
  };
});

if (loading) {
  return (
    <div className="p-8">
      Loading reviewers...
    </div>
  );
}

  return (
    <div>
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
        <style jsx>{`
          .metric-card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .metric-card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -10px rgba(122, 86, 78, 0.08);
          }
        `}</style>
        
        {/* Metrics Section */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover">
            <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Total Reviewers</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none">
  {reviewers.length}
</h3>
              <span className="text-primary font-bold text-[12px]">+4</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover">
            <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Active</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none">
  {reviewers.filter(r => (r.current_load ?? 0) > 0).length}
</h3>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 mb-2"></div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover">
            <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Assigned</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none">
  {assignments.length}
</h3>
              <span className="material-symbols-outlined text-outline">assignment</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover">
            <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Pending</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none">
  0
</h3>
              <div className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded text-[10px] mb-1 font-bold">URGENT</div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover border-error/20">
            <p className="text-error font-label-sm uppercase mb-2 text-[12px]">Risk Alerts</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none text-error">3</h3>
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 metric-card-hover">
            <p className="text-on-surface-variant font-label-sm uppercase mb-2 text-[12px]">Avg Time</p>
            <div className="flex items-end justify-between">
              <h3 className="font-headline-md text-[32px] leading-none">1.2<span className="text-[12px] ml-1 opacity-50">d</span></h3>
              <span className="material-symbols-outlined text-outline">speed</span>
            </div>
          </div>
        </section>

        {/* Reviewer Highlights */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-sm text-[24px] flex items-center gap-3">
              <span className="w-1 h-8 bg-primary rounded-full"></span>
              Top Performing Reviewers
            </h2>
            <button className="text-primary font-label-md flex items-center gap-1 hover:underline text-[14px]">
              View Hall of Fame <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* High performer 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">auto_awesome</span>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-primary-container p-1 shrink-0">
                  <img className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfa9Nt_O9S2h2tYkFRl52prv9pGVNcGRRB3ZItPEKT3DqJfOm4qF8eQ40-MkmCP5QaOssc1UVjLj1HKnOKPgvp_az3jHEdweNRzVXKLe-_lRuFJoahSg4TFrgCSSFCgxyM_SFaQ1iEvsyYTpjJuMUjUmqPuGAJcWhjiEJdQOmcpaB0E24_7P5e0b9tfLKJnsAIj8kCTOcIyAuoEwkIE_5WINSuGT4HeSAcJQ3oAstwCXnqxoTxOXaaHss_SBRsk4If6pHX6oJ951Q" alt="Reviewer" />
                </div>
                <div>
                  <h4 className="font-headline-sm text-[20px]">Dr. Aris Thorne</h4>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[11px] font-bold">AI/ML EXPERT</span>
                  <p className="text-on-surface-variant text-[13px] mt-1">Summit University</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Teams</p>
                  <p className="text-headline-sm text-[18px]">14</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Avg Score</p>
                  <p className="text-headline-sm text-[18px]">8.9</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-medium">Completion Rate</span>
                  <span className="font-bold text-primary">96%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>

            {/* High performer 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">eco</span>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-primary-container p-1 shrink-0">
                  <img className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWCAUgxZV5nq5QBqMrSrEmkNaz-pJGgWfuRaMu5ulz4R2jBjiCoc80pdluCXoLtHW6RtrJs5Zm7nP1f0IDWfL-ygVtYM_UhxIM94GVG4dGFilZ_NsGz1nTvJOugH03hYsyt_cEvl05a4gR7mPDCvwkjQywV3l5mqd9zPxot52tC2IEUfiVzA3itki-KxpsvVUsoe0eF2XqCJ4jyQHoJRfh6nFkW75AP7v_gqE4pdeCMCWkxTu98dtEj4JvU1jmbbOitPV0eAGeS40" alt="Reviewer" />
                </div>
                <div>
                  <h4 className="font-headline-sm text-[20px]">Sarah Jenkins</h4>
                  <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-md text-[11px] font-bold">SUSTAINABILITY</span>
                  <p className="text-on-surface-variant text-[13px] mt-1">EcoVanguard</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Teams</p>
                  <p className="text-headline-sm text-[18px]">12</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Avg Score</p>
                  <p className="text-headline-sm text-[18px]">9.2</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-medium">Completion Rate</span>
                  <span className="font-bold text-primary">100%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* High performer 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[80px]">code</span>
              </div>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full border-2 border-primary-container p-1 shrink-0">
                  <img className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcJzCV3d12zKgUPi-0X1dS3IlT3CT5_BzlPL-yopGXEOERK8-iXjBmqDwwBapoK8Lawk2G5A5WvwcpWHnLJMgCBa5fDydfUAsO1f9hiDAdOa0PYNUYlmu4Zqh0neP_63dsNCVWo4K3ILoO3XPXrIZNOMhNsO1FsNHSH7z-e5DmkIpmBN_olOmTOYQnsnHGT35UB974i0gc1LkN_mH53wiBa5ZhBb-1noMUkX8eM7dcC2FIiWea7kUL3KJr7ngKPv0IRfpoJ1X2QJU" alt="Reviewer" />
                </div>
                <div>
                  <h4 className="font-headline-sm text-[20px]">Marc Vasseur</h4>
                  <span className="px-2 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-md text-[11px] font-bold">FINTECH / WEB3</span>
                  <p className="text-on-surface-variant text-[13px] mt-1">GreenTech Labs</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Teams</p>
                  <p className="text-headline-sm text-[18px]">18</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-outline text-[11px] uppercase font-bold">Avg Score</p>
                  <p className="text-headline-sm text-[18px]">7.8</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="font-medium">Completion Rate</span>
                  <span className="font-bold text-primary">82%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Workspace: Table & Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Table Section */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-headline-sm text-[20px]">Reviewer Management</h3>
                <button
                onClick={() => setShowAssignReviewerModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                + Assign Reviewer
              </button>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] flex items-center gap-2 hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-[20px]">filter_list</span> Filter
                  </button>
                  <button className="px-4 py-2 border border-outline-variant/50 rounded-lg text-[14px] flex items-center gap-2 hover:bg-surface-container-low transition-all">
                    <span className="material-symbols-outlined text-[20px]">download</span> Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-low/50 text-outline uppercase font-label-sm text-[11px] tracking-widest">
                    <tr>
                      <th className="px-8 py-4">Reviewer</th>
                      <th className="px-4 py-4">Expertise</th>
                      <th className="px-4 py-4 text-center">Assigned Teams</th>
                      <th className="px-4 py-4 text-center">Done</th>
                      <th className="px-4 py-4 text-center">Avg. Score</th>
                      <th className="px-4 py-4">Workload</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                 <tbody className="divide-y divide-outline-variant/10">
                    {reviewerRows.map((reviewer) => {
                      const load = reviewer.current_load ?? 0;

                      return (
                        <tr
                          key={reviewer.reviewer_id}
                          className="hover:bg-surface-container-lowest/50 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div>
                              <p className="font-bold text-[14px]">
                                {reviewer.name}
                              </p>
                              <p className="text-[11px] text-outline">
                                Reviewer
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-5">
                            <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold">
                              {reviewer.primary_specialization || "General"}
                            </span>
                          </td>

                          <td className="px-4 py-5 text-center font-medium">
                            {reviewer.assignedTeams}
                          </td>

                          <td className="px-4 py-5 text-center text-primary font-bold">
                            {load}
                          </td>

                          <td className="px-4 py-5 text-center font-bold">
                            -
                          </td>

                          <td className="px-4 py-5">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                              ACTIVE
                            </span>
                          </td>

                          <td className="px-8 py-5 text-right">
                            <button className="text-primary hover:text-primary/70 font-bold text-[12px]">
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-8 py-4 bg-surface-container-low/30 border-t border-outline-variant/20 flex items-center justify-between">
                <p className="text-[12px] text-on-surface-variant">Showing 3 of 42 reviewers</p>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-outline transition-all disabled:opacity-30" disabled>
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="text-[12px] font-bold px-2">Page 1 of 14</span>
                  <button className="p-1.5 rounded border border-outline-variant/30 hover:bg-white text-on-surface transition-all">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Insights Panel */}
          <aside className="w-full xl:w-80 flex flex-col gap-6">
            {/* Risk Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/20">
              <h4 className="font-headline-sm text-[18px] mb-6 flex items-center gap-2">
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
                    <span className="text-[12px] font-medium">Lenient Grading</span>
                  </div>
                  <span className="text-[12px] font-bold text-error">8% inc.</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">diversity_1</span>
                    <span className="text-[12px] font-medium">Domain Favoritism</span>
                  </div>
                  <span className="text-[12px] font-bold text-primary">Stable</span>
                </div>
              </div>
            </div>

            {/* Strategic Insights */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 flex-1">
              <h4 className="font-headline-sm text-[18px] mb-6 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">lightbulb</span> Strategic Insights
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-outline uppercase mb-3">Overloaded (Priority)</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white/60 p-2 rounded border border-outline-variant/10">
                      <span className="text-[12px] font-medium">Marcus K.</span>
                      <span className="text-[11px] font-bold text-red-600">12 Teams</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-2 rounded border border-outline-variant/10">
                      <span className="text-[12px] font-medium">Amara O.</span>
                      <span className="text-[11px] font-bold text-red-600">22 Teams</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-outline uppercase mb-3">System Status</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px]">Unassigned Teams</span>
                    <span className="px-2 py-0.5 bg-secondary text-on-secondary rounded text-[10px] font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]">Reviews Due Soon (24h)</span>
                    <span className="px-2 py-0.5 bg-primary text-on-primary rounded text-[10px] font-bold">14</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-outline-variant/20">
                  <button className="w-full py-2.5 bg-white border border-primary text-primary rounded-lg text-[14px] font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">auto_fix_high</span> Auto-Balance Workload
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Assign Reviewer Modal */}
      {showAssignReviewerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAssignReviewerModal(false);
              setReviewerForm({ name: "", email: "", phone: "", resume: null, hackathonId: "" });
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-outline-variant/20 flex items-center justify-between">
              <div>
                <h2 className="font-headline-sm text-[20px]">Assign Reviewer</h2>
                <p className="text-on-surface-variant text-[13px] mt-0.5">Add a new reviewer and assign them to a hackathon</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignReviewerModal(false);
                  setReviewerForm({ name: "", email: "", phone: "", resume: null, hackathonId: "" });
                }}
                className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={reviewerForm.name}
                  onChange={(e) => setReviewerForm({ ...reviewerForm, name: e.target.value })}
                  placeholder="e.g. Dr. Jane Smith"
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/50 text-[14px] bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Email & Phone row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={reviewerForm.email}
                    onChange={(e) => setReviewerForm({ ...reviewerForm, email: e.target.value })}
                    placeholder="reviewer@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/50 text-[14px] bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                    Phone <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={reviewerForm.phone}
                    onChange={(e) => setReviewerForm({ ...reviewerForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/50 text-[14px] bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                  Resume <span className="text-error">*</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : reviewerForm.resume
                      ? "border-green-400 bg-green-50"
                      : "border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-lowest"
                  }`}
                  onClick={() => document.getElementById("resume-upload")?.click()}
                >
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {reviewerForm.resume ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-[28px]">task</span>
                      <div className="text-left">
                        <p className="text-[13px] font-bold text-green-700">{reviewerForm.resume.name}</p>
                        <p className="text-[11px] text-green-600">{(reviewerForm.resume.size / 1024).toFixed(1)} KB — click to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="material-symbols-outlined text-outline text-[36px] mb-2 block">upload_file</span>
                      <p className="text-[13px] font-medium text-on-surface-variant">
                        {dragActive ? "Drop file here" : "Drag & drop resume here"}
                      </p>
                      <p className="text-[11px] text-outline mt-1">or click to browse — PDF, DOC, DOCX</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hackathon Dropdown */}
              <div>
                <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
                  Hackathon <span className="text-error">*</span>
                </label>
                {validHackathons.length === 0 ? (
                  <div className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/30 text-[13px] text-outline bg-surface-container-low">
                    No active hackathons available
                  </div>
                ) : (
                  <select
                    value={reviewerForm.hackathonId}
                    onChange={(e) => setReviewerForm({ ...reviewerForm, hackathonId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-outline-variant/50 text-[14px] bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a hackathon...</option>
                    {validHackathons.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.title} — ends {new Date(h.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-surface-container-low/40 border-t border-outline-variant/20 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignReviewerModal(false);
                  setReviewerForm({ name: "", email: "", phone: "", resume: null, hackathonId: "" });
                }}
                className="px-5 py-2.5 rounded-lg border border-outline-variant/50 text-[14px] font-medium hover:bg-surface-container-low transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignReviewer}
                className="px-5 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Assign Reviewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}