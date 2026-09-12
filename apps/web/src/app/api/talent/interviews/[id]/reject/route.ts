import { z } from "zod";
import { talentRoute } from "../../../_shared";
import { json, readJson } from "@/lib/server/talent/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({
  rejectedBy: z.string().trim().min(1).max(120),
  reason: z.string().trim().min(1).max(1000),
}).strict();

/** Human rejection retains audit evidence and creates no appointment. */
export const POST = talentRoute(async ({ request, service, params }) => {
  const input = await readJson(request, body);
  return json(await service.rejectInterviewProposal(params.id, input.rejectedBy, input.reason));
});
