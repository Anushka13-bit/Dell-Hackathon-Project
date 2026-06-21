"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const mockChartData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 68 },
    { day: 'Wed', value: 120 },
    { day: 'Thu', value: 250 },
    { day: 'Fri', value: 310 },
    { day: 'Sat', value: 420 },
    { day: 'Sun', value: 580 },
  ];
  const maxValue = Math.max(...mockChartData.map(d => d.value));

  const mockSubmissionsData = [
    { label: 'Week 1', value: 10 },
    { label: 'Week 2', value: 45 },
    { label: 'Week 3', value: 120 },
    { label: 'Week 4', value: 350 },
  ];
  const maxSubValue = Math.max(...mockSubmissionsData.map(d => d.value));

  return (
    <>
      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-md border-b border-outline-variant/20 flex items-center justify-between px-4 md:px-6 z-50">
        <div className="flex items-center">
          <div className="relative w-[192px] h-[192px] -my-16 -ml-8">
            <Image src="/logo.png" priority alt="Dell Logo" fill className="object-contain object-left" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/organizer/hackathons/create/step-1">
            <button className="bg-primary text-white px-4 md:px-5 py-2 rounded-lg font-label-sm hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">Create Hackathon</span>
              <span className="sm:hidden">Create</span>
            </button>
          </Link>
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)} 
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-primary">person</span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2">
                <Link href="/">
                  <button className="w-full text-left px-4 py-2 hover:bg-surface-variant/50 text-sm flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-4 md:px-6 min-h-screen max-w-7xl mx-auto flex flex-col gap-4 md:gap-6 w-full">
      {/* Page Heading */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h2 className="font-headline-md text-[24px] md:text-[28px] text-primary">Dashboard Overview</h2>
          <p className="text-on-surface-variant mt-1 text-sm">Welcome back. Here's what's happening across your {hackathons.length} hackathons.</p>
        </div>
        <div className="flex gap-3">
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
            <span className="text-2xl font-bold">{summary?.total_registrations || 0}</span>
          </div>
          <p className="text-[10px] text-primary mt-1 font-medium">↑ 12% vs last month</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Submissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary?.total_submissions || 0}</span>
          </div>
          <p className="text-[9px] text-on-surface-variant/40 mt-1">
            {summary?.total_teams ? Math.round((summary.total_submissions / summary.total_teams) * 100) : 0}% completion rate
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold mb-1">Reviewers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{summary?.total_reviewers || 0}</span>
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
              
              {hackathons.slice().reverse().slice(0, 2).map((h) => (
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
            {hackathons.length > 2 && (
              <div className="flex justify-center mt-2">
                <Link href="/organizer/hackathons">
                  <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                    See All Hackathons <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </Link>
              </div>
            )}
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
      <h3 className="text-3xl font-bold mt-2">{summary?.total_participants || 0}</h3>
      <p className="text-sm text-primary mt-1">Participants</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Registrations
      </p>
      <h3 className="text-3xl font-bold mt-2">{summary?.total_registrations || 0}</h3>
      <p className="text-sm text-primary mt-1">Registered users</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Teams Formed
      </p>
      <h3 className="text-3xl font-bold mt-2">{summary?.total_teams || 0}</h3>
      <p className="text-sm text-primary mt-1">Active teams</p>
    </div>

    <div className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm w-full">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">
        Submission Rate
      </p>
      <h3 className="text-3xl font-bold mt-2">
        {summary?.total_teams ? Math.round((summary.total_submissions / summary.total_teams) * 100) : 0}%
      </h3>
      <p className="text-sm text-primary mt-1">{summary?.total_submissions || 0} submissions</p>
    </div>
  </div>
  
  {/* Visualization Graphs */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-2">
    {/* Registration Trend Graph */}
    <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col h-72">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-sm text-[16px] font-bold text-primary">Registration Trend</h3>
      <select className="text-sm bg-surface-container-low border-none rounded-lg px-3 py-1.5 outline-none text-on-surface-variant font-medium cursor-pointer">
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
      </select>
    </div>
    <div className="flex-1 flex items-end gap-2 md:gap-6 justify-between pt-4 pb-2 border-b border-outline-variant/20">
      {mockChartData.map((data, i) => (
        <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full">
          <div className="relative w-full flex justify-center h-full items-end">
            <div 
              className="w-full max-w-[48px] bg-primary/20 group-hover:bg-primary/50 rounded-t-lg transition-all duration-300 relative cursor-pointer"
              style={{ height: `${(data.value / maxValue) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                {data.value}
              </div>
            </div>
          </div>
          <span className="text-[11px] md:text-xs text-on-surface-variant font-medium uppercase tracking-wider">{data.day}</span>
        </div>
      ))}
      </div>
    </div>

    {/* Submissions Over Time Graph */}
    <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col h-72">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-sm text-[16px] font-bold text-tertiary">Submissions Over Time</h3>
        <select className="text-sm bg-surface-container-low border-none rounded-lg px-3 py-1.5 outline-none text-on-surface-variant font-medium cursor-pointer">
          <option>Last 4 Weeks</option>
          <option>Last 12 Weeks</option>
        </select>
      </div>
      <div className="flex-1 flex items-end gap-2 md:gap-8 justify-between pt-4 pb-2 border-b border-outline-variant/20">
        {mockSubmissionsData.map((data, i) => (
          <div key={i} className="flex flex-col items-center gap-3 flex-1 group h-full">
            <div className="relative w-full flex justify-center h-full items-end">
              <div 
                className="w-full max-w-[64px] bg-tertiary/20 group-hover:bg-tertiary/50 rounded-t-lg transition-all duration-300 relative cursor-pointer"
                style={{ height: `${(data.value / maxSubValue) * 100}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[11px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                  {data.value}
                </div>
              </div>
            </div>
            <span className="text-[11px] md:text-xs text-on-surface-variant font-medium uppercase tracking-wider">{data.label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
            
        

     
          
        </div>
      </div>
    </div>
    </>
  );
}
