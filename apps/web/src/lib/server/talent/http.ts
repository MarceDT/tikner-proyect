/**
 * Guardas y helpers HTTP para /api/talent/*.
 * Mismo criterio que /api/followups: solo loopback, y los POST deben venir de la propia página
 * (Origin = Host, JSON). Sin usuarios autenticados: `decidedBy`/`requestedBy` se registran tal cual
 * los declara la UI. Un despliegue real debe autenticar en este borde.
 */
import { z } from "zod";
import { TalentError, isTalentError } from "./errors";
import type { TalentService } from "./service";

const LOOPBACK = ["localhost", "127.0.0.1", "[::1]"];

export function guardRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const expected = new URL(url);
  expected.host = request.headers.get("host") || url.host;
  if (!LOOPBACK.includes(expected.hostname)) {
    return json({ error: "This demo accepts loopback hosts only." }, 403);
  }
  if (request.method === "POST") {
    if (request.headers.get("origin") !== expected.origin) {
      return json({ error: "Usá los controles de la propia página de TalentScore." }, 403);
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return json({ error: "Content-Type debe ser application/json." }, 415);
    }
  }
  return null;
}

export function json(value: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return json({ error: `Solicitud inválida: ${error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")}` }, 400);
  }
  if (error instanceof SyntaxError) return json({ error: "El cuerpo debe ser JSON válido." }, 400);
  if (isTalentError(error)) return json({ error: error.message }, error.status);
  console.error("[talent] unexpected error", error);
  return json({ error: "Error interno del pipeline de talento. Revisá DATABASE_URL, la API key del modelo y los logs del servidor." }, 500);
}

/** Envuelve un handler: guardas → servicio → respuesta; cualquier error se mapea a JSON. */
export function talentRoute(
  handler: (ctx: { request: Request; service: TalentService; params: Record<string, string>; url: URL }) => Promise<Response>,
  getService: () => TalentService,
) {
  return async (request: Request, context: { params: Promise<Record<string, string>> }) => {
    const denied = guardRequest(request);
    if (denied) return denied;
    try {
      const params = (await context.params) ?? {};
      return await handler({ request, service: getService(), params, url: new URL(request.url) });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const text = await request.text();
  if (text.length > 20_000) throw new TalentError("La solicitud es demasiado grande.", 413);
  return schema.parse(JSON.parse(text || "{}"));
}
