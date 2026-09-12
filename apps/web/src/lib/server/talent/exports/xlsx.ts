/** XLSX con el ranking completo: una fila por candidato, una columna por criterio. Función pura. */
import ExcelJS from "exceljs";
import type { SelectionReport } from "@/lib/talent-types";

export const XLSX_SHEET_NAME = "Ranking";

export async function renderXlsx(report: SelectionReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "TalentScore";
  wb.created = new Date(report.generatedAt);

  const criteria = report.rankings[0]?.breakdown.map((b) => b.criterion) ?? ["skills", "experience", "budget", "completeness"];
  const ws = wb.addWorksheet(XLSX_SHEET_NAME);
  ws.columns = [
    { header: "Rank", key: "rank", width: 6 },
    { header: "Candidato", key: "name", width: 28 },
    { header: "Application ID", key: "applicationId", width: 22 },
    { header: "Score", key: "score", width: 8 },
    { header: "Shortlist", key: "shortlist", width: 10 },
    ...criteria.map((c) => ({ header: `${c} (score)`, key: `${c}_score`, width: 16 })),
    ...criteria.map((c) => ({ header: `${c} (razonamiento)`, key: `${c}_reasoning`, width: 60 })),
    { header: "Riesgos", key: "risks", width: 60 },
    { header: "Datos faltantes", key: "missing", width: 50 },
  ];
  ws.getRow(1).font = { bold: true };
  for (const r of report.rankings) {
    const row: Record<string, unknown> = {
      rank: r.rank,
      name: r.candidateName,
      applicationId: r.applicationId,
      score: r.score,
      shortlist: report.shortlistApplicationIds.includes(r.applicationId) ? "sí" : "no",
      risks: r.risks.join(" | "),
      missing: r.missingData.join(" | "),
    };
    for (const b of r.breakdown) {
      row[`${b.criterion}_score`] = b.score;
      row[`${b.criterion}_reasoning`] = b.reasoning;
    }
    ws.addRow(row);
  }

  const meta = wb.addWorksheet("Reporte");
  meta.columns = [{ header: "Campo", key: "k", width: 24 }, { header: "Valor", key: "v", width: 70 }];
  meta.getRow(1).font = { bold: true };
  const a = report.approval;
  meta.addRows([
    { k: "Reporte", v: report.id },
    { k: "Puesto", v: report.roleTitle },
    { k: "Presupuesto máx.", v: `${report.targetRole.currency} ${report.targetRole.budgetMaxSalary}` },
    { k: "Skills requeridas", v: report.targetRole.requiredSkills.join(", ") },
    { k: "Top N", v: report.topN },
    { k: "Generado", v: report.generatedAt },
    { k: "Solicitado por", v: report.requestedBy },
    { k: "Aprobación", v: a.status },
    { k: "Decidido por", v: a.decidedBy ?? "" },
    { k: "Decidido el", v: a.decidedAt ?? "" },
    { k: "Nota", v: a.note ?? "" },
  ]);

  return Buffer.from(await wb.xlsx.writeBuffer());
}
