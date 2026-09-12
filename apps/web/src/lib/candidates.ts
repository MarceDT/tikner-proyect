/**
 * TalentScore — Candidate Data Model & Domain Definitions (Idea 5: HR Tech)
 * Shared contract for Amin (Agent Backend) and Milena (Frontend & Generative UI).
 */
import type { Interview } from "./talent-types";

/** Shared interview contract consumed by the calendar/Kanban and server pipeline. */
export type {
  Interview,
  InterviewProposal,
  InterviewScheduleResult,
  InterviewHumanApproval,
  InterviewConflict,
  InterviewAvailabilityEvidence,
} from "./talent-types";

export interface InterviewNote {
  round: string;
  interviewer: string;
  rating: "Strong Yes" | "Yes" | "Neutral" | "No";
  date: string;
  notes: string;
}

export interface CandidateSkills {
  systemDesign: number; // 1-10
  coding: number;       // 1-10
  architecture: number; // 1-10
  leadership: number;   // 1-10
  communication: number;// 1-10
}

/**
 * Provenance for an application. The initial dataset deliberately uses a
 * simulated inbox, so the demo never implies that a real mailbox is connected.
 */
export type ApplicationSource = "simulated_email" | "email" | "manual_import";
export type ApplicationStatus =
  | "received"
  | "extracted"
  | "needs_review"
  | "ranked"
  | "shortlist_pending"
  | "shortlisted"
  | "exported"
  | "failed";

export interface CandidateEvidence {
  claim: string;
  excerpt: string;
  source: "cv" | "application_email" | "interview";
}

export interface ApplicationAttachment {
  fileName: string;
  mimeType: "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

export interface Application {
  id: string;
  source: ApplicationSource;
  sender: string;
  subject: string;
  receivedAt: string;
  attachment: ApplicationAttachment;
  status: ApplicationStatus;
  extractionConfidence: number;
  missingFields: string[];
  extractionErrors: string[];
}

export type RankingCriterionKey =
  | "requiredSkills"
  | "relevantExperience"
  | "architectureAndAgents"
  | "leadershipAndCommunication"
  | "budgetAlignment";

export interface RankingCriterion {
  key: RankingCriterionKey;
  label: string;
  weight: number;
  score: number | null;
  status: "assessed" | "unknown";
  evidence: string[];
}

export interface CandidateRanking {
  candidateId: string;
  score: number;
  evaluatedWeight: number;
  unknownWeight: number;
  requiresHumanReview: boolean;
  criteria: RankingCriterion[];
  strengths: string[];
  risks: string[];
  explanation: string;
}

export type ShortlistStatus = "not_selected" | "pending_approval" | "shortlisted";
export type ExportFormat = "pdf" | "docx" | "xlsx";
export type SelectionReportStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "exported";

export interface SelectionRankingSnapshot {
  candidateId: string;
  candidateName: string;
  score: number;
  evaluatedWeight: number;
  unknownWeight: number;
  explanation: string;
}

/**
 * Immutable-at-approval report shared by the PDF, DOCX and XLSX exporters.
 * Generating files belongs to the server layer; this model records the human
 * decision and exactly what data the files must contain.
 */
export interface SelectionReport {
  id: string;
  candidateIds: string[];
  rankings: SelectionRankingSnapshot[];
  reason: string;
  requestedFormats: ExportFormat[];
  status: SelectionReportStatus;
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  exportedAt?: string;
  exportedFormats?: ExportFormat[];
  /** Traceability from an approved shortlist to proposed and confirmed interviews. */
  interviewProposalIds: string[];
  plannedInterviews: Interview[];
}

export interface CandidateOffer {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  proposedSalary: number;
  salaryCurrency: string;
  budgetMaxSalary: number;
  equity: string;
  startDate: string;
  notes?: string;
  status: "draft" | "pending_approval" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  currentTitle: string;
  appliedRole: string;
  experienceYears: number;
  salaryExpectation: string;
  salaryNumber: number; // For budget comparisons
  location: string;
  status: "Review" | "Interviewing" | "Finalist" | "Offer Extended" | "Hired" | "Rejected";
  headline: string;
  summary: string;
  skills: string[];
  ratings: CandidateSkills;
  pros: string[];
  redFlags: string[];
  interviewNotes: InterviewNote[];
  application: Application;
  evidence: CandidateEvidence[];
  shortlistStatus: ShortlistStatus;
  offer?: CandidateOffer;
}


export const TARGET_ROLE = {
  title: "Lead Fullstack & AI Systems Engineer",
  department: "Product Engineering",
  budgetMaxSalary: 95000,
  currency: "USD",
  requiredSkills: ["Next.js", "TypeScript", "Python / Agents", "System Design", "Distributed Systems"],
};

/** Transparent, fixed rubric used in every candidate comparison. */
export const RANKING_WEIGHTS: Record<RankingCriterionKey, number> = {
  requiredSkills: 45,
  relevantExperience: 25,
  architectureAndAgents: 15,
  leadershipAndCommunication: 10,
  budgetAlignment: 5,
};

export const CRITICAL_CANDIDATE_STATUSES: Candidate["status"][] = [
  "Offer Extended",
  "Hired",
];

/** The agent can describe these transitions, but a person must enact them. */
export function requiresHumanApprovalForStatus(
  status: Candidate["status"],
): boolean {
  return CRITICAL_CANDIDATE_STATUSES.includes(status);
}

export function isAgentAllowedCandidateStatus(
  status: Candidate["status"],
): boolean {
  return !requiresHumanApprovalForStatus(status);
}

export const candidates: Candidate[] = [
  {
    id: "CAND-101",
    name: "Sofía Albarracín",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Senior Fullstack Architect",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 7,
    salaryExpectation: "$92,000 / año",
    salaryNumber: 92000,
    location: "Remoto (LatAm / UTC-3)",
    status: "Finalist",
    headline: "Especialista en escalabilidad de plataformas web y orquestación de agentes con TypeScript.",
    summary: "7 años liderando squads técnicos en startups de alto crecimiento. Fuerte perfil de liderazgo pedagógico, diseño modular y foco en performance.",
    skills: ["TypeScript", "Next.js", "Python", "CopilotKit", "PostgreSQL", "Docker", "System Design", "Distributed Systems"],
    ratings: {
      systemDesign: 9,
      coding: 9,
      architecture: 9,
      leadership: 8,
      communication: 9,
    },
    pros: [
      "Dentro del presupuesto ($92k vs $95k tope)",
      "Experiencia demostrada en producción con Next.js y arquitecturas de agentes",
      "Calificación de 'Strong Yes' en entrevistas técnicas y de cultura",
      "Alta capacidad comunicativa para liderar equipos interdisciplinarios"
    ],
    redFlags: [
      "Poco tiempo trabajando con infraestructura Kubernetes en bare-metal, aunque domina contenedores y ECS/Docker"
    ],
    application: {
      id: "APP-101",
      source: "simulated_email",
      sender: "sofia.albarracin@example.test",
      subject: "Postulación — Lead Fullstack & AI Systems Engineer",
      receivedAt: "2026-09-12T08:15:00.000Z",
      attachment: {
        fileName: "sofia-albarracin-cv.pdf",
        mimeType: "application/pdf",
      },
      status: "ranked",
      extractionConfidence: 0.96,
      missingFields: [],
      extractionErrors: [],
    },
    evidence: [
      {
        claim: "Experiencia liderando equipos y plataformas web escalables",
        excerpt: "7 años liderando squads técnicos en startups de alto crecimiento.",
        source: "cv",
      },
      {
        claim: "Experiencia en agentes y TypeScript",
        excerpt: "Orquestación de agentes con TypeScript y arquitecturas modulares.",
        source: "cv",
      },
    ],
    shortlistStatus: "not_selected",
    interviewNotes: [
      {
        round: "Cultura & Visión",
        interviewer: "Marcelo (Product Lead)",
        rating: "Strong Yes",
        date: "10 Sep 2026",
        notes: "Excelente alineación con el ritmo de entrega y valores del equipo. Empática, orientada a resultados y con mentalidad de ownership."
      },
      {
        round: "System Design & Agents",
        interviewer: "Amin (Tech Lead)",
        rating: "Strong Yes",
        date: "11 Sep 2026",
        notes: "Diseñó una arquitectura resiliente para streaming de eventos de LLMs con circuit breaker y colas asíncronas sin vacilar."
      },
      {
        round: "Frontend Architecture & UX",
        interviewer: "Milena (Design Systems Engineer)",
        rating: "Strong Yes",
        date: "12 Sep 2026",
        notes: "Código limpio y modular en React 19. Prioriza accesibilidad y patrones de estado predecibles."
      }
    ]
  },
  {
    id: "CAND-102",
    name: "Lucas Varela",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Principal Systems Engineer",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 11,
    salaryExpectation: "$125,000 / año",
    salaryNumber: 125000,
    location: "Buenos Aires, Argentina (Híbrido)",
    status: "Interviewing",
    headline: "Ingeniero veterano en sistemas de baja latencia y bases de datos distribuidas.",
    summary: "Más de una década de experiencia técnica sólida en infraestructura compleja. Perfil muy técnico e individualista.",
    skills: ["Go", "Rust", "TypeScript", "PostgreSQL", "Kafka", "Kubernetes", "C++"],
    ratings: {
      systemDesign: 10,
      coding: 9,
      architecture: 10,
      leadership: 6,
      communication: 5,
    },
    pros: [
      "Capacidad técnica sobresaliente en bajo nivel y bases de datos",
      "Ha manejado sistemas con millones de RPS en banca y fintech"
    ],
    redFlags: [
      "⚠️ Pretensión salarial $30,000 por encima del presupuesto asignado ($125k vs $95k)",
      "Poco interés en la capa de producto y experiencia de usuario frontend",
      "Feedback de entrevista indica posible resistencia al trabajo colaborativo ágil"
    ],
    application: {
      id: "APP-102",
      source: "simulated_email",
      sender: "lucas.varela@example.test",
      subject: "CV — Principal Systems Engineer",
      receivedAt: "2026-09-12T08:22:00.000Z",
      attachment: {
        fileName: "lucas-varela-cv.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      status: "ranked",
      extractionConfidence: 0.93,
      missingFields: ["portfolio de producto frontend"],
      extractionErrors: [],
    },
    evidence: [
      {
        claim: "Experiencia profunda en sistemas distribuidos",
        excerpt: "Sistemas de baja latencia y bases de datos distribuidas para fintech.",
        source: "cv",
      },
      {
        claim: "Pretensión salarial",
        excerpt: "Compensación objetivo: $125,000 USD anuales.",
        source: "application_email",
      },
    ],
    shortlistStatus: "not_selected",
    interviewNotes: [
      {
        round: "Cultura & Visión",
        interviewer: "Marcelo (Product Lead)",
        rating: "Neutral",
        date: "09 Sep 2026",
        notes: "Su foco es 100% técnico. Pareció distante ante temas de feedback de usuarios y diseño centrado en el cliente."
      },
      {
        round: "Deep Tech & Concurrency",
        interviewer: "Amin (Tech Lead)",
        rating: "Strong Yes",
        date: "11 Sep 2026",
        notes: "Conocimiento enciclopédico de internals de Postgres y optimización de memoria."
      }
    ]
  },
  {
    id: "CAND-103",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Senior Frontend & Creative Technologist",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 5,
    salaryExpectation: "$80,000 / año",
    salaryNumber: 80000,
    location: "Remoto (España / UTC+2)",
    status: "Review",
    headline: "Desarrolladora creativa especializada en interfaces de IA generativa y diseño interactivo.",
    summary: "5 años construyendo productos digitales galardonados. Extraordinario talento para prototipar interfaces agénticas y Generative UI.",
    skills: ["React", "Next.js", "Three.js", "Tailwind CSS", "Design Systems", "Python"],
    ratings: {
      systemDesign: 7,
      coding: 8,
      architecture: 7,
      leadership: 7,
      communication: 10,
    },
    pros: [
      "Excelente costo-beneficio ($80k vs $95k tope)",
      "Creatividad de primer nivel para interfaces humanas con IA",
      "Comunicación brillante y energía positiva para el equipo"
    ],
    redFlags: [
      "Menor tiempo de experiencia en backend distribuido pesado en comparación con Sofía y Lucas"
    ],
    application: {
      id: "APP-103",
      source: "simulated_email",
      sender: "elena.rostova@example.test",
      subject: "Application — Senior Frontend & Creative Technologist",
      receivedAt: "2026-09-12T08:31:00.000Z",
      attachment: {
        fileName: "elena-rostova-cv.pdf",
        mimeType: "application/pdf",
      },
      status: "ranked",
      extractionConfidence: 0.91,
      missingFields: ["experiencia backend distribuida a gran escala"],
      extractionErrors: [],
    },
    evidence: [
      {
        claim: "Experiencia en interfaces de IA generativa",
        excerpt: "Construyó interfaces agénticas, sistemas de diseño y productos interactivos.",
        source: "cv",
      },
      {
        claim: "Comunicación y colaboración",
        excerpt: "Prueba de frontend fluida, accesible y visualmente pulida.",
        source: "interview",
      },
    ],
    shortlistStatus: "not_selected",
    interviewNotes: [
      {
        round: "Cultura & Visión",
        interviewer: "Marcelo (Product Lead)",
        rating: "Strong Yes",
        date: "10 Sep 2026",
        notes: "Pasión contagiosa por construir software centrado en personas. Gran valor para el equipo."
      },
      {
        round: "Frontend & Generative UI",
        interviewer: "Milena (Design Systems Engineer)",
        rating: "Strong Yes",
        date: "12 Sep 2026",
        notes: "Una de las mejores pruebas de frontend que he visto: fluida, accesible y visualmente pulida."
      }
    ]
  },
  {
    id: "CAND-104",
    name: "Valentina Ferreyra",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Senior Fullstack Engineer & AI Platform Lead",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 8,
    salaryExpectation: "$90,000 / año",
    salaryNumber: 90000,
    location: "Córdoba, Argentina (Remoto)",
    status: "Finalist",
    headline: "Lead de plataforma de IA con experiencia en agentes, observabilidad y equipos de producto.",
    summary: "Perfil integral para comparar contra Sofía: plataforma de agentes en producción, mentoría y amplio recorrido fullstack.",
    skills: ["TypeScript", "Next.js", "Python", "LangGraph", "PostgreSQL", "Kafka", "Kubernetes", "System Design", "Distributed Systems"],
    ratings: { systemDesign: 9, coding: 9, architecture: 9, leadership: 8, communication: 8 },
    pros: ["Dentro del presupuesto ($90k vs $95k)", "Evidencia de agentes en producción y observabilidad", "Experiencia de liderazgo técnico"],
    redFlags: ["Disponibilidad de inicio debe confirmarse antes de agenda final"],
    application: {
      id: "APP-104", source: "simulated_email", sender: "valentina.ferreyra@example.test",
      subject: "Postulación — AI Platform Lead", receivedAt: "2026-09-12T09:10:00.000Z",
      attachment: { fileName: "valentina-ferreyra-cv.pdf", mimeType: "application/pdf" }, status: "ranked",
      extractionConfidence: 0.95, missingFields: [], extractionErrors: [],
    },
    evidence: [
      { claim: "Orquestación de agentes en producción", excerpt: "Diseñó un orquestador de agentes que procesa 40k conversaciones/día.", source: "cv" },
      { claim: "Liderazgo técnico", excerpt: "Mentoría técnica y entrevistas de contratación para seis personas.", source: "cv" },
    ],
    shortlistStatus: "not_selected",
    interviewNotes: [{ round: "Arquitectura & Agentes", interviewer: "Amin (Tech Lead)", rating: "Yes", date: "12 Sep 2026", notes: "Buen balance de diseño de producto, confiabilidad y costo de LLM." }],
  },
  {
    id: "CAND-105",
    name: "Camila Nunes",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Fullstack Developer",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 4,
    salaryExpectation: "No declarada",
    salaryNumber: 0,
    location: "São Paulo, Brasil (Remoto)",
    status: "Review",
    headline: "Fullstack con experiencia reciente en RAG y design systems; disponibilidad salarial desconocida.",
    summary: "Candidata de crecimiento con señal fuerte en producto y IA aplicada, pero con menor seniority para un rol Lead.",
    skills: ["Next.js", "TypeScript", "React", "Python", "FastAPI", "OpenAI API", "RAG", "PostgreSQL", "Design Systems"],
    ratings: { systemDesign: 7, coding: 8, architecture: 7, leadership: 6, communication: 8 },
    pros: ["Experiencia práctica con RAG y producto interno", "Buena base fullstack y de UX"],
    redFlags: ["Pretensión salarial no declarada: desconocida, requiere conversación", "Menor experiencia para liderar backend distribuido"],
    application: {
      id: "APP-105", source: "simulated_email", sender: "camila.nunes@example.test",
      subject: "Interesada en el puesto de Lead Fullstack", receivedAt: "2026-09-12T09:22:00.000Z",
      attachment: { fileName: "camila-nunes-cv.pdf", mimeType: "application/pdf" }, status: "ranked",
      extractionConfidence: 0.88, missingFields: ["pretensión salarial"], extractionErrors: [],
    },
    evidence: [{ claim: "Asistente RAG interno", excerpt: "Armó un asistente interno con OpenAI y RAG para 200 personas.", source: "cv" }],
    shortlistStatus: "not_selected",
    interviewNotes: [{ round: "Producto & UX", interviewer: "Milena (Design Systems Engineer)", rating: "Yes", date: "12 Sep 2026", notes: "Muy buena comprensión de flujos humanos; validar seniority de liderazgo." }],
  },
  {
    id: "CAND-106",
    name: "Mateo Ruiz",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    currentTitle: "Staff Backend Engineer",
    appliedRole: "Lead Fullstack & AI Systems Engineer",
    experienceYears: 9,
    salaryExpectation: "$94,000 / año",
    salaryNumber: 94000,
    location: "Asunción, Paraguay (Híbrido)",
    status: "Interviewing",
    headline: "Backend sólido con sistemas distribuidos y coaching técnico; evidencia limitada en agentes.",
    summary: "Opción técnica dentro de presupuesto para profundizar en arquitectura, con una brecha explícita de IA agéntica.",
    skills: ["TypeScript", "Node.js", "PostgreSQL", "Kafka", "Kubernetes", "System Design", "Distributed Systems"],
    ratings: { systemDesign: 9, coding: 9, architecture: 9, leadership: 8, communication: 7 },
    pros: ["Dentro del presupuesto ($94k vs $95k)", "Experiencia en plataformas distribuidas y mentoría"],
    redFlags: ["Sin evidencia suficiente de agentes en producción; tratar como desconocido y validar en entrevista"],
    application: {
      id: "APP-106", source: "simulated_email", sender: "mateo.ruiz@example.test",
      subject: "CV — Staff Backend Engineer", receivedAt: "2026-09-12T09:40:00.000Z",
      attachment: { fileName: "mateo-ruiz-cv.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, status: "ranked",
      extractionConfidence: 0.92, missingFields: ["experiencia con agentes"], extractionErrors: [],
    },
    evidence: [{ claim: "Sistemas distribuidos", excerpt: "Lideró la plataforma de eventos con Kafka y PostgreSQL para servicios críticos.", source: "cv" }],
    shortlistStatus: "not_selected",
    interviewNotes: [{ round: "System Design", interviewer: "Amin (Tech Lead)", rating: "Strong Yes", date: "11 Sep 2026", notes: "Excelente en confiabilidad; reservar preguntas de agentes y UX de producto." }],
  }
];

export type BudgetAlignment = "within" | "over" | "unknown";

/** Salary missing from a CV is uncertainty, not a $0 request or a positive budget signal. */
export function getBudgetAlignment(candidate: Candidate): BudgetAlignment {
  const salaryUnknown = candidate.application.missingFields.some((field) =>
    /salario|salary|pretensi[oó]n/i.test(field),
  );
  if (salaryUnknown || candidate.salaryNumber <= 0) return "unknown";
  return candidate.salaryNumber <= TARGET_ROLE.budgetMaxSalary ? "within" : "over";
}

const INITIAL_CANDIDATE_STATUSES = new Map(candidates.map((candidate) => [candidate.id, candidate.status]));

const selectionReports = new Map<string, SelectionReport>();

const rankingLabels: Record<RankingCriterionKey, string> = {
  requiredSkills: "Habilidades requeridas",
  relevantExperience: "Experiencia relevante",
  architectureAndAgents: "Arquitectura y agentes",
  leadershipAndCommunication: "Liderazgo y comunicación",
  budgetAlignment: "Alineación presupuestaria",
};

const requiredSkillAliases: Record<string, string[]> = {
  "Next.js": ["next.js", "nextjs"],
  TypeScript: ["typescript"],
  "Python / Agents": ["python", "agents", "agent"],
  "System Design": ["system design", "systems design"],
  "Distributed Systems": ["distributed systems", "sistemas distribuidos"],
};

function isMissing(candidate: Candidate, field: string): boolean {
  return candidate.application.missingFields.some((missing) =>
    missing.toLocaleLowerCase().includes(field.toLocaleLowerCase()),
  );
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Scores only the information that is actually known. Unknown information is
 * surfaced separately and never becomes a negative score.
 */
export function rankCandidate(candidate: Candidate): CandidateRanking {
  const criteria: RankingCriterion[] = [];
  const normalizedSkills = candidate.skills.map((skill) => skill.toLocaleLowerCase());

  const skillIsUnknown = isMissing(candidate, "skills");
  if (skillIsUnknown) {
    criteria.push({
      key: "requiredSkills",
      label: rankingLabels.requiredSkills,
      weight: RANKING_WEIGHTS.requiredSkills,
      score: null,
      status: "unknown",
      evidence: ["El CV no contiene un inventario de habilidades verificable."],
    });
  } else {
    const matched = TARGET_ROLE.requiredSkills.filter((requirement) =>
      (requiredSkillAliases[requirement] ?? [requirement.toLocaleLowerCase()]).some(
        (alias) => normalizedSkills.some((skill) => skill.includes(alias)),
      ),
    );
    criteria.push({
      key: "requiredSkills",
      label: rankingLabels.requiredSkills,
      weight: RANKING_WEIGHTS.requiredSkills,
      score: roundScore((matched.length / TARGET_ROLE.requiredSkills.length) * RANKING_WEIGHTS.requiredSkills),
      status: "assessed",
      evidence: [
        `${matched.length}/${TARGET_ROLE.requiredSkills.length} competencias requeridas encontradas: ${matched.join(", ") || "ninguna"}.`,
      ],
    });
  }

  const experienceIsUnknown = isMissing(candidate, "experiencia") || isMissing(candidate, "experience");
  if (experienceIsUnknown) {
    criteria.push({
      key: "relevantExperience",
      label: rankingLabels.relevantExperience,
      weight: RANKING_WEIGHTS.relevantExperience,
      score: null,
      status: "unknown",
      evidence: ["El CV no permite verificar años de experiencia relevante."],
    });
  } else {
    criteria.push({
      key: "relevantExperience",
      label: rankingLabels.relevantExperience,
      weight: RANKING_WEIGHTS.relevantExperience,
      score: roundScore(Math.min(candidate.experienceYears / 7, 1) * RANKING_WEIGHTS.relevantExperience),
      status: "assessed",
      evidence: [`${candidate.experienceYears} años de experiencia declarada; el benchmark del rol es 7 años.`],
    });
  }

  const architectureIsUnknown = isMissing(candidate, "arquitectura") || isMissing(candidate, "architecture");
  if (architectureIsUnknown) {
    criteria.push({
      key: "architectureAndAgents",
      label: rankingLabels.architectureAndAgents,
      weight: RANKING_WEIGHTS.architectureAndAgents,
      score: null,
      status: "unknown",
      evidence: ["No hay evidencia suficiente para evaluar arquitectura o agentes."],
    });
  } else {
    const architectureAverage = (candidate.ratings.systemDesign + candidate.ratings.architecture) / 20;
    criteria.push({
      key: "architectureAndAgents",
      label: rankingLabels.architectureAndAgents,
      weight: RANKING_WEIGHTS.architectureAndAgents,
      score: roundScore(architectureAverage * RANKING_WEIGHTS.architectureAndAgents),
      status: "assessed",
      evidence: [
        `System Design ${candidate.ratings.systemDesign}/10 y Arquitectura ${candidate.ratings.architecture}/10.`,
      ],
    });
  }

  const leadershipIsUnknown = isMissing(candidate, "liderazgo") || isMissing(candidate, "communication");
  if (leadershipIsUnknown) {
    criteria.push({
      key: "leadershipAndCommunication",
      label: rankingLabels.leadershipAndCommunication,
      weight: RANKING_WEIGHTS.leadershipAndCommunication,
      score: null,
      status: "unknown",
      evidence: ["No hay evidencia suficiente de liderazgo o comunicación."],
    });
  } else {
    const leadershipAverage = (candidate.ratings.leadership + candidate.ratings.communication) / 20;
    criteria.push({
      key: "leadershipAndCommunication",
      label: rankingLabels.leadershipAndCommunication,
      weight: RANKING_WEIGHTS.leadershipAndCommunication,
      score: roundScore(leadershipAverage * RANKING_WEIGHTS.leadershipAndCommunication),
      status: "assessed",
      evidence: [
        `Liderazgo ${candidate.ratings.leadership}/10 y Comunicación ${candidate.ratings.communication}/10.`,
      ],
    });
  }

  const salaryIsUnknown = isMissing(candidate, "salario") || isMissing(candidate, "salary");
  if (salaryIsUnknown) {
    criteria.push({
      key: "budgetAlignment",
      label: rankingLabels.budgetAlignment,
      weight: RANKING_WEIGHTS.budgetAlignment,
      score: null,
      status: "unknown",
      evidence: ["La pretensión salarial no fue encontrada en la postulación."],
    });
  } else {
    const withinBudget = candidate.salaryNumber <= TARGET_ROLE.budgetMaxSalary;
    criteria.push({
      key: "budgetAlignment",
      label: rankingLabels.budgetAlignment,
      weight: RANKING_WEIGHTS.budgetAlignment,
      score: withinBudget ? RANKING_WEIGHTS.budgetAlignment : 0,
      status: "assessed",
      evidence: [
        withinBudget
          ? `Pretensión de $${candidate.salaryNumber.toLocaleString()} dentro del tope de $${TARGET_ROLE.budgetMaxSalary.toLocaleString()}.`
          : `Pretensión de $${candidate.salaryNumber.toLocaleString()} supera el tope en $${(candidate.salaryNumber - TARGET_ROLE.budgetMaxSalary).toLocaleString()}.`,
      ],
    });
  }

  const assessed = criteria.filter((criterion) => criterion.status === "assessed");
  const evaluatedWeight = assessed.reduce((total, criterion) => total + criterion.weight, 0);
  const earnedScore = assessed.reduce((total, criterion) => total + (criterion.score ?? 0), 0);
  const unknownWeight = 100 - evaluatedWeight;
  const score = evaluatedWeight === 0 ? 0 : roundScore((earnedScore / evaluatedWeight) * 100);
  const unknownCriteria = criteria.filter((criterion) => criterion.status === "unknown");
  const risks = [...candidate.redFlags];

  if (unknownCriteria.length > 0) {
    risks.push(`Revisión humana requerida: faltan datos para ${unknownCriteria.map((criterion) => criterion.label.toLocaleLowerCase()).join(", ")}.`);
  }

  return {
    candidateId: candidate.id,
    score,
    evaluatedWeight,
    unknownWeight,
    requiresHumanReview: unknownCriteria.length > 0,
    criteria,
    strengths: [...candidate.pros],
    risks,
    explanation:
      unknownCriteria.length > 0
        ? `${candidate.name} obtuvo ${score}/100 con ${evaluatedWeight}% de la rúbrica evaluada; los datos faltantes quedan como desconocidos y requieren revisión humana.`
        : `${candidate.name} obtuvo ${score}/100 según la rúbrica transparente del rol y la evidencia disponible.`,
  };
}

export function getCandidateRanking(candidateId: string): CandidateRanking {
  return rankCandidate(findCandidate(candidateId));
}

export function getRankedCandidates(): CandidateRanking[] {
  return candidates
    .map(rankCandidate)
    .sort((left, right) => right.score - left.score);
}

function selectionSnapshot(candidate: Candidate): SelectionRankingSnapshot {
  const ranking = rankCandidate(candidate);
  return {
    candidateId: candidate.id,
    candidateName: candidate.name,
    score: ranking.score,
    evaluatedWeight: ranking.evaluatedWeight,
    unknownWeight: ranking.unknownWeight,
    explanation: ranking.explanation,
  };
}

export function createSelectionReport(
  candidateIds: string[],
  reason: string,
  requestedFormats: ExportFormat[] = ["pdf", "docx", "xlsx"],
): SelectionReport {
  const uniqueCandidateIds = [...new Set(candidateIds)];
  const uniqueFormats = [...new Set(requestedFormats)];
  if (uniqueCandidateIds.length === 0) {
    throw new Error("La shortlist debe incluir al menos un candidato.");
  }
  if (!reason.trim()) {
    throw new Error("La decisión de shortlist requiere una justificación.");
  }
  if (uniqueFormats.length === 0) {
    throw new Error("Selecciona al menos un formato de exportación.");
  }

  const selected = uniqueCandidateIds.map(findCandidate);
  const report: SelectionReport = {
    id: `SELECTION-${Date.now()}`,
    candidateIds: uniqueCandidateIds,
    rankings: selected.map(selectionSnapshot),
    reason: reason.trim(),
    requestedFormats: uniqueFormats,
    status: "pending_approval",
    requestedAt: new Date().toISOString(),
    interviewProposalIds: [],
    plannedInterviews: [],
  };

  for (const candidate of selected) {
    candidate.shortlistStatus = "pending_approval";
    candidate.application.status = "shortlist_pending";
  }
  selectionReports.set(report.id, report);
  return report;
}

export function getSelectionReport(reportId: string): SelectionReport | undefined {
  return selectionReports.get(reportId);
}

export function approveSelectionReport(
  reportId: string,
  approvedBy = "Recruiting Lead (Marcelo)",
): SelectionReport {
  const report = selectionReports.get(reportId);
  if (!report) throw new Error(`Shortlist ${reportId} no encontrada.`);
  if (report.status !== "pending_approval") {
    throw new Error("Solo una shortlist pendiente puede aprobarse.");
  }

  const approved: SelectionReport = {
    ...report,
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvedBy,
  };
  for (const candidateId of report.candidateIds) {
    const candidate = findCandidate(candidateId);
    candidate.shortlistStatus = "shortlisted";
    candidate.application.status = "shortlisted";
  }
  selectionReports.set(reportId, approved);
  return approved;
}

export function rejectSelectionReport(
  reportId: string,
  rejectedBy: string,
  rejectionReason: string,
): SelectionReport {
  const report = selectionReports.get(reportId);
  if (!report) throw new Error(`Shortlist ${reportId} no encontrada.`);
  if (report.status !== "pending_approval") {
    throw new Error("Solo una shortlist pendiente puede rechazarse.");
  }
  if (!rejectionReason.trim()) {
    throw new Error("El rechazo de shortlist requiere un motivo.");
  }

  const rejected: SelectionReport = {
    ...report,
    status: "rejected",
    rejectedAt: new Date().toISOString(),
    rejectedBy,
    rejectionReason: rejectionReason.trim(),
  };
  for (const candidateId of report.candidateIds) {
    const candidate = findCandidate(candidateId);
    candidate.shortlistStatus = "not_selected";
    candidate.application.status = "ranked";
  }
  selectionReports.set(reportId, rejected);
  return rejected;
}

/** Exporters must call this only after the explicit shortlist approval. */
export function markSelectionReportExported(
  reportId: string,
  exportedFormats: ExportFormat[],
): SelectionReport {
  const report = selectionReports.get(reportId);
  if (!report) throw new Error(`Shortlist ${reportId} no encontrada.`);
  if (report.status !== "approved") {
    throw new Error("La exportación requiere una aprobación humana previa.");
  }
  const uniqueFormats = [...new Set(exportedFormats)];
  if (uniqueFormats.length === 0 || uniqueFormats.some((format) => !report.requestedFormats.includes(format))) {
    throw new Error("Los formatos exportados deben coincidir con los aprobados.");
  }

  const exported: SelectionReport = {
    ...report,
    status: "exported",
    exportedAt: new Date().toISOString(),
    exportedFormats: uniqueFormats,
  };
  for (const candidateId of report.candidateIds) {
    const candidate = findCandidate(candidateId);
    candidate.application.status = "exported";
  }
  selectionReports.set(reportId, exported);
  return exported;
}

export function getCandidate(id?: string): Candidate | undefined {
  if (!id) return undefined;
  return candidates.find((item) => item.id === id);
}

export function getOrFirstCandidate(id?: string): Candidate {
  return getCandidate(id) ?? candidates[0];
}

export function findCandidate(id: string): Candidate {
  const c = candidates.find((item) => item.id === id);
  if (!c) {
    throw new Error(`Candidato ${id} no encontrado. Opciones: ${candidates.map(x => x.id).join(", ")}`);
  }
  return c;
}

// In-memory store for candidate offers (drafts, pending approval, approved)
const candidateOffers = new Map<string, CandidateOffer>();

export function getOfferForCandidate(candidateId: string): CandidateOffer | undefined {
  return candidateOffers.get(candidateId) ?? candidates.find((c) => c.id === candidateId)?.offer;
}

export function createDefaultOffer(candidate: Candidate): CandidateOffer {
  const isWithinBudget = candidate.salaryNumber <= TARGET_ROLE.budgetMaxSalary;
  const proposedSalary = isWithinBudget ? candidate.salaryNumber : TARGET_ROLE.budgetMaxSalary;

  return {
    id: `OFFER-${candidate.id}-${Date.now()}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    role: TARGET_ROLE.title,
    proposedSalary,
    salaryCurrency: TARGET_ROLE.currency,
    budgetMaxSalary: TARGET_ROLE.budgetMaxSalary,
    equity: "0.25% (4 años vesting, 1 año cliff)",
    startDate: "2026-10-01",
    notes: isWithinBudget
      ? `Oferta alineada con pretensión salarial ($${candidate.salaryNumber.toLocaleString()} USD) dentro del presupuesto autorizado.`
      : `Ajuste salarial al tope presupuestario ($${TARGET_ROLE.budgetMaxSalary.toLocaleString()} USD) para cumplir con el rango del departamento.`,
    status: "pending_approval",
    createdAt: new Date().toISOString(),
  };
}

export function saveOfferDraft(offer: CandidateOffer): CandidateOffer {
  candidateOffers.set(offer.candidateId, offer);
  const cand = getCandidate(offer.candidateId);
  if (cand) {
    cand.offer = offer;
  }
  return offer;
}

export function approveCandidateOffer(
  candidateId: string,
  offerData?: Partial<CandidateOffer>,
  approvedBy = "Recruiting Lead (Marcelo)",
): CandidateOffer {
  const candidate = findCandidate(candidateId);
  if (
    offerData?.proposedSalary !== undefined &&
    (isNaN(offerData.proposedSalary) || offerData.proposedSalary <= 0)
  ) {
    throw new Error(
      `Salario propuesto inválido: ${offerData.proposedSalary}. Debe ser un número positivo.`,
    );
  }
  const baseOffer = getOfferForCandidate(candidateId) ?? createDefaultOffer(candidate);

  const approvedOffer: CandidateOffer = {
    ...baseOffer,
    ...offerData,
    candidateId: candidate.id,
    candidateName: candidate.name,
    status: "approved",
    approvedAt: new Date().toISOString(),
    approvedBy,
  };

  // Enforce Human-in-the-Loop transition: candidate status transitions to "Offer Extended"
  candidate.status = "Offer Extended";
  candidate.offer = approvedOffer;
  candidateOffers.set(candidateId, approvedOffer);

  return approvedOffer;
}

export function rejectCandidateOffer(
  candidateId: string,
  reason?: string,
): CandidateOffer | null {
  const candidate = getCandidate(candidateId);
  const existing =
    getOfferForCandidate(candidateId) ??
    (candidate ? createDefaultOffer(candidate) : undefined);
  if (!existing) return null;

  const rejectedOffer: CandidateOffer = {
    ...existing,
    status: "rejected",
    notes: reason
      ? `${existing.notes ? existing.notes + " | " : ""}Motivo de ajuste/rechazo: ${reason}`
      : existing.notes,
  };

  candidateOffers.set(candidateId, rejectedOffer);
  if (candidate) {
    if (candidate.status === "Offer Extended") {
      candidate.status = "Finalist";
    }
    candidate.offer = rejectedOffer;
  }
  return rejectedOffer;
}

export function resetCandidateOffersForTesting(): void {
  candidateOffers.clear();
  selectionReports.clear();
  for (const c of candidates) {
    delete c.offer;
    c.status = INITIAL_CANDIDATE_STATUSES.get(c.id) ?? "Review";
    c.shortlistStatus = "not_selected";
    c.application.status = "ranked";
  }
}

export function candidatesWorkspaceContext(selectedId: string) {
  const selected = getOrFirstCandidate(selectedId);
  const offer = getOfferForCandidate(selected.id);

  return {
    targetPosition: TARGET_ROLE,
    availableCandidates: candidates.map(
      ({ id, name, appliedRole, status, salaryExpectation, ratings, application, shortlistStatus }) => ({
        id,
        name,
        appliedRole,
        status,
        salaryExpectation,
        ratings,
        application: {
          source: application.source,
          status: application.status,
          attachment: application.attachment.fileName,
          missingFields: application.missingFields,
        },
        shortlistStatus,
        ranking: getCandidateRanking(id),
      }),
    ),
    selectedCandidate: selected,
    selectedCandidateRanking: rankCandidate(selected),
    activeOffer: offer ?? null,
    humanInTheLoopPolicy: {
      status: offer?.status ?? "none",
      approvalRequired: true,
      boundaryDescription:
        "Las ofertas formales, shortlist y exportaciones requieren confirmación humana explícita antes de ejecutarse.",
      allowedActions: [
        "review_offer",
        "propose_offer_for_human_review",
        "propose_shortlist_for_human_review",
        "read_interviews_and_availability",
        "propose_interview_for_human_review",
      ],
      prohibitedAgentTransitions: CRITICAL_CANDIDATE_STATUSES,
    },
    rubricEvaluationTip:
      "Usa la rúbrica: habilidades 45%, experiencia 25%, arquitectura/agentes 15%, liderazgo/comunicación 10% y presupuesto 5%. Los datos faltantes deben presentarse como desconocidos, no como puntos negativos. La IA puede proponer entrevistas, nunca agendarlas ni enviar invitaciones.",
  };
}

