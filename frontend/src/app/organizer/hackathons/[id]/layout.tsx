"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";

export default function HackathonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();
  const resolvedParams = use(params);
  const id = resolvedParams.id || "winter-2024";

  const navLinks = [
    { name: "Overview", href: `/organizer/hackathons/${id}`, icon: "dashboard" },
    { name: "Registrations", href: `/organizer/hackathons/${id}/registrations`, icon: "person_add" },
    { name: "Teams", href: `/organizer/hackathons/${id}/teams`, icon: "groups" },
    { name: "Submissions", href: `/organizer/hackathons/${id}/submissions`, icon: "description" },
    { name: "Reviewers", href: `/organizer/hackathons/${id}/reviewers`, icon: "rate_review" },
    { name: "Evaluations", href: `/organizer/hackathons/${id}/evaluations`, icon: "assignment_turned_in" },
    { name: "Analytics", href: `/organizer/hackathons/${id}/analytics`, icon: "analytics" },
    { name: "Promo Tools", href: `/organizer/hackathons/${id}/promo`, icon: "campaign" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b border-outline-variant/30 bg-surface px-8 pt-4 sticky top-0 z-30">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/organizer/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span className="text-[14px] font-medium">Back to Events</span>
          </Link>
          <div className="h-4 w-px bg-outline-variant/50"></div>
          <h1 className="font-headline-sm text-[24px] text-primary font-bold">Winter 2024 Tech Bloom</h1>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Live</span>
        </div>
        
        {/* Secondary Navigation Tabs */}
        <nav className="flex gap-6 overflow-x-auto custom-scrollbar pb-[-1px]">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.name === "Overview" && pathname === `/organizer/hackathons/${id}`);
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-[14px] transition-colors whitespace-nowrap ${
                  isActive 
                    ? "border-primary text-primary" 
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
