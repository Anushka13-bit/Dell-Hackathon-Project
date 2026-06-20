"use client";

import { useMemo, useState } from "react";
import {
  type Decision,
  computeWeightedScore,
  decisionClasses,
  decisionLabels,
  faceScanLabels,
  filterRegistrations,
  getRegistrationMetrics,
  getScoreBarClass,
  getScoreClass,
  hasHardInvariant,
  toPercent,
  type RegistrationCase,
} from "./registrationIntelligenceModel";

function MetricCard({
  icon,
  label,
  value,
  note,
  tone = "primary",
}: {
  icon: string;
  label: string;
  value: string;
  note: string;
  tone?: "primary" | "tertiary" | "error" | "secondary";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    tertiary: "bg-tertiary-fixed/70 text-tertiary",
    error: "bg-error-container text-error",
    secondary: "bg-secondary-container/50 text-secondary",
  };

  return (
    <div className="bg-white rounded-[24px] border border-outline-variant/30 p-6 shadow-[0_20px_30px_-10px_rgba(214,203,191,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </div>
        <span className="text-[12px] font-bold text-on-surface-variant">{note}</span>
      </div>
      <p className="mt-5 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-[32px] font-bold text-on-surface leading-none">{value}</p>
    </div>
  );
}

function SignalPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        active
          ? "border-error/25 bg-error-container text-on-error-container"
          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">
        {active ? "priority_high" : "remove"}
      </span>
      {label}
    </span>
  );
}

function SimilarityBar({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-[13px] font-bold text-on-surface">{label}</p>
          <p className="text-[12px] text-on-surface-variant">{detail}</p>
        </div>
        <span className={`text-[14px] font-bold ${getScoreClass(value)}`}>{toPercent(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-outline-variant/30 overflow-hidden">
        <div
          className={`h-full rounded-full ${getScoreBarClass(value)}`}
          style={{ width: toPercent(value) }}
        />
      </div>
    </div>
  );
}

function PipelineStage({
  index,
  title,
  body,
  latency,
  state,
}: {
  index: number;
  title: string;
  body: string;
  latency: string;
  state: "pass" | "review" | "block" | "skip";
}) {
  const stateClasses = {
    pass: "bg-primary text-on-primary",
    review: "bg-tertiary text-on-tertiary",
    block: "bg-error text-on-error",
    skip: "bg-outline-variant text-on-surface-variant",
  };

  return (
    <div className="relative flex gap-4">
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${stateClasses[state]}`}
      >
        {index}
      </div>
      <div className="min-w-0 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-bold text-on-surface">{title}</p>
          <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[11px] font-bold text-on-surface-variant">
            {latency}
          </span>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

function ThresholdBand({ selectedScore }: { selectedScore: number }) {
  const markerPosition = `${Math.min(Math.max(selectedScore * 100, 0), 100)}%`;

  return (
    <div className="rounded-[24px] border border-outline-variant/30 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-bold text-on-surface">Decision thresholds</p>
          <p className="text-[12px] text-on-surface-variant">From PRD section 9.2 stage 6.</p>
        </div>
        <span className={`text-[18px] font-bold ${getScoreClass(selectedScore)}`}>
          {toPercent(selectedScore)}
        </span>
      </div>
      <div className="relative h-12">
        <div className="absolute top-5 flex h-3 w-full overflow-hidden rounded-full">
          <div className="w-[70%] bg-primary" />
          <div className="w-[15%] bg-tertiary" />
          <div className="w-[15%] bg-error" />
        </div>
        <div
          className="absolute top-1 h-10 w-0.5 rounded-full bg-on-surface"
          style={{ left: markerPosition }}
        >
          <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-on-surface" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[11px] font-bold text-on-surface-variant">
        <span>0.00-0.69 Accept</span>
        <span>0.70-0.84 Review</span>
        <span>0.85+ Block</span>
      </div>
    </div>
  );
}

export default function RegistrationIntelligenceModule({
  title = "Registration Intelligence",
  subtitle = "Review duplicate-risk decisions, FaceScan status, and explainable registration pipeline signals.",
  initialRegistrations = [],
}: {
  title?: string;
  subtitle?: string;
  initialRegistrations?: RegistrationCase[];
}) {
  const [selectedId, setSelectedId] = useState(initialRegistrations[0]?.id);
  const [decisionFilter, setDecisionFilter] = useState<"ALL" | Decision>("ALL");
  const [query, setQuery] = useState("");

  const selected = initialRegistrations.find((item) => item.id === selectedId) ?? initialRegistrations[0];
  const selectedHardStop = selected ? hasHardInvariant(selected) : false;
  const weightedScore = selected ? computeWeightedScore(selected) : 0;

  const filteredRegistrations = useMemo(
    () => filterRegistrations(initialRegistrations, decisionFilter, query),
    [initialRegistrations, decisionFilter, query]
  );
  const {
    autoApprovedCount,
    manualReviewCount,
    duplicateCount,
    faceScanReviewCount,
  } = getRegistrationMetrics(initialRegistrations);

  if (!selected) {
    return (
      <div className="mx-auto w-full max-w-[1500px] p-8 text-center text-on-surface-variant">
        No registrations found.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] p-8">
      <section className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[12px] font-bold uppercase tracking-widest text-primary">
            PRD Section 9
          </p>
          <h1 className="font-headline-md text-[32px] font-bold text-on-surface">{title}</h1>
          <p className="mt-2 max-w-3xl text-[16px] leading-relaxed text-on-surface-variant">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-outline-variant bg-white px-4 py-2 text-[13px] font-bold text-on-surface-variant hover:border-primary hover:text-primary">
            Export review queue
          </button>
          <button className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-on-primary shadow-sm hover:bg-primary/90">
            Run duplicate scan
          </button>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="how_to_reg"
          label="Processed this hour"
          value="1,240"
          note="187/min"
        />
        <MetricCard
          icon="task_alt"
          label="Auto-approved"
          value={String(autoApprovedCount)}
          note="Score below 0.70"
          tone="primary"
        />
        <MetricCard
          icon="pending_actions"
          label="Manual review"
          value={String(manualReviewCount)}
          note="0.70-0.84"
          tone="tertiary"
        />
        <MetricCard
          icon="report"
          label="Duplicate blocks"
          value={String(duplicateCount)}
          note={`${faceScanReviewCount} FaceScan reviews`}
          tone="error"
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[24px] border border-outline-variant/30 bg-surface-container p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-full border border-outline-variant bg-white py-2.5 pl-10 pr-4 text-[13px] font-medium outline-none focus:border-primary"
                placeholder="Search name, email, college, GitHub, or decision"
                type="text"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(["ALL", "AUTO_APPROVED", "MANUAL_REVIEW", "POTENTIAL_DUPLICATE", "HARD_DUPLICATE"] as const).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setDecisionFilter(filter)}
                    className={`rounded-full border px-3 py-2 text-[12px] font-bold transition-colors ${
                      decisionFilter === filter
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-white text-on-surface-variant hover:border-primary hover:text-primary"
                    }`}
                  >
                    {filter === "ALL" ? "All" : decisionLabels[filter]}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-outline-variant/30 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-on-surface">Demo accuracy panel</p>
              <p className="text-[12px] text-on-surface-variant">
                Based on `mock_data_generator.py` curated duplicate pairs.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-primary">1.00</p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                F1 score
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-surface-container-low p-3">
              <p className="text-[18px] font-bold text-on-surface">5/5</p>
              <p className="text-[11px] font-bold text-on-surface-variant">TP</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-3">
              <p className="text-[18px] font-bold text-on-surface">0</p>
              <p className="text-[11px] font-bold text-on-surface-variant">FP</p>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-3">
              <p className="text-[18px] font-bold text-on-surface">0</p>
              <p className="text-[11px] font-bold text-on-surface-variant">FN</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 overflow-hidden rounded-[24px] border border-outline-variant/30 bg-white shadow-[0_20px_30px_-10px_rgba(214,203,191,0.35)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low">
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Participant
                  </th>
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Hard invariants
                  </th>
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Similarity
                  </th>
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    FaceScan
                  </th>
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Score
                  </th>
                  <th className="px-5 py-4 text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Decision
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {filteredRegistrations.map((registration) => {
                  const isSelected = selected.id === registration.id;

                  return (
                    <tr
                      key={registration.id}
                      onClick={() => setSelectedId(registration.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setSelectedId(registration.id);
                        }
                      }}
                      tabIndex={0}
                      className={`cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        isSelected ? "bg-primary/5" : "hover:bg-surface-container-lowest"
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[13px] font-bold ${
                              isSelected
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface"
                            }`}
                          >
                            {registration.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold text-on-surface">
                              {registration.name}
                            </p>
                            <p className="truncate text-[12px] text-on-surface-variant">
                              {registration.email}
                            </p>
                            <p className="truncate text-[12px] text-on-surface-variant">
                              {registration.college}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <SignalPill active={registration.exactSignals.email} label="Email" />
                          <SignalPill active={registration.exactSignals.phone} label="Phone" />
                          <SignalPill active={registration.exactSignals.github} label="GitHub" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[12px] font-bold text-on-surface-variant">
                              Name
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-outline-variant/30">
                              <div
                                className="h-full bg-primary"
                                style={{ width: toPercent(registration.similarity.name) }}
                              />
                            </div>
                            <span className="text-[12px] font-bold text-on-surface">
                              {toPercent(registration.similarity.name)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-16 text-[12px] font-bold text-on-surface-variant">
                              College
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-outline-variant/30">
                              <div
                                className="h-full bg-secondary"
                                style={{ width: toPercent(registration.similarity.college) }}
                              />
                            </div>
                            <span className="text-[12px] font-bold text-on-surface">
                              {toPercent(registration.similarity.college)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-bold text-on-surface">
                            {faceScanLabels[registration.faceScan.status]}
                          </span>
                          <span className="text-[12px] text-on-surface-variant">
                            {registration.faceScan.score
                              ? `${toPercent(registration.faceScan.score)} liveness`
                              : "Manual path"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[120px] items-center gap-3">
                          <span className={`text-[18px] font-bold ${getScoreClass(registration.score)}`}>
                            {toPercent(registration.score)}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-outline-variant/30">
                            <div
                              className={`h-full ${getScoreBarClass(registration.score)}`}
                              style={{ width: toPercent(registration.score) }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[12px] font-bold ${decisionClasses[registration.decision]}`}
                        >
                          {decisionLabels[registration.decision]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low p-5 text-[12px] font-medium text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredRegistrations.length} registrations from the seeded review queue.
            </span>
            <span>Duplicate score excludes FaceScan by design.</span>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[24px] border border-outline-variant/30 bg-white p-6 shadow-[0_20px_30px_-10px_rgba(214,203,191,0.35)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Selected analysis
                </p>
                <h2 className="mt-1 text-[24px] font-bold text-on-surface">{selected.name}</h2>
                <p className="text-[13px] text-on-surface-variant">{selected.submittedAt}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[12px] font-bold ${decisionClasses[selected.decision]}`}
              >
                {decisionLabels[selected.decision]}
              </span>
            </div>

            <ThresholdBand selectedScore={selected.score} />

            <div className="mt-6 space-y-5">
              <SimilarityBar
                label="Name similarity"
                value={selected.similarity.name}
                detail="Weighted at 60 percent."
              />
              <SimilarityBar
                label="College similarity"
                value={selected.similarity.college}
                detail="Weighted at 40 percent after normalization."
              />
              <div className="rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4">
                <p className="text-[13px] font-bold text-on-surface">Device and IP bonuses</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-surface-container-low p-3">
                    <p className="text-[12px] font-bold text-on-surface-variant">
                      Device fingerprint
                    </p>
                    <p className="mt-1 text-[18px] font-bold text-on-surface">
                      {selected.deviceMatch ? "+30%" : "+0%"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-3">
                    <p className="text-[12px] font-bold text-on-surface-variant">IP subnet</p>
                    <p className="mt-1 text-[18px] font-bold text-on-surface">
                      {selected.ipSubnetMatch ? "+20%" : "+0%"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-[20px] border border-primary/20 bg-primary/5 p-4">
                <p className="text-[13px] font-bold text-primary">Computed score</p>
                <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
                  {selectedHardStop
                    ? "Hard invariant matched. The duplicate score is forced to 100 percent and downstream fuzzy processing is skipped."
                    : `0.60 x ${toPercent(selected.similarity.name)} + 0.40 x ${toPercent(
                        selected.similarity.college
                      )} plus device/IP bonuses = ${toPercent(weightedScore)}.`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-outline-variant/30 bg-white p-6">
            <p className="text-[14px] font-bold text-on-surface">Pipeline trace</p>
            <p className="mt-1 text-[12px] text-on-surface-variant">
              Mirrors the async processor described in PRD section 9.1.
            </p>
            <div className="relative mt-5 before:absolute before:left-4 before:top-3 before:bottom-6 before:w-0.5 before:bg-outline-variant/40">
              <PipelineStage
                index={1}
                title="Hard invariants"
                body={
                  selectedHardStop
                    ? "Exact email, phone, or GitHub username signal found. No further duplicate scoring is required."
                    : "No exact email, phone, or GitHub username signal found."
                }
                latency="<10 ms"
                state={selectedHardStop ? "block" : "pass"}
              />
              <PipelineStage
                index={2}
                title="Fuzzy name and institution"
                body={
                  selectedHardStop
                    ? "Skipped because hard duplicate detection already resolved the case."
                    : `RapidFuzz-style normalized comparison produced ${toPercent(
                        selected.similarity.name
                      )} name and ${toPercent(selected.similarity.college)} college similarity.`
                }
                latency="<50 ms"
                state={selectedHardStop ? "skip" : selected.score >= 0.7 ? "review" : "pass"}
              />
              <PipelineStage
                index={3}
                title="Device and IP correlation"
                body={
                  selectedHardStop
                    ? "Skipped after hard duplicate decision."
                    : selected.deviceMatch || selected.ipSubnetMatch
                    ? "Correlation signal found and added to the duplicate score."
                    : "No device fingerprint or IP subnet correlation detected."
                }
                latency="<30 ms"
                state={
                  selectedHardStop
                    ? "skip"
                    : selected.deviceMatch || selected.ipSubnetMatch
                    ? "review"
                    : "pass"
                }
              />
              <PipelineStage
                index={4}
                title="FaceScan personhood"
                body={
                  selected.faceScan.consented
                    ? `${faceScanLabels[selected.faceScan.status]} with raw frames deleted immediately after validation. This is not used for duplicate scoring.`
                    : "Participant did not consent to FaceScan. The case is routed to a manual personhood review fallback."
                }
                latency="<3 sec"
                state={
                  selected.faceScan.status === "verified"
                    ? "pass"
                    : selected.faceScan.status === "review_required"
                    ? "review"
                    : "skip"
                }
              />
              <PipelineStage
                index={5}
                title="Threshold decision"
                body={selected.recommendation}
                latency="sync"
                state={
                  selected.decision === "AUTO_APPROVED"
                    ? "pass"
                    : selected.decision === "MANUAL_REVIEW"
                    ? "review"
                    : "block"
                }
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-outline-variant/30 bg-white p-6">
            <p className="text-[14px] font-bold text-on-surface">Match explanation</p>
            <div className="mt-4 rounded-[20px] bg-surface-container-low p-4">
              <p className="text-[13px] font-bold text-on-surface">{selected.matchedProfile}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-on-surface-variant">
                {selected.matchedProfileNote}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selected.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-secondary-container/50 px-3 py-1 text-[12px] font-bold text-on-secondary-container"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button className="rounded-full border border-outline-variant px-3 py-2 text-[12px] font-bold text-on-surface-variant hover:border-primary hover:text-primary">
                Clarify
              </button>
              <button className="rounded-full border border-error/30 px-3 py-2 text-[12px] font-bold text-error hover:bg-error hover:text-on-error">
                Reject
              </button>
              <button className="rounded-full bg-primary px-3 py-2 text-[12px] font-bold text-on-primary hover:bg-primary/90">
                Approve
              </button>
            </div>
          </div>

          <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">privacy_tip</span>
              <div>
                <p className="text-[14px] font-bold text-primary">Privacy guardrails</p>
                <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-on-surface-variant">
                  <li>PII remains encrypted at rest and is not sent to Gemini.</li>
                  <li>FaceScan validates liveness only; no cross-user face matching is shown.</li>
                  <li>Raw frames are deleted immediately; only status, score, consent, and audit metadata remain.</li>
                  <li>Every duplicate decision is written to the audit trail with the score breakdown.</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
