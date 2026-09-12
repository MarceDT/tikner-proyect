/** PDF ejecutivo: resumen del puesto, shortlist, ranking y riesgos. Función pura. */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { SelectionReport } from "@/lib/talent-types";

const PAGE = { width: 595.28, height: 841.89, margin: 48 }; // A4
const FONT_SIZE = { title: 18, h2: 13, body: 10, small: 8.5 };

/** pdf-lib con fuentes estándar solo soporta WinAnsi; reemplazamos lo que no cabe. */
const safe = (s: string) =>
  s.replace(/[—–]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x00-\xFF]/g, "?");

class Writer {
  page!: PDFPage;
  y = 0;
  constructor(private doc: PDFDocument, private font: PDFFont, private bold: PDFFont) {
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - PAGE.margin;
  }
  private ensure(height: number) {
    if (this.y - height < PAGE.margin) this.newPage();
  }
  private wrap(text: string, size: number, font: PDFFont, maxWidth: number): string[] {
    const lines: string[] = [];
    for (const paragraph of safe(text).split("\n")) {
      let line = "";
      for (const word of paragraph.split(" ")) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = candidate;
      }
      lines.push(line);
    }
    return lines;
  }
  text(text: string, opts: { size?: number; bold?: boolean; indent?: number; color?: [number, number, number] } = {}) {
    const size = opts.size ?? FONT_SIZE.body;
    const font = opts.bold ? this.bold : this.font;
    const indent = opts.indent ?? 0;
    const lineHeight = size * 1.35;
    for (const line of this.wrap(text, size, font, PAGE.width - PAGE.margin * 2 - indent)) {
      this.ensure(lineHeight);
      this.page.drawText(line, {
        x: PAGE.margin + indent,
        y: this.y - size,
        size,
        font,
        color: opts.color ? rgb(...opts.color) : rgb(0.1, 0.1, 0.12),
      });
      this.y -= lineHeight;
    }
  }
  gap(h = 8) {
    this.y -= h;
  }
  rule() {
    this.ensure(10);
    this.page.drawLine({
      start: { x: PAGE.margin, y: this.y - 4 },
      end: { x: PAGE.width - PAGE.margin, y: this.y - 4 },
      thickness: 0.6,
      color: rgb(0.75, 0.75, 0.78),
    });
    this.y -= 12;
  }
}

export async function renderPdf(report: SelectionReport): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.setTitle(`TalentScore - Reporte de selección ${report.id}`);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, font, bold);
  const { targetRole: t } = report;

  w.text("TalentScore - Reporte ejecutivo de selección", { size: FONT_SIZE.title, bold: true });
  w.text(`Puesto: ${report.roleTitle} · ${t.department} · Presupuesto máx. ${t.currency} ${t.budgetMaxSalary.toLocaleString("en-US")}`, { size: FONT_SIZE.small, color: [0.35, 0.35, 0.4] });
  w.text(`Reporte ${report.id} · generado ${new Date(report.generatedAt).toLocaleString("es-AR")} · solicitado por ${report.requestedBy}`, { size: FONT_SIZE.small, color: [0.35, 0.35, 0.4] });
  const a = report.approval;
  w.text(
    a.status === "approved"
      ? `Aprobado por ${a.decidedBy ?? "-"} el ${a.decidedAt ? new Date(a.decidedAt).toLocaleString("es-AR") : "-"}${a.note ? ` - "${a.note}"` : ""}`
      : `Estado de aprobación: ${a.status}`,
    { size: FONT_SIZE.small, bold: true, color: a.status === "approved" ? [0.05, 0.45, 0.25] : [0.7, 0.2, 0.2] },
  );
  w.rule();

  w.text(`Shortlist (top ${report.topN})`, { size: FONT_SIZE.h2, bold: true });
  w.gap(4);
  const shortlist = report.rankings.filter((r) => report.shortlistApplicationIds.includes(r.applicationId));
  for (const r of shortlist) {
    w.text(`#${r.rank}  ${r.candidateName}  -  ${r.score}/100`, { bold: true });
    for (const b of r.breakdown) {
      w.text(`${b.criterion} (${b.weight}%): ${b.score}/100 - ${b.reasoning}`, { size: FONT_SIZE.small, indent: 14 });
    }
    if (r.risks.length) w.text(`Riesgos: ${r.risks.join(" | ")}`, { size: FONT_SIZE.small, indent: 14, color: [0.6, 0.15, 0.15] });
    if (r.missingData.length) w.text(`Datos faltantes: ${r.missingData.join(" | ")}`, { size: FONT_SIZE.small, indent: 14, color: [0.45, 0.35, 0.05] });
    w.gap(6);
  }
  w.rule();

  w.text("Ranking completo", { size: FONT_SIZE.h2, bold: true });
  w.gap(4);
  for (const r of report.rankings) {
    w.text(`#${r.rank}  ${r.candidateName}  -  ${r.score}/100  ·  ${r.breakdown.map((b) => `${b.criterion} ${b.score}`).join(" · ")}`, { size: FONT_SIZE.small });
  }
  w.gap(10);
  w.text(`Skills requeridas: ${t.requiredSkills.join(", ")}. Puntajes calculados con una rúbrica determinista sobre datos extraídos del CV; los datos ausentes puntúan 0 y no se estiman.`, { size: FONT_SIZE.small, color: [0.35, 0.35, 0.4] });

  return Buffer.from(await doc.save());
}
