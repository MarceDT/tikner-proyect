import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { createTalentTools, TALENT_TOOL_NAMES, type TalentToolsBackend } from "./talent";

const calls: string[] = [];
const backend: TalentToolsBackend = {
  listApplications: async () => (calls.push("list"), [{ id: "APP-1" }]),
  getApplication: async (id) => (calls.push(`get:${id}`), { id }),
  evaluate: async (id) => (calls.push(`eval:${id}`), { applicationId: id, score: 80 }),
  compare: async (ids) => (calls.push(`cmp:${ids.join(",")}`), { rankings: [] }),
  buildReport: async (input) => (calls.push(`report:${input.topN}:${input.requestedBy}`), { id: "REP-1", approval: { status: "pending" } }),
};

test("expone exactamente las tools de lectura/evaluación, sin aprobar ni exportar", () => {
  const names = createTalentTools(backend).map((t) => t.name);
  assert.deepEqual(names, [...TALENT_TOOL_NAMES]);
  assert.ok(!names.some((n) => /approve|export|decide/.test(n)));
});

const tool = (name: string) => {
  const found = createTalentTools(backend).find((t) => t.name === name);
  assert.ok(found, `tool ${name} no encontrada`);
  return found;
};

test("los parámetros están tipados: topN 11 y menos de 2 ids se rechazan", () => {
  const report = tool("build_selection_report").parameters as z.ZodTypeAny;
  assert.ok(!report.safeParse({ topN: 11 }).success);
  assert.ok(report.safeParse({ topN: 3 }).success);
  const cmp = tool("compare_candidates").parameters as z.ZodTypeAny;
  assert.ok(!cmp.safeParse({ applicationIds: ["A"] }).success);
});

test("execute delega en el backend y convierte errores en resultado", async () => {
  await tool("evaluate_candidate").execute!({ applicationId: "APP-1" });
  assert.ok(calls.includes("eval:APP-1"));
  const failing = createTalentTools({ ...backend, evaluate: async () => { throw new Error("boom"); } });
  const result = (await failing.find((t) => t.name === "evaluate_candidate")!.execute!({ applicationId: "X" })) as { status: string; message: string };
  assert.equal(result.status, "error");
  assert.match(result.message, /boom/);
});
