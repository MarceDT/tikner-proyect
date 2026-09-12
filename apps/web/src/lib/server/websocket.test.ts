import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../../app/api/copilotkit/[[...path]]/route";
import { resolveIntelligenceTransportConfiguration } from "./intelligence-transport";

const origin = "http://localhost:3100";

test("Intelligence uses CopilotKit's managed WebSocket transport when only a project key is configured", () => {
  const configuration = resolveIntelligenceTransportConfiguration({
    CPK_INTELLIGENCE_API_KEY: "cpk_test_key",
  });

  assert.deepEqual(configuration, {
    enabled: true,
    apiKey: "cpk_test_key",
  });
});

test("a dedicated Intelligence gateway must configure HTTP and WebSocket bases together", () => {
  assert.throws(
    () =>
      resolveIntelligenceTransportConfiguration({
        CPK_INTELLIGENCE_API_KEY: "cpk_test_key",
        INTELLIGENCE_WS_URL: "ws://127.0.0.1:8787",
      }),
    /together/,
  );

  const configuration = resolveIntelligenceTransportConfiguration({
    CPK_INTELLIGENCE_API_KEY: "cpk_test_key",
    INTELLIGENCE_API_URL: "http://127.0.0.1:8788",
    INTELLIGENCE_WS_URL: "ws://127.0.0.1:8787",
  });

  assert.deepEqual(configuration, {
    enabled: true,
    apiKey: "cpk_test_key",
    apiUrl: "http://127.0.0.1:8788",
    wsUrl: "ws://127.0.0.1:8787",
  });
});

test("gateway addresses reject paths so the client can safely add its own realtime routes", () => {
  assert.throws(
    () =>
      resolveIntelligenceTransportConfiguration({
        CPK_INTELLIGENCE_API_KEY: "cpk_test_key",
        INTELLIGENCE_API_URL: "https://api.example.test/api",
        INTELLIGENCE_WS_URL: "wss://realtime.example.test",
      }),
    /bare gateway URL/,
  );
});

test("GET /api/copilotkit/info reports the transport that is actually enabled", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    mode: string;
    intelligence?: { wsUrl?: string };
    threadEndpoints?: { realtimeMetadata?: boolean };
  };
  const configuration = resolveIntelligenceTransportConfiguration();

  if (configuration.enabled) {
    assert.equal(data.mode, "intelligence");
    assert.match(data.intelligence?.wsUrl ?? "", /^wss?:\/\//);
    assert.equal(data.threadEndpoints?.realtimeMetadata, true);
  } else {
    assert.notEqual(data.mode, "intelligence");
    assert.equal(data.intelligence, undefined);
  }
});

test("Voice, A2UI, Open Generative UI, agent streaming, and HITL remain advertised", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    agents: Record<
      string,
      {
        capabilities?: {
          transport?: { streaming?: boolean };
          humanInTheLoop?: { interrupts?: boolean };
        };
      }
    >;
    audioFileTranscriptionEnabled?: boolean;
    a2uiEnabled?: boolean;
    openGenerativeUIEnabled?: boolean;
    inspectorLearning?: boolean;
  };

  assert.equal(data.audioFileTranscriptionEnabled, true);
  assert.equal(data.a2uiEnabled, true);
  assert.equal(data.openGenerativeUIEnabled, true);
  assert.ok(data.agents.default);
  assert.equal(data.agents.default.capabilities?.transport?.streaming, true);
  assert.equal(data.agents.default.capabilities?.humanInTheLoop?.interrupts, true);

  if (resolveIntelligenceTransportConfiguration().enabled) {
    assert.equal(data.inspectorLearning, true);
  }
});

test("the thread endpoint returns a safe hydration result", async () => {
  const req = new Request(`${origin}/api/copilotkit/threads`);
  const res = await GET(req);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { threads?: unknown[] };
  assert.ok(Array.isArray(data.threads));
});
