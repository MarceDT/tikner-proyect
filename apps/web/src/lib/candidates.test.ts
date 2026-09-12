import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import {
  candidates,
  TARGET_ROLE,
  findCandidate,
  getCandidate,
  getOrFirstCandidate,
  createDefaultOffer,
  saveOfferDraft,
  getOfferForCandidate,
  approveCandidateOffer,
  rejectCandidateOffer,
  resetCandidateOffersForTesting,
  candidatesWorkspaceContext,
} from "./candidates";
import {
  formatOfferDescription,
  parseOfferDescription,
  type JobOfferDetails,
} from "./followup-types";

beforeEach(() => {
  resetCandidateOffersForTesting();
});

test("candidate lookup handles valid IDs, undefined IDs, and invalid IDs correctly", () => {
  const sofia = findCandidate("CAND-101");
  assert.equal(sofia.name, "Sofía Albarracín");
  assert.equal(sofia.salaryNumber, 92000);

  const found = getCandidate("CAND-102");
  assert.equal(found?.name, "Lucas Varela");

  const missing = getCandidate("NON-EXISTENT");
  assert.equal(missing, undefined);

  const fallback = getOrFirstCandidate("UNKNOWN-ID");
  assert.equal(fallback.id, candidates[0].id);

  assert.throws(() => findCandidate("UNKNOWN-ID"), /no encontrado/);
});

test("createDefaultOffer respects budget and department constraints", () => {
  const sofia = findCandidate("CAND-101");
  const sofiaOffer = createDefaultOffer(sofia);
  assert.equal(sofiaOffer.candidateId, "CAND-101");
  assert.equal(sofiaOffer.proposedSalary, 92000);
  assert.equal(sofiaOffer.budgetMaxSalary, TARGET_ROLE.budgetMaxSalary);
  assert.equal(sofiaOffer.status, "pending_approval");
  assert.match(sofiaOffer.notes ?? "", /dentro del presupuesto/i);

  // Lucas Varela expects $125k, which exceeds $95k budget
  const lucas = findCandidate("CAND-102");
  const lucasOffer = createDefaultOffer(lucas);
  assert.equal(lucasOffer.candidateId, "CAND-102");
  assert.equal(lucasOffer.proposedSalary, TARGET_ROLE.budgetMaxSalary); // capped at budget
  assert.match(lucasOffer.notes ?? "", /tope presupuestario/i);
});

test("Human-in-the-Loop: approveCandidateOffer transitions status to 'Offer Extended' with audit trail", () => {
  const candidateId = "CAND-101";
  const initialCandidate = findCandidate(candidateId);
  assert.equal(initialCandidate.status, "Finalist");
  assert.equal(initialCandidate.offer, undefined);

  // Recruiter executes explicit Human-in-the-Loop approval
  const approved = approveCandidateOffer(
    candidateId,
    {
      proposedSalary: 94000,
      equity: "0.3% (4 años)",
      startDate: "2026-10-15",
    },
    "Marcelo (Product & Recruiting Lead)",
  );

  assert.equal(approved.status, "approved");
  assert.equal(approved.proposedSalary, 94000);
  assert.equal(approved.approvedBy, "Marcelo (Product & Recruiting Lead)");
  assert.ok(approved.approvedAt);

  // Candidate status is now Offer Extended
  const updatedCandidate = findCandidate(candidateId);
  assert.equal(updatedCandidate.status, "Offer Extended");
  assert.equal(updatedCandidate.offer?.status, "approved");
  assert.equal(getOfferForCandidate(candidateId)?.status, "approved");
});

test("Human-in-the-Loop: rejectCandidateOffer records rejection without extending formal offer", () => {
  const candidateId = "CAND-102";
  const lucas = findCandidate(candidateId);
  const draft = createDefaultOffer(lucas);
  saveOfferDraft(draft);

  const rejected = rejectCandidateOffer(
    candidateId,
    "Expectativa salarial ($125k) supera presupuesto corporativo.",
  );

  assert.ok(rejected);
  assert.equal(rejected?.status, "rejected");
  assert.match(rejected?.notes ?? "", /supera presupuesto/);

  // Candidate status was NOT changed to Offer Extended
  assert.notEqual(lucas.status, "Offer Extended");
});

test("candidatesWorkspaceContext provides target position, candidate data, and HITL security policies", () => {
  const context = candidatesWorkspaceContext("CAND-101");
  assert.equal(context.targetPosition.budgetMaxSalary, 95000);
  assert.equal(context.selectedCandidate.name, "Sofía Albarracín");
  assert.equal(context.availableCandidates.length, 3);
  assert.ok(context.humanInTheLoopPolicy.approvalRequired);
  assert.match(context.humanInTheLoopPolicy.boundaryDescription, /confirmación humana explícita/);
  assert.deepEqual(context.humanInTheLoopPolicy.allowedActions, [
    "review_offer",
    "approve_and_extend_offer",
    "reject_or_adjust_offer",
  ]);
});

test("formatOfferDescription and parseOfferDescription round-trip structured offer data", () => {
  const offer: JobOfferDetails = {
    candidateId: "CAND-101",
    candidateName: "Sofía Albarracín",
    role: "Lead Fullstack & AI Systems Engineer",
    proposedSalary: 92000,
    salaryCurrency: "USD",
    budgetMaxSalary: 95000,
    equity: "0.25%",
    startDate: "2026-10-01",
    notes: "Bono de firma $5k incluido",
  };

  const formatted = formatOfferDescription(offer);
  assert.match(formatted, /Sofía Albarracín/);
  assert.match(formatted, /\$92,000 USD/);
  assert.match(formatted, /HITL SECURITY POLICY/);

  const parsed = parseOfferDescription(formatted);
  assert.ok(parsed);
  assert.equal(parsed?.candidateId, offer.candidateId);
  assert.equal(parsed?.candidateName, offer.candidateName);
  assert.equal(parsed?.proposedSalary, offer.proposedSalary);
  assert.equal(parsed?.budgetMaxSalary, offer.budgetMaxSalary);
  assert.equal(parsed?.equity, offer.equity);
  assert.equal(parsed?.startDate, offer.startDate);
});

test("parseOfferDescription correctly parses Windows CRLF (\\r\\n) line endings in METADATA", () => {
  const crlfDescription =
    "=== OFERTA FORMAL DE EMPLEO — TALENTSCORE ===\r\n" +
    "Candidato: Sofía Albarracín (CAND-101)\r\n" +
    "Puesto: Lead Fullstack & AI Systems Engineer\r\n" +
    "--- METADATA ---\r\n" +
    JSON.stringify({
      candidateId: "CAND-101",
      candidateName: "Sofía Albarracín",
      role: "Lead Fullstack & AI Systems Engineer",
      proposedSalary: 93500,
      salaryCurrency: "USD",
      budgetMaxSalary: 95000,
      equity: "0.25%",
      startDate: "2026-10-01",
    }) +
    "\r\n";

  const parsed = parseOfferDescription(crlfDescription);
  assert.ok(parsed);
  assert.equal(parsed?.candidateId, "CAND-101");
  assert.equal(parsed?.proposedSalary, 93500);
});

test("parseOfferDescription extracts structured fields from plain LLM text without metadata block", () => {
  const plainLlmText =
    "=== OFERTA FORMAL DE EMPLEO — TALENTSCORE ===\n" +
    "Candidato: Lucas Varela (CAND-102)\n" +
    "Puesto: Lead Fullstack & AI Systems Engineer\n" +
    "Salario Propuesto: $95,000 USD/año\n" +
    "Presupuesto Máximo: $95,000 USD/año\n" +
    "Equity: 0.2% (4 años vesting)\n" +
    "Fecha Tentativa de Incorporación: 2026-11-01\n" +
    "Observaciones: Ajustado al tope presupuestario.";

  const parsed = parseOfferDescription(plainLlmText);
  assert.ok(parsed);
  assert.equal(parsed?.candidateId, "CAND-102");
  assert.equal(parsed?.candidateName, "Lucas Varela");
  assert.equal(parsed?.proposedSalary, 95000);
  assert.equal(parsed?.budgetMaxSalary, 95000);
  assert.equal(parsed?.startDate, "2026-11-01");
});

test("approveCandidateOffer throws an error when given a non-positive or NaN salary", () => {
  assert.throws(
    () => approveCandidateOffer("CAND-101", { proposedSalary: 0 }),
    /Salario propuesto inválido/,
  );
  assert.throws(
    () => approveCandidateOffer("CAND-101", { proposedSalary: -50000 }),
    /Salario propuesto inválido/,
  );
  assert.throws(
    () => approveCandidateOffer("CAND-101", { proposedSalary: NaN }),
    /Salario propuesto inválido/,
  );
});

test("rejectCandidateOffer creates rejection record even if candidate had no previous offer draft", () => {
  const candidate = findCandidate("CAND-103");
  assert.equal(getOfferForCandidate("CAND-103"), undefined);

  const rejected = rejectCandidateOffer("CAND-103", "No cumple seniority de backend");
  assert.ok(rejected);
  assert.equal(rejected?.status, "rejected");
  assert.equal(rejected?.candidateId, "CAND-103");
  assert.match(rejected?.notes ?? "", /No cumple seniority/);
  assert.equal(candidate.offer?.status, "rejected");
});

test("saveOfferDraft registers pending status in candidate offers and workspace context", () => {
  const sofia = findCandidate("CAND-101");
  const draft = createDefaultOffer(sofia);
  saveOfferDraft(draft);

  const ctx = candidatesWorkspaceContext("CAND-101");
  assert.ok(ctx.activeOffer);
  assert.equal(ctx.activeOffer?.status, "pending_approval");
  assert.equal(ctx.humanInTheLoopPolicy.status, "pending_approval");
});

