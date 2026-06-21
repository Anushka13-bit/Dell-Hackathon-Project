"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function HackathonTeams() {
  const params = useParams();
  const [teams, setTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${apiUrl}/teams/`).then(res => res.json()),
      fetch(`${apiUrl}/submissions/`).then(res => res.json())
    ])
      .then(([teamsData, submissionsData]) => {
        setTeams(teamsData);
        setSubmissions(submissionsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load teams/submissions", err);
        setIsLoading(false);
      });

    // Simple micro-interaction for hover states on metrics
    document.querySelectorAll('.bento-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            (card as HTMLElement).style.borderColor = 'rgba(73, 99, 95, 0.4)';
        });
        card.addEventListener('mouseleave', () => {
            (card as HTMLElement).style.borderColor = 'rgba(193, 200, 198, 0.2)';
        });
    });
  }, []);

  const totalTeams = teams.length;
  const recruiting = teams.filter(t => (t.member_ids?.length || 0) < 4).length;
  const complete = teams.filter(t => (t.member_ids?.length || 0) >= 4).length;
  const totalSubmissions = submissions.length;
  const missingSkills = teams.filter(t => (t.coverage_score || 0) < 50).length;
  const submissionPercentage = totalTeams ? Math.round((totalSubmissions / totalTeams) * 100) : 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <style jsx>{`
        .bento-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .bento-card:hover {
            transform: translateY(-4px);
        }
      `}</style>
      
      {/* Page Header */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <p className="font-label-md text-[14px] text-primary tracking-widest uppercase mb-2">Management Console</p>
          <h3 className="font-headline-md text-[32px] font-bold">Teams Ecosystem</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={async () => {
              if (confirm("Run AI Team Formation to group unassigned participants for this hackathon?")) {
                try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                  const res = await fetch(`${apiUrl}/teams/form`, { 
                    method: "POST",
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ team_size: 4 })
                  });
                  if (res.ok) alert("Team formation started in background!");
                  else alert("Failed to start team formation.");
                } catch (e) {
                  alert("Error triggering formation.");
                }
              }
            }}
            className="border-2 border-secondary/20 text-secondary px-4 py-2 rounded-xl flex items-center gap-2 text-[14px] font-bold hover:bg-secondary/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">group_add</span>
            AI Team Assembly
          </button>
          <button className="bg-white border border-outline-variant/30 text-on-surface-variant px-4 py-2 rounded-xl flex items-center gap-2 text-[14px] font-bold hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Advanced Filters
          </button>
          <button className="bg-primary text-on-primary px-5 py-2 rounded-xl flex items-center gap-2 text-[14px] font-bold shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Manual Form Team
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Total Teams</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">{isLoading ? "-" : totalTeams}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Recruiting</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-secondary">{isLoading ? "-" : recruiting}</span>
            <span className="text-[12px] text-secondary/60 font-bold">Open</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Complete</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-primary">{isLoading ? "-" : complete}</span>
            <span className="text-[12px] text-primary/60 font-bold">Ready</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Missing Skills</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-error">{isLoading ? "-" : missingSkills}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-on-surface">{isLoading ? "-" : totalSubmissions}</span>
            <span className="text-[12px] text-primary font-bold">{submissionPercentage}%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm bento-card">
          <p className="text-on-surface-variant text-[12px] font-bold uppercase mb-2">Pending Review</p>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-tertiary">{isLoading ? "-" : totalSubmissions}</span>
            <span className="text-[12px] text-tertiary/60 font-bold">New</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content Column */}
        <div className="xl:col-span-9 space-y-6">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search Team Name, Member, or Problem Statement..." type="text"/>
            </div>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 text-on-surface-variant cursor-pointer">
              <option>All Statuses</option>
              <option>Healthy</option>
              <option>Recruiting</option>
              <option>At Risk</option>
            </select>
            <select className="bg-surface-container-low border-none rounded-xl px-4 py-3 text-[14px] font-medium focus:ring-2 focus:ring-primary/20 text-on-surface-variant cursor-pointer">
              <option>All Problem Statements</option>
              <option>Sustainability Tech</option>
              <option>Circular Economy</option>
              <option>Urban Agri-tech</option>
            </select>
            <button className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
            </button>
          </div>

          {/* Featured Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Featured</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] font-bold leading-tight">Green Ledger</h4>
                  <p className="text-[12px] font-medium text-on-surface-variant">Circular Economy</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-medium text-on-surface-variant">Coverage Score</span>
                  <span className="text-[12px] font-bold text-primary">94%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[94%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGQfV_lpUGAxNghwOcbvD05yQQzpOixOHOuZsPkbLEIv2eUZjJKg7pXjGS2pB0D8KOCdphpZeBdWX52rlFTldaUkKZnDy1RkS1ZRhoXrU8oW-ZIxO4Tkdy6fZA1BZ54l4b0QHZDzS33x1KJie1BS694uooIg732aojO2qztj8WYiC6sHScGequBkjWlh-icMQsFllcU-xGgVwJ_3RsFGBPWw-GENeKsZQULu3Wm4MLG6yHFMb4-A1iA3ujxy936fupkaEJ4I4G8-k" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC140TnSrthwFKePMO9zuVwI_0Rr-FJ-Jb1UJlmIzqIqX3sfq974eq3oDtopWgU7Ho9VFCBl2zJJ5Kg5gus2DfDC5ZRSNxlnWyIQWzptDtjsAT3RKi7qiW6nniT3V-Epjk8ivFCWv1kNw8oPevp3XetqBJVCLJbQwQERda5PRvw3euzp_DWw_z2tyiF3AUAoKPUHh-aXs56p3Yowc1rouQeed6ljKEEiKSk-kDX8Wk9iCvT7Q0Goq-sR0AoZk6zZ_rokGBYV6ld2b4" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxw0lhARfLqLV3Dv3NQVilVUwvtkpHpwoTbtMYCpOz9uGd1qRJZZ14dAG2LaMINVydgJLq4hI2Be02zBja_obP7X9x9i3vx-jA5QdeImo60jeUGcfzMDGG5zgKswhrQUZyT1mt-BoRxn_AuzuIaFCmwZcXPRnEW09SjkoAwcpsnxQKwQnPMR8dmnqN4SxXyqdf2T_8ehTnN16Ieb5IkwlryyQBX8NsgOyYLqfWBZ7TVTvJT0w_MiGOXvHMmSZZlMfopX7oI4ZWrUg" alt="Member" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+1</div>
                </div>
                <span className="bg-primary/10 text-primary-container text-[11px] font-bold px-3 py-1 rounded-full">Submitted</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-3xl">electric_car</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] font-bold leading-tight">Volt Stream</h4>
                  <p className="text-[12px] font-medium text-on-surface-variant">Urban Agri-tech</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-medium text-on-surface-variant">Coverage Score</span>
                  <span className="text-[12px] font-bold text-secondary">72%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[72%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoH04CuL5b--4sUDKNcLXj-gK9CqxaA9j-MvtZCmCRHK6ksTHNaSRfhL5zfXxjBoXgDaTpCbMgjneupqxMo7OU6Rl0VwgjTbYL4tqnGxQi-t8RMBzQlIwpwAyenUEMlD_QhcHyRFQ6nP0tkp0s_GaRyXEs6dDsJtLhWKmKy8qOqLoCbtJqbQ8XlLlWX3gx-F8_QenUlqanizfRY52nLpJXkHoMBVnxbETT07Yj9_4GY812ihHg4E-yCHvSV2x0Gz81Wv0gfb2ocOA" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArdRJGkYYhSR6DSi5oRyTnXetCf5etwR7BuRZ-sOu05ROpnvgKcJY_v4SUK1TNp1nTxSo1wX7RbTF7KifVTHE6nE8njqy67UcftJZdy9azRBufuKDsyJ9_RuCHctvnOKsOzexhIdJ6_pAd4pjOEP2NqBtXO6LYlMr7WxcaVA8ONgtx-FuOL3xu0FmFsCyzYZpymPzGK6HXd5Dm_DcsmliT5lY-DcILMp2pB8if9yfirvWPpD_SsAeNgtPd5dnTfm1Dh5WnkunIdHQ" alt="Member" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-container flex items-center justify-center text-[10px] font-bold text-on-secondary-container">Recruiting</div>
                </div>
                <span className="bg-surface-container-highest text-on-surface-variant text-[11px] font-bold px-3 py-1 rounded-full">Drafting</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-3xl">psychology</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-[24px] font-bold leading-tight">Mind Meld</h4>
                  <p className="text-[12px] font-medium text-on-surface-variant">Sustainability Tech</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-medium text-on-surface-variant">Coverage Score</span>
                  <span className="text-[12px] font-bold text-tertiary">88%</span>
                </div>
                <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[88%]"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqZSCAcVoWVEnbXmZseHMNWKH824Nrek4hj2IGDB3Na6X4U3dfPCRcymkVZy4I0KKR2ThNeCuqUYmokcsiR7pjgIsXIEAjPRvk2SoE_omk4aOxTZetIvwLtmQrkD9Cqvv71kjBJ0GyZUH3_ziGwF0kq5XQn_J6ESEkdzbcZoBJyHKnHH477N6boXJZcxbAOhAwcggTJrSCv4imLbJujA-wGNDT22hsbuUBGXYB8yvNpzaTS48w10KJwm4az3fOVean1Kn9iDrekxc" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOsJkhDiVRuJk-Zmt-AeaU6TYXpWc2Y6k45TPTXoJYFS4hUAG9ysc3Gv3Teva6QgeqmuX2Dn0uZOevYK_oMYWGmYa-UtueV6qWo2ElMNI0131yGOWR7oJL_EQHsOyDJNNo9N9uDstL2L34ClbweIFU1AjgwFbR9rFulSQIvSZVVJf5SJZx4ZQO1V6LH08aDIShBouzeNswPudH_asP13ox-iWt3HJ-TREDAzHcXIVNzHtuDrbUAWmM7UFxRnw562rcLG1CO0W3J0c" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLHtvsJIziPATFnkSJCFip_6RccLjHPLoZH3yy_689N0I7DdU9IumyWDgr_kkhXVDVtemqmRADDshLsCyhYXrcSM4DjR8GlGpXnK_we2H7TrLS6wANylqniPWSQBsIbPxVOCqApK-xV9ODTEl-G4SeHPq2oEF_QW1AgWg2jPEZoFFyeTNUy9zVV6cMRiL-LViijayW6NeZPldTOdPCFmmTc0plzy8EWxDTDhGE4viUVg712M2WBhOwNP3q_jkNo4SvAMa8ept9_nE" alt="Member" />
                  <img className="w-8 h-8 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQY6gAqLBXg-BFd0FdptXDKZjYSdbEPuLzhpAqP08V2AP8Dq2Jw7gwdsTfsMzQfpt1cZinc4qJ9QXZxch9f6EdKP_6cLJ4VgHFwidgPPDKegL5SRQCeVmICeplGqAxlka1bgNaFavGSKmwIXmBfWn7ULGYTiP-0iNb4MFb--PMN7r_BS0-WGtka5Tw3zAEWjGDO1UnVWBGjOvQVM3rHr3VjsxLGf4jkC10fTZkcDTz2hi3s09eOZVXuNKmC8WMOPnYEVXxTuaj_-I" alt="Member" />
                </div>
                <span className="bg-tertiary/10 text-tertiary text-[11px] font-bold px-3 py-1 rounded-full">In Review</span>
              </div>
            </div>
          </div>

          {/* Main Team Table */}
          <div className="bg-white rounded-[24px] border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/20">
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Coverage</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Problem Statement</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Health</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Reviewer</th>
                    <th className="px-6 py-4 text-[14px] font-medium text-on-surface-variant uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-5 text-center text-on-surface-variant text-sm">Loading teams...</td>
                    </tr>
                  )}
                  {!isLoading && teams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-5 text-center text-on-surface-variant text-sm">No teams have been formed yet.</td>
                    </tr>
                  )}
                  {!isLoading && teams.map(t => {
                    const memberCount = t.member_ids?.length || 0;
                    const coverageScore = Math.round(t.coverage_score || 0);
                    const healthStatus = memberCount >= 4 ? 'Healthy' : memberCount > 0 ? 'Recruiting' : 'At Risk';
                    const healthColor = healthStatus === 'Healthy' ? 'bg-primary' : healthStatus === 'Recruiting' ? 'bg-secondary' : 'bg-error';
                    const healthBg = healthStatus === 'Healthy' ? 'bg-primary/10 text-primary' : healthStatus === 'Recruiting' ? 'bg-secondary-container/30 text-on-secondary-container' : 'bg-error-container/30 text-error';
                    const initials = t.name ? t.name.charAt(0).toUpperCase() : '?';
                    
                    const teamSubmission = submissions.find(s => s.team_id === t.team_id);

                    return (
                      <tr key={t.team_id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary-container/20 text-primary flex items-center justify-center font-bold">{initials}</div>
                            <span className="font-bold text-on-surface">{t.name || 'Unnamed Team'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-on-surface font-medium text-[14px]">{memberCount}/4</span>
                            <div className="flex -space-x-2">
                              {Array.from({ length: Math.min(memberCount, 4) }).map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border border-white bg-slate-300 flex items-center justify-center overflow-hidden">
                                  <span className="material-symbols-outlined text-[12px] text-white">person</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 w-16 bg-surface-container-highest rounded-full overflow-hidden shrink-0">
                              <div className={`h-full w-[${coverageScore}%]`} style={{ backgroundColor: coverageScore > 50 ? '#49635F' : '#BA1A1A', width: `${coverageScore}%` }}></div>
                            </div>
                            <span className={`text-[12px] font-bold ${coverageScore > 50 ? 'text-primary' : 'text-error'}`}>{coverageScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[14px] font-medium text-on-surface-variant truncate block max-w-[140px]" title={teamSubmission?.title || 'No submission'}>{teamSubmission?.title || 'Pending Submission'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`${healthBg} px-2 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 w-fit whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${healthColor}`}></span>
                            {healthStatus}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[12px] font-bold ${teamSubmission ? 'text-on-surface-variant' : 'text-error italic'}`}>{teamSubmission ? 'Pending Assignment' : 'Unassigned'}</span>
                        </td>
                        <td className="px-6 py-5">
                          <button className="text-primary hover:underline font-bold text-[12px]">Manage</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest">
              <span className="text-[12px] font-bold text-on-surface-variant">Showing 1-{Math.min(teams.length, 10)} of {teams.length} teams</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
                <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded-lg text-[14px] font-medium">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low text-[14px] font-medium">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low text-[14px] font-medium">3</button>
                <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg hover:bg-surface-container-low"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Panel (Insights) */}
        <aside className="xl:col-span-3 space-y-6">
          {/* Team Health Analysis */}
          <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <h5 className="font-headline-sm text-[24px] font-bold mb-4">Ecosystem Health</h5>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">diversity_3</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-on-surface-variant">Skill Diversity</span>
                    <span className="text-[12px] font-bold">High (84%)</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[84%]"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-bold text-on-surface-variant">Waitlisted Members</span>
                    <span className="text-[12px] font-bold">42 People</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[60%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Insights List */}
          <div className="bg-white p-6 rounded-[24px] border border-outline-variant/20 shadow-sm">
            <h5 className="text-[14px] font-bold uppercase tracking-widest text-on-surface-variant mb-6 border-b border-outline-variant/10 pb-4">Urgent Attention</h5>
            <div className="space-y-6">
              {/* Section: Needing Members */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-bold text-[14px]">Open Roles</h6>
                  <span className="text-secondary font-bold text-[12px]">12 Teams</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 p-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-[14px] font-bold group-hover:text-primary transition-colors">Data Dynamics</p>
                      <p className="text-[11px] text-on-surface-variant">Needs: Backend Engineer, ML Specialist</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 p-2 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group">
                    <div className="w-2 h-2 rounded-full bg-secondary mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-[14px] font-bold group-hover:text-primary transition-colors">Solar Sync</p>
                      <p className="text-[11px] text-on-surface-variant">Needs: UI Designer</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Section: Missing Submissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-bold text-[14px]">Incomplete Data</h6>
                  <span className="text-error font-bold text-[12px]">8 Teams</span>
                </div>
                <div className="p-3 bg-error-container/10 border border-error/10 rounded-xl">
                  <p className="text-[12px] text-on-surface-variant leading-relaxed mb-2">The following teams are missing <span className="font-bold text-error">Problem Statements</span> and cannot be assigned reviewers.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">Team Alpha</span>
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">Orbit-X</span>
                    <span className="bg-white border border-outline-variant/20 px-2 py-1 rounded text-[10px] font-bold">EcoWave</span>
                  </div>
                </div>
              </div>

              {/* Section: Reviewer Load */}
              <div>
                <h6 className="font-bold text-[14px] mb-3">Reviewer Load</h6>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[12px] font-bold">
                    <span>Avg. Teams / Reviewer</span>
                    <span>4.2</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px] font-bold">
                    <span>Unassigned Teams</span>
                    <span className="text-error">18</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
</aside>
          {/* Pro-Tip Card */}
          

      {/* Floating Action Button (for global action) */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-tertiary text-on-tertiary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform group relative">
          <span className="material-symbols-outlined text-3xl">chat</span>
          <span className="absolute right-full mr-4 bg-surface text-on-surface px-3 py-1 rounded shadow text-[12px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Contact All Leads</span>
        </button>
      </div>
    </div>
    </div>
  );
}
