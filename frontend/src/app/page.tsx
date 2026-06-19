"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
          <div className="font-display-lg text-[32px] md:text-[48px] text-primary dark:text-primary-fixed tracking-tight">HackFlow</div>
          <div className="hidden md:flex items-center gap-12">
            <Link href="#" className="text-primary font-bold border-b-2 border-primary pb-1 text-body-md">Features</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Solutions</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Pricing</Link>
            <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors text-body-md">Documentation</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/participant" className="hidden md:block text-on-surface-variant hover:text-primary transition-colors text-body-md font-medium">Participant Login</Link>
            <Link href="/auth/organizer">
              <button className="bg-tertiary text-white px-6 py-2.5 rounded-xl font-label-md hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md">
                Organizer Login
              </button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-32 md:pb-40 hero-gradient">
          <div className="absolute -top-24 -right-24 w-96 h-96 organic-shape-1 bg-secondary-container/30 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 organic-shape-1 bg-primary-container/20 blur-3xl"></div>
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop text-center relative z-10">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-label-sm mb-6">THE ULTIMATE HACKATHON OPERATING SYSTEM</span>
            <h1 className="font-display-lg text-[32px] md:text-[48px] max-w-4xl mx-auto mb-6 leading-tight">
              Architecting the Future of <span className="italic text-secondary">Innovation</span>
            </h1>
            <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed">
              HackFlow provides a tactile, professional-grade platform for organizing world-class hackathons with ease. From registration to real-time analytics.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/auth/participant">
                <button className="bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1">
                  Participant Login
                </button>
              </Link>
              <Link href="/auth/organizer">
                <button className="bg-white text-primary border-2 border-primary/10 px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1">
                  Organizer Login
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Countdown Timer */}
        <section className="py-12 bg-surface-container-low border-y border-outline-variant/20">
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop">
            <div className="flex flex-col items-center">
              <h3 className="font-label-sm text-on-surface-variant tracking-[0.2em] mb-6">NEXT GLOBAL SPRINT BEGINS IN</h3>
              <div className="flex gap-6 md:gap-12">
                <div className="text-center">
                  <span className="block font-headline-md md:text-5xl text-tertiary font-bold mb-2">{formatNumber(timeLeft.days)}</span>
                  <span className="font-label-sm text-on-surface-variant opacity-60">DAYS</span>
                </div>
                <div className="text-center">
                  <span className="block font-headline-md md:text-5xl text-tertiary font-bold mb-2">{formatNumber(timeLeft.hours)}</span>
                  <span className="font-label-sm text-on-surface-variant opacity-60">HOURS</span>
                </div>
                <div className="text-center">
                  <span className="block font-headline-md md:text-5xl text-tertiary font-bold mb-2">{formatNumber(timeLeft.minutes)}</span>
                  <span className="font-label-sm text-on-surface-variant opacity-60">MINUTES</span>
                </div>
                <div className="text-center">
                  <span className="block font-headline-md md:text-5xl text-tertiary font-bold mb-2">{formatNumber(timeLeft.seconds)}</span>
                  <span className="font-label-sm text-on-surface-variant opacity-60">SECONDS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-surface">
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

        {/* Statistics Section */}
        <section className="py-24 bg-surface-container">
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="p-6">
                <span className="block font-display-lg text-primary text-6xl md:text-7xl mb-2">500+</span>
                <span className="font-label-sm tracking-widest text-on-surface-variant uppercase">GLOBAL EVENTS</span>
              </div>
              <div className="p-6">
                <span className="block font-display-lg text-secondary text-6xl md:text-7xl mb-2">100k+</span>
                <span className="font-label-sm tracking-widest text-on-surface-variant uppercase">ACTIVE HACKERS</span>
              </div>
              <div className="p-6">
                <span className="block font-display-lg text-tertiary text-6xl md:text-7xl mb-2">$2M+</span>
                <span className="font-label-sm tracking-widest text-on-surface-variant uppercase">TOTAL PRIZES</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-surface">
          <div className="max-w-[1280px] mx-auto px-5 md:px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-[32px]">Trusted by Pioneers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Testimonial 1 */}
              <div className="p-12 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col gap-6 hover:border-primary/40 transition-colors">
                <p className="font-body-lg text-[18px] text-on-surface italic">"The editorial feel of HackFlow immediately set our event apart. It felt less like a tech conference and more like a high-end workshop. Our participants loved the clarity."</p>
                <div className="flex items-center gap-6 mt-auto">
                  <img className="w-14 h-14 rounded-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDecfe9YPIg6_PBpgbIgbVBxrs3Nn8e-UBFd1emjk8WuI4f1UDTl9oFUPeYeZ3NpRESyTVYlkp5eTf3cVnmbeAF8qUGRNKuA140uBlIprztTkATMID3f_MY0D5m7GykFNGqr-wDW_oKVRPgy8xhsogyhKPIiVdhNhtYyfLoSNI4wXkCZ5jP17hzitLWW8OFN2NOA6O6DA0icVfW6caKzyc9w-YT1_pTeEF821f_dc_qlpaMi45_0Vct6rKSATZLWM2b38qfRAHzROw" alt="Elena Vance" />
                  <div>
                    <h4 className="font-label-md text-on-surface">Elena Vance</h4>
                    <p className="text-label-sm text-on-surface-variant">Director, Lumina Hack</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-12 rounded-3xl border border-outline-variant/30 bg-surface flex flex-col gap-6 hover:border-secondary/40 transition-colors">
                <p className="font-body-lg text-[18px] text-on-surface italic">"Seamless from start to finish. The real-time analytics allowed us to identify roadblocks in teams within minutes rather than hours. Truly architected for success."</p>
                <div className="flex items-center gap-6 mt-auto">
                  <img className="w-14 h-14 rounded-full object-cover bg-surface-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJyI5lPLqUfyDK1D_xKuI4DsIbxGIdMlzCqmpEDw7skscPS4N_0N13d_K6HOjnx4vWLsWfiw14QGWAf_4y2R_2zralWVCHCVLYkYLFFqcJS6OcdVG5K0DqIoI-0ze8BrzCPweCvxD-5Gmh1ayj3U2OV7KdvuxPg0yByVY_fsiZ7kB5rDLd91Z4GgkhGfsS5t048rgO5NC4RmWhSp8IMAFEsaXT0FB6D8T3osFOyhcplCWwYaYW52t48Q6CmT7_xPAGJ9kOygv4_IE" alt="Marcus Chen" />
                  <div>
                    <h4 className="font-label-md text-on-surface">Marcus Chen</h4>
                    <p className="text-label-sm text-on-surface-variant">Lead Organizer, DevSprint Int'l</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-surface relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <div className="bg-surface-container-highest p-16 rounded-[48px] border border-outline-variant/20 shadow-2xl">
              <h2 className="font-display-lg text-[32px] md:text-[48px] mb-6">Ready to build?</h2>
              <p className="font-body-lg text-[18px] text-on-surface-variant mb-12">Join the thousands of organizers who have upgraded to a more sophisticated way of hacking.</p>
              <button className="bg-primary text-white px-12 py-5 rounded-full font-label-md text-lg hover:bg-on-primary-container transition-all duration-300">Start for Free</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-high border-t border-outline-variant/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-5 md:px-margin-desktop py-12 max-w-[1280px] mx-auto">
          <div className="col-span-1 md:col-span-1">
            <div className="font-display-lg text-[24px] text-primary dark:text-primary-fixed mb-3">HackFlow</div>
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
          <p className="text-on-surface-variant text-[12px] opacity-60">© 2024 HackFlow. End-to-End Hackathon Management Platform.</p>
        </div>
      </footer>
    </div>
  );
}
