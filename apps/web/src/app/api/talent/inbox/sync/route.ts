/** POST: sincroniza la bandeja DEMO (simulada) → crea postulaciones nuevas y extrae perfiles. Idempotente. */
import { talentRoute } from "../../_shared";
import { json } from "@/lib/server/talent/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = talentRoute(async ({ service }) => json(await service.syncInbox()));
