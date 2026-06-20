"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore, ProblemStatement } from "@/store/useHackathonStore";

export default function CreateHackathonStep2() {
  const router = useRouter();
  const { draftId, problemStatements, setProblemStatements } = useHackathonStore();

  const [activeStatementIndex, setActiveStatementIndex] = useState<number | null>(null);
  
  // Temporary state for the form
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Sustainability");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [description, setDescription] = useState("");

  const handleEdit = (index: number) => {
    const ps = problemStatements[index];
    setTitle(ps.title);
    setDomain(ps.domain);
    setDifficulty(ps.difficulty);
    setDescription(ps.description);
    setActiveStatementIndex(index);
  };

  const handleSaveCurrent = () => {
    if (!title) return;
    
    const newPs: ProblemStatement = { title, domain, difficulty, description };
    if (activeStatementIndex !== null) {
      const updated = [...problemStatements];
      updated[activeStatementIndex] = newPs;
      setProblemStatements(updated);
    } else {
      setProblemStatements([...problemStatements, newPs]);
    }
    
    // Reset form
    setTitle("");
    setDomain("Sustainability");
    setDifficulty("Intermediate");
    setDescription("");
    setActiveStatementIndex(null);
  };

  const handleNext = async () => {
    if (!draftId) {
      alert("Missing draft Hackathon ID. Please return to step 1 and save.");
      return;
    }
    
    // MOCKED FOR MVP: Normally we'd POST to /problem-statements here
    // but the backend schema for Hackathon relations is currently simplified.
    router.push("/organizer/hackathons/create/step-3");
  };

  return (
    <div className="p-6 md:p-stack-lg max-w-container-max mx-auto w-full relative">
      <div className="mb-stack-lg">
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-stack-sm">
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center font-bold">1</div>
            <span className="font-label-sm text-label-sm">Basic Info</span>
          </div>
          <div className="flex-1 h-[2px] bg-outline-variant mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">2</div>
            <span className="font-label-md text-label-md text-primary font-bold">Problem Statements</span>
          </div>
          <div className="flex-1 h-[2px] bg-outline-variant/30 mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="w-10 h-10 rounded-full border-2 border-outline flex items-center justify-center font-bold">3</div>
            <span className="font-label-sm text-label-sm">Evaluation</span>
          </div>
        </div>
      </div>

      <div className="mb-stack-lg">
        <h3 className="font-display-lg text-display-lg text-on-surface mb-2">Define Your Challenges</h3>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">Craft clear, compelling problem statements that will inspire participants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-stack-sm">
            <h4 className="font-headline-sm text-headline-sm">Current List</h4>
            <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-label-sm">{problemStatements.length} Statements</span>
          </div>

          {problemStatements.map((ps, index) => (
            <div 
              key={index} 
              onClick={() => handleEdit(index)}
              className={`ambient-card p-5 rounded-2xl cursor-pointer transition-colors shadow-sm border ${activeStatementIndex === index ? 'bg-surface-container-lowest border-l-4 border-l-primary' : 'bg-surface hover:bg-surface-container-highest border-outline-variant'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-label-sm text-outline uppercase tracking-widest font-semibold">{ps.domain}</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">edit</span>
              </div>
              <h5 className="font-bold text-on-surface mb-1">{ps.title}</h5>
              <p className="text-label-md text-on-surface-variant line-clamp-2">{ps.description}</p>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-md text-[10px] font-bold uppercase">{ps.difficulty}</span>
              </div>
            </div>
          ))}

          <button 
            onClick={() => {
              setTitle("");
              setDomain("Sustainability");
              setDifficulty("Intermediate");
              setDescription("");
              setActiveStatementIndex(null);
            }}
            className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant font-label-md flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-all group"
          >
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add_circle</span>
            Add Another Statement
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="ambient-card bg-surface-container-lowest p-8 md:p-stack-lg rounded-[32px] relative overflow-hidden shadow-sm border border-outline-variant/50">
            <div className="relative">
              <div className="flex items-center gap-3 mb-stack-md">
                <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm">{activeStatementIndex !== null ? "Edit Statement" : "New Statement"}</h4>
              </div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveCurrent(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="flex flex-col gap-2 group">
                    <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Title</label>
                    <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md" placeholder="e.g. Smart Grid Optimization" type="text" />
                  </div>
                  <div className="flex flex-col gap-2 group">
                    <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Domain</label>
                    <select value={domain} onChange={e => setDomain(e.target.value)} className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md cursor-pointer appearance-none">
                      <option>Sustainability</option>
                      <option>FinTech</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Cybersecurity</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-label-md text-on-surface-variant">Difficulty Level</label>
                  <div className="flex p-1 bg-surface-container rounded-2xl w-full max-w-md">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`flex-1 py-2 rounded-xl font-label-md text-label-md transition-all ${
                          difficulty === level
                            ? "bg-white shadow-sm text-primary font-bold"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                        type="button"
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 group">
                  <label className="font-label-md text-label-md text-on-surface-variant group-focus-within:text-primary">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md resize-none" placeholder="Describe the core problem..." rows={6}></textarea>
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20">
                    {activeStatementIndex !== null ? "Update Statement" : "Save Statement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-stack-lg pt-stack-md border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/organizer/hackathons/create/step-1">
          <button className="w-full md:w-auto px-8 py-3 rounded-xl border border-primary text-primary font-bold font-label-md flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Previous
          </button>
        </Link>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <button onClick={handleNext} className="w-full md:w-auto px-10 py-4 rounded-xl bg-tertiary text-on-tertiary font-bold font-label-md flex items-center justify-center gap-2 shadow-lg shadow-tertiary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Next: Evaluation Rubrics
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

