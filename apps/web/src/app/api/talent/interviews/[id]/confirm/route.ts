import { z } from "zod";
import { talentRoute } from "../../../_shared";
import { json, readJson } from "@/lib/server/talent/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const checked = z.literal(true);
const body = z.object({
  approvedBy: z.string().trim().min(1).max(120),
  consentConfirmed: checked,
  reviewed: z.object({
    candidate: checked,
    dateAndTime: checked,
    timezone: checked,
    interviewers: checked,
    modality: checked,
  }).strict(),
}).strict();

/**
 * Human-only mutation. The loopback + same-origin guard runs before this
 * handler; the chat agent has no tool that can reach this confirmation path.
 */
export const POST = talentRoute(async ({ request, service, params }) =>
  json(await service.confirmInterview(params.id, await readJson(request, body))),
);
