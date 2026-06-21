"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Hackathon {
  id: string;
  name: string;
  theme: string;
  description: string;
  status: string;
  registration_start: string;
  registration_end: string;
  event_start: string;
  event_end: string;
  public_slug: string;
}

export default function HackathonsListPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    Promise.all([
      fetch(`${apiUrl}/hackathons/`).then(res => res.json()),
      fetch(`${apiUrl}/organizer/summary`).then(res => res.json())
    ])
      .then(([hackathonsData, summaryData]) => {
        setHackathons(hackathonsData);
        setSummary(summaryData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load dashboard data", err);
        setIsLoading(false);
      });
  }, []);

  const activeCount = hackathons.filter(h => h.status === 'active' || h.status === 'published').length;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
  <Link href="/">
    <button className="text-primary font-medium hover:underline">
      ← Back to Home
    </button>
  </Link>

  <button className="text-red-600 font-medium">
    Sign Out
  </button>
</div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-md text-[32px] text-primary font-bold">Your Hackathons</h2>
          <p className="text-on-surface-variant mt-2 text-md max-w-2xl">Manage all the hackathons you are organizing. View analytics, manage submissions, and review participant evaluations.</p>
        </div>
        <Link href="/organizer/hackathons/create/step-1">
          <button className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create New Hackathon
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-xs uppercase">Hackathons</p>
    <h3 className="text-2xl font-bold">{isLoading ? "-" : hackathons.length}</h3>
  </div>

  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-xs uppercase">Active</p>
    <h3 className="text-2xl font-bold">{isLoading ? "-" : activeCount}</h3>
  </div>

  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-xs uppercase">Registrations</p>
    <h3 className="text-2xl font-bold">{summary?.total_registrations || 0}</h3>
  </div>

  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-xs uppercase">Submissions</p>
    <h3 className="text-2xl font-bold">{summary?.total_submissions || 0}</h3>
  </div>

  <div className="bg-white p-4 rounded-xl shadow-sm border">
    <p className="text-xs uppercase">Reviewers</p>
    <h3 className="text-2xl font-bold">{summary?.total_reviewers || 0}</h3>
  </div>
</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="text-sm text-on-surface-variant col-span-3">Loading hackathons...</p>}
        {!isLoading && hackathons.length === 0 && (
          <div className="col-span-3 text-center p-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
            <p className="text-sm text-on-surface-variant mb-2">You haven't created any hackathons yet.</p>
          </div>
        )}
        
        {hackathons.slice().reverse().map((h) => (
          <Link key={h.id} href={`/organizer/hackathons/${h.public_slug || h.id}`} className="block group">
            <div className="bg-white rounded-[24px] border border-outline-variant/30 p-6 shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-container/20 p-3 rounded-xl text-primary">
                  <span className="material-symbols-outlined text-[32px]">event</span>
                </div>
                <span className={`px-3 py-1 text-[12px] font-bold rounded-full uppercase tracking-wider border ${h.status === 'draft' ? 'bg-surface-variant text-on-surface-variant border-outline-variant/50' : 'bg-green-100 text-green-700 border-green-200'}`}>
                  {h.status}
                </span>
              </div>
              <h4 className="font-headline-sm text-[20px] text-on-surface font-bold group-hover:text-primary transition-colors">{h.name}</h4>
              <p className="text-[14px] text-on-surface-variant mt-2 mb-6 line-clamp-2 flex-grow">{h.description || h.theme || 'No description provided.'}</p>
              
              <div className="mt-auto pt-6 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Starts</p>
                  <p className="font-headline-sm text-[20px] text-on-surface font-bold">
                    {h.event_start ? new Date(h.event_start).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-1">Ends</p>
                  <p className="font-headline-sm text-[20px] text-on-surface font-bold">
                    {h.event_end ? new Date(h.event_end).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-10">
  <h3 className="font-headline-sm text-[18px] text-primary font-bold mb-4">
    Reach & Engagement
  </h3>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <p>Total Reach</p>
      <h3 className="text-3xl font-bold">{summary?.total_participants || 0}</h3>
    </div>

    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <p>Registrations</p>
      <h3 className="text-3xl font-bold">{summary?.total_registrations || 0}</h3>
    </div>

    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <p>Teams Formed</p>
      <h3 className="text-3xl font-bold">{summary?.total_teams || 0}</h3>
    </div>

    <div className="bg-white p-5 rounded-xl border shadow-sm">
      <p>Submission Rate</p>
      <h3 className="text-3xl font-bold">
        {summary?.total_teams ? Math.round((summary.total_submissions / summary.total_teams) * 100) : 0}%
      </h3>
    </div>
  </div>
</div> 
    </div>
  );
}
