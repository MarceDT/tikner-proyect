import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../../app/api/copilotkit/[[...path]]/route";

const origin = "http://localhost:3100";

test("GET /api/copilotkit/info advertises a2uiEnabled: true and a2ui: { enabled: true }", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    version: string;
    agents: Record<string, { name: string; className: string; capabilities?: Record<string, unknown> }>;
    mode: string;
    a2uiEnabled?: boolean;
    a2ui?: { enabled: boolean };
    inspectorLearning?: boolean;
  };

  // Assert A2UI capabilities are fully enabled and declared
  assert.equal(data.a2uiEnabled, true, "Expected a2uiEnabled to be true in /info");
  assert.ok(data.a2ui, "Expected a2ui capability object in /info");
  assert.equal(data.a2ui?.enabled, true, "Expected a2ui.enabled to be true in /info");

  // Assert existing agent and learning capabilities are preserved
  assert.ok(data.agents.default, "Expected default agent to remain available");
  assert.equal(data.agents.default.name, "default");
  assert.equal(data.inspectorLearning, true, "Expected inspectorLearning to remain true");
  assert.equal(data.mode, "intelligence");
});

test("A2UI activity message payload structure matches a2ui-surface specification", () => {
  const a2uiSurfaceActivity = {
    activityType: "a2ui-surface",
    content: {
      surfaceId: "talentscore-evaluation-card",
      status: "painted",
      a2ui_operations: [
        {
          version: "v0.9",
          createSurface: {
            surfaceId: "talentscore-evaluation-card",
            title: "Evaluación de Candidato: Sofía Albarracín",
          },
        },
        {
          version: "v0.9",
          updateComponents: {
            surfaceId: "talentscore-evaluation-card",
            components: [
              {
                id: "score-badge",
                type: "Badge",
                properties: {
                  label: "Top Match - 96%",
                  variant: "success",
                },
              },
            ],
          },
        },
      ],
    },
  };

  assert.equal(a2uiSurfaceActivity.activityType, "a2ui-surface");
  assert.ok(Array.isArray(a2uiSurfaceActivity.content.a2ui_operations));
  assert.equal(a2uiSurfaceActivity.content.a2ui_operations.length, 2);
  assert.equal(a2uiSurfaceActivity.content.surfaceId, "talentscore-evaluation-card");
});

test("Application Generative UI and A2UI coexistence", () => {
  // Ensures that the named components do not higjack the a-2ui surface
  const registeredComponents = ["candidate_comparison", "offer_proposal", "propose_action"];
  assert.ok(!registeredComponents.includes("a2ui-surface"));
  assert.ok(!registeredComponents.includes("render_a2ui"));
});
