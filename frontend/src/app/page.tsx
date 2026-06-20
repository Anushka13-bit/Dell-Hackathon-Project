"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    const target = new Date("2024-12-31T23:59:59").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const gap = target - now;

      if (gap <= 0) return;

      const second = 1000;
      const minute = second * 60;
      const hour = minute * 60;
      const day = hour * 24;

      setTimeLeft({
        days: Math.floor(gap / day),
        hours: Math.floor((gap % day) / hour),
        minutes: Math.floor((gap % hour) / minute),
        seconds: Math.floor((gap % minute) / second),
      });
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container scroll-smooth">
      <style jsx global>{`
        .organic-shape-1 {
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }
        .hero-gradient {
          background: radial-gradient(circle at top right, #f2c3b933 0%, transparent 50%),
                      radial-gradient(circle at bottom left, #97b3ae22 0%, transparent 50%);
        }
      `}</style>

      {/* TopNavBar */}
      <header className="bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 dark:border-outline/20 docked full-width top-0 sticky z-50">
        <nav className="flex justify-between items-center px-5 md:px-margin-desktop h-20 w-full max-w-[1280px] mx-auto">
          <Link href="/" className="flex items-center mt-1">
            <Image src="/logo.png" alt="HackOS" width={840} height={240} className="h-60 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center gap-12">
            <Link href="#features" className="text-on-surface-variant hover:text-primary font-bold pb-1 text-body-md transition-colors">Features</Link>
            <Link href="/solutions" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Solutions</Link>
            <Link href="/documentation" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Documentation</Link>
          </div>
          <div className="flex items-center gap-4 md:-mr-10 lg:-mr-16">
            <Link href="/auth/participant" className="hidden md:block">
              <button className="cursor-pointer text-on-surface-variant hover:text-primary transition-colors text-body-md font-medium px-2 py-2.5">
                Participant Login
              </button>
            </Link>

            <div className="hidden md:block w-px h-6 bg-outline-variant/50 mx-2"></div>

            <Link href="/auth/organizer">
              <button className="cursor-pointer bg-[rgb(73,99,95)] text-white px-6 py-2.5 rounded-xl font-label-md hover:bg-[rgb(63,89,85)] transition-all duration-300 shadow-sm hover:shadow-md">
                Organizer Login
              </button>
            </Link>

            <Link href="/auth/reviewer" className="hidden md:block">
              <button className="cursor-pointer border-2 border-secondary text-secondary px-5 py-2 rounded-xl font-label-md hover:bg-secondary/10 transition-all duration-300">
                Reviewer Login
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-32 md:pb-40 hero-gradient">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -top-24 -right-24 w-96 h-96 organic-shape-1 bg-secondary-container/30 blur-3xl"></motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute -bottom-24 -left-24 w-80 h-80 organic-shape-1 bg-primary-container/20 blur-3xl"></motion.div>
          
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop text-center relative z-10">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-label-sm mb-6">
              THE ULTIMATE HACKATHON OPERATING SYSTEM
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display-lg text-[32px] md:text-[48px] max-w-4xl mx-auto mb-6 leading-tight">
              Architecting the Future of <span className="italic text-secondary">Innovation</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
              HackOS provides a tactile, professional-grade platform for organizing world-class hackathons with ease. From registration to real-time analytics.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <button 
                onClick={() => setShowRoleModal(true)} 
                className="bg-primary text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </section>


        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-surface">
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop">
            <div className="mb-20 max-w-2xl">
              <h2 className="font-headline-md text-[32px] mb-3">Curated Tools for Excellence</h2>
              <p className="text-on-surface-variant text-[16px]">We believe in a frictionless experience where organizers can focus on the talent, not the logistics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Smart Judging */}
              <div className="md:col-span-7 bg-surface-container-high rounded-3xl p-12 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-4xl text-primary mb-6">balance</span>
                  <h3 className="font-headline-sm text-[24px] mb-3">Smart Judging</h3>
                  <p className="text-on-surface-variant max-w-md">Automated weighted scoring and double-blind review protocols designed for integrity and speed.</p>
                </div>
                <div className="mt-12 relative h-48 rounded-2xl overflow-hidden bg-surface shadow-inner">
                  <img className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMAsSgCznLRLyRc_fsv9D60MNEiB1NoyCLgODfJzYEMfBSyQmF0suiujVC4X84s5YRAMu1p8DX1sPvz4r6CkZcrtAtNuSi1SWO5SYm032CYpHywCDwlrn2m00erFBD3UvaNte4_T-xDl7pkp9DNVZWMb9GzQliQg1oDdd5JthfOHj_5vv4yz0G1RgHn_PiGwXG-Dk_Hk4GhNgHMAtBbf_hPs37yMBfdRJhEPD7EESunj-4zSDSTqUOYJm1nwFnmaOu0-k4tMae1PQ" alt="Dashboard UI" />
                </div>
              </div>

              {/* Seamless Registration */}
              <div className="md:col-span-5 bg-secondary-container rounded-3xl p-12 flex flex-col group hover:shadow-xl transition-all duration-500">
                <span className="material-symbols-outlined text-4xl text-secondary mb-6">assignment_ind</span>
                <h3 className="font-headline-sm text-[24px] mb-3">Seamless Registration</h3>
                <p className="text-on-surface-variant mb-12">Collect RSVPs, build teams, and manage dietary requirements through an editorial-style interface.</p>
                <div className="space-y-2 mb-8">
  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[16px]">check_circle</span>
    <span className="text-sm">AI Skill Matching</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[16px]">check_circle</span>
    <span className="text-sm">Instant Team Formation</span>
  </div>

  <div className="flex items-center gap-2">
    <span className="material-symbols-outlined text-[16px]">check_circle</span>
    <span className="text-sm">Verified Participants</span>
  </div>
</div>
     
                <div className="mt-auto pt-12 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/50 border border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <span className="font-label-md">Verified Hackers Only</span>
                </div>
              </div>

              {/* Real-time Analytics */}
              <div className="md:col-span-12 bg-primary-container rounded-3xl p-12 grid md:grid-cols-2 gap-12 items-center group hover:shadow-xl transition-all duration-500">
                <div>
                  <span className="material-symbols-outlined text-4xl text-on-primary-container mb-6">query_stats</span>
                  <h3 className="font-headline-sm text-[24px] mb-3">Real-time Analytics</h3>
                  <p className="text-on-primary-container/80 mb-12">Live dashboards showing participant activity, submission heatmaps, and mentor responsiveness as they happen.</p>
                  <button className="bg-on-primary-container text-white px-6 py-2 rounded-xl font-label-md transition-transform active:scale-95">Explore Dashboards</button>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-64 border border-white/20">
                  <div className="flex items-end gap-2 h-full justify-between">
                    <div className="w-full bg-on-primary-container/20 rounded-t-lg transition-all duration-1000" style={{ height: "40%" }}></div>
                    <div className="w-full bg-on-primary-container/40 rounded-t-lg transition-all duration-1000" style={{ height: "60%" }}></div>
                    <div className="w-full bg-on-primary-container/60 rounded-t-lg transition-all duration-1000" style={{ height: "85%" }}></div>
                    <div className="w-full bg-on-primary-container/80 rounded-t-lg transition-all duration-1000" style={{ height: "70%" }}></div>
                    <div className="w-full bg-on-primary-container/90 rounded-t-lg transition-all duration-1000" style={{ height: "95%" }}></div>
                    <div className="w-full bg-on-primary-container/50 rounded-t-lg transition-all duration-1000" style={{ height: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role Selection Modal */}
        <AnimatePresence>
          {showRoleModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
              onClick={() => setShowRoleModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface w-full max-w-2xl rounded-[32px] p-10 md:p-14 shadow-2xl relative border border-outline-variant/20"
              >
                <button 
                  onClick={() => setShowRoleModal(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-highest flex items-center justify-center transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
                
                <h2 className="text-[32px] md:text-[40px] font-bold text-center mb-4 text-on-surface">Choose your path</h2>
                <p className="text-center text-on-surface-variant mb-12 text-[18px]">Are you here to build something amazing, or organize the next big event?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Link href="/auth/participant" className="group">
                    <div className="h-full border-2 border-outline-variant/30 hover:border-primary rounded-3xl p-8 transition-all hover:bg-primary/5 hover:shadow-lg flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[40px] text-primary">code_blocks</span>
                      </div>
                      <h3 className="text-[24px] font-bold mb-3 text-on-surface group-hover:text-primary transition-colors">Participant</h3>
                      <p className="text-on-surface-variant leading-relaxed">Join hackathons, form teams, and showcase your skills to the world.</p>
                    </div>
                  </Link>
                  
                  <Link href="/auth/organizer" className="group">
                    <div className="h-full border-2 border-outline-variant/30 hover:border-[rgb(73,99,95)] rounded-3xl p-8 transition-all hover:bg-[rgb(73,99,95)]/10 hover:shadow-lg flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-[rgb(73,99,95)]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[40px] text-[rgb(73,99,95)]">event_available</span>
                      </div>
                      <h3 className="text-[24px] font-bold mb-3 text-on-surface group-hover:text-[rgb(73,99,95)] transition-colors">Organizer</h3>
                      <p className="text-on-surface-variant leading-relaxed">Host events, review submissions, and manage the entire hackathon lifecycle.</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-high border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-5 md:px-margin-desktop py-12 max-w-[1280px] mx-auto">
          <div className="col-span-1 md:col-span-1">
            <Image src="/logo.png" alt="HackOS" width={720} height={204} className="h-[204px] w-auto object-contain mb-4" />
            <p className="text-on-surface-variant text-[16px] leading-relaxed opacity-80">
              End-to-End Hackathon Management Platform
            </p>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface mb-3">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Solutions</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Documentation</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface mb-3">Support</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Support</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Contact Us</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Cookie Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface mb-3">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Privacy Policy</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-[16px] hover:translate-x-1 inline-block duration-200">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant/10 py-6 text-center max-w-[1280px] mx-auto">
          <p className="text-on-surface-variant text-[12px] opacity-60">© 2024 HackOS. End-to-End Hackathon Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
