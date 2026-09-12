import { z } from "zod";
import { talentRoute } from "../_shared";
import { json, readJson } from "@/lib/server/talent/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({
  topN: z.number().int().min(1).max(10),
  requestedBy: z.string().trim().min(1).max(120),
}).strict();

export const GET = talentRoute(async ({ service }) => json({ reports: await service.listReports() }));

/** Crea un SelectionReport en estado pending. */
export const POST = talentRoute(async ({ request, service }) =>
  json(await service.buildReport(await readJson(request, body)), 201),
);
