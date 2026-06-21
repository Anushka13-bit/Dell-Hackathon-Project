"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/app/auth/actions";
import { useOnboardingStore } from "@/store/useOnboardingStore";

export default function ParticipantSidebar() {
  const pathname = usePathname();
  const { fullName, collegeInfo, aiData } = useOnboardingStore();

  const navLinks = [
    { name: "Dashboard", href: "/participant/dashboard", icon: "dashboard" },
    { name: "Profile", href: "/participant/profile", icon: "person" },
    { name: "Teams", href: "/participant/teams", icon: "groups" },
    { name: "Challenges", href: "/participant/challenges", icon: "emoji_events" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#04201d] rounded-r-[32px] flex flex-col py-stack-md px-4 shadow-lg z-30">
      <div className="mb-stack-lg px-2 flex flex-col items-start gap-1">
        <Image src="/logo.png" priority alt="HackOS" width={840} height={240} className="h-[240px] object-contain brightness-0 invert" style={{ width: 'auto' }} />
        <p className="font-label-sm text-[12px] text-white/70 ml-1 opacity-80">Participant</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
          return (
            <Link 
              key={link.name}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-white/20 text-white font-bold" 
                  : "text-white/80 hover:text-white hover:bg-white/10 font-label-md"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="text-label-md">{link.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto px-2 pb-4">
        <div className="mt-stack-lg border-t border-white/10 pt-4 space-y-2">
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-white/80 text-label-md hover:bg-white/10 rounded-xl transition-all">
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </form>
        </div>
        
        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => {
              const modal = document.getElementById('profile-modal');
              if (modal) modal.classList.toggle('hidden');
            }}
            className="w-full mt-4 flex items-center gap-3 px-2 py-3 bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shrink-0">
              {fullName ? fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "H"}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{fullName || "Hacker"}</p>
              <p className="text-white/60 text-xs truncate">{collegeInfo?.college || "Participant"}</p>
            </div>
          </button>
          
          {/* Simple Profile Modal */}
          <div id="profile-modal" className="hidden absolute bottom-full left-0 w-64 mb-2 bg-[#0a2e29] border border-white/10 rounded-2xl p-4 shadow-xl z-50">
            <h4 className="text-white font-bold mb-3 border-b border-white/10 pb-2">Your Profile</h4>
            
            <div className="space-y-3">
              <div>
                <span className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Top Skills</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {aiData?.skill_vector ? Object.entries(aiData.skill_vector)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 4)
                    .map(([skill]) => (
                      <span key={skill} className="px-2 py-0.5 bg-white/10 text-white/90 text-[10px] font-bold rounded">
                        {skill.replace('_', ' ')}
                      </span>
                    )) : (
                      <span className="text-white/70 text-xs italic">No skills extracted yet</span>
                    )}
                </div>
              </div>

              {collegeInfo?.degree && (
                <div>
                  <span className="text-white/50 text-[10px] uppercase tracking-wider font-bold">Education</span>
                  <p className="text-white/90 text-[12px]">{collegeInfo.degree}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
