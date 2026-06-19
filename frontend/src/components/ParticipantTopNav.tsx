import Link from "next/link";

export default function ParticipantTopNav() {
  return (
    <nav className="w-full top-0 sticky z-50 bg-surface/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-6 md:px-margin-desktop py-4 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/participant/dashboard" className="font-display-lg text-[24px] md:text-[28px] font-bold text-primary">
            HackFlow
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <Link className="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-200" href="/participant/dashboard">Dashboard</Link>
            <Link className="text-primary font-bold border-b-2 border-primary pb-1 font-body-md" href="/participant/teams">Teams</Link>
            <Link className="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-200" href="/participant/challenges">Challenges</Link>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">notifications</span>
            <span className="material-symbols-outlined text-primary cursor-pointer active:opacity-80">settings</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold cursor-pointer active:opacity-80">
            JD
          </div>
        </div>
      </div>
    </nav>
  );
}
