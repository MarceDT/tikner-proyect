/**
 * Demo de punta a punta del pipeline de talento, sin UI:
 *   sync bandeja DEMO → reporte top N → aprobación humana (simulada por CLI) → export PDF/DOCX/XLSX.
 *
 * Uso: npm run demo:talent --workspace web [-- --top 3 --store memory]
 *   --store pg (default): usa DATABASE_URL. --store memory: no persiste (solo para probar sin DB).
 *   Extracción: requiere OPENAI_API_KEY (u OPENROUTER_API_KEY) válida. No hay modo sin LLM.
 *
 * Los archivos se escriben en .data/talent-exports/.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createLlmExtractor } from "../src/lib/server/talent/extract-profile";
import { TalentService } from "../src/lib/server/talent/service";
import { InMemoryTalentStore } from "../src/lib/server/talent/store";
import { PgTalentStore } from "../src/lib/server/talent/store-pg";
import { EXPORT_FORMATS } from "../src/lib/talent-types";

const args = process.argv.slice(2);
const flag = (name: string, def: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const topN = Number(flag("top", "3"));
const storeKind = flag("store", "pg");
const outDir = resolve(process.env.TALENT_EXPORT_DIR || ".data/talent-exports");

async function main() {
const pgStore = storeKind === "pg" ? PgTalentStore.fromEnv() : null;
const service = new TalentService({ store: pgStore ?? new InMemoryTalentStore(), extractor: createLlmExtractor() });

try {
  console.log(`\n1) Sincronizando bandeja DEMO (simulada) → extracción LLM…`);
  const sync = await service.syncInbox();
  console.log(`   creadas=${sync.created} omitidas=${sync.skipped} fallidas=${sync.failed}`);
  for (const a of sync.applications) {
    const p = a.profile;
    console.log(`   - ${a.id} [${a.status}] ${p?.name ?? a.email.from} · skills=${p?.skills.length ?? 0} · faltan=${p?.missingFields.join(",") || "-"}${a.extractionError ? ` · error=${a.extractionError}` : ""}`);
  }

  console.log(`\n2) Generando SelectionReport (top ${topN})…`);
  const report = await service.buildReport({ topN, requestedBy: "demo-cli" });
  for (const r of report.rankings) {
    console.log(`   #${r.rank} ${r.candidateName} — ${r.score}/100 · ${r.breakdown.map((b) => `${b.criterion}=${b.score}`).join(" ")}${r.risks.length ? ` · riesgos: ${r.risks.join(" | ")}` : ""}`);
  }
  console.log(`   reporte ${report.id} · aprobación: ${report.approval.status}`);

  console.log(`\n3) Intentando exportar SIN aprobación (debe fallar)…`);
  try {
    await service.exportReport(report.id, "pdf", "demo-cli");
    console.log("   ✗ ERROR: exportó sin aprobación");
    process.exitCode = 1;
  } catch (error) {
    console.log(`   ✓ bloqueado: ${error instanceof Error ? error.message : error}`);
  }

  console.log(`\n4) Registrando aprobación humana (decidedBy=Marcelo)…`);
  const approved = await service.decide(report.id, { decision: "approved", decidedBy: "Marcelo", note: "Aprobado desde demo CLI" });
  console.log(`   aprobación: ${approved.approval.status} por ${approved.approval.decidedBy} el ${approved.approval.decidedAt}`);

  console.log(`\n5) Exportando…`);
  await mkdir(outDir, { recursive: true });
  for (const format of EXPORT_FORMATS) {
    const { file, fileName, event } = await service.exportReport(report.id, format, "demo-cli");
    const path = resolve(outDir, fileName);
    await writeFile(path, file);
    console.log(`   ✓ ${format.toUpperCase()} ${file.length} bytes → ${path} (evento ${event.id})`);
  }
  const final = await service.getReport(report.id);
  console.log(`\nEventos de exportación registrados: ${final.exports.length}. Listo.\n`);
} finally {
  await pgStore?.close();
}
}

main().catch((error) => {
  console.error(`\nDemo abortada: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
