/**
 * POST: registra la decisión humana sobre el reporte (aprobar / rechazar).
 * Este es el ÚNICO camino para aprobar; el agente no tiene acceso.
 */
import { z } from "zod";
import { talentRoute } from "../../../_shared";
import { json, readJson } from "@/lib/server/talent/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({
  decision: z.enum(["approved", "rejected"]),
  decidedBy: z.string().trim().min(1).max(120),
  note: z.string().trim().max(1000).optional(),
}).strict();

export const POST = talentRoute(async ({ request, service, params }) =>
  json(await service.decide(params.id, await readJson(request, body))),
);
