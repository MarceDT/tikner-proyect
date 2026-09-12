import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../../app/api/copilotkit/[[...path]]/route";

const origin = "http://localhost:3100";

test("GET /api/copilotkit/info advertises mode: 'intelligence' and valid intelligence.wsUrl", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    version: string;
    mode: string;
    intelligence?: { wsUrl?: string };
    threadEndpoints?: {
      list?: boolean;
      inspect?: boolean;
      mutations?: boolean;
      realtimeMetadata?: boolean;
    };
  };

  assert.equal(data.mode, "intelligence", "Runtime mode must be 'intelligence'");
  assert.ok(data.intelligence?.wsUrl, "Expected intelligence.wsUrl in runtime info");
  assert.match(
    data.intelligence.wsUrl,
    /^wss?:\/\//,
    "intelligence.wsUrl must be a valid WebSocket URL",
  );
  assert.ok(
    data.intelligence.wsUrl.includes("realtime"),
    "intelligence.wsUrl should point to a realtime endpoint",
  );
});

test("GET /api/copilotkit/info advertises threadEndpoints with realtimeMetadata: true", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    threadEndpoints?: {
      list?: boolean;
      inspect?: boolean;
      mutations?: boolean;
      realtimeMetadata?: boolean;
    };
  };

  assert.ok(data.threadEndpoints, "Expected threadEndpoints in /info");
  assert.equal(data.threadEndpoints.realtimeMetadata, true, "threadEndpoints.realtimeMetadata must be true");
  assert.equal(data.threadEndpoints.list, true, "threadEndpoints.list must be true");
  assert.equal(data.threadEndpoints.inspect, true, "threadEndpoints.inspect must be true");
  assert.equal(data.threadEndpoints.mutations, true, "threadEndpoints.mutations must be true");
});

test("WebSocket / Realtime transport coexists with Voice, A2UI, Open Gen UI, and Learning", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    agents: Record<string, { name: string; className: string; capabilities?: { transport?: { streaming?: boolean }; humanInTheLoop?: { interrupts?: boolean } } }>;
    audioFileTranscriptionEnabled?: boolean;
    a2uiEnabled?: boolean;
    openGenerativeUIEnabled?: boolean;
    inspectorLearning?: boolean;
  };

  // Coexistence checks
  assert.equal(data.audioFileTranscriptionEnabled, true, "Voice transcription must remain enabled");
  assert.equal(data.a2uiEnabled, true, "A2UI must remain enabled");
  assert.equal(data.openGenerativeUIEnabled, true, "Open Generative UI must remain enabled");
  assert.equal(data.inspectorLearning, true, "Inspector learning must remain enabled");

  // Agent capabilities checks
  assert.ok(data.agents.default, "Default agent must exist");
  assert.equal(data.agents.default.capabilities?.transport?.streaming, true, "Agent must support streaming transport");
  assert.equal(data.agents.default.capabilities?.humanInTheLoop?.interrupts, true, "Agent must support HITL interrupts");
});

test("GET /api/copilotkit/threads serves thread hydration for realtime synchronization", async () => {
  const req = new Request(`${origin}/api/copilotkit/threads`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as { threads?: unknown[] };
  assert.ok(Array.isArray(data.threads), "Expected threads array for thread hydration");
});
