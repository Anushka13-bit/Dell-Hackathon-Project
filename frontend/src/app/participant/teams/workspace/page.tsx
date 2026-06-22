"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/utils/supabase/client";
import { getApiBaseUrl } from "@/lib/api";

export default function TeamWorkspace() {
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [participant, setParticipant] = useState<any>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const apiBase = getApiBaseUrl();
        const pRes = await fetch(`${apiBase}/participants/${session.user.id}`, { cache: 'no-store' });
        if (!pRes.ok) return;
        const pData = await pRes.json();
        setParticipant(pData);

        if (pData.team_id) {
          const tRes = await fetch(`${apiBase}/teams/${pData.team_id}`, { cache: 'no-store' });
          if (tRes.ok) {
            const tData = await tRes.json();
            setTeam(tData);
            setProjectTitle(tData.name || "Project");
            setProblemStatement(tData.problem_statement || "");

            const teamMembers = [];
            for (const mid of tData.member_ids || []) {
              const mRes = await fetch(`${apiBase}/participants/${mid}`, { cache: 'no-store' });
              if (mRes.ok) teamMembers.push(await mRes.json());
            }
            
            if (!teamMembers.some(m => m.id === pData.id)) {
              teamMembers.unshift(pData);
            }
            
            setMembers(teamMembers);

            const subRes = await fetch(`${apiBase}/submissions/team/${pData.team_id}`);
            if (subRes.ok) {
              const subs = await subRes.json();
              if (subs.length > 0) {
                const latest = subs[subs.length - 1];
                setProjectTitle(latest.title || tData.name);
                setProjectDescription(latest.description || "");
                setGithubUrl(latest.github_url || "");
                setVideoUrl(latest.video_url || "");
                if (latest.ai_feedback) setAiFeedback(latest.ai_feedback);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTeamData();
  }, []);

  const handleSubmission = async () => {
    try {
      if (!team?.team_id) {
        alert("No team found. Create a team first.");
        return;
      }
      setIsSubmitting(true);
      const deckUrl = await uploadDeck();
      const payload = {
        team_id: team.team_id,
        title: projectTitle,
        description: projectDescription,
        github_url: githubUrl || undefined,
        video_url: videoUrl || undefined,
        ppt_url: deckUrl || undefined
      };

      async function uploadDeck() {
        if (!deckFile || !team) return null;

        const supabase = createClient();

        const fileName = `${team.team_id}/${Date.now()}-${deckFile.name}`;

        const { data, error } = await supabase.storage
          .from("decks")
          .upload(fileName, deckFile);

        if (error) {
          console.error(error);
          return null;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("decks")
          .getPublicUrl(fileName);

        return publicUrl;
      };

      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/submissions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Project submitted successfully!");
      } else {
        alert("Failed to submit project.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProblemStatement = async () => {
    if (!team?.team_id) return;

    const apiBase = getApiBaseUrl();

    await fetch(`${apiBase}/teams/${team.team_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: team.name,
        problem_statement: problemStatement,
      }),
    });
  };

  useEffect(() => {
    if (!team) return;

    const timer = setTimeout(() => {
      saveProblemStatement();
    }, 1000);

    return () => clearTimeout(timer);
  }, [problemStatement]);

  return (

    <div className="bg-surface min-h-[calc(100vh-80px)] overflow-x-hidden">
      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto p-6 lg:p-margin-desktop bg-gradient-to-br from-[#fef2e5] to-[#fff8f3]">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-stack-lg border-b border-outline-variant pb-8">
          <div className="max-w-2xl">
            <nav className="flex items-center gap-2 text-outline text-label-sm mb-4">
              <Link href="/participant/teams" className="hover:text-primary">Teams</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-primary font-bold">{team ? team.name : "Team Workspace"}</span>
            </nav>
            <h2 className="font-display-lg text-[48px] text-on-surface mb-2">{team ? team.name : "Team Workspace"}</h2>

          </div>
          <div className="mt-6 md:mt-0 flex gap-3">


          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-stack-lg">
          {/* Readiness Score */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                <circle className="text-primary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="176" strokeDashoffset="26" strokeWidth="4" strokeLinecap="round"></circle>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-bold text-primary text-sm">85%</span>
            </div>
            <div>
              <p className="text-outline text-label-sm uppercase tracking-wider">Readiness Score</p>
              <p className="font-headline-sm text-[24px] text-on-surface">Optimized</p>
            </div>
          </div>

          {/* Submission Status */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)]">
            <p className="text-outline text-label-sm uppercase tracking-wider mb-2">Submission Status</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-tertiary rounded-full animate-pulse"></span>
              <p className="font-headline-sm text-[24px] text-on-surface">In Progress</p>
            </div>
            <p className="text-label-sm text-on-surface-variant mt-1">Due in 48 hours</p>
          </div>

          {/* Milestones */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)]">
            <p className="text-outline text-label-sm uppercase tracking-wider mb-2">Total Milestones</p>
            <div className="flex items-end gap-2">
              <p className="font-display-lg text-[48px] text-primary leading-none">4/6</p>
              <div className="flex-1 h-2 bg-surface-container-high rounded-full mb-2 overflow-hidden">
                <div className="h-full bg-primary w-2/3"></div>
              </div>
            </div>
          </div>

          {/* Assigned Reviewer */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] flex items-center gap-4">
            <img className="w-12 h-12 rounded-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5ZG3IF2C4nsEU4O9RC_qvd0Qr0Dqoc1o7gi_Yz9b3KBUqoN4qNZ5CQo0II3DGmC6DFk3_g57dT7hcxy5Bi7zacF9E1Yph2CJoZrlDQh0Qfmykq0PYi2Kj_xZ1udSfBEIG4aMHZWA8ovJRSa2qdpfDhj6HQeWIQa7K1GySDzDI8lsIcUT8EGysD1oUwMUdmAH3xo0tX2u7_W2R0MLH8XuYnrwgtHb6kGlWOZaDYn9VRrMF_v4iGvXnx3U1FBXPnQsyzEuNnmHkwx8" alt="Reviewer" />
            <div>
              <p className="text-outline text-label-sm uppercase tracking-wider">Assigned Reviewer</p>
              <p className="font-headline-sm text-[24px] text-on-surface truncate">Dr. Sarah Jenkins</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
          {/* Left Column (Main Flow) */}
          <div className="lg:col-span-8 space-y-stack-lg">
            {/* Project Section */}
            <section className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] border border-outline-variant/30 transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-md text-[32px] text-on-surface">Project Statement</h3>
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">edit_note</span>
              </div>
              <div className="bg-surface-bright p-6 rounded-2xl border border-surface-variant mb-8">
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Describe your solution and problem statement..."
                  className="w-full min-h-[180px] bg-transparent text-body-lg text-on-surface-variant outline-none resize-none"
                />
              </div>
              <h4 className="font-label-md text-on-surface mb-4 uppercase tracking-widest">Milestones Journey</h4>
              <div className="space-y-4">
                <div className="group flex items-center justify-between p-4 bg-surface rounded-xl border-l-4 border-primary transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-body-md text-on-surface">Hardware Prototyping</span>
                  </div>
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-label-sm">Completed</span>
                </div>
                <div className="group flex items-center justify-between p-4 bg-surface rounded-xl border-l-4 border-primary transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="font-body-md text-on-surface">AI Model Training</span>
                  </div>
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-label-sm">Completed</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border-l-4 border-tertiary">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-tertiary animate-pulse">sync</span>
                    <span className="font-body-md text-on-surface">Cloud Dashboard Integration</span>
                  </div>
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-label-sm">In Progress</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-container opacity-60 rounded-xl border-l-4 border-outline">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-outline">pending</span>
                    <span className="font-body-md text-on-surface">Final Documentation</span>
                  </div>
                  <span className="bg-surface-variant text-on-surface-variant px-3 py-1 rounded-full text-label-sm">Pending</span>
                </div>
              </div>
            </section>
            <section className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] border border-outline-variant/30 transition-transform duration-300 hover:-translate-y-1">
              <div className="mb-6">
                <h3 className="font-headline-md text-[32px] text-on-surface mb-2">
                  Project Idea
                </h3>
                <p className="text-on-surface-variant text-body-md">
                  Briefly describe your solution, innovation, and expected impact.
                </p>
              </div>

              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your project idea, solution approach, innovation, and expected impact..."
                className="w-full min-h-[220px] bg-[#fffaf6] border-2 border-primary/20 rounded-2xl p-6 text-body-md text-on-surface placeholder:text-outline outline-none resize-none shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </section>
            {/* Submission Section */}
            <section className="bg-surface-container-lowest p-8 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] border border-outline-variant/30 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="font-headline-md text-[32px] text-on-surface mb-6">Submission Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface">GitHub Repository</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">link</span>
                    <input className="w-full bg-surface-bright border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-12 py-3 text-body-md outline-none transition-all" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-on-surface">Demo Video URL</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary">play_circle</span>
                    <input className="w-full bg-surface-bright border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-12 py-3 text-body-md outline-none transition-all" placeholder="https://vimeo.com/..." type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <label className="font-label-md text-on-surface block mb-2">Presentation Deck</label>
                <label className="border-2 border-dashed border-primary-container bg-primary-fixed/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-fixed/30 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setDeckFile(e.target.files[0]);
                      }
                    }}
                  />

                  <span className="material-symbols-outlined text-4xl text-primary mb-2">
                    upload_file
                  </span>

                  <p className="font-headline-sm text-[24px] text-primary mb-1">
                    {deckFile
                      ? deckFile.name
                      : "Upload your PDF or PPTX"}
                  </p>

                  <p className="text-label-sm text-on-surface-variant">
                    Max file size 25MB
                  </p>
                </label>
              </div>
              <button
                onClick={handleSubmission}
                disabled={isSubmitting}
                className="w-full bg-primary text-on-primary py-5 rounded-2xl font-headline-sm text-[24px] shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Project Finalization"}
                <span className="material-symbols-outlined">rocket_launch</span>
              </button>
            </section>
          </div>

          {/* Right Column (Oversight) */}
          <div className="lg:col-span-4 space-y-stack-lg">
            {/* Members Panel */}
            <section className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline-sm text-[24px] text-on-surface">Team Members</h3>
              </div>
              <div className="space-y-6">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full object-cover bg-primary-container flex items-center justify-center font-bold text-[20px] text-primary">
                        {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-on-surface">{member.name || "Unknown Hacker"}</p>
                      <p className="text-[10px] text-outline uppercase tracking-wider">Team Member</p>

                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviewer Section */}
            <section className="bg-surface-container-high p-6 rounded-[24px] shadow-sm border border-primary-container/20 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-4">Evaluation Progress</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-sm font-bold text-on-surface">Review Status</span>
                  <span className="text-error font-bold text-label-sm">Review Pending</span>
                </div>
                <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-error/20 w-0"></div>
                </div>
              </div>
              <div className="p-4 bg-surface-bright rounded-xl">
                <p className="text-[11px] text-outline leading-relaxed italic">
                  "Team EcoStream has demonstrated strong technical feasibility in their milestones. I am waiting for the final demo video to verify LoRaWAN connectivity stability."
                </p>
                <p className="text-label-sm text-primary font-bold mt-2">— Dr. Sarah Jenkins</p>
              </div>
            </section>

            {/* AI Feedback Section */}
            {aiFeedback && (
              <section className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-[24px] shadow-sm border border-primary/20 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="font-label-md text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  AI Personalized Feedback
                </h3>
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-[13px] text-on-surface leading-relaxed whitespace-pre-wrap">
                    {aiFeedback}
                  </p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <p className="text-[10px] text-outline font-bold uppercase tracking-wider">Generated by HackOS AI</p>
                  </div>
                </div>
              </section>
            )}


            {/* Timeline Journey */}
            <section className="bg-surface-container-lowest p-6 rounded-[24px] shadow-[0_20px_30px_-10px_rgba(214,203,191,0.4)] transition-transform duration-300 hover:-translate-y-1">
              <h3 className="font-headline-sm text-[24px] text-on-surface mb-6">Hackathon Journey</h3>
              <div className="space-y-8 relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-surface-container-high"></div>
                <div className="relative flex gap-6">
                  <div className="z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">Registration</p>
                    <p className="text-[11px] text-outline">Oct 12, 2023</p>
                  </div>
                </div>
                <div className="relative flex gap-6">
                  <div className="z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">Team Formation</p>
                    <p className="text-[11px] text-outline">Oct 14, 2023</p>
                  </div>
                </div>
                <div className="relative flex gap-6">
                  <div className="z-10 w-8 h-8 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary ring-4 ring-tertiary/20">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>

                  <div>
                    <p className="font-label-md text-tertiary font-bold">Submission</p>
                    <p className="text-[11px] text-tertiary-fixed-dim">Currently Active</p>
                  </div>
                </div>
                <div className="relative flex gap-6 opacity-40">
                  <div className="z-10 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-sm">rate_review</span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">Review Phase</p>
                    <p className="text-[11px] text-outline">Upcoming Oct 28</p>
                  </div>
                </div>
                <div className="relative flex gap-6 opacity-40">
                  <div className="z-10 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-sm">trophy</span>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface">Results</p>
                    <p className="text-[11px] text-outline">Nov 02, 2023</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

    </div>
  );
}
