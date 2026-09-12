/**
 * Persistencia PostgreSQL del pipeline de talento. Esquema en `db/002_talent.sql`.
 * Los documentos (perfil, rankings, aprobación) se guardan como JSONB; las columnas
 * escalares existen para filtrar/ordenar sin deserializar.
 */
import { Pool, type PoolConfig } from "pg";
import type {
  Application,
  ExportEvent,
  Interview,
  InterviewProposal,
  SelectionReport,
} from "@/lib/talent-types";
import { NotConfiguredError } from "./errors";
import type { TalentStore } from "./store";

type Row = Record<string, unknown>;

export class PgTalentStore implements TalentStore {
  constructor(private pool: Pool) {}

  static fromEnv(env = process.env, config: PoolConfig = {}): PgTalentStore {
    const url = env.DATABASE_URL?.trim();
    if (!url) {
      throw new NotConfiguredError(
        "DATABASE_URL no está configurada. Levantá PostgreSQL (db/README.md), corré `npm run db:migrate` y reiniciá la app.",
      );
    }
    return new PgTalentStore(new Pool({ connectionString: url, max: 5, ...config }));
  }

  async close() {
    await this.pool.end();
  }

  private static toApplication(r: Row): Application {
    return {
      id: r.id as string,
      source: r.source as Application["source"],
      email: {
        messageId: r.message_id as string,
        from: r.email_from as string,
        subject: r.email_subject as string,
        receivedAt: (r.received_at as Date).toISOString(),
        ...(r.attachment_name ? { attachmentName: r.attachment_name as string } : {}),
      },
      rawCvText: r.raw_cv_text as string,
      profile: (r.profile as Application["profile"]) ?? null,
      status: r.status as Application["status"],
      ...(r.extraction_error ? { extractionError: r.extraction_error as string } : {}),
      createdAt: (r.created_at as Date).toISOString(),
      updatedAt: (r.updated_at as Date).toISOString(),
    };
  }

  private static toReport(r: Row): SelectionReport {
    return {
      id: r.id as string,
      roleTitle: r.role_title as string,
      targetRole: r.target_role as SelectionReport["targetRole"],
      topN: r.top_n as number,
      generatedAt: (r.generated_at as Date).toISOString(),
      requestedBy: r.requested_by as string,
      rankings: r.rankings as SelectionReport["rankings"],
      shortlistApplicationIds: r.shortlist_application_ids as string[],
      approval: r.approval as SelectionReport["approval"],
      interviewProposalIds: (r.interview_proposal_ids as string[] | null) ?? [],
      plannedInterviews: (r.planned_interviews as Interview[] | null) ?? [],
    };
  }

  private static toInterviewProposal(r: Row): InterviewProposal {
    return r.document as InterviewProposal;
  }

  private static toInterview(r: Row): Interview {
    return r.document as Interview;
  }

  private static toExport(r: Row): ExportEvent {
    return {
      id: r.id as string,
      reportId: r.report_id as string,
      format: r.format as ExportEvent["format"],
      fileName: r.file_name as string,
      sizeBytes: Number(r.size_bytes),
      requestedBy: r.requested_by as string,
      createdAt: (r.created_at as Date).toISOString(),
    };
  }

  async upsertApplication(a: Application) {
    const { rows } = await this.pool.query(
      `INSERT INTO talent_applications
         (id, source, message_id, email_from, email_subject, received_at, attachment_name,
          raw_cv_text, profile, status, extraction_error, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         profile = EXCLUDED.profile, status = EXCLUDED.status,
         extraction_error = EXCLUDED.extraction_error, updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [
        a.id, a.source, a.email.messageId, a.email.from, a.email.subject, a.email.receivedAt,
        a.email.attachmentName ?? null, a.rawCvText, a.profile === null ? null : JSON.stringify(a.profile),
        a.status, a.extractionError ?? null, a.createdAt, a.updatedAt,
      ],
    );
    return PgTalentStore.toApplication(rows[0]);
  }
  async getApplication(id: string) {
    const { rows } = await this.pool.query("SELECT * FROM talent_applications WHERE id = $1", [id]);
    return rows[0] && PgTalentStore.toApplication(rows[0]);
  }
  async findApplicationByMessageId(messageId: string) {
    const { rows } = await this.pool.query("SELECT * FROM talent_applications WHERE message_id = $1", [messageId]);
    return rows[0] && PgTalentStore.toApplication(rows[0]);
  }
  async listApplications() {
    const { rows } = await this.pool.query("SELECT * FROM talent_applications ORDER BY received_at ASC");
    return rows.map(PgTalentStore.toApplication);
  }
  async saveReport(r: SelectionReport) {
    const { rows } = await this.pool.query(
      `INSERT INTO talent_selection_reports
         (id, role_title, target_role, top_n, generated_at, requested_by, rankings,
          shortlist_application_ids, approval, approval_status, interview_proposal_ids, planned_interviews)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO UPDATE SET
         approval = EXCLUDED.approval,
         approval_status = EXCLUDED.approval_status,
         interview_proposal_ids = EXCLUDED.interview_proposal_ids,
         planned_interviews = EXCLUDED.planned_interviews
       RETURNING *`,
      [
        r.id, r.roleTitle, JSON.stringify(r.targetRole), r.topN, r.generatedAt, r.requestedBy,
        JSON.stringify(r.rankings), JSON.stringify(r.shortlistApplicationIds), JSON.stringify(r.approval),
        r.approval.status, JSON.stringify(r.interviewProposalIds), JSON.stringify(r.plannedInterviews),
      ],
    );
    return PgTalentStore.toReport(rows[0]);
  }
  async getReport(id: string) {
    const { rows } = await this.pool.query("SELECT * FROM talent_selection_reports WHERE id = $1", [id]);
    return rows[0] && PgTalentStore.toReport(rows[0]);
  }
  async listReports() {
    const { rows } = await this.pool.query("SELECT * FROM talent_selection_reports ORDER BY generated_at DESC");
    return rows.map(PgTalentStore.toReport);
  }
  async saveInterviewProposal(proposal: InterviewProposal) {
    const { rows } = await this.pool.query(
      `INSERT INTO talent_interview_proposals (id, report_id, candidate_application_id, status, starts_at, document)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, starts_at = EXCLUDED.starts_at, document = EXCLUDED.document
       RETURNING document`,
      [proposal.id, proposal.reportId, proposal.candidateApplicationId, proposal.status, proposal.startsAt, JSON.stringify(proposal)],
    );
    return PgTalentStore.toInterviewProposal(rows[0]);
  }
  async getInterviewProposal(id: string) {
    const { rows } = await this.pool.query("SELECT document FROM talent_interview_proposals WHERE id = $1", [id]);
    return rows[0] && PgTalentStore.toInterviewProposal(rows[0]);
  }
  async listInterviewProposals(reportId?: string) {
    const { rows } = await this.pool.query(
      reportId
        ? "SELECT document FROM talent_interview_proposals WHERE report_id = $1 ORDER BY created_at DESC"
        : "SELECT document FROM talent_interview_proposals ORDER BY created_at DESC",
      reportId ? [reportId] : [],
    );
    return rows.map(PgTalentStore.toInterviewProposal);
  }
  async saveInterview(interview: Interview) {
    const { rows } = await this.pool.query(
      `INSERT INTO talent_interviews (id, proposal_id, report_id, candidate_application_id, starts_at, status, document)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, starts_at = EXCLUDED.starts_at, document = EXCLUDED.document
       RETURNING document`,
      [interview.id, interview.proposalId, interview.reportId, interview.candidateApplicationId, interview.startsAt, interview.status, JSON.stringify(interview)],
    );
    return PgTalentStore.toInterview(rows[0]);
  }
  async getInterview(id: string) {
    const { rows } = await this.pool.query("SELECT document FROM talent_interviews WHERE id = $1", [id]);
    return rows[0] && PgTalentStore.toInterview(rows[0]);
  }
  async listInterviews(reportId?: string) {
    const { rows } = await this.pool.query(
      reportId
        ? "SELECT document FROM talent_interviews WHERE report_id = $1 ORDER BY starts_at ASC"
        : "SELECT document FROM talent_interviews ORDER BY starts_at ASC",
      reportId ? [reportId] : [],
    );
    return rows.map(PgTalentStore.toInterview);
  }
  async recordExport(e: ExportEvent) {
    const { rows } = await this.pool.query(
      `INSERT INTO talent_export_events (id, report_id, format, file_name, size_bytes, requested_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [e.id, e.reportId, e.format, e.fileName, e.sizeBytes, e.requestedBy, e.createdAt],
    );
    return PgTalentStore.toExport(rows[0]);
  }
  async listExports(reportId: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM talent_export_events WHERE report_id = $1 ORDER BY created_at ASC",
      [reportId],
    );
    return rows.map(PgTalentStore.toExport);
  }
}
