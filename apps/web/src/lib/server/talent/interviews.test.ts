import assert from "node:assert/strict";
import { test } from "node:test";
import { TalentService } from "./service";
import { InMemoryTalentStore } from "./store";
import type { ExtractorFn } from "./extract-profile";

const extractor: ExtractorFn = async ({ cvText, emailFrom }) => ({
  name: cvText.split("\n")[0].trim(),
  contact: { email: emailFrom, phone: null, location: null },
  currentTitle: cvText.split("\n")[1]?.trim() || null,
  experienceYears: 7,
  experience: [],
  skills: ["Next.js", "TypeScript", "Python", "System Design", "Distributed Systems"],
  salaryExpectation: { amount: 92000, currency: "USD", raw: "USD 92,000" },
  evidence: [{ field: "skills", quote: "Next.js" }],
  missingFields: [],
  confidence: { overall: 0.9, fields: {} },
});

async function ready() {
  const service = new TalentService({ store: new InMemoryTalentStore(), extractor, now: () => new Date("2026-09-12T12:00:00.000Z") });
  await service.syncInbox();
  const apps = await service.listApplications();
  const sofia = apps.find((app) => app.profile?.name === "Sofía Albarracín")!;
  const lucas = apps.find((app) => app.profile?.name === "Lucas Varela")!;
  const report = await service.buildReport({ topN: 10, requestedBy: "Marcelo" });
  await service.decide(report.id, { decision: "approved", decidedBy: "Marcelo" });
  return { service, reportId: report.id, sofiaId: sofia.id, lucasId: lucas.id };
}

const humanApproval = {
  approvedBy: "Marcelo",
  consentConfirmed: true as const,
  reviewed: { candidate: true as const, dateAndTime: true as const, timezone: true as const, interviewers: true as const, modality: true as const },
};

test("Sofía recibe una propuesta prioritaria y solo una persona la confirma", async () => {
  const { service, reportId, sofiaId } = await ready();
  const proposal = await service.proposeInterview({
    reportId, candidateApplicationId: sofiaId, type: "final", startsAt: "2026-09-15T14:00:00-03:00",
    durationMinutes: 60, timezone: "America/Asuncion", interviewers: ["Amin", "Milena"], modality: "video",
    locationOrMeetingUrl: "https://demo.invalid/sofia", agenda: ["Arquitectura de agentes", "Liderazgo"],
    recommendationReason: "Evidencia técnica y de liderazgo fuerte; está dentro de presupuesto.",
  });
  assert.equal(proposal.status, "pending_human_approval");
  assert.equal(proposal.createdBy, "ai");
  assert.equal(proposal.conflicts.length, 0);
  assert.match(proposal.availabilityEvidence[0].description, /dataset demo/i);

  const result = await service.confirmInterview(proposal.id, humanApproval);
  assert.equal(result.status, "scheduled");
  assert.ok(result.interviewId);
  const interviews = await service.listInterviews(reportId);
  assert.equal(interviews.length, 1);
  assert.equal(interviews[0].createdBy, "Marcelo");
  assert.equal(interviews[0].provider, "simulated_local");
  assert.ok(interviews[0].auditTrail.some((event) => event.action === "approved_and_scheduled"));
  const report = await service.getReport(reportId);
  assert.equal(report.plannedInterviews[0].id, result.interviewId);
});

test("zona horaria inválida, conflicto y consentimiento incompleto bloquean la agenda", async () => {
  const { service, reportId, sofiaId, lucasId } = await ready();
  await assert.rejects(service.proposeInterview({
    reportId, candidateApplicationId: sofiaId, type: "technical", startsAt: "2026-09-15T14:00:00-03:00",
    durationMinutes: 60, timezone: "No/Existe", interviewers: ["Amin"], modality: "video", agenda: ["Diseño"], recommendationReason: "Prueba.",
  }), /Zona horaria inválida/);

  const sofia = await service.proposeInterview({
    reportId, candidateApplicationId: sofiaId, type: "technical", startsAt: "2026-09-15T14:00:00-03:00",
    durationMinutes: 60, timezone: "America/Asuncion", interviewers: ["Amin"], modality: "video", agenda: ["Diseño"], recommendationReason: "Prueba.",
  });
  await assert.rejects(service.confirmInterview(sofia.id, { ...humanApproval, reviewed: { ...humanApproval.reviewed, modality: false } }), /exige revisar/);
  await service.confirmInterview(sofia.id, humanApproval);

  const lucas = await service.proposeInterview({
    reportId, candidateApplicationId: lucasId, type: "technical", startsAt: "2026-09-15T14:00:00-03:00",
    durationMinutes: 60, timezone: "America/Asuncion", interviewers: ["Amin"], modality: "video", agenda: ["Concurrencia"], recommendationReason: "Perfil técnico alto; advertir presupuesto y colaboración.",
  });
  assert.ok(lucas.conflicts.some((conflict) => conflict.type === "interviewer_busy"));
  assert.ok(lucas.conflicts.some((conflict) => conflict.severity === "blocking"));
  await assert.rejects(service.confirmInterview(lucas.id, humanApproval), /conflictos bloqueantes/);
});

test("rechazar conserva auditoría y jamás crea una entrevista", async () => {
  const { service, reportId, sofiaId } = await ready();
  const proposal = await service.proposeInterview({
    reportId, candidateApplicationId: sofiaId, type: "final", startsAt: "2026-09-15T14:00:00-03:00",
    durationMinutes: 60, timezone: "America/Asuncion", interviewers: ["Milena"], modality: "video", agenda: ["UX"], recommendationReason: "Prueba de rechazo.",
  });
  const rejected = await service.rejectInterviewProposal(proposal.id, "Marcelo", "Cambiar entrevistadores antes de agendar.");
  assert.equal(rejected.status, "rejected");
  assert.equal((await service.listInterviews(reportId)).length, 0);
  const stored = (await service.listInterviewProposals(reportId)).find((item) => item.id === proposal.id)!;
  assert.equal(stored.status, "rejected");
  assert.ok(stored.auditTrail.some((event) => event.action === "rejected"));
});
