"use client";

import Link from "next/link";

export default function TeamFormationHub() {
  return (
    <>
      {/* Subtle Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 md:px-margin-desktop py-12 md:py-20 space-y-stack-lg">
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full font-label-sm uppercase tracking-wider">Onboarding Phase</span>
          <h1 className="font-display-lg text-[32px] md:text-[48px] text-on-surface">How would you like to participate?</h1>
          <p className="font-body-lg text-on-surface-variant">Registration complete. Now, choose your path to innovation.</p>
        </header>

        {/* Path Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {/* Card 1: Create Team */}
          <div className="group relative bg-surface-container-lowest p-8 md:p-12 rounded-[24px] border border-outline-variant/30 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(84,110,245,0.04),0_0_0_1px_rgba(151,179,174,0.2)]">
            <div className="flex flex-col h-full space-y-8">
              <div className="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>groups_3</span>
              </div>
              <div className="space-y-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Create Team</h2>
                <p className="font-body-md text-on-surface-variant leading-relaxed">Take the helm and bring your vision to life. Assemble a dream team tailored to your project's specific needs.</p>
              </div>
              <ul className="space-y-4 flex-grow">
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-label-md">Recruit Members</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-label-md">Define Required Skills</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-label-md">Select Problem Statement</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  <span className="font-label-md">Manage Team Workspace</span>
                </li>
              </ul>
              <Link href="/participant/teams/create" className="w-full bg-primary text-white py-4 rounded-xl font-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
                Become Team Lead
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Join Team */}
          <div className="group relative bg-surface-container-lowest p-8 md:p-12 rounded-[24px] border-2 border-primary-container/50 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(84,110,245,0.04),0_0_0_1px_rgba(151,179,174,0.2)] overflow-hidden">
            {/* Recommended Badge */}
            <div className="absolute top-4 right-4">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                Recommended Path
              </span>
            </div>
            <div className="flex flex-col h-full space-y-8">
              <div className="w-16 h-16 bg-secondary-container/30 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
              </div>
              <div className="space-y-4">
                <h2 className="font-headline-md text-headline-md text-on-surface">Join Team</h2>
                <p className="font-body-md text-on-surface-variant leading-relaxed">Collaborate with talented peers and find your perfect fit. Leverage our AI to find teams that match your skills.</p>
              </div>
              <ul className="space-y-4 flex-grow">
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  <span className="font-label-md">AI Match Recommendations</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  <span className="font-label-md">Skill Compatibility Analysis</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                  <span className="font-label-md">Request To Join Teams</span>
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant italic">
                  <span className="material-symbols-outlined text-secondary/50 text-sm">info</span>
                  <span className="font-label-md opacity-70">Over 40 teams looking for your expertise</span>
                </li>
              </ul>
              <Link href="/participant/teams/join" className="w-full bg-secondary text-white py-4 rounded-xl font-label-md hover:opacity-90 transition-all flex items-center justify-center gap-2">
                Browse Teams
                <span className="material-symbols-outlined text-sm">explore</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <section className="pt-12 space-y-8">
          <div className="text-center">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">A Closer Look at the Roles</h3>
            <p className="font-body-md text-on-surface-variant mt-2">Understand the expectations before you commit.</p>
          </div>
          <div className="bg-white rounded-[24px] border border-outline-variant overflow-hidden shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-8 py-6 text-left font-label-sm uppercase tracking-wider text-on-surface-variant">Dimension</th>
                  <th className="px-8 py-6 text-left font-headline-sm text-primary">Team Lead</th>
                  <th className="px-8 py-6 text-left font-headline-sm text-secondary">Team Member</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                <tr>
                  <td className="px-8 py-6 font-label-md text-on-surface">Responsibility</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">Project direction, submission, and coordination.</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">Assigned task execution and collaborative ideation.</td>
                </tr>
                <tr>
                  <td className="px-8 py-6 font-label-md text-on-surface">Control</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">Full authority over team membership and tech stack.</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">Participates in consensus-driven decisions.</td>
                </tr>
                <tr>
                  <td className="px-8 py-6 font-label-md text-on-surface">Commitment</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">High. Requires active oversight of all team milestones.</td>
                  <td className="px-8 py-6 font-body-md text-on-surface-variant">Moderate. Focused on delivering high-quality contributions.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex justify-center pt-8">
          <Link href="/participant/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all font-label-md group">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </main>

      {/* Footer Component */}
      <footer className="w-full py-12 bg-surface-container-low border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-margin-desktop gap-stack-md max-w-[1280px] mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-headline-sm text-headline-sm text-primary">HackOS</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 HackOS. High-End Editorial Hackathon Management.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="text-on-surface-variant font-label-sm hover:text-primary underline transition-all duration-300" href="#">Privacy Policy</Link>
            <Link className="text-on-surface-variant font-label-sm hover:text-primary underline transition-all duration-300" href="#">Terms of Service</Link>
            <Link className="text-on-surface-variant font-label-sm hover:text-primary underline transition-all duration-300" href="#">Support</Link>
            <Link className="text-on-surface-variant font-label-sm hover:text-primary underline transition-all duration-300" href="#">Contact Us</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
