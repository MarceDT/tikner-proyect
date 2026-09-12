import { talentRoute } from "../_shared";
import { json } from "@/lib/server/talent/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only view for the calendar/Kanban. Scheduling is deliberately absent here. */
export const GET = talentRoute(async ({ service, url }) => {
  const reportId = url.searchParams.get("reportId")?.trim() || undefined;
  return json({
    provider: "simulated_local",
    disclosure: "Demo local: no Google Calendar, Outlook ni correo están conectados.",
    interviews: await service.listInterviews(reportId),
    proposals: await service.listInterviewProposals(reportId),
  });
});
