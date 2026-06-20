"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHackathonStore, ReviewerInvite } from "@/store/useHackathonStore";

export default function CreateHackathonStep4() {
  const router = useRouter();
  const { draftId, reviewers, setReviewers } = useHackathonStore();

  const [email, setEmail] = useState("");
  const [expertise, setExpertise] = useState("AI & ML");
  const [organization, setOrganization] = useState("");

  const handleInvite = () => {
    if (!email) return;
    
    const newReviewer: ReviewerInvite = {
      name: "", // Can be filled if we add a name field
      email,
      institution: organization,
      expertise_domains: [expertise]
    };
    
    setReviewers([...reviewers, newReviewer]);
    setEmail("");
    setExpertise("AI & ML");
    setOrganization("");
  };

  const removeReviewer = (index: number) => {
    const updated = [...reviewers];
    updated.splice(index, 1);
    setReviewers(updated);
  };

  const handleNext = async () => {
    if (!draftId) {
      alert("Missing draft Hackathon ID. Please return to step 1 and save.");
      return;
    }
    
    // MOCKED FOR MVP: Normally we'd POST to /team here
    // but the backend schema for Hackathon relations is currently simplified.
    router.push("/organizer/hackathons/create/step-5");
  };
  return (
    <div className="p-margin-desktop max-w-container-max mx-auto w-full">
      {/* Stepper Container */}
      <section className="mb-stack-lg">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto relative">
          {/* Progress Line Background */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-container-highest -translate-y-1/2 z-0"></div>
          {/* Active Progress Line */}
          <div className="absolute top-1/2 left-0 w-[75%] h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Basics</span>
          </div>
          
          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Tracks</span>
          </div>
          
          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-sm">check</span>
            </div>
            <span className="font-label-sm text-primary">Criteria</span>
          </div>
          
          {/* Step 4 (Current) */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-white ring-4 ring-primary-container/30 flex items-center justify-center font-bold">4</div>
            <span className="font-label-sm text-primary">Reviewers</span>
          </div>
          
          {/* Step 5 */}
          <div className="relative z-10 flex flex-col items-center gap-2 opacity-40">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-outline text-on-surface flex items-center justify-center font-bold">5</div>
            <span className="font-label-sm text-on-surface-variant">Summary</span>
          </div>
        </div>
      </section>

      {/* Main Task Grid (Asymmetric Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Left: Invitation Form */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-gutter">
          <div className="bg-white rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.2)] hover:shadow-[0_30px_40px_-15px_rgba(214,203,191,0.3)] transition-all duration-300 p-8 border border-outline-variant/30 h-full">
            <header className="mb-8">
              <h2 className="font-headline-md text-on-surface mb-2">Invite Experts</h2>
              <p className="font-body-md text-on-surface-variant">Nominate professionals to judge projects and provide technical feedback to participants.</p>
            </header>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleInvite(); }}>
              <div>
                <label className="block font-label-md text-on-surface mb-2">Reviewer Email</label>
                <input required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary transition-all outline-none" placeholder="colleague@industry.com" type="email"/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface mb-2">Expertise</label>
                  <select value={expertise} onChange={e => setExpertise(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none appearance-none cursor-pointer">
                    <option>AI & ML</option>
                    <option>Web3/Blockchain</option>
                    <option>FinTech</option>
                    <option>Product Design</option>
                    <option>Sustainability</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-on-surface mb-2">Organization</label>
                  <input value={organization} onChange={e => setOrganization(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary outline-none" placeholder="e.g. Anthropic" type="text"/>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>person_add</span>
                Invite Reviewer
              </button>
            </form>
          </div>
        </div>

        {/* Right: Pending Invitations List */}
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-[0_20px_30px_-10px_rgba(214,203,191,0.2)] hover:shadow-[0_30px_40px_-15px_rgba(214,203,191,0.3)] transition-all duration-300 p-8 border border-outline-variant/30 min-h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-headline-md text-on-surface mb-1">Pending Invitations</h2>
                <p className="font-label-md text-on-surface-variant">Reviewers who haven't accepted yet.</p>
              </div>
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label-sm">{reviewers.length} Pending</span>
            </div>
            
            <div className="space-y-4">
              {reviewers.map((reviewer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-tertiary-container text-on-tertiary-container font-bold text-lg">
                      {reviewer.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{reviewer.email}</h4>
                      <div className="flex gap-2 mt-1">
                        {reviewer.expertise_domains.map(domain => (
                          <span key={domain} className="px-2 py-0.5 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold uppercase tracking-wider">{domain}</span>
                        ))}
                        {reviewer.institution && (
                          <span className="px-2 py-0.5 bg-on-surface-variant/10 text-on-surface-variant rounded text-[10px] font-bold uppercase tracking-wider">{reviewer.institution}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeReviewer(index)} className="w-10 h-10 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {reviewers.length === 0 && (
                <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[32px] text-outline">group_add</span>
                  </div>
                  <p className="font-label-md text-on-surface-variant">Recommended: 5-8 reviewers for your hackathon scale.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="mt-stack-lg flex flex-col md:flex-row items-center justify-between border-t border-outline-variant pt-8 gap-4">
        <Link href="/organizer/hackathons/create/step-3" className="w-full md:w-auto">
          <button className="w-full px-8 py-3 bg-surface-container-highest text-on-surface-variant rounded-xl font-bold hover:bg-outline-variant/30 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span>
            Previous
          </button>
        </Link>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button className="w-full md:w-auto px-8 py-3 border border-outline text-on-surface-variant rounded-xl font-bold hover:bg-surface-variant transition-all">
            Save Draft
          </button>
          <button onClick={handleNext} className="w-full md:w-auto px-10 py-3 bg-tertiary text-white rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
            Next: Review Summary
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
