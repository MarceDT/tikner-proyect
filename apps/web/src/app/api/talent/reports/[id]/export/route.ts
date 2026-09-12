/**
 * GET ?format=pdf|docx|xlsx&requestedBy=Nombre
 * Genera y descarga el archivo. 409 si el reporte no tiene aprobación humana registrada.
 */
import { z } from "zod";
import { talentRoute } from "../../../_shared";
import { json } from "@/lib/server/talent/http";
import { EXPORT_CONTENT_TYPES } from "@/lib/server/talent/exports";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const query = z.object({
  format: z.enum(["pdf", "docx", "xlsx"]),
  requestedBy: z.string().trim().min(1).max(120).default("Reclutador"),
});

export const GET = talentRoute(async ({ service, params, url }) => {
  const parsed = query.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return json({ error: "format debe ser pdf, docx o xlsx." }, 400);
  const { file, fileName, event } = await service.exportReport(params.id, parsed.data.format, parsed.data.requestedBy);
  return new Response(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": EXPORT_CONTENT_TYPES[parsed.data.format],
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(file.length),
      "Cache-Control": "no-store",
      "X-Talent-Export-Id": event.id,
    },
  });
});
