export type Decision =
  | "AUTO_APPROVED"
  | "MANUAL_REVIEW"
  | "POTENTIAL_DUPLICATE"
  | "HARD_DUPLICATE";

export type FaceScanStatus = "verified" | "manual_review" | "review_required" | "not_consented";

export type RegistrationCase = {
  id: string;
  name: string;
  email: string;
  college: string;
  github: string;
  submittedAt: string;
  decision: Decision;
  score: number;
  matchedProfile: string;
  matchedProfileNote: string;
  initials: string;
  skills: string[];
  exactSignals: {
    email: boolean;
    phone: boolean;
    github: boolean;
  };
  similarity: {
    name: number;
    college: number;
  };
  deviceMatch: boolean;
  ipSubnetMatch: boolean;
  faceScan: {
    status: FaceScanStatus;
    score: number | null;
    consented: boolean;
    dataDeletedAt: string | null;
  };
  recommendation: string;
};

export const registrations: RegistrationCase[] = [
  {
    id: "reg-vivek-hard",
    name: "Vivek M",
    email: "vivek.menon@sec.hackos.demo",
    college: "Jadavpur Univ",
    github: "vivekmenon_security",
    submittedAt: "2 min ago",
    decision: "HARD_DUPLICATE",
    score: 1,
    matchedProfile: "Vivek Menon",
    matchedProfileNote: "Exact email match against an approved registration.",
    initials: "VM",
    skills: ["Security", "OWASP", "Bug Bounty"],
    exactSignals: { email: true, phone: false, github: false },
    similarity: { name: 0.68, college: 0.86 },
    deviceMatch: false,
    ipSubnetMatch: false,
    faceScan: {
      status: "manual_review",
      score: null,
      consented: false,
      dataDeletedAt: null,
    },
    recommendation:
      "Reject as a hard duplicate unless the participant can prove this is a shared institutional account.",
  },
  {
    id: "reg-priya-potential",
    name: "Priya Sharma",
    email: "priyasharma.aiml@gmail.com",
    college: "Indian Institute of Technology Bombay",
    github: "priyasharma_ml_alt",
    submittedAt: "8 min ago",
    decision: "POTENTIAL_DUPLICATE",
    score: 0.95,
    matchedProfile: "Priya S.",
    matchedProfileNote: "Name and institution are near-identical to an existing profile.",
    initials: "PS",
    skills: ["NLP", "PyTorch", "Transformers"],
    exactSignals: { email: false, phone: false, github: false },
    similarity: { name: 1, college: 0.88 },
    deviceMatch: false,
    ipSubnetMatch: false,
    faceScan: {
      status: "verified",
      score: 0.91,
      consented: true,
      dataDeletedAt: "Immediate",
    },
    recommendation:
      "Block the registration and ask for clarification because the duplicate score is above the 0.85 threshold.",
  },
  {
    id: "reg-rahul-manual",
    name: "R. Verma",
    email: "rverma.dev@protonmail.com",
    college: "Birla Institute of Technology and Science",
    github: "rahulverma_backend_alt",
    submittedAt: "14 min ago",
    decision: "MANUAL_REVIEW",
    score: 0.83,
    matchedProfile: "Rahul Verma",
    matchedProfileNote: "Borderline content score was pushed into review by device correlation.",
    initials: "RV",
    skills: ["FastAPI", "PostgreSQL", "Kafka"],
    exactSignals: { email: false, phone: false, github: false },
    similarity: { name: 0.46, college: 0.64 },
    deviceMatch: true,
    ipSubnetMatch: false,
    faceScan: {
      status: "review_required",
      score: 0.58,
      consented: true,
      dataDeletedAt: "Immediate",
    },
    recommendation:
      "Hold for manual review. Compare GitHub ownership and ask the participant to complete an additional verification step.",
  },
  {
    id: "reg-arjun-manual",
    name: "Arjun K Singh",
    email: "arjun.k.singh@gmail.com",
    college: "Vellore Institute of Technology",
    github: "arjunkumarsingh-alt",
    submittedAt: "21 min ago",
    decision: "MANUAL_REVIEW",
    score: 0.7,
    matchedProfile: "Arjun Kumar S.",
    matchedProfileNote: "The profile is right at the manual review threshold.",
    initials: "AS",
    skills: ["React", "Node.js", "Redis"],
    exactSignals: { email: false, phone: false, github: false },
    similarity: { name: 0.62, college: 0.83 },
    deviceMatch: false,
    ipSubnetMatch: false,
    faceScan: {
      status: "verified",
      score: 0.89,
      consented: true,
      dataDeletedAt: "Immediate",
    },
    recommendation:
      "Review manually within 24 hours. The evidence is not strong enough for an automatic block.",
  },
  {
    id: "reg-maya-approved",
    name: "Maya Rodriguez",
    email: "maya.r@mit.edu",
    college: "MIT",
    github: "mayarodriguez-ui",
    submittedAt: "32 min ago",
    decision: "AUTO_APPROVED",
    score: 0.14,
    matchedProfile: "No close match",
    matchedProfileNote: "No exact invariant, fuzzy, device, or IP signal crossed a review threshold.",
    initials: "MR",
    skills: ["Design", "React", "Framer Motion"],
    exactSignals: { email: false, phone: false, github: false },
    similarity: { name: 0.1, college: 0.2 },
    deviceMatch: false,
    ipSubnetMatch: false,
    faceScan: {
      status: "verified",
      score: 0.94,
      consented: true,
      dataDeletedAt: "Immediate",
    },
    recommendation:
      "Auto-approve and trigger embedding generation for team formation and reviewer matching.",
  },
];

export const decisionLabels: Record<Decision, string> = {
  AUTO_APPROVED: "Auto-approved",
  MANUAL_REVIEW: "Manual review",
  POTENTIAL_DUPLICATE: "Potential duplicate",
  HARD_DUPLICATE: "Hard duplicate",
};

export const decisionClasses: Record<Decision, string> = {
  AUTO_APPROVED: "bg-primary/10 text-primary border-primary/20",
  MANUAL_REVIEW: "bg-tertiary-fixed/70 text-on-tertiary-fixed-variant border-tertiary/20",
  POTENTIAL_DUPLICATE: "bg-error-container text-on-error-container border-error/20",
  HARD_DUPLICATE: "bg-error text-on-error border-error",
};

export const faceScanLabels: Record<FaceScanStatus, string> = {
  verified: "Verified",
  manual_review: "Manual fallback",
  review_required: "Review required",
  not_consented: "Not consented",
};

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

export function toPercent(value: number) {
  return `${Math.round(clampScore(value) * 100)}%`;
}

export function getScoreClass(score: number) {
  const clampedScore = clampScore(score);
  if (clampedScore >= 0.85) return "text-error";
  if (clampedScore >= 0.7) return "text-tertiary";
  return "text-primary";
}

export function getScoreBarClass(score: number) {
  const clampedScore = clampScore(score);
  if (clampedScore >= 0.85) return "bg-error";
  if (clampedScore >= 0.7) return "bg-tertiary";
  return "bg-primary";
}

export function hasHardInvariant(registration: RegistrationCase) {
  return (
    registration.exactSignals.email ||
    registration.exactSignals.phone ||
    registration.exactSignals.github
  );
}

export function computeWeightedScore(registration: RegistrationCase) {
  if (hasHardInvariant(registration)) return 1;

  const weighted =
    clampScore(registration.similarity.name) * 0.6 +
    clampScore(registration.similarity.college) * 0.4;
  const deviceBonus = registration.deviceMatch ? 0.3 : 0;
  const ipBonus = registration.ipSubnetMatch ? 0.2 : 0;

  return clampScore(weighted + deviceBonus + ipBonus);
}

export function getDecisionForRegistration(registration: RegistrationCase): Decision {
  if (hasHardInvariant(registration)) return "HARD_DUPLICATE";

  const score = computeWeightedScore(registration);
  if (score < 0.7) return "AUTO_APPROVED";
  if (score < 0.85) return "MANUAL_REVIEW";
  return "POTENTIAL_DUPLICATE";
}

export function filterRegistrations(
  source: RegistrationCase[],
  decisionFilter: "ALL" | Decision,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();

  return source.filter((registration) => {
    const matchesDecision =
      decisionFilter === "ALL" || registration.decision === decisionFilter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [
        registration.name,
        registration.email,
        registration.college,
        registration.github,
        registration.decision,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesDecision && matchesQuery;
  });
}

export function getRegistrationMetrics(source: RegistrationCase[]) {
  return {
    autoApprovedCount: source.filter(
      (registration) => registration.decision === "AUTO_APPROVED"
    ).length,
    manualReviewCount: source.filter(
      (registration) => registration.decision === "MANUAL_REVIEW"
    ).length,
    duplicateCount: source.filter(
      (registration) =>
        registration.decision === "POTENTIAL_DUPLICATE" ||
        registration.decision === "HARD_DUPLICATE"
    ).length,
    faceScanReviewCount: source.filter(
      (registration) =>
        registration.faceScan.status === "manual_review" ||
        registration.faceScan.status === "review_required"
    ).length,
  };
}
