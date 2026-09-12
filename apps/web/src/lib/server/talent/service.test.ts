import { test } from "node:test";
import assert from "node:assert/strict";
import { TalentService } from "./service";
import { InMemoryTalentStore } from "./store";
import { ApprovalRequiredError } from "./errors";
import { DEMO_INBOX_MESSAGES } from "./demo-inbox";
import type { ExtractorFn } from "./extract-profile";

/** Extractor falso: perfil mínimo coherente con el texto (sin red). */
const fakeExtractor: ExtractorFn = async ({ cvText, emailFrom }) => {
  const years = /(\d+)\s+años/.exec(cvText);
  const salary = /USD\s?([\d.,]+)/.exec(cvText);
  const amount = salary ? Number(salary[1].replace(/[.,]/g, "")) : null;
  return {
    name: cvText.split("\n")[0].trim(),
    contact: { email: emailFrom, phone: null, location: null },
    currentTitle: cvText.split("\n")[1]?.trim() || null,
    experienceYears: years ? Number(years[1]) : null,
    experience: [],
    skills: (/Skills?\s*\n?([^\n]+)/i.exec(cvText)?.[1] ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    salaryExpectation: { amount, currency: amount ? "USD" : null, raw: salary?.[0] ?? null },
    evidence: years ? [{ field: "experienceYears", quote: years[0] }] : [],
    missingFields: [],
    confidence: { overall: 0.85, fields: {} },
  };
};

const make = (extractor: ExtractorFn = fakeExtractor) =>
  new TalentService({ store: new InMemoryTalentStore(), extractor });

test("syncInbox es idempotente y no repite postulaciones", async () => {
  const svc = make();
  const first = await svc.syncInbox();
  assert.equal(first.created, DEMO_INBOX_MESSAGES.length);
  const second = await svc.syncInbox();
  assert.equal(second.created, 0);
  assert.equal(second.skipped, DEMO_INBOX_MESSAGES.length);
  assert.equal((await svc.listApplications()).length, DEMO_INBOX_MESSAGES.length);
});

test("una extracción fallida deja la postulación en 'failed' y no corta el lote", async () => {
  let calls = 0;
  const flaky: ExtractorFn = async (input) => {
    if (++calls === 2) throw new Error("timeout del modelo");
    return fakeExtractor(input);
  };
  const svc = make(flaky);
  const r = await svc.syncInbox();
  assert.equal(r.failed, 1);
  assert.equal(r.created, 2);
  const failed = r.applications.find((a) => a.status === "failed")!;
  assert.match(failed.extractionError!, /timeout/);
  await assert.rejects(svc.evaluate(failed.id), /no tiene perfil/);
});

test("las postulaciones 'failed' se reintentan en el siguiente sync sin duplicarse", async () => {
  let fail = true;
  const extractor: ExtractorFn = async (input) => {
    if (fail) throw new Error("modelo caído");
    return fakeExtractor(input);
  };
  const svc = make(extractor);
  const first = await svc.syncInbox();
  assert.equal(first.failed, 3);
  fail = false;
  const second = await svc.syncInbox();
  assert.equal(second.created, 3);
  assert.equal(second.failed, 0);
  const apps = await svc.listApplications();
  assert.equal(apps.length, 3);
  assert.ok(apps.every((a) => a.status === "extracted" && !a.extractionError));
});

test("compare devuelve rankings ordenados y deltas contra el primero", async () => {
  const svc = make();
  const { applications } = await svc.syncInbox();
  const ids = applications.map((a) => a.id);
  const cmp = await svc.compare(ids);
  assert.equal(cmp.rankings.length, 3);
  assert.equal(cmp.rankings[0].rank, 1);
  assert.equal(cmp.deltas.length, 2);
  assert.ok(cmp.deltas.every((d) => d.scoreDelta <= 0));
  await assert.rejects(svc.compare([ids[0]]), /al menos dos/);
});

test("el reporte nace pending y no se puede exportar sin aprobación humana", async () => {
  const svc = make();
  await svc.syncInbox();
  const report = await svc.buildReport({ topN: 2, requestedBy: "agente" });
  assert.equal(report.approval.status, "pending");
  assert.equal(report.shortlistApplicationIds.length, 2);
  await assert.rejects(svc.exportReport(report.id, "pdf", "agente"), ApprovalRequiredError);
  assert.equal((await svc.getReport(report.id)).exports.length, 0, "un export rechazado no deja evento");
});

test("aprobado por un humano ⇒ exporta y registra el evento; la decisión es única", async () => {
  const svc = make();
  await svc.syncInbox();
  const report = await svc.buildReport({ topN: 1, requestedBy: "amin" });
  const approved = await svc.decide(report.id, { decision: "approved", decidedBy: "Marcelo", note: "ok para avanzar" });
  assert.equal(approved.approval.status, "approved");
  assert.equal(approved.approval.decidedBy, "Marcelo");
  const { file, event, fileName } = await svc.exportReport(report.id, "xlsx", "amin");
  assert.ok(file.length > 0);
  assert.equal(event.format, "xlsx");
  assert.ok(fileName.endsWith(".xlsx"));
  assert.equal((await svc.getReport(report.id)).exports.length, 1);
  await assert.rejects(svc.decide(report.id, { decision: "rejected", decidedBy: "otro" }), /ya fue aprobado/);
});

test("un reporte rechazado tampoco se exporta", async () => {
  const svc = make();
  await svc.syncInbox();
  const report = await svc.buildReport({ topN: 1, requestedBy: "amin" });
  await svc.decide(report.id, { decision: "rejected", decidedBy: "Marcelo" });
  await assert.rejects(svc.exportReport(report.id, "docx", "amin"), ApprovalRequiredError);
});

test("validaciones de entrada: topN fuera de rango y decidedBy vacío", async () => {
  const svc = make();
  await svc.syncInbox();
  await assert.rejects(svc.buildReport({ topN: 11, requestedBy: "x" }), /entre 1 y 10/);
  const report = await svc.buildReport({ topN: 1, requestedBy: "x" });
  await assert.rejects(svc.decide(report.id, { decision: "approved", decidedBy: "  " }), /decidedBy/);
});
