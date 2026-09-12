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

export function findCandidate(id: string): Candidate {
  const c = candidates.find((item) => item.id === id);
  if (!c) {
    throw new Error(`Candidato ${id} no encontrado. Opciones: ${candidates.map(x => x.id).join(", ")}`);
  }
  return c;
}

export function candidatesWorkspaceContext(selectedId: string) {
  const selected = findCandidate(selectedId);
  return {
    targetPosition: TARGET_ROLE,
    availableCandidates: candidates.map(({ id, name, appliedRole, status, salaryExpectation, ratings }) => ({
      id,
      name,
      appliedRole,
      status,
      salaryExpectation,
      ratings
    })),
    selectedCandidate: selected,
    rubricEvaluationTip: "Considera presupuesto ($95k max), balance técnico vs liderazgo y feedback de las entrevistas."
  };
}
