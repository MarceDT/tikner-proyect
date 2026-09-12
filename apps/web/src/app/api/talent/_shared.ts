import { getTalentService } from "@/lib/server/talent/runtime";
import { talentRoute as route } from "@/lib/server/talent/http";

export const talentRoute = (handler: Parameters<typeof route>[0]) => route(handler, getTalentService);
