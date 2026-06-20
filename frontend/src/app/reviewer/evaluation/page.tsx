"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/auth/actions";

export default function EvaluationCenter() {
  const [scores, setScores] = useState({
    innovation: 8,
    technical: 7,
    impact: 9,
    feasibility: 6,
    presentation: 8,
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleScoreChange = (category: keyof typeof scores, value: number) => {
    setScores(prev => ({ ...prev, [category]: value }));
  };

  return (
    <>
      <style jsx global>{`
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: #ece1d4;
          border-radius: 5px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #49635f;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px rgba(73, 99, 95, 0.1);
        }
      `}</style>

      {/* SideNavBar (Hidden on desktop for this view to maximize real estate, but semantic shell) */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 hidden lg:flex flex-col py-stack-md bg-surface-container-low shadow-sm z-40 transform -translate-x-full transition-transform duration-300 xl:translate-x-0">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white">ac_unit</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] font-semibold text-primary">Winter Hack 2024</h3>
              <p className="text-label-sm text-on-surface-variant">Judge Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-col px-4 gap-2">
          <Link href="/reviewer/teams" className="bg-primary-container text-on-primary-container rounded-xl flex items-center gap-3 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">group</span>
            <span className="text-label-md font-label-md">Teams Overview</span>
          </Link>
          <Link href="/reviewer/queue" className="text-on-surface-variant hover:bg-surface-variant rounded-xl flex items-center gap-3 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">list_alt</span>
            <span className="text-label-md font-label-md">Current Queue</span>
          </Link>
          <Link href="/reviewer/rubric" className="text-on-surface-variant hover:bg-surface-variant rounded-xl flex items-center gap-3 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">fact_check</span>
            <span className="text-label-md font-label-md">Judging Rubric</span>
          </Link>
          <Link href="/reviewer/leaderboard" className="text-on-surface-variant hover:bg-surface-variant rounded-xl flex items-center gap-3 px-4 py-3 transition-all">
            <span className="material-symbols-outlined">leaderboard</span>
            <span className="text-label-md font-label-md">Live Leaderboard</span>
          </Link>
        </nav>
        <div className="mt-auto px-4">
          <button className="w-full bg-primary text-white py-3 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <span>Submit Scores</span>
          </button>
          <div className="mt-6 flex flex-col gap-1">
            <Link href="/reviewer/help" className="text-on-surface-variant hover:text-primary px-4 py-2 text-label-md flex items-center gap-3">
              <span className="material-symbols-outlined">help</span>
              Help Center
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-on-surface-variant hover:text-primary px-4 py-2 text-label-md flex items-center gap-3 w-full text-left">
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="pt-8 pb-32 xl:pl-64 min-h-screen px-4 md:px-margin-desktop bg-surface">
        <div className="max-w-[1280px] mx-auto">
          {/* Page Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-variant pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm uppercase tracking-widest">In Progress</span>
                <span className="text-label-md text-on-surface-variant">Submission ID: #WH24-042</span>
              </div>
              <h1 className="font-display-lg text-[48px] text-primary">Team Evaluation Command</h1>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span className="text-label-md">Review window closes in 4h 12m</span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Team info & Assets */}
            <div className="lg:col-span-3 space-y-6">
              {/* Team Card */}
              <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-surface-variant/50">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed mb-4 flex items-center justify-center text-primary overflow-hidden">
                  <img className="w-full h-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOEKrcDKMW3qwkPXBigaLG2lF_K_IYTYoBpBXlnULIaZ_bup8KQQIpHQmTub4pyBV3R9e50tfbLoo-tkXOGCc9Df_8S8KJGcNpkmndcuaPWfBHCLRJPX5LiDnW-iaYwsw90KtaQsUkc9BXH194iako0W-YYuqhbTHQwP5JV_ua8UDbFB9lYGeJESk7HKEYE184TrvPF8mfmmpM5GGjRGOpSfurd1cHM1sqUz_OKZj0sxFtgEYMWnhDcIg4_qGEed8AoMpwuuNuDNk" alt="EcoStream Logo" />
                </div>
                <h2 className="font-headline-sm text-[24px] mb-1">EcoStream</h2>
                <p className="text-label-md text-on-surface-variant mb-4 font-medium">Urban Water Monitoring</p>
                <div className="flex -space-x-3 mb-6">
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMOcFwMDU1nmkNqOoL9Gb7zgoSbmNloELvWcHbFLtDikMAywwsZJwS16iohEN5cCqoF4mF9wxrg_pB9WSNCALAop9-KDhLB7jmdOP-ej8ArCUs6_SKCUNxFrejZOFX6H5wakwKFxwFlejM3oRVrwpuopUJZdcmBlBLzpXpSpOYKgMqzGJEDUd3uArFYTL5jb-anUsp_WIehnHS_-byMcyR2smQRnv8_Ip7acASHhTIslGHD88AxX4MVQ0YfZI6hy60v48Nj_h0RbE" alt="Member 1" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXUia5H6I2QNlzvDA4o4O60x3Mbd85vbIdtM9uvjnxWKHrQW9RXIOHYZBfhNKSrAJc2oh7YpqQfumsoe1xQc3PiOwS8JUHC_XbbwVZ0b1n-dvI9r5fmT03bl86izKDpIWZ4r1uW-wV5P2zFY5XAuRzy2TZR2pCMisqlpMV_lp5KkPl96ad7t09aC5PAtZRjk-bMrMDSnoRm2kWmFZYD1AcEUj-jbAN9p0pVTM1sPgnGlHP92XJt1E-C9KtdOqqdWrVi-hnPiW4HS4" alt="Member 2" />
                  <img className="w-10 h-10 rounded-full border-2 border-white object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5wsIWmdlKI7iTgiQqzka7EkuyY7Kg2mLAuJDx8m-bLd3bblHnaj0A28AbO7rz2AkF6AlNPo6IzACtul927n-IXaq__tF_BGYKNYxLtsxZkeSXYjrsJQoFGcBbOaQvVOWgSQrU9OQRfz62WfzwbYszjKw2AKbQiUL2mzPhJTV0TdqmmIrDD8H-42TsdbTlR5DZ3HoHaSeDik30ynKPPt8vCJqlF4nd6B6EmuBLaDUBDCpDwwxuSN8NP7Putl9qQh_Z_nxYbnZUTLg" alt="Member 3" />
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-variant flex items-center justify-center text-label-sm text-on-surface">+1</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">Problem Statement</span>
                    <p className="text-body-md text-on-surface leading-relaxed">Developing low-cost IoT sensors to monitor urban runoff and chemical pollution levels in real-time within heritage city districts.</p>
                  </div>
                </div>
              </div>

              {/* Assets Card */}
              <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-sm border border-surface-variant/50">
                <h3 className="font-headline-sm text-[16px] font-semibold text-primary mb-4 uppercase tracking-widest">Submission Assets</h3>
                <div className="space-y-2">
                  <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">terminal</span>
                      <span className="text-label-md font-medium group-hover:text-primary">GitHub Repository</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">open_in_new</span>
                  </Link>
                  <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">play_circle</span>
                      <span className="text-label-md font-medium group-hover:text-primary">Demo Video</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">open_in_new</span>
                  </Link>
                  <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">slideshow</span>
                      <span className="text-label-md font-medium group-hover:text-primary">PPT Deck</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">open_in_new</span>
                  </Link>
                  <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">description</span>
                      <span className="text-label-md font-medium group-hover:text-primary">Architecture Docs</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">open_in_new</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Center Column: Evaluation Rubric */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-lowest rounded-[24px] p-8 shadow-sm border border-surface-variant/50">
                <h2 className="font-headline-sm text-[32px] mb-6 border-b border-surface-variant pb-4">Detailed Evaluation Rubric</h2>
                <div className="space-y-8">
                  {/* Rubric Item: Innovation */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-headline-sm text-[16px] font-semibold text-primary uppercase tracking-wider">1. Innovation</h4>
                      <span className="text-[24px] text-primary font-bold">{scores.innovation}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Uniqueness of the solution and creative use of technology.</p>
                    <input className="mb-4" max="10" min="0" type="range" value={scores.innovation} onChange={(e) => handleScoreChange('innovation', Number(e.target.value))} />
                    <textarea className="w-full bg-surface border border-surface-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 outline-none" placeholder="Add specific notes on innovative aspects..."></textarea>
                  </section>
                  
                  {/* Rubric Item: Technical Complexity */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-headline-sm text-[16px] font-semibold text-primary uppercase tracking-wider">2. Technical Complexity</h4>
                      <span className="text-[24px] text-primary font-bold">{scores.technical}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Engineering depth, stack sophistication, and technical challenges overcome.</p>
                    <input className="mb-4" max="10" min="0" type="range" value={scores.technical} onChange={(e) => handleScoreChange('technical', Number(e.target.value))} />
                    <textarea className="w-full bg-surface border border-surface-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 outline-none" placeholder="Notes on architecture and code quality..."></textarea>
                  </section>

                  {/* Rubric Item: Impact */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-headline-sm text-[16px] font-semibold text-primary uppercase tracking-wider">3. Impact</h4>
                      <span className="text-[24px] text-primary font-bold">{scores.impact}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Potential for real-world application and scalability.</p>
                    <input className="mb-4" max="10" min="0" type="range" value={scores.impact} onChange={(e) => handleScoreChange('impact', Number(e.target.value))} />
                    <textarea className="w-full bg-surface border border-surface-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 outline-none" placeholder="Notes on societal or market impact..."></textarea>
                  </section>

                  {/* Rubric Item: Feasibility */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-headline-sm text-[16px] font-semibold text-primary uppercase tracking-wider">4. Feasibility</h4>
                      <span className="text-[24px] text-primary font-bold">{scores.feasibility}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Execution viability and long-term sustainability plan.</p>
                    <input className="mb-4" max="10" min="0" type="range" value={scores.feasibility} onChange={(e) => handleScoreChange('feasibility', Number(e.target.value))} />
                    <textarea className="w-full bg-surface border border-surface-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 outline-none" placeholder="Notes on implementation hurdles..."></textarea>
                  </section>

                  {/* Rubric Item: Presentation */}
                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-headline-sm text-[16px] font-semibold text-primary uppercase tracking-wider">5. Presentation</h4>
                      <span className="text-[24px] text-primary font-bold">{scores.presentation}</span>
                    </div>
                    <p className="text-label-sm text-on-surface-variant mb-4">Clarity of communication, storytelling, and visual delivery.</p>
                    <input className="mb-4" max="10" min="0" type="range" value={scores.presentation} onChange={(e) => handleScoreChange('presentation', Number(e.target.value))} />
                    <textarea className="w-full bg-surface border border-surface-variant rounded-xl p-4 text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24 outline-none" placeholder="Notes on team pitch and clarity..."></textarea>
                  </section>
                </div>
              </div>
            </div>

            {/* Right Column: Summary & Feedback */}
            <div className="lg:col-span-4 space-y-6">
              {/* Live Score Summary */}
              <div className="bg-primary text-white rounded-[32px] p-8 shadow-lg sticky top-24">
                <h3 className="font-headline-sm text-label-md font-semibold mb-8 uppercase tracking-widest opacity-80 text-center">Live Score Summary</h3>
                <div className="flex flex-col items-center mb-10">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-primary-container/20" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                      <circle className="text-primary-fixed" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * (totalScore / 50))} strokeLinecap="round" strokeWidth="12" style={{ transition: 'stroke-dashoffset 0.5s ease' }}></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-display-lg text-5xl leading-none">{totalScore}</span>
                      <span className="text-label-sm uppercase tracking-widest opacity-70">of 50</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-label-md">
                    <span className="opacity-70">Innovation (20%)</span>
                    <span className="font-bold">{scores.innovation} / 10</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                    <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${(scores.innovation / 10) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-label-md">
                    <span className="opacity-70">Technical (20%)</span>
                    <span className="font-bold">{scores.technical} / 10</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                    <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${(scores.technical / 10) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between text-label-md">
                    <span className="opacity-70">Impact (20%)</span>
                    <span className="font-bold">{scores.impact} / 10</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full">
                    <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: `${(scores.impact / 10) * 100}%` }}></div>
                  </div>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl flex items-center justify-between mb-8">
                  <div>
                    <span className="text-label-sm block opacity-70 uppercase tracking-tighter">Progress</span>
                    <span className="text-label-md font-bold">In Progress</span>
                  </div>
                  <span className="material-symbols-outlined">trending_up</span>
                </div>

                {/* Feedback section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-label-sm uppercase tracking-widest opacity-80 block mb-2">Strengths</label>
                    <textarea className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-body-md placeholder:text-white/30 h-20 focus:bg-white/10 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label className="text-label-sm uppercase tracking-widest opacity-80 block mb-2">Areas for Improvement</label>
                    <textarea className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-body-md placeholder:text-white/30 h-20 focus:bg-white/10 outline-none transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label className="text-label-sm uppercase tracking-widest opacity-80 block mb-2">Final Comments</label>
                    <textarea className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-body-md placeholder:text-white/30 h-24 focus:bg-white/10 outline-none transition-all resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <footer className="fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-surface-variant px-6 md:px-margin-desktop py-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] xl:pl-[320px]">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-label-md text-on-surface-variant">Autosaved just now</span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-3 border border-outline-variant text-on-surface-variant rounded-full text-label-md font-semibold hover:bg-surface-variant transition-colors">
              Finalize Review
            </button>
            <button className="flex-1 md:flex-none px-6 py-3 bg-primary-container text-on-primary-container rounded-full text-label-md font-semibold hover:opacity-90 transition-opacity">
              Save Draft
            </button>
            <button className="flex-[2] md:flex-none px-10 py-3 bg-primary text-white rounded-full text-label-md font-semibold hover:opacity-95 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2">
              Submit Evaluation
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
