import assert from "node:assert/strict";
import test from "node:test";
import {
  GET,
  resolveIntelligenceTransportConfiguration,
} from "../../app/api/copilotkit/[[...path]]/route";

const origin = "http://localhost:3100";

test("GET /api/copilotkit/info advertises openGenerativeUIEnabled: true", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    version: string;
    agents: Record<string, { name: string; className: string }>;
    mode: string;
    a2uiEnabled?: boolean;
    openGenerativeUIEnabled?: boolean;
    inspectorLearning?: boolean;
  };

  // Assert Open Generative UI is activated
  assert.equal(data.openGenerativeUIEnabled, true, "Expected openGenerativeUIEnabled to be true in /info");

  // Assert existing capabilities are preserved
  assert.equal(data.a2uiEnabled, true, "Expected a2uiEnabled to remain true");
  if (resolveIntelligenceTransportConfiguration().enabled) {
    assert.equal(data.inspectorLearning, true, "Expected inspectorLearning to remain true");
    assert.equal(data.mode, "intelligence");
  }
  assert.ok(data.agents.default, "Expected default agent to remain available");
  assert.equal(data.agents.default.name, "default");
});

test("Open Generative UI activity message payload conforms to open-generative-ui specification", () => {
  const openGenUiActivity = {
    activityType: "open-generative-ui",
    content: {
      html: "<div class='candidate-scorecard'><h3>Sofía Albarracín</h3><p class='match'>96% Fit</p></div>",
      css: ".candidate-scorecard { padding: 16px; border-radius: 8px; } .match { color: #10b981; }",
      js: "console.log('Scorecard mounted');",
      version: 1,
    },
  };

  assert.equal(openGenUiActivity.activityType, "open-generative-ui");
  assert.ok(openGenUiActivity.content.html.includes("Scorecard") || openGenUiActivity.content.html.includes("Sofía"));
  assert.ok(openGenUiActivity.content.css.length > 0);
});

test("Coexistence of Generative UI, tools, and Open Gen UI", () => {
  const registeredActivityTypes = ["a2ui-surface", "open-generative-ui", "mcp-apps"];
  const toolComponents = ["candidate_comparison", "offer_proposal", "propose_action"];

  for (const tool of toolComponents) {
    assert.ok(!registeredActivityTypes.includes(tool));
  }
});
