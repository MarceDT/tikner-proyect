import { test } from "node:test";
import assert from "node:assert/strict";
import { rankApplications, RANKING_WEIGHTS } from "./rank-candidates";
import type { Application, CandidateProfile, TargetRoleSnapshot } from "@/lib/talent-types";

const target: TargetRoleSnapshot = {
  title: "Lead Fullstack & AI Systems Engineer",
  department: "Product Engineering",
  budgetMaxSalary: 95000,
  currency: "USD",
  requiredSkills: ["Next.js", "TypeScript", "Python / Agents", "System Design", "Distributed Systems"],
};

function profile(over: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    name: "X",
    contact: { email: "x@example.com", phone: null, location: null },
    currentTitle: "Engineer",
    experienceYears: 6,
    experience: [],
    skills: ["Next.js", "TypeScript", "Python", "System Design", "Distributed Systems"],
    salaryExpectation: { amount: 90000, currency: "USD", raw: "USD 90,000" },
    evidence: [{ field: "skills", quote: "Next.js" }],
    missingFields: [],
    confidence: { overall: 0.9, fields: {} },
    ...over,
  };
}

function app(id: string, p: CandidateProfile | null, status: Application["status"] = "extracted"): Application {
  return {
    id,
    source: "demo-inbox",
    email: { messageId: id, from: "a@b", subject: "s", receivedAt: "2026-09-10T00:00:00Z" },
    rawCvText: "cv",
    profile: p,
    status,
    createdAt: "2026-09-10T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  };
}

test("los pesos suman 100", () => {
  assert.equal(Object.values(RANKING_WEIGHTS).reduce((a, b) => a + b, 0), 100);
});

test("ordena de mayor a menor score y asigna rank consecutivo", () => {
  const strong = app("A", profile({ name: "Strong" }));
  const weak = app("B", profile({ name: "Weak", skills: ["PHP"], experienceYears: 1 }));
  const [first, second] = rankApplications([weak, strong], target);
  assert.equal(first.applicationId, "A");
  assert.equal(first.rank, 1);
  assert.equal(second.rank, 2);
  assert.ok(first.score > second.score);
  assert.equal(first.breakdown.length, 5);
});

test("salario ausente queda desconocido y se declara como dato faltante, no como penalización", () => {
  const [r] = rankApplications(
    [app("A", profile({ salaryExpectation: { amount: null, currency: null, raw: "a convenir" }, missingFields: ["salaryExpectation"] }))],
    target,
  );
  const budget = r.breakdown.find((b) => b.criterion === "budgetAlignment")!;
  assert.equal(budget.score, null);
  assert.equal(budget.status, "unknown");
  assert.ok(r.missingData.some((m) => /salar/i.test(m)));
  assert.ok(!r.risks.some((m) => /salar/i.test(m)));
});

test("salario por encima del presupuesto genera riesgo con el monto de exceso", () => {
  const [r] = rankApplications(
    [app("A", profile({ salaryExpectation: { amount: 130000, currency: "USD", raw: "USD 130.000" } }))],
    target,
  );
  const budget = r.breakdown.find((b) => b.criterion === "budgetAlignment")!;
  assert.ok((budget.score ?? 100) < 50);
  assert.ok(r.risks.some((m) => m.includes("35")), `esperaba el exceso de 35k en riesgos: ${r.risks.join(" | ")}`);
});

test("las postulaciones sin perfil no se rankean", () => {
  const rankings = rankApplications([app("A", profile()), app("B", null, "failed")], target);
  assert.equal(rankings.length, 1);
});

test("skills faltantes quedan explicadas en el reasoning", () => {
  const [r] = rankApplications([app("A", profile({ skills: ["Go", "Rust"] }))], target);
  const skills = r.breakdown.find((b) => b.criterion === "requiredSkills")!;
  assert.ok((skills.score ?? 100) < 30);
  assert.match(skills.reasoning, /Next\.js/);
});
