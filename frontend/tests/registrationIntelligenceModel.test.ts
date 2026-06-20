import assert from "node:assert/strict";
import test from "node:test";
import {
  type RegistrationCase,
  clampScore,
  computeWeightedScore,
  filterRegistrations,
  getDecisionForRegistration,
  getRegistrationMetrics,
  getScoreBarClass,
  getScoreClass,
  hasHardInvariant,
  registrations,
  toPercent,
} from "../src/components/registrations/registrationIntelligenceModel";

type RegistrationCaseOverride = Omit<
  Partial<RegistrationCase>,
  "exactSignals" | "similarity" | "faceScan"
> & {
  exactSignals?: Partial<RegistrationCase["exactSignals"]>;
  similarity?: Partial<RegistrationCase["similarity"]>;
  faceScan?: Partial<RegistrationCase["faceScan"]>;
};

const baseCase: RegistrationCase = {
  id: "test-registration",
  name: "Test Participant",
  email: "test@example.com",
  college: "Test Institute",
  github: "test-user",
  submittedAt: "now",
  decision: "AUTO_APPROVED",
  score: 0,
  matchedProfile: "No close match",
  matchedProfileNote: "Test case",
  initials: "TP",
  skills: ["Testing"],
  exactSignals: { email: false, phone: false, github: false },
  similarity: { name: 0, college: 0 },
  deviceMatch: false,
  ipSubnetMatch: false,
  faceScan: {
    status: "verified",
    score: 0.9,
    consented: true,
    dataDeletedAt: "Immediate",
  },
  recommendation: "Test recommendation",
};

function makeCase(overrides: RegistrationCaseOverride = {}): RegistrationCase {
  return {
    ...baseCase,
    ...overrides,
    exactSignals: {
      ...baseCase.exactSignals,
      ...overrides.exactSignals,
    },
    similarity: {
      ...baseCase.similarity,
      ...overrides.similarity,
    },
    faceScan: {
      ...baseCase.faceScan,
      ...overrides.faceScan,
    },
  };
}

function assertClose(actual: number, expected: number) {
  assert.ok(
    Math.abs(actual - expected) < 0.000001,
    `expected ${actual} to be close to ${expected}`
  );
}

test("seeded cases stay consistent with PRD section 9 scoring decisions", () => {
  for (const registration of registrations) {
    assert.equal(getDecisionForRegistration(registration), registration.decision);
    assert.equal(toPercent(computeWeightedScore(registration)), toPercent(registration.score));
  }
});

test("hard invariant matches short-circuit to HARD_DUPLICATE", () => {
  for (const signal of ["email", "phone", "github"] as const) {
    const registration = makeCase({
      exactSignals: { [signal]: true },
      similarity: { name: 0.01, college: 0.01 },
      deviceMatch: false,
      ipSubnetMatch: false,
    });

    assert.equal(hasHardInvariant(registration), true);
    assert.equal(computeWeightedScore(registration), 1);
    assert.equal(getDecisionForRegistration(registration), "HARD_DUPLICATE");
  }
});

test("threshold boundaries classify exactly as the PRD defines", () => {
  assert.equal(
    getDecisionForRegistration(makeCase({ similarity: { name: 0.69, college: 0.69 } })),
    "AUTO_APPROVED"
  );
  assert.equal(
    getDecisionForRegistration(makeCase({ similarity: { name: 0.7, college: 0.7 } })),
    "MANUAL_REVIEW"
  );
  assert.equal(
    getDecisionForRegistration(makeCase({ similarity: { name: 0.84, college: 0.84 } })),
    "MANUAL_REVIEW"
  );
  assert.equal(
    getDecisionForRegistration(makeCase({ similarity: { name: 0.85, college: 0.85 } })),
    "POTENTIAL_DUPLICATE"
  );
});

test("weighted duplicate score uses 60 percent name and 40 percent college", () => {
  const registration = makeCase({
    similarity: { name: 0.5, college: 0.25 },
  });

  assertClose(computeWeightedScore(registration), 0.4);
});

test("device and IP signals add bonuses and cap at 100 percent", () => {
  assertClose(
    computeWeightedScore(
      makeCase({
        similarity: { name: 0.46, college: 0.64 },
        deviceMatch: true,
      })
    ),
    0.832
  );
  assert.equal(
    computeWeightedScore(
      makeCase({
        similarity: { name: 0.95, college: 0.95 },
        deviceMatch: true,
        ipSubnetMatch: true,
      })
    ),
    1
  );
});

test("FaceScan status never changes duplicate score or threshold decision", () => {
  const verified = makeCase({
    similarity: { name: 0.72, college: 0.72 },
    faceScan: { status: "verified", score: 0.96, consented: true },
  });
  const reviewRequired = makeCase({
    similarity: { name: 0.72, college: 0.72 },
    faceScan: { status: "review_required", score: 0.2, consented: true },
  });
  const skipped = makeCase({
    similarity: { name: 0.72, college: 0.72 },
    faceScan: { status: "manual_review", score: null, consented: false, dataDeletedAt: null },
  });

  assert.equal(computeWeightedScore(verified), computeWeightedScore(reviewRequired));
  assert.equal(computeWeightedScore(verified), computeWeightedScore(skipped));
  assert.equal(getDecisionForRegistration(verified), getDecisionForRegistration(reviewRequired));
  assert.equal(getDecisionForRegistration(verified), getDecisionForRegistration(skipped));
});

test("score helpers clamp invalid visual values", () => {
  assert.equal(clampScore(Number.NaN), 0);
  assert.equal(toPercent(-0.2), "0%");
  assert.equal(toPercent(1.2), "100%");
  assert.equal(getScoreClass(0.699), "text-primary");
  assert.equal(getScoreClass(0.7), "text-tertiary");
  assert.equal(getScoreClass(0.849), "text-tertiary");
  assert.equal(getScoreClass(0.85), "text-error");
  assert.equal(getScoreBarClass(0.85), "bg-error");
});

test("filtering handles empty query, whitespace, casing, decision filters, and no results", () => {
  assert.equal(filterRegistrations(registrations, "ALL", "").length, registrations.length);
  assert.deepEqual(
    filterRegistrations(registrations, "ALL", "  prIYA  ").map((registration) => registration.id),
    ["reg-priya-potential"]
  );
  assert.deepEqual(
    filterRegistrations(registrations, "MANUAL_REVIEW", "").map(
      (registration) => registration.id
    ),
    ["reg-rahul-manual", "reg-arjun-manual"]
  );
  assert.deepEqual(filterRegistrations(registrations, "AUTO_APPROVED", "priya"), []);
});

test("summary metrics match the seeded review queue", () => {
  assert.deepEqual(getRegistrationMetrics(registrations), {
    autoApprovedCount: 1,
    manualReviewCount: 2,
    duplicateCount: 2,
    faceScanReviewCount: 2,
  });
});

test("FaceScan seeded privacy metadata follows consent and deletion rules", () => {
  for (const registration of registrations) {
    if (registration.faceScan.consented) {
      assert.equal(registration.faceScan.dataDeletedAt, "Immediate");
    } else {
      assert.equal(registration.faceScan.score, null);
      assert.equal(registration.faceScan.dataDeletedAt, null);
    }
  }
});
