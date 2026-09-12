import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { renderReport, exportFileName } from "./index";
import type { SelectionReport } from "@/lib/talent-types";

const report: SelectionReport = {
  id: "REP-TEST",
  roleTitle: "Lead Fullstack & AI Systems Engineer",
  targetRole: { title: "Lead", department: "Product Engineering", budgetMaxSalary: 95000, currency: "USD", requiredSkills: ["Next.js", "TypeScript"] },
  topN: 1,
  generatedAt: "2026-09-12T12:00:00.000Z",
  requestedBy: "amin",
  rankings: [
    {
      applicationId: "APP-1", candidateName: "Valentina Ferreyra — “lead”", rank: 1, score: 91,
      breakdown: [
        { criterion: "requiredSkills", weight: 45, score: 100, status: "assessed", reasoning: "Cubre 2/2", evidence: ["TypeScript, Next.js"] },
        { criterion: "relevantExperience", weight: 25, score: 100, status: "assessed", reasoning: "8 años", evidence: [] },
        { criterion: "architectureAndAgents", weight: 15, score: 80, status: "assessed", reasoning: "Arquitectura", evidence: [] },
        { criterion: "leadershipAndCommunication", weight: 10, score: null, status: "unknown", reasoning: "Desconocido", evidence: [] },
        { criterion: "budgetAlignment", weight: 5, score: 100, status: "assessed", reasoning: "Dentro", evidence: [] },
      ],
      evaluatedWeight: 90, unknownWeight: 10, risks: [], missingData: ["Campo sin dato en el CV: contact.phone."],
    },
    {
      applicationId: "APP-2", candidateName: "Tomás Ibarra", rank: 2, score: 40,
      breakdown: [
        { criterion: "requiredSkills", weight: 45, score: 40, status: "assessed", reasoning: "Faltan: Next.js", evidence: [] },
        { criterion: "relevantExperience", weight: 25, score: 100, status: "assessed", reasoning: "12 años", evidence: [] },
        { criterion: "architectureAndAgents", weight: 15, score: 40, status: "assessed", reasoning: "Arquitectura", evidence: [] },
        { criterion: "leadershipAndCommunication", weight: 10, score: 90, status: "assessed", reasoning: "ok", evidence: [] },
        { criterion: "budgetAlignment", weight: 5, score: 8, status: "assessed", reasoning: "Excede", evidence: [] },
      ],
      evaluatedWeight: 100, unknownWeight: 0, risks: ["Pretensión USD 35k por encima del presupuesto"], missingData: [],
    },
  ],
  shortlistApplicationIds: ["APP-1"],
  approval: { status: "approved", decidedBy: "Marcelo", decidedAt: "2026-09-12T12:30:00.000Z", note: "ok" },
  interviewProposalIds: [],
  plannedInterviews: [],
};

test("el PDF empieza con la firma %PDF", async () => {
  const buf = await renderReport(report, "pdf");
  assert.equal(buf.subarray(0, 4).toString("latin1"), "%PDF");
  assert.ok(buf.length > 1000);
});

test("el DOCX es un zip (PK) no vacío", async () => {
  const buf = await renderReport(report, "docx");
  assert.equal(buf.subarray(0, 2).toString("latin1"), "PK");
});

test("el XLSX tiene hoja Ranking con una fila por candidato + encabezado", async () => {
  const buf = await renderReport(report, "xlsx");
  assert.equal(buf.subarray(0, 2).toString("latin1"), "PK");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as unknown as ArrayBuffer);
  const ws = wb.getWorksheet("Ranking")!;
  assert.equal(ws.rowCount, report.rankings.length + 1);
  assert.equal(ws.getRow(2).getCell(2).value, report.rankings[0].candidateName);
});

test("nombre de archivo incluye id, fecha y extensión", () => {
  assert.equal(exportFileName(report, "xlsx"), "talentscore-seleccion-REP-TEST-2026-09-12.xlsx");
});
