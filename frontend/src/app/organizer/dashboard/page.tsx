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

export default function OrganizerDashboard() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/hackathons/`)
      .then(res => res.json())
      .then(data => {
        setHackathons(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load hackathons", err);
        setIsLoading(false);
      });
  }, []);

  const activeCount = hackathons.filter(h => h.status === 'active' || h.status === 'published').length;

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-64px)] max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full overflow-hidden">
      {/* Page Heading */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="font-headline-md text-[24px] md:text-[28px] text-primary">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Welcome back. Here's what's happening across your {hackathons.length} hackathons.</p>
        </div>
        <div className="flex gap-3">
         
          <Link href="/organizer/hackathons/create/step-1">
            <button className="bg-primary text-white px-5 py-2 rounded-lg font-label-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Hackathon
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 flex-shrink-0">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Hackathons</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{isLoading ? "-" : hackathons.length}</span>
            <span className="text-primary text-[10px] font-bold bg-primary-fixed px-1.5 py-0.5 rounded">All</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">All time events</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Active</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{isLoading ? "-" : activeCount}</span>
            <span className="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">Currently running</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Registrations</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">4,852</span>
          </div>
          <p className="text-[10px] text-primary mt-1 font-medium">↑ 12% vs last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">1,240</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">75% completion rate</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Reviewers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">45</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">Verified experts</p>
        </div>
      </div> 
        

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column (Main Charts & Data) */}
        <div className="col-span-12 flex flex-col gap-4 md:gap-6">
          
          {/* Your Hackathons Section */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <h3 className="font-headline-sm text-[18px] text-primary font-bold">Your Hackathons</h3>
              <Link href="/organizer/hackathons/create/step-1" className="text-primary font-label-sm hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Create New
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading && <p className="text-sm text-on-surface-variant">Loading hackathons...</p>}
              {!isLoading && hackathons.length === 0 && (
                <div className="col-span-2 text-center p-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/50">
                  <p className="text-sm text-on-surface-variant mb-2">You haven't created any hackathons yet.</p>
                  <Link href="/organizer/hackathons/create/step-1">
                    <button className="text-primary font-bold text-sm">Create your first hackathon →</button>
                  </Link>
                </div>
              )}
              
              {hackathons.map((h) => (
                <Link key={h.id} href={`/organizer/hackathons/${h.public_slug || h.id}`} className="block group">
                  <div className="bg-white rounded-xl border border-outline-variant/30 p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-primary-container/20 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-[24px]">event</span>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${h.status === 'draft' ? 'bg-surface-variant text-on-surface-variant' : 'bg-green-100 text-green-700'}`}>
                        {h.status}
                      </span>
                    </div>
                    <h4 className="font-headline-sm text-[16px] text-on-surface font-bold group-hover:text-primary transition-colors">{h.name}</h4>
                    <p className="text-[12px] text-on-surface-variant mt-1 line-clamp-2 flex-grow">{h.description || h.theme || 'No description provided.'}</p>
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant/20">
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Starts</p>
                        <p className="font-bold text-[12px] text-on-surface">
                          {h.event_start ? new Date(h.event_start).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-low group-hover:bg-primary/10 text-on-surface-variant group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          
          
       
            {/* Evaluation Progress */}
            <div className="flex flex-col gap-3">
  <h3 className="font-headline-sm text-[18px] text-primary font-bold">
    Reach & Engagement
  </h3>

  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">      
    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Total Reach
      </p>
      <h3 className="text-3xl font-bold mt-2">52K</h3>
      <p className="text-sm text-primary mt-1">+18% this month</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Registrations
      </p>
      <h3 className="text-3xl font-bold mt-2">4,852</h3>
      <p className="text-sm text-primary mt-1">+12%</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Teams Formed
      </p>
      <h3 className="text-3xl font-bold mt-2">720</h3>
      <p className="text-sm text-primary mt-1">88% conversion</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Submission Rate
      </p>
      <h3 className="text-3xl font-bold mt-2">72%</h3>
      <p className="text-sm text-primary mt-1">580 submissions</p>
    </div>
  </div>
</div>
            
        

     
          
        </div>
      </div>
    </div>
  );
}
