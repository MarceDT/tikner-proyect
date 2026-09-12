/**
 * The web surface's runtime endpoint.
 *
 * A Hono app built at module scope; Next.js route handlers are fetch-based, so
 * `app.fetch` is the handler. The catch-all segment lets Hono route the
 * runtime's sub-paths itself.
 *
 * TWO THINGS TO NOT DO HERE:
 *
 * 1. Do NOT declare `channels` on this runtime, and never call
 *    `app.channels.ready()`. Next.js isolates freeze and recycle per request,
 *    so a cold start would mint a competing listener for the same Channel —
 *    and managed delivery is claim-based, so the loser silently gets nothing.
 *    The Channels listener is `apps/channel`, a long-running process.
 *
 * 2. Do NOT reuse one agent instance across requests. The factory form hands
 *    out a fresh agent per resolution.
 */
import { randomUUID } from "node:crypto";
import {
  CopilotRuntime,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { createTalentTools, makeAgent } from "agent-core";
import { getTalentService } from "@/lib/server/talent/runtime";

// Web writes use /api/followups after a browser approval. Never expose raw MCP writes here.
// Talent tools are read/evaluate only; approval and export live in /api/talent/* behind a human click.
function talentTools() {
  try {
    return createTalentTools(getTalentService());
  } catch (error) {
    // Without DATABASE_URL the agent still works for the on-screen candidates; it just lacks the inbox tools.
    console.warn("[talent] tools not registered:", error instanceof Error ? error.message : error);
    return [];
  }
}

const runtime = new CopilotRuntime({
  agents: () => ({ default: makeAgent(randomUUID(), { workplace: false, tools: talentTools() }) }),
});

const app = createCopilotHonoHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = app.fetch;
export const POST = app.fetch;
export const OPTIONS = app.fetch;
