"use client";

import { useFrontendTool, useAgentContext } from "@copilotkit/react-core/v2";
import { z } from "zod";
import {
  candidates,
  findCandidate,
  candidatesWorkspaceContext,
  Candidate,
} from "@/lib/candidates";

export function AppControl({
  selectedId,
  selectCandidate,
  onUpdateStatus,
  shortlistApproved,
  shortlistIds,
  onExportStart,
}: {
  selectedId: string;
  selectCandidate: (id: string) => void;
  onUpdateStatus?: (id: string, status: Candidate["status"]) => void;
  shortlistApproved?: boolean;
  shortlistIds?: Set<string>;
  onExportStart?: () => void;
}) {
  // Give the Copilot agent real-time eyes on the selected candidate, target role, and pipeline.
  useAgentContext({
    description:
      "TalentScore ATS Workspace activo. Contiene el candidato seleccionado en pantalla, la lista completa de candidatos, los requisitos del puesto objetivo (Lead Fullstack & AI Systems Engineer) y el presupuesto tope ($95,000 USD). Utiliza esta información para responder preguntas, comparar perfiles y justificar decisiones salariales.",
    value: candidatesWorkspaceContext(selectedId) as any,
  });

  // Frontend tool: Allows the agent to switch the active candidate on the dashboard screen.
  useFrontendTool(
    {
      name: "select_candidate",
      description:
        "Abre y selecciona un candidato en el dashboard para que el usuario lo vea en la pantalla central. Usa uno de los IDs disponibles: CAND-101 (Sofía Albarracín), CAND-102 (Lucas Varela), CAND-103 (Elena Rostova).",
      parameters: z.object({
        candidateId: z.string().describe("ID del candidato (ej: CAND-101, CAND-102, CAND-103)"),
      }),
      handler: async ({ candidateId }) => {
        try {
          const candidate = findCandidate(candidateId);
          selectCandidate(candidate.id);
          return `Se ha abierto en pantalla el perfil de ${candidate.name} (${candidate.id}), puesto actual: ${candidate.currentTitle}. El reclutador ahora está viendo sus detalles y métricas.`;
        } catch (error) {
          return `Error al seleccionar candidato: ${error instanceof Error ? error.message : "ID no válido"}`;
        }
      },
    },
    [selectCandidate]
  );

  // Frontend tool: Allows the agent or human to update a candidate's status in the recruiting funnel.
  useFrontendTool(
    {
      name: "update_candidate_status",
      description:
        "Actualiza la etapa o estado del candidato en el pipeline de TalentScore (Review, Interviewing, Finalist, Offer Extended, Hired, Rejected).",
      parameters: z.object({
        candidateId: z.string().describe("ID del candidato"),
        newStatus: z.enum([
          "Review",
          "Interviewing",
          "Finalist",
          "Offer Extended",
          "Hired",
          "Rejected",
        ]),
      }),
      handler: async ({ candidateId, newStatus }) => {
        try {
          const candidate = findCandidate(candidateId);
          // Safety guard: Enforce Human-in-the-Loop policy
          if (newStatus === "Offer Extended" || newStatus === "Hired") {
            return `Acción bloqueada: El estado "${newStatus}" es una transición crítica que requiere la aprobación humana explícita del reclutador en la interfaz. Por favor utiliza la compuerta Human-in-the-Loop (propose_action) o solicita confirmación en pantalla.`;
          }
          if (onUpdateStatus) {
            onUpdateStatus(candidateId, newStatus);
          }
          return `El estado de ${candidate.name} se actualizó exitosamente a "${newStatus}".`;
        } catch (error) {
          return `No se pudo actualizar el estado: ${error instanceof Error ? error.message : "Error desconocido"}`;
        }
      },
    },
    [onUpdateStatus]
  );

  // Frontend tool: AI command to export the shortlist
  useFrontendTool(
    {
      name: "export_shortlist",
      description: "Inicia la exportación de la shortlist actual a PDF/Excel. Requiere que la shortlist esté previamente aprobada por el usuario (Human-in-the-Loop).",
      parameters: z.object({}),
      handler: async () => {
        if (!shortlistIds || shortlistIds.size === 0) {
          return "No hay candidatos seleccionados en la shortlist para exportar.";
        }
        if (!shortlistApproved) {
          return "Error: No se puede exportar. La shortlist requiere aprobación humana. Por favor pide al reclutador que haga clic en 'Aprobar Selección' en la compuerta de exportación.";
        }
        if (onExportStart) {
          onExportStart();
        }
        return `Exportación iniciada exitosamente para ${shortlistIds.size} candidato(s). El usuario verá el estado de descarga en pantalla.`;
      }
    },
    [shortlistApproved, shortlistIds, onExportStart]
  );

  return null;
}
