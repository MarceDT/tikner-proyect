import assert from "node:assert/strict";
import test from "node:test";
import {
  GET,
  POST,
} from "../../app/api/copilotkit/[[...path]]/route";
import { resolveIntelligenceTransportConfiguration } from "./intelligence-transport";

const origin = "http://localhost:3100";

test("GET /api/copilotkit/info advertises audioFileTranscriptionEnabled: true", async () => {
  const req = new Request(`${origin}/api/copilotkit/info`);
  const res = await GET(req);
  assert.equal(res.status, 200);

  const data = (await res.json()) as {
    version: string;
    agents: Record<string, { name: string; className: string }>;
    mode: string;
    audioFileTranscriptionEnabled?: boolean;
    a2uiEnabled?: boolean;
    openGenerativeUIEnabled?: boolean;
    inspectorLearning?: boolean;
  };

  // Assert Voice / Transcription is activated
  assert.equal(data.audioFileTranscriptionEnabled, true, "Expected audioFileTranscriptionEnabled to be true in /info");

  // Assert existing capabilities remain active
  assert.equal(data.a2uiEnabled, true, "Expected a2uiEnabled to remain true");
  assert.equal(data.openGenerativeUIEnabled, true, "Expected openGenerativeUIEnabled to remain true");
  if (resolveIntelligenceTransportConfiguration().enabled) {
    assert.equal(data.inspectorLearning, true, "Expected inspectorLearning to remain true");
    assert.equal(data.mode, "intelligence");
  }
  assert.ok(data.agents.default, "Expected default agent to remain available");
  assert.equal(data.agents.default.name, "default");
});

test("POST /api/copilotkit/transcribe handles audio payloads and returns transcription", async () => {
  const req = new Request(`${origin}/api/copilotkit/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audio: Buffer.from("mock_audio_data").toString("base64"),
      mimeType: "audio/wav",
      filename: "sofia_eval.wav",
    }),
  });

  const res = await POST(req);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { text?: string; size?: number; type?: string };
  assert.ok(data.text && data.text.length > 0, "Expected transcription text");
  assert.equal(data.type, "audio/wav");
});

test("Voice transcription rejects invalid request without audio", async () => {
  const req = new Request(`${origin}/api/copilotkit/transcribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  const res = await POST(req);
  assert.ok(res.status >= 400);
});
