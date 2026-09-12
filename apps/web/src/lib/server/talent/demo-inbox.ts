/**
 * DEMO DATA — bandeja de entrada simulada.
 *
 * No existe integración con Gmail/IMAP/OAuth ni parsing real de PDF/DOCX.
 * Los "adjuntos" son texto plano ya extraído, incluido acá para que el pipeline
 * (extracción LLM → ranking → aprobación → export) pueda demostrarse de punta a punta.
 * Reemplazar `readDemoInbox` por un lector real es el punto de extensión.
 */
import type { ApplicationSource } from "@/lib/talent-types";

export const DEMO_INBOX_SOURCE: ApplicationSource = "demo-inbox";

export interface DemoInboxMessage {
  messageId: string;
  from: string;
  subject: string;
  receivedAt: string;
  /** Nombre del adjunto simulado. Si falta, el CV venía en el cuerpo del correo. */
  attachmentName?: string;
  /** Cuerpo del correo (texto). */
  bodyText: string;
  /** Texto del CV tal como lo leería un parser (aquí ya en texto plano). */
  cvText: string;
}

export const DEMO_INBOX_MESSAGES: readonly DemoInboxMessage[] = [
  {
    messageId: "<demo-001@talentscore.local>",
    from: "valentina.ferreyra@example.com",
    subject: "Postulación — Lead Fullstack & AI Systems Engineer",
    receivedAt: "2026-09-10T13:05:00.000Z",
    attachmentName: "CV_Valentina_Ferreyra.pdf",
    bodyText:
      "Hola, adjunto mi CV para la posición de Lead Fullstack & AI Systems Engineer. Quedo atenta. Saludos, Valentina.",
    cvText: `VALENTINA FERREYRA
Senior Fullstack Engineer & AI Platform Lead
Email: valentina.ferreyra@example.com | Tel: +54 9 11 5555-0142 | Córdoba, Argentina (remoto)

PERFIL
Ingeniera de software con 8 años de experiencia construyendo productos web de alto tráfico y, en los últimos 3 años, plataformas de agentes de IA en producción. Lideré equipos de hasta 6 personas.

EXPERIENCIA
Nubia Labs — Tech Lead, AI Platform (2023 – presente)
- Diseñé la arquitectura de un orquestador de agentes con Next.js 15, TypeScript y Python (LangGraph) que procesa 40k conversaciones/día.
- Introduje observabilidad de LLM (tracing, evals) y reduje el costo por conversación un 35%.
- Mentoría técnica y entrevistas de contratación.

Rappi — Senior Fullstack Engineer (2019 – 2023)
- Migración de un monolito a servicios en Node.js/TypeScript sobre Kubernetes.
- Diseño de sistemas distribuidos con Kafka y PostgreSQL para el dominio de pagos.

Globant — Fullstack Developer (2018 – 2019)
- React, Node.js, GraphQL.

SKILLS
TypeScript, Next.js, React, Node.js, Python, LangGraph, PostgreSQL, Kafka, Kubernetes, System Design, Distributed Systems, Docker

EDUCACIÓN
Ingeniería en Sistemas — Universidad Nacional de Córdoba (2017)

PRETENSIÓN SALARIAL
USD 90,000 anuales (remoto, contractor).`,
  },
  {
    messageId: "<demo-002@talentscore.local>",
    from: "tomas.ibarra@example.com",
    subject: "CV Tomás Ibarra – Lead Engineer",
    receivedAt: "2026-09-11T09:42:00.000Z",
    attachmentName: "tomas_ibarra_cv.docx",
    bodyText:
      "Buenas, les envío mi CV. Mi pretensión salarial es de USD 130.000 al año. Disponibilidad inmediata.",
    cvText: `Tomás Ibarra
Principal Backend Engineer
tomas.ibarra@example.com · Montevideo, Uruguay · +598 99 123 456

Resumen
12 años de experiencia en backend de alta concurrencia para fintech y trading. Especialista en Go, Rust y bases de datos distribuidas.

Experiencia
dLocal — Principal Engineer (2020 – presente)
· Lidero el equipo de plataforma de pagos (9 ingenieros). Sistemas con picos de 1.2M RPS.
· Diseño de arquitectura event-driven con Kafka y CockroachDB.
· Definí estándares de System Design y revisiones de arquitectura de toda la empresa.

Mercado Libre — Senior Software Engineer (2015 – 2020)
· Servicios core de checkout en Go y Java sobre Kubernetes.
· Optimización de PostgreSQL a escala (particionado, réplicas).

Skills
Go, Rust, Java, Kafka, PostgreSQL, CockroachDB, Kubernetes, gRPC, Distributed Systems, System Design, C++

Nota: no tengo experiencia con Next.js ni con desarrollo de agentes de IA, pero aprendo rápido.

Pretensión salarial: USD 130.000 / año.`,
  },
  {
    messageId: "<demo-003@talentscore.local>",
    from: "camila.nunes@example.com",
    subject: "Interesada en el puesto de Lead Fullstack",
    receivedAt: "2026-09-11T18:20:00.000Z",
    bodyText: `Hola equipo,

Vi la búsqueda de Lead Fullstack & AI Systems Engineer y me interesa mucho. No tengo el CV en PDF a mano así que les paso mi trayectoria acá abajo. Sobre salario, prefiero conversarlo en una entrevista.

Camila Nunes
Fullstack Developer — São Paulo, Brasil
camila.nunes@example.com

Actualmente en Loft (2022 – presente) como Fullstack Developer: construyo features con Next.js, TypeScript y Python (FastAPI). Este año armé un asistente interno con OpenAI y RAG sobre documentación que usan 200 personas.

Antes, en QuintoAndar (2020 – 2022), Frontend Developer con React y Design Systems.

Skills: Next.js, TypeScript, React, Python, FastAPI, OpenAI API, RAG, Tailwind, PostgreSQL

Formación: Ciência da Computação — USP (2020).

Gracias!`,
    cvText: `Camila Nunes
Fullstack Developer — São Paulo, Brasil
camila.nunes@example.com

Actualmente en Loft (2022 – presente) como Fullstack Developer: construyo features con Next.js, TypeScript y Python (FastAPI). Este año armé un asistente interno con OpenAI y RAG sobre documentación que usan 200 personas.

Antes, en QuintoAndar (2020 – 2022), Frontend Developer con React y Design Systems.

Skills: Next.js, TypeScript, React, Python, FastAPI, OpenAI API, RAG, Tailwind, PostgreSQL

Formación: Ciência da Computação — USP (2020).

Sobre salario, prefiero conversarlo en una entrevista.`,
  },
  {
    messageId: "<demo-004@talentscore.local>",
    from: "sofia.albarracin@example.test",
    subject: "Postulación — Lead Fullstack & AI Systems Engineer",
    receivedAt: "2026-09-12T08:15:00.000Z",
    attachmentName: "sofia-albarracin-cv.pdf",
    bodyText: "CV de demostración de Sofía. La disponibilidad y el correo son datos simulados.",
    cvText: `Sofía Albarracín
Senior Fullstack Architect
sofia.albarracin@example.test · Remoto UTC-3

Siete años liderando squads técnicos en productos SaaS. Diseñé plataformas web escalables y un orquestador de agentes con TypeScript, Next.js, Python y PostgreSQL. En mi último rol facilité revisiones de arquitectura y mentorías para un equipo de siete personas.

Experiencia
TechSur — Staff Engineer (2022 – presente)
- Arquitectura de agentes con colas asíncronas, tracing y evaluación de calidad.
- Diseño de sistemas distribuidos y mentoría de desarrolladores.

Skills: TypeScript, Next.js, Python, Agents, System Design, Distributed Systems, PostgreSQL, Docker
Pretensión salarial: USD 92,000 anuales.`,
  },
  {
    messageId: "<demo-005@talentscore.local>",
    from: "lucas.varela@example.test",
    subject: "CV — Principal Systems Engineer",
    receivedAt: "2026-09-12T08:22:00.000Z",
    attachmentName: "lucas-varela-cv.docx",
    bodyText: "CV de demostración de Lucas; su riesgo presupuestario debe mostrarse de forma transparente.",
    cvText: `Lucas Varela
Principal Systems Engineer
lucas.varela@example.test · Buenos Aires, Argentina

Once años creando sistemas de baja latencia y bases de datos distribuidas para fintech. Experiencia profunda en Go, Rust, Kafka, PostgreSQL, Kubernetes y System Design. Lideré iniciativas técnicas, aunque el feedback de colaboración requiere una conversación adicional.

Experiencia
FinCore — Principal Engineer (2019 – presente)
- Sistemas event-driven con más de un millón de requests por segundo.
- Diseño de arquitectura distribuida y revisiones técnicas.

Skills: Go, Rust, TypeScript, Kafka, PostgreSQL, Kubernetes, Distributed Systems, System Design
Pretensión salarial: USD 125,000 anuales.`,
  },
  {
    messageId: "<demo-006@talentscore.local>",
    from: "elena.rostova@example.test",
    subject: "Application — Senior Frontend & Creative Technologist",
    receivedAt: "2026-09-12T08:31:00.000Z",
    attachmentName: "elena-rostova-cv.pdf",
    bodyText: "CV de demostración de Elena; perfil complementario de frontend y UX.",
    cvText: `Elena Rostova
Senior Frontend & Creative Technologist
elena.rostova@example.test · Remoto UTC+2

Cinco años creando interfaces accesibles para productos digitales. Construí experiencias de IA generativa, sistemas de diseño y prototipos interactivos con React y Next.js. Mi experiencia de backend distribuido es menor y debe revisarse como una limitación de alcance, no como un dato inventado.

Experiencia
Studio Nova — Senior Frontend Engineer (2023 – presente)
- Lideré el Design System y workshops de accesibilidad con producto.
- Prototipos de interfaces agénticas con React, Next.js y Python.

Skills: React, Next.js, TypeScript, Python, Design Systems, Generative UI, Tailwind
Pretensión salarial: USD 80,000 anuales.`,
  },
];

/** Lee la bandeja simulada. Firma async para que un lector real (IMAP, webhook) pueda reemplazarla. */
export async function readDemoInbox(): Promise<DemoInboxMessage[]> {
  return DEMO_INBOX_MESSAGES.map((m) => ({ ...m }));
}
