    "use client";
 
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
 ArrowLeft,
 Calendar,
 CheckCircle2,
 ChevronRight,
 Clock,
 Code2,
 FileText,
 Flag,
 Inbox,
 Lightbulb,
 Link2,
 PlayCircle,
 User,
 Users,
} from "lucide-react";
 
// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type HackathonStatus = "upcoming" | "judging" | "completed";
type SubmissionStatus = "pending" | "reviewed";
 
interface Hackathon {
 id: string;
 name: string;
 date: string;
 status: HackathonStatus;
 teamsCount: number;
 description: string;
}
 
interface Submission {
 id: string;
 hackathonId: string;
 teamName: string;
 members: string[];
 problemStatement: string;
 ideaSubmission: string;
 githubRepo: string;
 demoVideoUrl: string;
 presentationDeckName: string;
 presentationDeckUrl: string;
 status: SubmissionStatus;
 score?: number;
}
 
// ─────────────────────────────────────────────
// MOCK DATA — replace with real fetches from actions.ts
// ─────────────────────────────────────────────
const MOCK_HACKATHONS: Hackathon[] = [
 {
   id: "hk-1",
   name: "EcoStream Hackathon 2024",
   date: "Dec 14–16, 2024",
   status: "judging",
   teamsCount: 18,
   description: "Sustainability & IoT focused hackathon for climate-tech builders.",
 },
 {
   id: "hk-2",
   name: "FinFlow Builders Sprint",
   date: "Jan 10–12, 2025",
   status: "upcoming",
   teamsCount: 12,
   description: "Fintech innovation challenge for embedded finance solutions.",
 },
 {
   id: "hk-3",
   name: "HealthTech Horizon",
   date: "Oct 5–7, 2024",
   status: "completed",
   teamsCount: 24,
   description: "Healthcare accessibility and diagnostics hackathon.",
 },
];
 
const MOCK_SUBMISSIONS: Record<string, Submission[]> = {
 "hk-1": [
   {
     id: "sub-1",
     hackathonId: "hk-1",
     teamName: "Team Mesh",
     members: ["Aarav Sharma", "Diya Patel", "Kabir Nair"],
     problemStatement:
       "Rural and disaster-affected areas often lose internet connectivity, cutting off access to emergency communication and critical environmental sensor data.",
     ideaSubmission:
       "IoT-Mesh is a self-healing mesh network of low-power sensor nodes that relay environmental and emergency data peer-to-peer, even when centralized infrastructure is down.",
     githubRepo: "https://github.com/ecostream/iot-mesh",
     demoVideoUrl: "https://vimeo.com/123456789",
     presentationDeckName: "IoT-Mesh_FinalDeck.pdf",
     presentationDeckUrl: "#",
     status: "pending",
   },
   {
     id: "sub-2",
     hackathonId: "hk-1",
     teamName: "Team Greenwave",
     members: ["Sara Khan", "Ishaan Verma"],
     problemStatement:
       "Urban farms lack affordable, real-time soil and water quality monitoring, leading to inefficient resource use and lower yields.",
     ideaSubmission:
       "Greenwave is a solar-powered sensor pod paired with a predictive irrigation app that reduces water usage by up to 30% for small-scale urban farmers.",
     githubRepo: "https://github.com/greenwave/sensor-pod",
     demoVideoUrl: "https://vimeo.com/987654321",
     presentationDeckName: "Greenwave_Pitch.pptx",
     presentationDeckUrl: "#",
     status: "reviewed",
     score: 87,
   },
 ],
 "hk-2": [],
 "hk-3": [
   {
     id: "sub-3",
     hackathonId: "hk-3",
     teamName: "Team Pulse",
     members: ["Meera Iyer", "Rohan Gupta", "Tara Singh"],
     problemStatement:
       "Patients in low-resource clinics face long diagnostic delays due to a shortage of trained radiologists.",
     ideaSubmission:
       "Pulse is a lightweight on-device ML model that pre-screens chest X-rays for common conditions, flagging urgent cases for radiologist review.",
     githubRepo: "https://github.com/pulse-health/xray-screen",
     demoVideoUrl: "https://vimeo.com/192837465",
     presentationDeckName: "Pulse_Deck_Final.pdf",
     presentationDeckUrl: "#",
     status: "reviewed",
     score: 92,
   },
 ],
};
 
// ─────────────────────────────────────────────
// HELPERS — colored with real design tokens
// secondary (rose) = Reviewer's brand color, same family as the
// Reviewer Login button / "Innovation" hero text on the landing page
// tertiary (green) = same token Organizer uses, kept for "done/positive" states
// ─────────────────────────────────────────────
function HackathonStatusBadge({ status }: { status: HackathonStatus }) {
 const styles: Record<HackathonStatus, string> = {
   upcoming: "bg-tertiary/10 text-tertiary",
   judging: "bg-secondary/15 text-secondary",
   completed: "bg-surface-container-highest text-on-surface-variant",
 };
 const labels: Record<HackathonStatus, string> = {
   upcoming: "Upcoming",
   judging: "Judging Open",
   completed: "Completed",
 };
 return (
   <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold tracking-wide ${styles[status]}`}>
     {labels[status]}
   </span>
 );
}
 
function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
 return status === "reviewed" ? (
   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-tertiary/10 text-tertiary">
     <CheckCircle2 className="w-3.5 h-3.5" />
     Reviewed
   </span>
 ) : (
   <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-secondary/15 text-secondary">
     <Clock className="w-3.5 h-3.5" />
     Pending
   </span>
 );
}
 
// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
type View = "dashboard" | "submissions" | "detail";
 
export default function ReviewerDashboard() {
 const [view, setView] = useState<View>("dashboard");
 const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
 const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
 
 const [scoreInput, setScoreInput] = useState("");
 const [commentInput, setCommentInput] = useState("");
 
 const selectedHackathon = MOCK_HACKATHONS.find((h) => h.id === selectedHackathonId) || null;
 const submissionsForHackathon = selectedHackathonId ? MOCK_SUBMISSIONS[selectedHackathonId] || [] : [];
 const selectedSubmission = submissionsForHackathon.find((s) => s.id === selectedSubmissionId) || null;
 
 const openHackathon = (id: string) => {
   setSelectedHackathonId(id);
   setView("submissions");
 };
 
 const openSubmission = (id: string) => {
   setSelectedSubmissionId(id);
   setScoreInput("");
   setCommentInput("");
   setView("detail");
 };
 
 const backToDashboard = () => {
   setSelectedHackathonId(null);
   setSelectedSubmissionId(null);
   setView("dashboard");
 };
 
 const backToSubmissions = () => {
   setSelectedSubmissionId(null);
   setView("submissions");
 };
 
 const handleSubmitReview = () => {
   alert(`Review submitted — Score: ${scoreInput || "N/A"}`);
 };
 
 return (
   <div className="bg-background min-h-screen text-on-surface font-body-md relative">
     <style jsx global>{`
       .reviewer-hero-gradient {
         background: radial-gradient(circle at top right, #f2c3b933 0%, transparent 50%),
                     radial-gradient(circle at bottom left, #97b3ae22 0%, transparent 50%);
       }
     `}</style>
 
     {/* Decorative gradient backdrop, same family as landing page hero */}
     <div className="absolute inset-0 reviewer-hero-gradient pointer-events-none" />
 
     {/* Top bar */}
     <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50">
       <div className="flex items-center justify-between px-4 md:px-8 h-20 w-full max-w-[1280px] mx-auto">
         <div className="flex items-center gap-3">
           <span className="font-display-lg text-[22px] tracking-tight">
             Hack<span className="text-secondary">/OS</span>
           </span>
           <span className="hidden md:inline text-on-surface-variant text-[13px] ml-2 pl-3 border-l border-outline-variant/40">
             Reviewer Console
           </span>
         </div>
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
             <User className="w-4.5 h-4.5 text-secondary" />
           </div>
         </div>
       </div>
     </header>
 
     <main className="px-4 md:px-8 py-10 max-w-[1280px] mx-auto relative z-10">
       <AnimatePresence mode="wait">
         {/* ───────────── DASHBOARD VIEW ───────────── */}
         {view === "dashboard" && (
           <motion.div
             key="dashboard"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.3 }}
           >
             <div className="mb-10">
               <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide mb-4">
                 REVIEWER DASHBOARD
               </span>
               <h1 className="font-headline-md text-[28px] md:text-[32px] mb-2 tracking-tight">
                 Your Assigned Hackathons
               </h1>
               <p className="text-on-surface-variant text-[16px]">
                 Select a hackathon to review team submissions.
               </p>
             </div>
 
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {MOCK_HACKATHONS.map((h) => (
                 <button
                   key={h.id}
                   onClick={() => openHackathon(h.id)}
                   className="cursor-pointer text-left bg-white/80 backdrop-blur-xl rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group border border-white/50 hover:border-secondary/30"
                 >
                   <div className="flex items-start justify-between mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                       <Flag className="w-5 h-5 text-secondary" />
                     </div>
                     <HackathonStatusBadge status={h.status} />
                   </div>
                   <h3 className="font-headline-sm text-[20px] mb-2 group-hover:text-secondary transition-colors">
                     {h.name}
                   </h3>
                   <p className="text-on-surface-variant text-[14px] mb-6 leading-relaxed">
                     {h.description}
                   </p>
                   <div className="flex items-center justify-between text-[13px] text-on-surface-variant pt-4 border-t border-outline-variant/20">
                     <span className="flex items-center gap-1.5">
                       <Calendar className="w-4 h-4 text-tertiary" />
                       {h.date}
                     </span>
                     <span className="flex items-center gap-1.5">
                       <Users className="w-4 h-4 text-tertiary" />
                       {h.teamsCount} teams
                     </span>
                   </div>
                 </button>
               ))}
             </div>
           </motion.div>
         )}
 
         {/* ───────────── SUBMISSIONS LIST VIEW ───────────── */}
         {view === "submissions" && selectedHackathon && (
           <motion.div
             key="submissions"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.3 }}
           >
             <button
               onClick={backToDashboard}
               className="cursor-pointer flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors mb-6 text-[14px] font-medium"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to Dashboard
             </button>
 
             <div className="mb-8">
               <div className="flex items-center gap-3 mb-2 flex-wrap">
                 <h1 className="font-headline-md text-[28px] md:text-[32px] tracking-tight">{selectedHackathon.name}</h1>
                 <HackathonStatusBadge status={selectedHackathon.status} />
               </div>
               <p className="text-on-surface-variant text-[16px]">
                 {submissionsForHackathon.length} team{submissionsForHackathon.length !== 1 ? "s" : ""} submitted
               </p>
             </div>
 
             {submissionsForHackathon.length === 0 ? (
               <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/50">
                 <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                   <Inbox className="w-7 h-7 text-secondary/60" />
                 </div>
                 <p className="text-on-surface-variant">No submissions yet for this hackathon.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 gap-4">
                 {submissionsForHackathon.map((s) => (
                   <button
                     key={s.id}
                     onClick={() => openSubmission(s.id)}
                     className="cursor-pointer text-left bg-white/80 backdrop-blur-xl rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4 flex-wrap group border border-white/50 hover:border-secondary/30"
                   >
                     <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                         <Users className="w-5 h-5 text-tertiary" />
                       </div>
                       <div>
                         <h3 className="font-bold text-[17px] group-hover:text-secondary transition-colors">
                           {s.teamName}
                         </h3>
                         <p className="text-on-surface-variant text-[14px]">{s.members.join(", ")}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       {s.status === "reviewed" && s.score !== undefined && (
                         <span className="font-bold text-tertiary text-[16px]">{s.score}/100</span>
                       )}
                       <SubmissionStatusBadge status={s.status} />
                       <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 group-hover:text-secondary transition-all" />
                     </div>
                   </button>
                 ))}
               </div>
             )}
           </motion.div>
         )}
 
         {/* ───────────── SUBMISSION DETAIL VIEW ───────────── */}
         {view === "detail" && selectedSubmission && selectedHackathon && (
           <motion.div
             key="detail"
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.3 }}
           >
             <button
               onClick={backToSubmissions}
               className="cursor-pointer flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors mb-6 text-[14px] font-medium"
             >
               <ArrowLeft className="w-4 h-4" />
               Back to {selectedHackathon.name}
             </button>
 
             {/* Team header */}
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-6 flex items-center justify-between flex-wrap gap-4 border border-white/50">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                   <Users className="w-6 h-6 text-tertiary" />
                 </div>
                 <div>
                   <h1 className="font-headline-sm text-[24px] tracking-tight">{selectedSubmission.teamName}</h1>
                   <p className="text-on-surface-variant text-[14px]">
                     {selectedSubmission.members.join(" • ")}
                   </p>
                 </div>
               </div>
               <SubmissionStatusBadge status={selectedSubmission.status} />
             </div>
 
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Left: submission content */}
               <div className="lg:col-span-2 flex flex-col gap-6">
                 {/* 1. Problem Statement */}
                 <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                   <div className="flex items-center gap-2.5 mb-4">
                     <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                       <Flag className="w-4.5 h-4.5 text-secondary" />
                     </div>
                     <h2 className="font-headline-sm text-[18px]">Problem Statement</h2>
                   </div>
                   <p className="text-on-surface-variant leading-relaxed">
                     {selectedSubmission.problemStatement}
                   </p>
                 </section>
 
                 {/* 2. Idea Submission */}
                 <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                   <div className="flex items-center gap-2.5 mb-4">
                     <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
                       <Lightbulb className="w-4.5 h-4.5 text-tertiary" />
                     </div>
                     <h2 className="font-headline-sm text-[18px]">Idea Submission</h2>
                   </div>
                   <p className="text-on-surface-variant leading-relaxed">
                     {selectedSubmission.ideaSubmission}
                   </p>
                 </section>
 
                 {/* 3. GitHub Repository */}
                 <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                   <div className="flex items-center gap-2.5 mb-4">
                     <div className="w-9 h-9 rounded-xl bg-on-surface/10 flex items-center justify-center">
                       <Code2 className="w-4.5 h-4.5 text-on-surface" />
                     </div>
                     <h2 className="font-headline-sm text-[18px]">GitHub Repository</h2>
                   </div>
                   <a
                     href={selectedSubmission.githubRepo}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-5 py-3.5 hover:bg-surface-container transition-colors group border border-outline-variant/20"
                   >
                     <Link2 className="w-4.5 h-4.5 text-on-surface-variant flex-shrink-0" />
                     <span className="text-on-surface group-hover:text-secondary transition-colors truncate">
                       {selectedSubmission.githubRepo}
                     </span>
                   </a>
                 </section>
 
                 {/* 4. Demo Video */}
                 <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                   <div className="flex items-center gap-2.5 mb-4">
                     <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                       <PlayCircle className="w-4.5 h-4.5 text-secondary" />
                     </div>
                     <h2 className="font-headline-sm text-[18px]">Demo Video</h2>
                   </div>
                   <a
                     href={selectedSubmission.demoVideoUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-3 bg-secondary/10 rounded-2xl px-5 py-3.5 hover:bg-secondary/15 transition-colors group border border-secondary/10"
                   >
                     <PlayCircle className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                     <span className="text-on-surface group-hover:text-secondary transition-colors truncate">
                       {selectedSubmission.demoVideoUrl}
                     </span>
                   </a>
                 </section>
 
                 {/* 5. Presentation Deck */}
                 <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                   <div className="flex items-center gap-2.5 mb-4">
                     <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
                       <FileText className="w-4.5 h-4.5 text-tertiary" />
                     </div>
                     <h2 className="font-headline-sm text-[18px]">Presentation Deck</h2>
                   </div>
                   <a
                     href={selectedSubmission.presentationDeckUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-3 bg-tertiary/10 rounded-2xl px-5 py-3.5 hover:bg-tertiary/15 transition-colors group border border-tertiary/10"
                   >
                     <FileText className="w-4.5 h-4.5 text-tertiary flex-shrink-0" />
                     <span className="text-on-surface group-hover:text-tertiary transition-colors">
                       {selectedSubmission.presentationDeckName}
                     </span>
                   </a>
                 </section>
               </div>
 
               {/* Right: review panel */}
               <div className="lg:col-span-1">
                 <div className="bg-secondary-container rounded-3xl p-8 sticky top-28">
                   <h2 className="font-headline-sm text-[18px] text-on-secondary-container mb-6">
                     Submit Your Review
                   </h2>
 
                   <label className="block text-on-secondary-container/80 text-[14px] mb-2 font-medium">
                     Score (out of 100)
                   </label>
                   <input
                     type="number"
                     min={0}
                     max={100}
                     value={scoreInput}
                     onChange={(e) => setScoreInput(e.target.value)}
                     placeholder="e.g. 85"
                     className="w-full mb-5 px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-on-secondary-container/30"
                   />
 
                   <label className="block text-on-secondary-container/80 text-[14px] mb-2 font-medium">
                     Feedback / Comments
                   </label>
                   <textarea
                     value={commentInput}
                     onChange={(e) => setCommentInput(e.target.value)}
                     placeholder="Share feedback for the team..."
                     rows={5}
                     className="w-full mb-6 px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-on-secondary-container/30 resize-none"
                   />
 
                   <button
                     onClick={handleSubmitReview}
                     className="cursor-pointer w-full bg-on-secondary-container text-white px-6 py-3.5 rounded-xl font-bold text-[15px] hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5"
                   >
                     Submit Review
                   </button>
                 </div>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </main>
   </div>
 );
}
 