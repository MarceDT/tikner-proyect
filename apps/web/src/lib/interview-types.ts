/**
 * TalentScore — Contrato de Calendario y Entrevistas Programadas
 * Diseñado por Milena para coordinación con Marcelo (Dominio & Producto).
 *
 * Si el backend/store de Marcelo aún no implementa persistencia para este modelo,
 * este módulo provee la especificación tipada limpia y vacía (sin datos simulados falsos),
 * junto con funciones utilitarias puras para detección visual de conflictos de agenda.
 */

export type InterviewStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface ScheduledInterview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  interviewer: string;
  round: string;
  date: string; // Formato YYYY-MM-DD
  startTime: string; // Formato HH:mm (24h)
  endTime: string; // Formato HH:mm (24h)
  status: InterviewStatus;
  hasConflict?: boolean;
  conflictReason?: string;
  meetingUrl?: string;
  notes?: string;
}

/**
 * Arreglo inicial tipado y vacío.
 * No inventa eventos falsos; se alimenta de la agenda real del reclutador
 * o de las propuestas acordadas.
 */
export const initialScheduledInterviews: ScheduledInterview[] = [];

/**
 * Detecta si dos entrevistas se solapan en fecha y horario para el mismo entrevistador o candidato.
 */
export function hasTimeOverlap(
  intA: Pick<ScheduledInterview, "date" | "startTime" | "endTime">,
  intB: Pick<ScheduledInterview, "date" | "startTime" | "endTime">
): boolean {
  if (intA.date !== intB.date) return false;
  // Comparación lexicográfica estándar para formato militar HH:mm
  return intA.startTime < intB.endTime && intB.startTime < intA.endTime;
}

/**
 * Evalúa una lista de entrevistas y anota banderas de conflicto visual
 * cuando un entrevistador o candidato tiene citas solapadas.
 */
export function evaluateInterviewConflicts(
  interviews: ScheduledInterview[]
): ScheduledInterview[] {
  return interviews.map((current, index) => {
    if (current.status === "cancelled") {
      return { ...current, hasConflict: false, conflictReason: undefined };
    }

    // Buscar conflictos con cualquier otra entrevista activa
    for (let i = 0; i < interviews.length; i++) {
      if (i === index) continue;
      const other = interviews[i];
      if (other.status === "cancelled") continue;

      if (hasTimeOverlap(current, other)) {
        if (current.interviewer.trim().toLowerCase() === other.interviewer.trim().toLowerCase()) {
          return {
            ...current,
            hasConflict: true,
            conflictReason: `Conflicto de agenda: ${current.interviewer} ya tiene asignada la ronda "${other.round}" de ${other.startTime} a ${other.endTime}.`,
          };
        }
        if (current.candidateId === other.candidateId) {
          return {
            ...current,
            hasConflict: true,
            conflictReason: `Conflicto de candidato: ${current.candidateName} tiene otra entrevista simultánea de ${other.startTime} a ${other.endTime}.`,
          };
        }
      }
    }

    return { ...current, hasConflict: false, conflictReason: undefined };
  });
}
