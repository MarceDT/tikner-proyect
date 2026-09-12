/**
 * Reglas puras de agenda. El único proveedor incluido es `simulated_local`:
 * no llama a Calendar, Outlook ni correo. Un proveedor real puede implementar
 * `InterviewScheduler` sin cambiar la compuerta humana del servicio.
 */
import type {
  Interview,
  InterviewAvailabilityEvidence,
  InterviewConflict,
  InterviewModality,
  InterviewProposal,
  InterviewType,
} from "@/lib/talent-types";

export type InterviewProposalInput = {
  reportId: string;
  candidateApplicationId: string;
  type: InterviewType;
  startsAt: string;
  durationMinutes: number;
  timezone: string;
  interviewers: string[];
  modality: InterviewModality;
  locationOrMeetingUrl?: string | null;
  agenda: string[];
  recommendationReason: string;
};

export interface InterviewScheduler {
  readonly provider: "simulated_local";
  schedule(interview: Interview): Promise<void>;
}

/**
 * A deliberately side-effect-free adapter for the hackathon demo. It records
 * no remote event and sends no invitation; persistence remains in TalentStore.
 */
export class SimulatedLocalInterviewScheduler implements InterviewScheduler {
  readonly provider = "simulated_local" as const;
  async schedule(): Promise<void> {}
}

type PublishedWindow = { startsAt: string; endsAt: string; description: string };

/** Publicada en el dataset demo; no afirma consultar calendarios reales. */
const DEMO_PUBLISHED_AVAILABILITY: Record<string, PublishedWindow[]> = {
  "Sofía Albarracín": [
    {
      startsAt: "2026-09-15T13:00:00-03:00",
      endsAt: "2026-09-15T17:00:00-03:00",
      description: "Ventana publicada por Sofía para entrevista final (dataset demo).",
    },
  ],
  "Lucas Varela": [
    {
      startsAt: "2026-09-16T10:00:00-03:00",
      endsAt: "2026-09-16T12:00:00-03:00",
      description: "Ventana publicada por Lucas; revisar presupuesto y colaboración antes de confirmar (dataset demo).",
    },
  ],
  "Elena Rostova": [
    {
      startsAt: "2026-09-17T14:00:00-03:00",
      endsAt: "2026-09-17T16:00:00-03:00",
      description: "Ventana publicada por Elena para ronda frontend/UX (dataset demo).",
    },
  ],
};

export function isValidTimeZone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

export function assertInterviewProposalInput(input: InterviewProposalInput): void {
  if (!input.reportId.trim() || !input.candidateApplicationId.trim()) {
    throw new Error("La propuesta debe vincularse a una shortlist aprobada y a una postulación.");
  }
  if (!Number.isFinite(input.durationMinutes) || input.durationMinutes < 15 || input.durationMinutes > 240) {
    throw new Error("La duración debe estar entre 15 y 240 minutos.");
  }
  if (Number.isNaN(Date.parse(input.startsAt))) {
    throw new Error("La fecha/hora propuesta debe usar un timestamp ISO válido.");
  }
  if (!isValidTimeZone(input.timezone)) {
    throw new Error(`Zona horaria inválida: ${input.timezone}. Usá una zona IANA, por ejemplo America/Asuncion.`);
  }
  if (!input.recommendationReason.trim()) {
    throw new Error("La IA debe explicar por qué recomienda la entrevista.");
  }
}

export function availabilityForCandidate(candidateName: string, now: string): InterviewAvailabilityEvidence[] {
  const windows = DEMO_PUBLISHED_AVAILABILITY[candidateName];
  if (!windows) {
    return [{
      source: "unknown",
      description: "No hay disponibilidad publicada en este demo; confirmar con la persona candidata.",
      checkedAt: now,
    }];
  }
  return windows.map((window) => ({
    source: "simulated_published_availability",
    description: window.description,
    startsAt: window.startsAt,
    endsAt: window.endsAt,
    checkedAt: now,
  }));
}

function overlaps(leftStart: string, leftMinutes: number, rightStart: string, rightMinutes: number): boolean {
  const leftFrom = Date.parse(leftStart);
  const leftUntil = leftFrom + leftMinutes * 60_000;
  const rightFrom = Date.parse(rightStart);
  const rightUntil = rightFrom + rightMinutes * 60_000;
  return leftFrom < rightUntil && rightFrom < leftUntil;
}

export function detectInterviewConflicts(
  input: InterviewProposalInput,
  evidence: InterviewAvailabilityEvidence[],
  scheduled: Interview[],
): { conflicts: InterviewConflict[]; missingData: string[] } {
  const conflicts: InterviewConflict[] = [];
  const missingData: string[] = [];
  const requestedEnd = Date.parse(input.startsAt) + input.durationMinutes * 60_000;
  const windows = evidence.filter((item) => item.startsAt && item.endsAt);

  if (!windows.length) {
    missingData.push("Disponibilidad de la persona candidata no publicada.");
    conflicts.push({
      type: "missing_data",
      severity: "warning",
      description: "Disponibilidad desconocida: confirmar con la persona candidata antes de agendar.",
    });
  } else if (!windows.some((window) => Date.parse(input.startsAt) >= Date.parse(window.startsAt!) && requestedEnd <= Date.parse(window.endsAt!))) {
    conflicts.push({
      type: "candidate_unavailable",
      severity: "blocking",
      description: "El horario propuesto queda fuera de la disponibilidad publicada en el dataset demo.",
    });
  }

  for (const interview of scheduled) {
    if (!overlaps(input.startsAt, input.durationMinutes, interview.startsAt, interview.durationMinutes)) continue;
    if (interview.candidateApplicationId === input.candidateApplicationId) {
      conflicts.push({
        type: "candidate_unavailable",
        severity: "blocking",
        description: "La persona candidata ya tiene una entrevista solapada.",
      });
    }
    const sharedInterviewers = input.interviewers.filter((name) => interview.interviewers.includes(name));
    if (sharedInterviewers.length) {
      conflicts.push({
        type: "interviewer_busy",
        severity: "blocking",
        description: `Entrevistador(es) con conflicto: ${sharedInterviewers.join(", ")}.`,
      });
    }
  }
  return { conflicts, missingData };
}

export function proposalIsBlocked(proposal: InterviewProposal): boolean {
  return proposal.conflicts.some((conflict) => conflict.severity === "blocking");
}
