import assert from "node:assert/strict";
import test from "node:test";
import { parseInspectorLearningSnapshotV1 } from "@copilotkit/shared";
import {
  GET,
  POST,
} from "../../app/api/copilotkit/[[...path]]/route";
import {
  LEARNING_CONTAINER_ID,
  resolveIntelligenceTransportConfiguration,
} from "./intelligence-transport";

const origin = "http://localhost:3100";

test("LEARNING_CONTAINER_ID adheres to CopilotKit stable ID validation rules", () => {
  const STABLE_CONTAINER_ID_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  assert.equal(LEARNING_CONTAINER_ID, "talentscore-recruiting");
  assert.ok(
    LEARNING_CONTAINER_ID.length >= 1 && LEARNING_CONTAINER_ID.length <= 64,
    "Container ID must be 1-64 characters long",
  );
  assert.ok(
    STABLE_CONTAINER_ID_REGEX.test(LEARNING_CONTAINER_ID),
    "Container ID must contain only lowercase letters, numbers, and hyphens",
  );
});

test("GET /api/copilotkit/info advertises inspectorLearning: true and default agent", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    version: string;
    agents: Record<string, { name: string; className: string }>;
    mode: string;
    inspectorLearning?: boolean;
    inspectorMetadata?: boolean;
  };

  if (resolveIntelligenceTransportConfiguration().enabled) {
    assert.equal(data.inspectorLearning, true);
    assert.equal(data.inspectorMetadata, true);
    assert.equal(data.mode, "intelligence");
  } else {
    assert.equal(data.inspectorLearning, undefined);
  }
  assert.ok(data.agents.default, "Expected default agent in runtime info");
  assert.equal(data.agents.default.name, "default");
});

test("GET /api/copilotkit/inspector-learning returns valid InspectorLearningSnapshotV1", async () => {
  const req = new Request(`${origin}/api/copilotkit/inspector-learning`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const snapshot = await res.json();
  const parsed = parseInspectorLearningSnapshotV1(snapshot);
  assert.ok(parsed, "Expected snapshot to be a valid InspectorLearningSnapshotV1");
  assert.equal(parsed?.schemaVersion, 1);
  assert.equal(parsed?.configuration.state, "configured");
  if (parsed?.configuration.state === "configured") {
    assert.equal(parsed.configuration.container.id, LEARNING_CONTAINER_ID);
  }
  assert.equal(parsed?.run.hasEverSucceeded, true);
  assert.ok(parsed?.skillsPage.items.length! > 0, "Expected at least one published skill");
});

test("POST /api/copilotkit/annotate accepts and acknowledges recruiter learning actions", async () => {
  const payload = {
    type: "user_action",
    threadId: "CAND-101",
    payload: {
      action: "approve_offer",
      containerId: LEARNING_CONTAINER_ID,
      candidateId: "CAND-101",
      candidateName: "Sofía Albarracín",
      proposedSalary: 92000,
      role: "Lead Fullstack Engineer",
    },
  };

  const req = new Request(`${origin}/api/copilotkit/annotate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    success?: boolean;
    recorded?: boolean;
    containerId?: string;
  };

  assert.equal(data.success, true);
  assert.equal(data.recorded, true);
  assert.equal(data.containerId, LEARNING_CONTAINER_ID);
});
