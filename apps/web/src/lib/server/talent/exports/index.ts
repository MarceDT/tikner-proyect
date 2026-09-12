import type { ExportFormat, SelectionReport } from "@/lib/talent-types";
import { renderDocx } from "./docx";
import { renderPdf } from "./pdf";
import { renderXlsx } from "./xlsx";

export const EXPORT_CONTENT_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/** Único punto de entrada: todos los formatos se generan desde el mismo SelectionReport. */
export async function renderReport(report: SelectionReport, format: ExportFormat): Promise<Buffer> {
  switch (format) {
    case "pdf":
      return renderPdf(report);
    case "docx":
      return renderDocx(report);
    case "xlsx":
      return renderXlsx(report);
  }
}

export function exportFileName(report: SelectionReport, format: ExportFormat): string {
  const date = report.generatedAt.slice(0, 10);
  return `talentscore-seleccion-${report.id}-${date}.${format}`;
}
