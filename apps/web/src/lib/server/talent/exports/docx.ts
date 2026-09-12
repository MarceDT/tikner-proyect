/** DOCX dossier: una sección por candidato con desglose, evidencia y riesgos. Función pura. */
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import type { CandidateRanking, SelectionReport } from "@/lib/talent-types";

const p = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number } = {}) =>
  new Paragraph({ children: [new TextRun({ text, bold: opts.bold, italics: opts.italics, size: opts.size })] });

const bullet = (text: string) => new Paragraph({ text, bullet: { level: 0 } });

function breakdownTable(r: CandidateRanking): Table {
  const header = new TableRow({
    tableHeader: true,
    children: ["Criterio", "Peso", "Puntaje", "Razonamiento"].map(
      (h) => new TableCell({ children: [p(h, { bold: true })] }),
    ),
  });
  const rows = r.breakdown.map(
    (b) =>
      new TableRow({
        children: [b.criterion, `${b.weight}%`, b.score === null ? "Desconocido" : `${b.score}/100`, b.reasoning].map(
          (v) => new TableCell({ children: [p(v)] }),
        ),
      }),
  );
  return new Table({ rows: [header, ...rows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

function candidateSection(r: CandidateRanking, inShortlist: boolean): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [
    new Paragraph({ text: `#${r.rank} ${r.candidateName} — ${r.score}/100${inShortlist ? " (shortlist)" : ""}`, heading: HeadingLevel.HEADING_2 }),
    breakdownTable(r),
    p(""),
  ];
  const evidence = r.breakdown.flatMap((b) => b.evidence.map((e) => `${b.criterion}: "${e}"`));
  if (evidence.length) {
    out.push(p("Evidencia citada del CV", { bold: true }));
    out.push(...evidence.map(bullet));
  }
  if (r.risks.length) {
    out.push(p("Riesgos", { bold: true }));
    out.push(...r.risks.map(bullet));
  }
  if (r.missingData.length) {
    out.push(p("Datos faltantes (no se estimaron)", { bold: true }));
    out.push(...r.missingData.map(bullet));
  }
  out.push(p(""));
  return out;
}

export async function renderDocx(report: SelectionReport): Promise<Buffer> {
  const { targetRole: t, approval: a } = report;
  const doc = new Document({
    creator: "TalentScore",
    title: `Dossier de selección ${report.id}`,
    sections: [
      {
        children: [
          new Paragraph({ text: "TalentScore — Dossier de selección", heading: HeadingLevel.TITLE, alignment: AlignmentType.LEFT }),
          p(`Puesto: ${report.roleTitle} · ${t.department}`),
          p(`Presupuesto máximo: ${t.currency} ${t.budgetMaxSalary.toLocaleString("en-US")} · Skills requeridas: ${t.requiredSkills.join(", ")}`),
          p(`Reporte ${report.id} · generado ${new Date(report.generatedAt).toLocaleString("es-AR")} · solicitado por ${report.requestedBy}`, { italics: true }),
          p(
            a.status === "approved"
              ? `Aprobación humana registrada: ${a.decidedBy} · ${a.decidedAt ? new Date(a.decidedAt).toLocaleString("es-AR") : ""}${a.note ? ` · "${a.note}"` : ""}`
              : `Estado de aprobación: ${a.status}`,
            { bold: true },
          ),
          new Paragraph({ text: `Shortlist (top ${report.topN})`, heading: HeadingLevel.HEADING_1 }),
          ...report.rankings
            .filter((r) => report.shortlistApplicationIds.includes(r.applicationId))
            .map((r) => bullet(`#${r.rank} ${r.candidateName} — ${r.score}/100`)),
          new Paragraph({ text: "Candidatos", heading: HeadingLevel.HEADING_1 }),
          ...report.rankings.flatMap((r) => candidateSection(r, report.shortlistApplicationIds.includes(r.applicationId))),
          p("Puntajes calculados con una rúbrica determinista sobre datos extraídos del CV. Los datos ausentes se muestran como desconocidos y no se estiman.", { italics: true, size: 18 }),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}
