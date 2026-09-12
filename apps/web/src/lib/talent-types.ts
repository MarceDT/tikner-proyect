/**
 * TalentScore — contratos del pipeline "postulación → perfil → ranking → shortlist → export".
 * Isomórfico (sin imports de Node): la UI (Milena) importa estos tipos tal cual.
 * No reemplaza ni renombra nada de `Candidate` en ./candidates.ts (Marcelo).
 */

/** Único origen de postulaciones hoy. DEMO: bandeja simulada, no hay Gmail/IMAP. */
export type ApplicationSource = "demo-inbox";

export type ApplicationStatus = "received" | "extracted" | "failed";

export interface ApplicationEmail {
  messageId: string;
  from: string;
  subject: string;
  receivedAt: string; // ISO
  /** Nombre del "adjunto" simulado; su contenido ya viene como texto plano en rawCvText. */
  attachmentName?: string;
}

export interface ProfileEvidence {
  /** Campo del perfil que respalda, p. ej. "experienceYears" o "skills". */
  field: string;
  /** Cita textual del CV. Debe existir literalmente en rawCvText. */
  quote: string;
}

export interface CandidateProfile {
  name: string | null;
  contact: {
    email: string | null;
    phone: string | null;
    location: string | null;
  };
  currentTitle: string | null;
  experienceYears: number | null;
  experience: Array<{
    company: string;
    role: string;
    period: string;
    highlights: string[];
  }>;
  skills: string[];
  salaryExpectation: {
    amount: number | null;
    currency: string | null;
    raw: string | null;
  };
  evidence: ProfileEvidence[];
  /** Campos que el CV no contiene. Nunca se rellenan con suposiciones. */
  missingFields: string[];
  confidence: {
    overall: number; // 0..1
    fields: Record<string, number>; // 0..1 por campo
  };
}

export interface Application {
  id: string;
  source: ApplicationSource;
  email: ApplicationEmail;
  rawCvText: string;
  profile: CandidateProfile | null;
  status: ApplicationStatus;
  extractionError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RankingCriterion {
  criterion: "skills" | "experience" | "budget" | "completeness";
  weight: number; // suma 100
  score: number; // 0..100
  reasoning: string;
  evidence: string[];
}

export interface CandidateRanking {
  applicationId: string;
  candidateName: string;
  rank: number; // 1 = mejor
  score: number; // 0..100, ponderado
  breakdown: RankingCriterion[];
  risks: string[];
  missingData: string[];
}

export interface TargetRoleSnapshot {
  title: string;
  department: string;
  budgetMaxSalary: number;
  currency: string;
  requiredSkills: string[];
}

export type ReportDecision = "approved" | "rejected";
export type ApprovalStatus = "pending" | ReportDecision;

export interface ReportApproval {
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
  note?: string;
}

export interface SelectionReport {
  id: string;
  roleTitle: string;
  targetRole: TargetRoleSnapshot;
  topN: number; // 1..10
  generatedAt: string;
  requestedBy: string;
  rankings: CandidateRanking[]; // ranking completo, ordenado
  shortlistApplicationIds: string[]; // los topN primeros
  approval: ReportApproval;
}

export type ExportFormat = "pdf" | "docx" | "xlsx";
export const EXPORT_FORMATS: readonly ExportFormat[] = ["pdf", "docx", "xlsx"];

export interface ExportEvent {
  id: string;
  reportId: string;
  format: ExportFormat;
  fileName: string;
  sizeBytes: number;
  requestedBy: string;
  createdAt: string;
}
