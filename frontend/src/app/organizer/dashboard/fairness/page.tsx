"use client";

import Link from "next/link";

const MOCK_BIAS_ALERTS = [
  {
    id: "b1",
    type: "GENDER_BIAS",
    severity: "high",
    title: "Significant Gender Scoring Discrepancy",
    description: "Mann-Whitney U test indicates a statistically significant difference (p=0.012) in scores between male-majority and female-majority teams in the 'Urban Tech' track.",
    metric: "p = 0.012",
    actionRequired: "Review track #4 scores manually."
  },
  {
    id: "b2",
    type: "REVIEWER_OUTLIER",
    severity: "medium",
    title: "Consistently Harsh Scoring",
    description: "Reviewer Dr. Sarah Jenkins is scoring 2.1 standard deviations below the mean for the 'Blockchain' category.",
    metric: "z = -2.1",
    actionRequired: "Trigger recalibration or normalize scores."
  },
  {
    id: "b3",
    type: "INSTITUTION_BIAS",
    severity: "low",
    title: "Slight Institutional Advantage",
    description: "Teams with members from 'Stanford University' are scoring marginally higher on average, but within acceptable variance (p=0.08).",
    metric: "p = 0.08",
    actionRequired: "Monitor for continuing trends."
  }
];

export default function FairnessDashboard() {
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
        <button className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-xl font-label-md hover:bg-primary-container/80 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Run Recalibration
        </button>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Overall Equity Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-green-600">92</span>
            <span className="text-body-md text-on-surface-variant">/ 100</span>
          </div>
          <p className="text-[12px] text-green-600 font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +3 points since last round
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
          <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Active Alerts</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display-lg text-error">1</span>
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
            <span className="text-4xl font-display-lg text-secondary">2</span>
          </div>
          <p className="text-[12px] text-secondary font-bold mt-2">|Z-score| &gt; 2.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Alerts Feed */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-headline-sm text-[24px] text-on-surface mb-4">Statistical Bias Alerts</h3>
          <div className="space-y-4">
            {MOCK_BIAS_ALERTS.map(alert => (
              <div key={alert.id} className={`bg-white rounded-3xl p-6 border-l-8 shadow-sm ${
                alert.severity === 'high' ? 'border-l-error' : 
                alert.severity === 'medium' ? 'border-l-secondary' : 'border-l-tertiary'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined p-2 rounded-xl ${
                      alert.severity === 'high' ? 'bg-error-container text-error' : 
                      alert.severity === 'medium' ? 'bg-secondary-container text-secondary' : 'bg-tertiary-container text-tertiary'
                    }`}>
                      {alert.type === 'GENDER_BIAS' ? 'wc' : alert.type === 'REVIEWER_OUTLIER' ? 'person_off' : 'account_balance'}
                    </span>
                    <div>
                      <h4 className="font-headline-sm text-[20px]">{alert.title}</h4>
                      <p className="text-[12px] uppercase tracking-wider text-outline font-bold mt-1">{alert.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="bg-surface-variant px-3 py-1 rounded-lg">
                    <span className="font-mono text-sm font-bold text-on-surface">{alert.metric}</span>
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant leading-relaxed mb-6">{alert.description}</p>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">engineering</span>
                    <span className="font-label-md text-on-surface">{alert.actionRequired}</span>
                  </div>
                  <button className="bg-surface-container-high hover:bg-surface-container-highest px-4 py-2 rounded-lg font-label-md text-on-surface transition-colors">
                    Take Action
                  </button>
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
              {/* Reviewer 1 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Dr. Jenkins</span>
                  <span className="text-error font-bold">-2.1</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div className="w-1/2 flex justify-end">
                    <div className="h-full bg-error rounded-l-full" style={{ width: '80%' }}></div>
                  </div>
                  <div className="w-1/2 border-l border-white"></div>
                </div>
              </div>
              {/* Reviewer 2 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Prof. Chen</span>
                  <span className="text-primary font-bold">+1.5</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div className="w-1/2 border-r border-white"></div>
                  <div className="w-1/2 flex justify-start">
                    <div className="h-full bg-primary rounded-r-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
              {/* Reviewer 3 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold">Alex Rivera</span>
                  <span className="text-tertiary font-bold">+0.2</span>
                </div>
                <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex">
                  <div className="w-1/2 border-r border-white"></div>
                  <div className="w-1/2 flex justify-start">
                    <div className="h-full bg-tertiary rounded-r-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
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
    </div>
  );
}
