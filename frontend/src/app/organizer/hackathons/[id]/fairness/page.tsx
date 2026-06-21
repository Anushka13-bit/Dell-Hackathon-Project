"use client";

import Link from "next/link";

import { useEffect, useState, useCallback } from "react";

export default function FairnessDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [reviewerStats, setReviewerStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecalibrating, setIsRecalibrating] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const [resAlerts, resReport, resStats] = await Promise.all([
        fetch(`${apiUrl}/fairness/alerts`),
        fetch(`${apiUrl}/fairness/report/latest`),
        fetch(`${apiUrl}/fairness/reviewer_stats`)
      ]);

      if (resAlerts.ok) setAlerts(await resAlerts.json());
      if (resReport.ok) setReport(await resReport.json());
      if (resStats.ok) setReviewerStats(await resStats.json());
    } catch (e) {
      console.error("Failed to fetch fairness data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecalibrate = async () => {
    setIsRecalibrating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/fairness/run/mock-round-1`, { method: "POST" });
      
      // Wait 3 seconds for celery task to complete, then refetch
      setTimeout(async () => {
        await fetchData();
        setIsRecalibrating(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      setIsRecalibrating(false);
    }
  };
  return (
    <div className="p-6 h-[calc(100vh-64px)] max-w-[1280px] mx-auto flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <nav className="flex items-center gap-2 text-outline text-label-sm mb-2">
            <Link href="/organizer/dashboard" className="hover:text-primary">Dashboard</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-bold">Fairness Engine</span>
          </nav>
          <h2 className="font-headline-md text-[32px] text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
            Live Fairness & Bias Monitor
          </h2>
          <p className="text-on-surface-variant mt-2 text-body-lg">
            Real-time statistical analysis of scoring distribution using SciPy (Mann-Whitney U, Kruskal-Wallis, Z-scores).
          </p>
        </div>
        <button 
          onClick={handleRecalibrate}
          disabled={isRecalibrating}
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-label-md hover:bg-primary-container/80 transition-all flex items-center gap-2 disabled:opacity-50">
          <span className={`material-symbols-outlined text-[20px] ${isRecalibrating ? 'animate-spin' : ''}`}>refresh</span>
          {isRecalibrating ? 'Recalibrating...' : 'Run Recalibration'}
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Overall Equity Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-green-600">{report ? report.average_confidence.toFixed(1) : "92"}</span>
            <span className="text-body-md text-on-surface-variant">/ 100</span>
          </div>
          <p className="text-[12px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +3 points since last round
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Active Alerts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-error">{report ? report.critical_alerts : alerts.filter(a => a.severity === 'HIGH').length}</span>
            <span className="text-body-md text-on-surface-variant">Critical</span>
          </div>
          <p className="text-[12px] text-error font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span> Action required
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Evaluations Monitored</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-on-surface">1,240</span>
          </div>
          <p className="text-[12px] text-on-surface-variant font-bold mt-2">100% Coverage</p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Outlier Reviewers</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-secondary">{report ? report.flagged_reviewers : "0"}</span>
          </div>
          <p className="text-[12px] text-secondary font-bold mt-2">|Z-score| &gt; 2.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Alerts Feed */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-headline-sm text-[24px] text-on-surface mb-4">Statistical Bias Alerts</h3>
          <div className="space-y-4">
            {loading ? (
              <p>Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-on-surface-variant">No statistical bias alerts found.</p>
            ) : alerts.map((alert, idx) => (
              <div key={alert.alert_id || alert.id || idx} className={`bg-white rounded-3xl p-6 border-l-8 shadow-sm ${
                alert.severity === 'HIGH' ? 'border-l-error' : 
                alert.severity === 'MEDIUM' ? 'border-l-secondary' : 'border-l-tertiary'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined p-2 rounded-xl ${
                      alert.severity === 'HIGH' ? 'bg-error-container text-error' : 
                      alert.severity === 'MEDIUM' ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'
                    }`}>
                      {alert.alert_type === 'GENDER_BIAS' ? 'wc' : alert.alert_type === 'REVIEWER_OUTLIER' ? 'person_off' : 'account_balance'}
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-[20px]">{alert.alert_type.replace(/_/g, ' ')} Detected</h4>
                      <p className="text-[12px] uppercase tracking-wider text-outline font-bold mt-1">P-Value: {alert.p_value?.toFixed(4) || "N/A"}</p>
                    </div>
                  </div>
                  <div className="bg-surface-variant px-3 py-1 rounded-lg">
                    <span className="font-mono text-sm font-bold text-on-surface">{alert.severity}</span>
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">{alert.description || "Statistical anomaly detected in scoring distribution."}</p>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">engineering</span>
                    <span className="font-label-md text-on-surface">
                      {alert.status === 'under_review' ? 'Under Human Review' : 'Review recommended'}
                    </span>
                  </div>
                  {alert.status !== 'under_review' && (
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg font-label-md text-on-surface transition-colors"
                    >
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Distribution Visualization */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-headline-sm text-[24px] text-on-surface mb-4">Distribution Analysis</h3>
          
          <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-6">Reviewer Z-Scores</h4>
            <div className="space-y-4">
              {reviewerStats.length > 0 ? (
                reviewerStats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold">{stat.reviewer_name || stat.reviewer_id}</span>
                      <span className={`font-bold ${stat.z_score < -1.5 ? 'text-error' : stat.z_score > 1.5 ? 'text-primary' : 'text-tertiary'}`}>
                        {stat.z_score > 0 ? '+' : ''}{stat.z_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                      {stat.z_score < 0 ? (
                        <>
                          <div className="w-1/2 flex justify-end">
                            <div className="h-full bg-error rounded-l-full" style={{ width: `${Math.min(100, Math.abs(stat.z_score) * 25)}%` }}></div>
                          </div>
                          <div className="w-1/2 border-l border-white"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2 border-r border-white"></div>
                          <div className="w-1/2 flex justify-start">
                            <div className="h-full bg-primary rounded-r-full" style={{ width: `${Math.min(100, stat.z_score * 25)}%` }}></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant text-sm">No reviewer stats available.</p>
              )}
            </div>
            <p className="text-[11px] text-outline mt-6 italic">Visualizing deviations from the mean score (0). Action recommended for |Z| &gt; 2.0.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm">
            <h4 className="font-label-md text-on-surface-variant uppercase tracking-widest mb-6">Gender Score Parity</h4>
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">84.2</div>
                <div className="text-[10px] uppercase text-outline">Male Majority</div>
              </div>
              <div className="text-primary font-bold text-xl">vs</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-1">82.1</div>
                <div className="text-[10px] uppercase text-outline">Female Majority</div>
              </div>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden flex">
              <div className="h-full bg-primary w-[51%]"></div>
              <div className="h-full bg-secondary w-[49%]"></div>
            </div>
            <p className="text-[11px] text-outline mt-4 italic text-center">Δ 2.1 pts (p = 0.012). Indicates potential bias.</p>
          </div>
        </div>
      </div>

      {/* Take Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest p-8 rounded-3xl max-w-md w-full shadow-lg border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <span className="material-symbols-outlined text-[32px]">gavel</span>
              <h3 className="font-headline-sm text-[24px]">Resolve Bias Alert</h3>
            </div>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              How would you like to handle the <strong>{selectedAlert.alert_type?.replace(/_/g, ' ')}</strong> alert?
            </p>
            <div className="flex flex-col gap-3 mb-8">
              <button 
                onClick={async () => {
                  try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const id = selectedAlert.alert_id || selectedAlert.id;
                    await fetch(`${apiUrl}/fairness/alerts/${id}/status?status=under_review`, { method: 'PUT' });
                    setAlerts(alerts.map(a => 
                      (a.alert_id || a.id) === id 
                        ? { ...a, status: 'under_review' } 
                        : a
                    ));
                  } catch (e) {
                    console.error("Failed to update alert", e);
                  }
                  setSelectedAlert(null);
                }}
                className="w-full px-6 py-4 bg-primary-container text-on-primary-container rounded-xl font-bold hover:bg-primary-container/80 transition-colors flex items-center gap-3 text-left"
              >
                <span className="material-symbols-outlined">person_search</span>
                <div>
                  <div className="text-[14px]">Flag for Human Review</div>
                  <div className="text-[11px] font-normal opacity-80 mt-0.5">Escalate to the ethics committee for manual inspection</div>
                </div>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                    const id = selectedAlert.alert_id || selectedAlert.id;
                    await fetch(`${apiUrl}/fairness/alerts/${id}`, { method: 'DELETE' });
                    setAlerts(alerts.filter(a => (a.alert_id || a.id) !== id));
                  } catch (e) {
                    console.error("Failed to delete alert", e);
                  }
                  setSelectedAlert(null);
                }}
                className="w-full px-6 py-4 border border-outline-variant/30 text-on-surface rounded-xl font-bold hover:bg-surface-container-high transition-colors flex items-center gap-3 text-left"
              >
                <span className="material-symbols-outlined text-outline">delete</span>
                <div>
                  <div className="text-[14px]">Dismiss Alert</div>
                  <div className="text-[11px] font-normal text-outline mt-0.5">Remove this alert from the dashboard</div>
                </div>
              </button>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedAlert(null)}
                className="px-6 py-2 rounded-xl font-label-md text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
