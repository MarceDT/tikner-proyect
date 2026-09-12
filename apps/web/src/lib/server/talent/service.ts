/**
 * Orquestación del pipeline: inbox → extracción → ranking → reporte → decisión humana → export.
 *
 * Regla de seguridad: `exportReport` solo funciona con `approval.status === "approved"`,
 * y la aprobación solo se registra vía `decide` (endpoint HTTP usado por un humano).
 * Las tools del agente no tienen acceso a `decide` ni a `exportReport`.
 */
import { createHash, randomUUID } from "node:crypto";
import { TARGET_ROLE } from "@/lib/candidates";
import type {
  Application,
  CandidateRanking,
  ExportEvent,
  ExportFormat,
  ReportDecision,
  SelectionReport,
  TargetRoleSnapshot,
} from "@/lib/talent-types";
import { EXPORT_FORMATS } from "@/lib/talent-types";
import { DEMO_INBOX_SOURCE, readDemoInbox, type DemoInboxMessage } from "./demo-inbox";
import { ApprovalRequiredError, NotFoundError, TalentError } from "./errors";
import { exportFileName, renderReport } from "./exports";
import { extractProfile, type ExtractorFn } from "./extract-profile";
import { rankApplication, rankApplications } from "./rank-candidates";
import type { TalentStore } from "./store";

export interface TalentServiceOptions {
  store: TalentStore;
  extractor: ExtractorFn;
  /** Lector de bandeja. Por defecto la bandeja DEMO simulada. */
  inbox?: () => Promise<DemoInboxMessage[]>;
  targetRole?: TargetRoleSnapshot;
  now?: () => Date;
}

export interface SyncResult {
  applications: Application[];
  created: number;
  skipped: number;
  failed: number;
}

export interface ComparisonResult {
  targetRole: TargetRoleSnapshot;
  rankings: CandidateRanking[];
  /** Diferencias por criterio entre el primero y cada uno de los demás. */
  deltas: Array<{ applicationId: string; candidateName: string; scoreDelta: number; byCriterion: Record<string, number> }>;
}

const applicationIdFor = (messageId: string) =>
  `APP-${createHash("sha256").update(messageId).digest("hex").slice(0, 10).toUpperCase()}`;

export class TalentService {
  private store: TalentStore;
  private extractor: ExtractorFn;
  private inbox: () => Promise<DemoInboxMessage[]>;
  readonly targetRole: TargetRoleSnapshot;
  private now: () => Date;

  constructor(options: TalentServiceOptions) {
    this.store = options.store;
    this.extractor = options.extractor;
    this.inbox = options.inbox ?? readDemoInbox;
    this.targetRole = options.targetRole ?? { ...TARGET_ROLE, requiredSkills: [...TARGET_ROLE.requiredSkills] };
    this.now = options.now ?? (() => new Date());
  }

  /**
   * Idempotente: los mensajes ya extraídos (por messageId) se saltan; los que quedaron en `failed`
   * se reintentan. Una extracción fallida no corta el lote.
   */
  async syncInbox(): Promise<SyncResult> {
    const result: SyncResult = { applications: [], created: 0, skipped: 0, failed: 0 };
    for (const message of await this.inbox()) {
      const existing = await this.store.findApplicationByMessageId(message.messageId);
      if (existing && existing.status !== "failed") {
        result.skipped++;
        result.applications.push(existing);
        continue;
      }
      const ts = this.now().toISOString();
      let application: Application = {
        id: existing?.id ?? applicationIdFor(message.messageId),
        source: DEMO_INBOX_SOURCE,
        email: {
          messageId: message.messageId,
          from: message.from,
          subject: message.subject,
          receivedAt: message.receivedAt,
          ...(message.attachmentName ? { attachmentName: message.attachmentName } : {}),
        },
        rawCvText: message.cvText,
        profile: null,
        status: "received",
        createdAt: existing?.createdAt ?? ts,
        updatedAt: ts,
      };
      try {
        const profile = await extractProfile(
          { cvText: message.cvText, emailSubject: message.subject, emailFrom: message.from },
          this.extractor,
        );
        application = { ...application, profile, status: "extracted", updatedAt: this.now().toISOString() };
        result.created++;
      } catch (error) {
        application = {
          ...application,
          status: "failed",
          extractionError: error instanceof Error ? error.message : String(error),
          updatedAt: this.now().toISOString(),
        };
        result.failed++;
      }
      result.applications.push(await this.store.upsertApplication(application));
    }
    return result;
  }

  listApplications() {
    return this.store.listApplications();
  }

  async getApplication(id: string): Promise<Application> {
    const app = await this.store.getApplication(id);
    if (!app) throw new NotFoundError("Postulación", id);
    return app;
  }

  /** Ranking individual (score, desglose, evidencia, riesgos). */
  async evaluate(applicationId: string): Promise<CandidateRanking> {
    const app = await this.getApplication(applicationId);
    const ranking = rankApplication(app, this.targetRole);
    if (!ranking) {
      throw new TalentError(
        `La postulación '${applicationId}' no tiene perfil extraído (estado: ${app.status}${app.extractionError ? `, error: ${app.extractionError}` : ""}).`,
        409,
      );
    }
    return { ...ranking, rank: 1 };
  }

  async compare(applicationIds: string[]): Promise<ComparisonResult> {
    const unique = [...new Set(applicationIds)];
    if (unique.length < 2) throw new TalentError("Se necesitan al menos dos postulaciones distintas para comparar.");
    const apps = await Promise.all(unique.map((id) => this.getApplication(id)));
    const rankings = rankApplications(apps, this.targetRole);
    const missing = apps.filter((a) => !rankings.some((r) => r.applicationId === a.id));
    if (missing.length) {
      throw new TalentError(`Sin perfil extraído: ${missing.map((a) => a.id).join(", ")}.`, 409);
    }
    const [top, ...rest] = rankings;
    const byCriterion = (r: CandidateRanking) => Object.fromEntries(r.breakdown.map((b) => [b.criterion, b.score]));
    const topCriteria = byCriterion(top);
    return {
      targetRole: this.targetRole,
      rankings,
      deltas: rest.map((r) => {
        const c = byCriterion(r);
        return {
          applicationId: r.applicationId,
          candidateName: r.candidateName,
          scoreDelta: r.score - top.score,
          byCriterion: Object.fromEntries(Object.keys(topCriteria).map((k) => [k, (c[k] ?? 0) - topCriteria[k]])),
        };
      }),
    };
  }

  /** Crea un reporte en estado `pending`. Nunca aprueba. */
  async buildReport(input: { topN: number; requestedBy: string }): Promise<SelectionReport> {
    const topN = Math.trunc(input.topN);
    if (!Number.isFinite(topN) || topN < 1 || topN > 10) throw new TalentError("topN debe estar entre 1 y 10.");
    const requestedBy = input.requestedBy.trim();
    if (!requestedBy) throw new TalentError("requestedBy es obligatorio.");
    const rankings = rankApplications(await this.store.listApplications(), this.targetRole);
    if (!rankings.length) throw new TalentError("No hay postulaciones con perfil extraído. Ejecutá la sincronización de la bandeja primero.", 409);
    const report: SelectionReport = {
      id: `REP-${randomUUID().slice(0, 8).toUpperCase()}`,
      roleTitle: this.targetRole.title,
      targetRole: this.targetRole,
      topN,
      generatedAt: this.now().toISOString(),
      requestedBy,
      rankings,
      shortlistApplicationIds: rankings.slice(0, topN).map((r) => r.applicationId),
      approval: { status: "pending" },
    };
    return this.store.saveReport(report);
  }

  listReports() {
    return this.store.listReports();
  }

  async getReport(id: string): Promise<SelectionReport & { exports: ExportEvent[] }> {
    const report = await this.store.getReport(id);
    if (!report) throw new NotFoundError("Reporte", id);
    return { ...report, exports: await this.store.listExports(id) };
  }

  /** Único camino para aprobar/rechazar. Una decisión tomada no se puede cambiar. */
  async decide(reportId: string, input: { decision: ReportDecision; decidedBy: string; note?: string }): Promise<SelectionReport> {
    const report = await this.store.getReport(reportId);
    if (!report) throw new NotFoundError("Reporte", reportId);
    if (report.approval.status !== "pending") {
      throw new TalentError(`El reporte '${reportId}' ya fue ${report.approval.status === "approved" ? "aprobado" : "rechazado"} por ${report.approval.decidedBy}.`, 409);
    }
    const decidedBy = input.decidedBy.trim();
    if (!decidedBy) throw new TalentError("decidedBy es obligatorio: la decisión debe quedar registrada a nombre de una persona.");
    return this.store.saveReport({
      ...report,
      approval: {
        status: input.decision,
        decidedBy,
        decidedAt: this.now().toISOString(),
        ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      },
    });
  }

  /** Genera el archivo y registra el evento. Rechaza si no hay aprobación humana registrada. */
  async exportReport(
    reportId: string,
    format: ExportFormat,
    requestedBy: string,
  ): Promise<{ file: Buffer; fileName: string; event: ExportEvent }> {
    if (!EXPORT_FORMATS.includes(format)) throw new TalentError(`Formato inválido: ${format}. Usá ${EXPORT_FORMATS.join(", ")}.`);
    const report = await this.store.getReport(reportId);
    if (!report) throw new NotFoundError("Reporte", reportId);
    if (report.approval.status !== "approved") throw new ApprovalRequiredError(reportId, report.approval.status);
    const file = await renderReport(report, format);
    const fileName = exportFileName(report, format);
    const event = await this.store.recordExport({
      id: `EXP-${randomUUID().slice(0, 8).toUpperCase()}`,
      reportId,
      format,
      fileName,
      sizeBytes: file.length,
      requestedBy: requestedBy.trim() || "desconocido",
      createdAt: this.now().toISOString(),
    });
    return { file, fileName, event };
  }
}
