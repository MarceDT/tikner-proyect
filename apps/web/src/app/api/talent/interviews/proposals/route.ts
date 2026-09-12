import { z } from "zod";
import { talentRoute } from "../../_shared";
import { json, readJson } from "@/lib/server/talent/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const body = z.object({
  reportId: z.string().trim().min(1),
  candidateApplicationId: z.string().trim().min(1),
  type: z.enum(["screening", "technical", "culture", "panel", "final"]),
  startsAt: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().min(15).max(240),
  timezone: z.string().trim().min(1).max(100),
  interviewers: z.array(z.string().trim().min(1).max(120)).max(12),
  modality: z.enum(["video", "phone", "onsite"]),
  locationOrMeetingUrl: z.string().trim().max(500).nullable().optional(),
  agenda: z.array(z.string().trim().min(1).max(500)).max(12),
  recommendationReason: z.string().trim().min(1).max(1000),
}).strict();

/** A reversible AI/recruiter proposal only. It does not schedule or send invitations. */
export const POST = talentRoute(async ({ request, service }) =>
  json(await service.proposeInterview(await readJson(request, body)), 201),
);
