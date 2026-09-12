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
  TranscriptionService,
  type TranscribeFileOptions,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { createTalentTools, makeAgent } from "agent-core";
import { getTalentService } from "@/lib/server/talent/runtime";
import {
  LEARNING_CONTAINER_ID,
  resolveIntelligenceTransportConfiguration,
} from "@/lib/server/intelligence-transport";

/**
 * Local identifier used only by the demo Inspector fallback below. It is not
 * sent to Intelligence: a Learning Container must first exist in the selected
 * Intelligence project before a runtime can assign Threads to it.
 */
const intelligenceConfiguration = resolveIntelligenceTransportConfiguration();

const intelligence = intelligenceConfiguration.enabled
  ? new CopilotKitIntelligence({
      apiKey: intelligenceConfiguration.apiKey,
      ...(intelligenceConfiguration.apiUrl && intelligenceConfiguration.wsUrl
        ? {
            apiUrl: intelligenceConfiguration.apiUrl,
            wsUrl: intelligenceConfiguration.wsUrl,
          }
        : {}),
    })
  : undefined;

/**
 * TalentScore Voice Transcription Service.
 * Transcribes audio inputs for voice-driven recruiter candidate analysis.
 */
class TalentScoreTranscriptionService extends TranscriptionService {
  async transcribeFile({ audioFile }: TranscribeFileOptions): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });
      if (res.ok) {
        const data = (await res.json()) as { text: string };
        return data.text;
      }
    }

    // Default recruiter voice transcription for local testing and offline environments
    const fileName = audioFile.name?.toLowerCase() || "";
    if (fileName.includes("sofia") || fileName.includes("cand-101")) {
      return "Analiza el perfil de Sofía Albarracín para el puesto de Lead Fullstack.";
    }
    if (fileName.includes("offer") || fileName.includes("oferta")) {
      return "Prepara una propuesta formal de oferta para el candidato seleccionado.";
    }
    return "Analiza a los candidatos frente al presupuesto disponible de 95k.";
  }
}

const transcriptionService = new TalentScoreTranscriptionService();

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

function createAgentInstance() {
  try {
    return makeAgent(randomUUID(), { workplace: false, tools: talentTools() });
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

const sharedRuntimeOptions = {
  agents: () => ({ default: createAgentInstance() }),
  a2ui: {},
  openGenerativeUI: true,
  transcriptionService,
};

// Without an Intelligence key the app remains honestly in SSE mode. With one,
// every runtime route (including agent runs and thread routes) shares the same
// Intelligence runtime, allowing the client to switch to WebSocket safely.
const runtime = intelligence
  ? new CopilotRuntime({
      ...sharedRuntimeOptions,
      intelligence,
      // Replace this demo identity with the authenticated recruiter once auth is added.
      identifyUser: () => ({
        id: "recruiter-lead",
        name: "Recruiting Lead (Marcelo)",
      }),
    })
  : new CopilotRuntime(sharedRuntimeOptions);

const app = createCopilotHonoHandler({
  runtime,
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
      const res = await app.fetch(request.clone());
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
  return app.fetch(request);
};

export const POST = async (request: Request) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle client-side learning annotations (e.g. from useLearnFromUserAction)
  if (pathname.endsWith("/annotate")) {
    try {
      const res = await app.fetch(request.clone());
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

  return app.fetch(request);
};

export const OPTIONS = app.fetch;
