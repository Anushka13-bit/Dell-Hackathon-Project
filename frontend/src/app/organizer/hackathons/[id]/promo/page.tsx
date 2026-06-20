"use client";

import { useState } from "react";
import { use } from "react";

export default function PromoToolsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hackathonId = resolvedParams.id || "winter-2024";

  const [isLoadingPromo, setIsLoadingPromo] = useState(false);
  const [promoContent, setPromoContent] = useState<any>(null);

  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportContent, setReportContent] = useState<any>(null);

  const handleGeneratePromo = async () => {
    setIsLoadingPromo(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizer/generate-promo/${hackathonId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPromoContent(data);
      } else {
        alert("Failed to generate promo content");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating promo content");
    } finally {
      setIsLoadingPromo(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsLoadingReport(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/organizer/generate-success-report/${hackathonId}`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setReportContent(data);
      } else {
        alert("Failed to generate report");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating report");
    } finally {
      setIsLoadingReport(false);
    }
  };

  return (
    <div className="px-8 py-10 max-w-[1280px] mx-auto min-h-screen space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Promo Generator Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[24px] font-bold font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">campaign</span>
                Social Media Promotions
              </h2>
              <p className="text-on-surface-variant text-[14px] mt-2">
                Generate high-converting social media posts and email drafts customized to this hackathon's theme and problem statements.
              </p>
            </div>
            <button
              onClick={handleGeneratePromo}
              disabled={isLoadingPromo}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-[14px] flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isLoadingPromo ? "hourglass_top" : "magic_button"}
              </span>
              {isLoadingPromo ? "Drafting..." : "Generate Drafts"}
            </button>
          </div>

          {promoContent && (
            <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 flex-grow overflow-y-auto max-h-[500px]">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">Twitter / X</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {promoContent.twitter}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">LinkedIn</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {promoContent.linkedin}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">Email Newsletter</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {promoContent.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pitch Deck Generator Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-[24px] font-bold font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">presentation</span>
                Success Report & Pitch
              </h2>
              <p className="text-on-surface-variant text-[14px] mt-2">
                Generate an executive summary and sponsor-facing pitch deck script using live registration, submission, and team statistics.
              </p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isLoadingReport}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-[14px] flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isLoadingReport ? "hourglass_top" : "magic_button"}
              </span>
              {isLoadingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {reportContent && (
            <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 flex-grow overflow-y-auto max-h-[500px]">
               <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">Executive Summary</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {reportContent.executive_summary}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">Sponsor Pitch</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {reportContent.sponsor_pitch}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[14px] uppercase text-outline mb-2">Key Metrics Highlights</h3>
                  <div className="bg-white p-4 rounded border border-outline-variant/20 whitespace-pre-wrap text-[14px] font-medium text-on-surface">
                    {reportContent.metrics_highlights?.map((m: string, i: number) => (
                      <div key={i}>• {m}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
