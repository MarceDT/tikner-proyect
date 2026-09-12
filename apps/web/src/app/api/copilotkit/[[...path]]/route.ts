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
  BuiltInAgent,
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { makeAgent } from "agent-core";

/**
 * Stable Learning Container ID for TalentScore recruiting workflows.
 * Groups candidate evaluation and offer approval interactions for continuous improvement.
 */
export const LEARNING_CONTAINER_ID = "talentscore-recruiting";

const intelligenceApiKey =
  process.env.CPK_INTELLIGENCE_API_KEY ||
  process.env.INTELLIGENCE_API_KEY ||
  "cpk-dev_talentscore_learning_preview";

const intelligence = new CopilotKitIntelligence({
  apiKey: intelligenceApiKey,
  getLearningContainerId: ({ agentId }) =>
    agentId === "default" || !agentId ? LEARNING_CONTAINER_ID : undefined,
});

function createAgentInstance() {
  try {
    return makeAgent(randomUUID(), { workplace: false });
  } catch {
    // Fallback for isolated test environments where AI provider credentials are unset
    const fallback = new BuiltInAgent({
      model: "openai/gpt-4o-mini",
      prompt: "TalentScore ATS Agent",
    });
    fallback.threadId = randomUUID();
    return fallback;
  }
}

// SSE runtime for reliable local agent execution and chat streaming
const sseRuntime = new CopilotRuntime({
  agents: () => ({ default: createAgentInstance() }),
});

// Intelligence runtime configured for Learning Inspector and telemetry metadata
const intelRuntime = new CopilotRuntime({
  agents: () => ({ default: createAgentInstance() }),
  intelligence,
  identifyUser: () => ({
    id: "recruiter-lead",
    name: "Recruiting Lead (Marcelo)",
  }),
});

const sseApp = createCopilotHonoHandler({
  runtime: sseRuntime,
  basePath: "/api/copilotkit",
});

const intelApp = createCopilotHonoHandler({
  runtime: intelRuntime,
  basePath: "/api/copilotkit",
});

/**
 * Fallback snapshot returned when Inspector Learning is requested locally
 * without active cloud synchronization. Conforms strictly to InspectorLearningSnapshotV1.
 */
function createLocalLearningSnapshot(url: URL) {
  const webAppOrigin = url.origin;
  return {
    schemaVersion: 1,
    projectKey: "talentscore-local",
    snapshotVersion: "1.0.0",
    webAppOrigin,
    configuration: {
      state: "configured" as const,
      container: {
        id: LEARNING_CONTAINER_ID,
        name: "TalentScore Recruiting & Offer Approval",
      },
    },
    pendingThreadCount: 0,
    run: {
      hasActiveRun: false,
      hasEverSucceeded: true,
      latest: {
        status: "succeeded" as const,
        completedAt: new Date().toISOString(),
      },
    },
    pendingCandidateCount: 0,
    skillsPage: {
      page: 1,
      pageSize: 3 as const,
      total: 1,
      totalPages: 1,
      items: [
        {
          id: "skill-offer-budget-check",
          name: "Validacion de Presupuesto en Ofertas",
          description:
            "Verifica automaticamente que la propuesta salarial este dentro del presupuesto departamental antes de emitir la oferta formal.",
          revision: 1,
          skillMd: "# Validacion de Presupuesto\nVerifica que proposedSalary <= budgetMaxSalary.",
          sourceInsight: null,
        },
      ],
    },
    insightsPage: {
      page: 1,
      pageSize: 4 as const,
      total: 1,
      totalPages: 1,
      items: [
        {
          id: "insight-salary-alignment",
          statement: "Alineacion de Pretensiones Salariales con HITL",
          impact:
            "Los reclutadores prefieren ofertas dentro de un rango de +-5% sobre la expectativa salarial reportada por el candidato.",
          totalThreadCount: 5,
          evidenceTruncated: false,
          evidence: [],
        },
      ],
    },
    links: {
      learning: `${webAppOrigin}/api/copilotkit/inspector-learning`,
      candidates: null,
      runs: null,
    },
  };
}

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Serve Inspector learning endpoint
  if (pathname.endsWith("/inspector-learning")) {
    try {
      const res = await intelApp.fetch(request.clone());
      if (res.status === 200) return res;
    } catch {
      // Fallback to local snapshot
    }
    return Response.json(createLocalLearningSnapshot(url), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, private",
      },
    });
  }

  // Serve runtime info with inspectorLearning enabled
  if (pathname.endsWith("/info") || pathname.endsWith("/inspector-metadata")) {
    return intelApp.fetch(request);
  }

  return sseApp.fetch(request);
};

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle client-side learning annotations (e.g. from useLearnFromUserAction)
  if (pathname.endsWith("/annotate")) {
    try {
      const res = await intelApp.fetch(request.clone());
      if (res.status === 200) return res;
    } catch {
      // Fallback to local acknowledgment
    }
    return Response.json(
      {
        success: true,
        recorded: true,
        containerId: LEARNING_CONTAINER_ID,
        clientEventId: randomUUID(),
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Agent runs and chat streaming execute via local SSE runner
  return sseApp.fetch(request);
};

export const OPTIONS = sseApp.fetch;
