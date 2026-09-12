/**
 * Puerto de persistencia del pipeline de talento.
 *
 * - `PgTalentStore` (store-pg.ts): PostgreSQL, la persistencia real de la app.
 * - `InMemoryTalentStore`: solo tests y scripts sin DB; se pierde al reiniciar.
 */
import type {
  Application,
  ExportEvent,
  Interview,
  InterviewProposal,
  SelectionReport,
} from "@/lib/talent-types";

export interface TalentStore {
  upsertApplication(application: Application): Promise<Application>;
  getApplication(id: string): Promise<Application | undefined>;
  findApplicationByMessageId(messageId: string): Promise<Application | undefined>;
  listApplications(): Promise<Application[]>;
  saveReport(report: SelectionReport): Promise<SelectionReport>;
  getReport(id: string): Promise<SelectionReport | undefined>;
  listReports(): Promise<SelectionReport[]>;
  saveInterviewProposal(proposal: InterviewProposal): Promise<InterviewProposal>;
  getInterviewProposal(id: string): Promise<InterviewProposal | undefined>;
  listInterviewProposals(reportId?: string): Promise<InterviewProposal[]>;
  saveInterview(interview: Interview): Promise<Interview>;
  getInterview(id: string): Promise<Interview | undefined>;
  listInterviews(reportId?: string): Promise<Interview[]>;
  recordExport(event: ExportEvent): Promise<ExportEvent>;
  listExports(reportId: string): Promise<ExportEvent[]>;
}

const clone = <T>(v: T): T => structuredClone(v);

export class InMemoryTalentStore implements TalentStore {
  private applications = new Map<string, Application>();
  private reports = new Map<string, SelectionReport>();
  private interviewProposals = new Map<string, InterviewProposal>();
  private interviews = new Map<string, Interview>();
  private exports: ExportEvent[] = [];

  async upsertApplication(application: Application) {
    this.applications.set(application.id, clone(application));
    return clone(application);
  }
  async getApplication(id: string) {
    const a = this.applications.get(id);
    return a && clone(a);
  }
  async findApplicationByMessageId(messageId: string) {
    const a = [...this.applications.values()].find((x) => x.email.messageId === messageId);
    return a && clone(a);
  }
  async listApplications() {
    return [...this.applications.values()]
      .sort((a, b) => a.email.receivedAt.localeCompare(b.email.receivedAt))
      .map(clone);
  }
  async saveReport(report: SelectionReport) {
    this.reports.set(report.id, clone(report));
    return clone(report);
  }
  async getReport(id: string) {
    const r = this.reports.get(id);
    return r && clone(r);
  }
  async listReports() {
    return [...this.reports.values()]
      .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))
      .map(clone);
  }
  async saveInterviewProposal(proposal: InterviewProposal) {
    this.interviewProposals.set(proposal.id, clone(proposal));
    return clone(proposal);
  }
  async getInterviewProposal(id: string) {
    const proposal = this.interviewProposals.get(id);
    return proposal && clone(proposal);
  }
  async listInterviewProposals(reportId?: string) {
    return [...this.interviewProposals.values()]
      .filter((proposal) => !reportId || proposal.reportId === reportId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(clone);
  }
  async saveInterview(interview: Interview) {
    this.interviews.set(interview.id, clone(interview));
    return clone(interview);
  }
  async getInterview(id: string) {
    const interview = this.interviews.get(id);
    return interview && clone(interview);
  }
  async listInterviews(reportId?: string) {
    return [...this.interviews.values()]
      .filter((interview) => !reportId || interview.reportId === reportId)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(clone);
  }
  async recordExport(event: ExportEvent) {
    this.exports.push(clone(event));
    return clone(event);
  }
  async listExports(reportId: string) {
    return this.exports.filter((e) => e.reportId === reportId).map(clone);
  }
}
