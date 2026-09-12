/** Integración real con PostgreSQL. Se salta si DATABASE_URL no está definida. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PgTalentStore } from "./store-pg";

const url = process.env.DATABASE_URL?.trim();

test("PgTalentStore persiste y relee una postulación", { skip: !url && "DATABASE_URL no configurada" }, async () => {
  const store = PgTalentStore.fromEnv();
  const id = `APP-TEST-${Date.now()}`;
  try {
    await store.upsertApplication({
      id, source: "demo-inbox",
      email: { messageId: `<${id}>`, from: "t@example.com", subject: "test", receivedAt: new Date().toISOString() },
      rawCvText: "cv de prueba", profile: null, status: "received",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    const back = await store.findApplicationByMessageId(`<${id}>`);
    assert.equal(back?.id, id);
  } finally {
    await store.close();
  }
});
