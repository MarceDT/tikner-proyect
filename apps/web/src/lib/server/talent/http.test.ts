import { test } from "node:test";
import assert from "node:assert/strict";
import { errorResponse, guardRequest, talentRoute } from "./http";
import { ApprovalRequiredError, NotConfiguredError, NotFoundError } from "./errors";
import type { TalentService } from "./service";

const req = (init: RequestInit & { url?: string; host?: string } = {}) =>
  new Request(init.url ?? "http://127.0.0.1:3100/api/talent/reports", {
    ...init,
    headers: { host: init.host ?? "127.0.0.1:3100", ...(init.headers as Record<string, string>) },
  });

test("rechaza hosts que no son loopback", async () => {
  const r = guardRequest(req({ host: "evil.example" }));
  assert.equal(r?.status, 403);
});

test("POST sin Origin propio o sin JSON se rechaza", async () => {
  assert.equal(guardRequest(req({ method: "POST", headers: { "content-type": "application/json" } }))?.status, 403);
  assert.equal(
    guardRequest(req({ method: "POST", headers: { origin: "http://127.0.0.1:3100", "content-type": "text/plain" } }))?.status,
    415,
  );
  assert.equal(
    guardRequest(req({ method: "POST", headers: { origin: "http://127.0.0.1:3100", "content-type": "application/json" } })),
    null,
  );
});

test("mapea errores de dominio a códigos HTTP", async () => {
  assert.equal(errorResponse(new NotFoundError("Reporte", "X")).status, 404);
  assert.equal(errorResponse(new ApprovalRequiredError("X", "pending")).status, 409);
  assert.equal(errorResponse(new NotConfiguredError("sin db")).status, 503);
  assert.equal(errorResponse(new Error("otro")).status, 500);
});

test("reconoce errores de dominio de otro chunk (sin instanceof) por su marcador", async () => {
  const foreign = Object.assign(new Error("de otro bundle"), { talentError: true, status: 409 });
  assert.equal(errorResponse(foreign).status, 409);
});

test("talentRoute devuelve 503 cuando el servicio no está configurado", async () => {
  const route = talentRoute(async () => new Response("ok"), () => { throw new NotConfiguredError("DATABASE_URL falta"); });
  const res = await route(req(), { params: Promise.resolve({}) });
  assert.equal(res.status, 503);
  assert.match((await res.json()).error, /DATABASE_URL/);
});

test("talentRoute pasa params y servicio al handler", async () => {
  const fakeService = {} as TalentService;
  const route = talentRoute(async ({ params, service }) => Response.json({ id: params.id, same: service === fakeService }), () => fakeService);
  const res = await route(req(), { params: Promise.resolve({ id: "REP-1" }) });
  assert.deepEqual(await res.json(), { id: "REP-1", same: true });
});
