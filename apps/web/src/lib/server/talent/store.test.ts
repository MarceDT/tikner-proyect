import { test } from "node:test";
import assert from "node:assert/strict";
import { InMemoryTalentStore } from "./store";
import type { Application, SelectionReport } from "@/lib/talent-types";

const app: Application = {
  id: "APP-1",
  source: "demo-inbox",
  email: { messageId: "<m1>", from: "a@b", subject: "s", receivedAt: "2026-09-10T00:00:00.000Z" },
  rawCvText: "cv",
  profile: null,
  status: "received",
  createdAt: "2026-09-10T00:00:00.000Z",
  updatedAt: "2026-09-10T00:00:00.000Z",
};

test("upsert + find por messageId + aislamiento de referencias", async () => {
  const store = new InMemoryTalentStore();
  await store.upsertApplication(app);
  const found = await store.findApplicationByMessageId("<m1>");
  assert.equal(found?.id, "APP-1");
  found!.status = "failed";
  assert.equal((await store.getApplication("APP-1"))?.status, "received");
  await store.upsertApplication({ ...app, status: "extracted" });
  assert.equal((await store.listApplications()).length, 1);
});

test("reportes y eventos de exportación por reporte", async () => {
  const store = new InMemoryTalentStore();
  const report: SelectionReport = {
    id: "REP-1", roleTitle: "r", targetRole: { title: "r", department: "d", budgetMaxSalary: 1, currency: "USD", requiredSkills: [] },
    topN: 1, generatedAt: "2026-09-12T00:00:00.000Z", requestedBy: "amin", rankings: [], shortlistApplicationIds: [],
    approval: { status: "pending" },
  };
  await store.saveReport(report);
  await store.recordExport({ id: "EXP-1", reportId: "REP-1", format: "pdf", fileName: "a.pdf", sizeBytes: 10, requestedBy: "amin", createdAt: "2026-09-12T00:00:00.000Z" });
  await store.recordExport({ id: "EXP-2", reportId: "OTHER", format: "pdf", fileName: "b.pdf", sizeBytes: 10, requestedBy: "amin", createdAt: "2026-09-12T00:00:00.000Z" });
  assert.equal((await store.listExports("REP-1")).length, 1);
  assert.equal((await store.listReports())[0].id, "REP-1");
});
