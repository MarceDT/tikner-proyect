import { talentRoute } from "../_shared";
import { json } from "@/lib/server/talent/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = talentRoute(async ({ service }) => json({ applications: await service.listApplications() }));
