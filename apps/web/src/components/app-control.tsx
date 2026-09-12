"use client";

import { useFrontendTool, useAgentContext } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { findCandidate, candidatesWorkspaceContext, candidates, getOrFirstCandidate } from "@/lib/candidates";
import type { WorkplaceControls } from "@/lib/use-workplace";

async function toolResult<T>(action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Operación de TalentScore fallida.",
    };
  }
}

export function AppControl({
  selectedId,
  selectCandidate,
  selectIncident,
  workplace,
}: {
  selectedId: string;
  selectCandidate: (id: string) => void;
  selectIncident?: (id: string) => void;
  workplace: WorkplaceControls;
}) {
  const { status, propose, retrieve } = workplace;
  const currentCandidate = getOrFirstCandidate(selectedId);

  useAgentContext({
    description:
      "Contexto del espacio de trabajo de TalentScore. Contiene la información del candidato seleccionado actualmente, el puesto al que aplica (Lead Fullstack & AI Systems Engineer, presupuesto $95k USD), notas de entrevistas de Marcelo, Amin y Milena, y las políticas de aprobación. Solo el botón del reclutador en la pantalla puede formalizar una oferta.",
    value: {
      activeCandidate: currentCandidate,
      workspace: candidatesWorkspaceContext(currentCandidate.id),
      workplaceStatus: status?.status ?? "disponible",
      proposalAwaitingApproval: workplace.proposal ?? null,
      lastNotice: workplace.notice,
    } as any,
  });

  useFrontendTool(
    {
      name: "select_candidate",
      description:
        "Abre la ficha de un candidato en el panel de TalentScore. Usa uno de los IDs disponibles: CAND-101 (Sofía), CAND-102 (Lucas), o CAND-103 (Elena).",
      parameters: z.object({ candidateId: z.string() }),
      handler: async ({ candidateId }) => {
        const c = findCandidate(candidateId);
        selectCandidate(c.id);
        if (selectIncident) selectIncident(c.id);
        return `Ficha de ${c.name} (${c.id}) abierta en pantalla. Se actualizó el contexto visual y las notas de entrevista.`;
      },
    },
    [selectCandidate, selectIncident],
  );

  // Alias compatible con tests heredados
  useFrontendTool(
    {
      name: "select_incident",
      description: "Alias para seleccionar un candidato o registro en la vista.",
      parameters: z.object({ incidentId: z.string() }),
      handler: async ({ incidentId }) => {
        const c = getOrFirstCandidate(incidentId);
        selectCandidate(c.id);
        return `Abierto ${c.id} (${c.name}).`;
      },
    },
    [selectCandidate],
  );

  useFrontendTool(
    {
      name: "propose_followup",
      description:
        "Prepara una propuesta de oferta salarial o acción de seguimiento para el candidato seleccionado. No guarda nada hasta que el usuario pulse 'Aprobar' en la pantalla.",
      parameters: z.object({
        incidentId: z.string(),
        title: z.string().trim().min(1).max(200),
        details: z.string().trim().min(1).max(4000),
      }),
      handler: async (draft) =>
        toolResult(async () => ({
          status: "pending_approval",
          proposal: await propose(draft),
        })),
    },
    [propose],
  );

  useFrontendTool(
    {
      name: "retrieve_followup",
      description:
        "Recupera un registro persistente guardado por su ID. Solo lectura.",
      parameters: z.object({ id: z.string() }),
      handler: async ({ id }) => toolResult(() => retrieve(id)),
    },
    [retrieve],
  );

  useFrontendTool(
    {
      name: "refresh_followups",
      description:
        "Refresca y sincroniza las ofertas y tareas del candidato actual desde el almacenamiento.",
      parameters: z.object({}),
      handler: async () => toolResult(() => workplace.refresh()),
    },
    [workplace.refresh],
  );

  return null;
}
