/**
 * Tools de talento para el agente (server-side, tipadas con zod).
 *
 * El agente puede LEER, EVALUAR, COMPARAR y PROPONER un reporte (que nace `pending`).
 * Deliberadamente NO existen tools para aprobar ni exportar: esas acciones sensibles
 * viven en endpoints HTTP que solo un humano dispara desde la UI.
 *
 * `TalentToolsBackend` es el contrato mínimo que apps/web implementa con `TalentService`;
 * agent-core no depende de apps/web.
 */
import { defineTool, type ToolDefinition } from "@copilotkit/runtime/v2";
import { z } from "zod";

export interface TalentToolsBackend {
  listApplications(): Promise<unknown[]>;
  getApplication(id: string): Promise<unknown>;
  evaluate(applicationId: string): Promise<unknown>;
  compare(applicationIds: string[]): Promise<unknown>;
  buildReport(input: { topN: number; requestedBy: string }): Promise<unknown>;
}

export const TALENT_TOOL_NAMES = [
  "list_applications",
  "get_candidate_profile",
  "evaluate_candidate",
  "compare_candidates",
  "build_selection_report",
] as const;

const applicationId = z.string().trim().min(1).describe("ID de la postulación, p. ej. APP-3F2A9C1B7D.");

/** Errores de dominio vuelven como resultado (no excepción) para que el modelo pueda explicarlos. */
async function safe<T>(action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Operación de talento fallida." };
  }
}

export function createTalentTools(backend: TalentToolsBackend): ToolDefinition[] {
  return [
    defineTool({
      name: "list_applications",
      description:
        "Lista las postulaciones recibidas por email (bandeja DEMO simulada) con su estado de extracción y un resumen del perfil. Usala para conocer los IDs disponibles.",
      parameters: z.object({}),
      execute: async () => safe(() => backend.listApplications()),
    }),
    defineTool({
      name: "get_candidate_profile",
      description:
        "Devuelve el perfil estructurado extraído de un CV: contacto, experiencia, skills, pretensión salarial, evidencia citada, campos faltantes y confianza. Los campos null NO existen en el CV: no los completes.",
      parameters: z.object({ applicationId }),
      execute: async ({ applicationId }) => safe(() => backend.getApplication(applicationId)),
    }),
    defineTool({
      name: "evaluate_candidate",
      description:
        "Evalúa una postulación contra el puesto objetivo. Devuelve score 0-100, desglose por criterio (skills, experiencia, presupuesto, completitud) con razonamiento y evidencia, riesgos y datos faltantes. Determinista: dos llamadas dan el mismo resultado.",
      parameters: z.object({ applicationId }),
      execute: async ({ applicationId }) => safe(() => backend.evaluate(applicationId)),
    }),
    defineTool({
      name: "compare_candidates",
      description:
        "Compara de 2 a 10 postulaciones: ranking ordenado y diferencias por criterio respecto del primero. Resumí fortalezas, riesgos y desvío presupuestario sin inventar datos.",
      parameters: z.object({
        applicationIds: z.array(applicationId).min(2).max(10),
      }),
      execute: async ({ applicationIds }) => safe(() => backend.compare(applicationIds)),
    }),
    defineTool({
      name: "build_selection_report",
      description:
        "Genera un SelectionReport con el ranking completo y una shortlist con los mejores topN (1-10). El reporte queda PENDIENTE de aprobación humana: no podés aprobarlo ni exportarlo; indicá al reclutador que lo revise y apruebe desde la pantalla.",
      parameters: z.object({
        topN: z.number().int().min(1).max(10).describe("Cantidad de candidatos en la shortlist."),
        requestedBy: z.string().trim().min(1).max(120).default("Agente TalentScore").describe("Quién pidió el reporte."),
      }),
      execute: async ({ topN, requestedBy }) => safe(() => backend.buildReport({ topN, requestedBy })),
    }),
  ];
}
