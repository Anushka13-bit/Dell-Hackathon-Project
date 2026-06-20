"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "@/app/auth/actions";

export default function ParticipantSidebar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dashboard", href: "/participant/dashboard", icon: "dashboard" },
    { name: "Teams", href: "/participant/teams", icon: "groups" },
    { name: "Challenges", href: "/participant/challenges", icon: "emoji_events" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#04201d] rounded-r-[32px] flex flex-col py-stack-md px-4 shadow-lg z-30">
      <div className="mb-stack-lg px-2 flex flex-col items-start gap-1">
        <Image src="/logo.png" alt="HackOS" width={840} height={240} className="h-[240px] w-auto object-contain brightness-0 invert" />
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
          <Link href="#" className="flex items-center gap-3 px-4 py-2 text-white/80 text-label-md hover:bg-white/10 rounded-xl transition-all">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-white/80 text-label-md hover:bg-white/10 rounded-xl transition-all">
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </form>
        </div>
        
        {/* User Profile */}
        <div className="mt-4 flex items-center gap-3 px-2 py-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold">
            JD
          </div>
          <div>
            <p className="text-white text-sm font-bold">John Doe</p>
            <p className="text-white/60 text-xs">Level 4</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
