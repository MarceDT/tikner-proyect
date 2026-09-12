/**
 * TalentScore — Candidate Data Model & Domain Definitions (Idea 5: HR Tech)
 * Shared contract for Amin (Agent Backend) and Milena (Frontend & Generative UI).
 */

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
  offer?: CandidateOffer;
}


export const TARGET_ROLE = {
  title: "Lead Fullstack & AI Systems Engineer",
  department: "Product Engineering",
  budgetMaxSalary: 95000,
  currency: "USD",
  requiredSkills: ["Next.js", "TypeScript", "Python / Agents", "System Design", "Distributed Systems"],
};

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
    skills: ["TypeScript", "Next.js", "Python", "CopilotKit", "PostgreSQL", "Docker", "System Design"],
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
  }
];

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
  for (const c of candidates) {
    delete c.offer;
    if (c.id === "CAND-101") c.status = "Finalist";
    if (c.id === "CAND-102") c.status = "Interviewing";
    if (c.id === "CAND-103") c.status = "Review";
  }
}

export function candidatesWorkspaceContext(selectedId: string) {
  const selected = getOrFirstCandidate(selectedId);
  const offer = getOfferForCandidate(selected.id);

  return {
    targetPosition: TARGET_ROLE,
    availableCandidates: candidates.map(
      ({ id, name, appliedRole, status, salaryExpectation, ratings }) => ({
        id,
        name,
        appliedRole,
        status,
        salaryExpectation,
        ratings,
      }),
    ),
    selectedCandidate: selected,
    activeOffer: offer ?? null,
    humanInTheLoopPolicy: {
      status: offer?.status ?? "none",
      approvalRequired: true,
      boundaryDescription:
        "Las ofertas formales y modificaciones salariales requieren confirmación humana explícita antes de emitirse legalmente.",
      allowedActions: [
        "review_offer",
        "approve_and_extend_offer",
        "reject_or_adjust_offer",
      ],
    },
    rubricEvaluationTip:
      "Considera presupuesto ($95k max), balance técnico vs liderazgo y feedback de las entrevistas.",
  };
}

