import { test } from "node:test";
import assert from "node:assert/strict";
import { DEMO_INBOX_MESSAGES, readDemoInbox, DEMO_INBOX_SOURCE } from "./demo-inbox";

test("la bandeja demo expone tres mensajes con ids únicos y CV en texto", async () => {
  const messages = await readDemoInbox();
  assert.equal(messages.length, 3);
  assert.equal(new Set(messages.map((m) => m.messageId)).size, 3);
  for (const m of messages) {
    assert.ok(m.cvText.trim().length > 200, `${m.messageId} debería tener un CV con contenido`);
    assert.ok(m.from.includes("@"));
    assert.ok(!Number.isNaN(Date.parse(m.receivedAt)));
  }
  assert.equal(DEMO_INBOX_SOURCE, "demo-inbox");
});

test("al menos un CV demo no declara pretensión salarial numérica", () => {
  const withoutSalary = DEMO_INBOX_MESSAGES.filter((m) => !/\$\s?\d|USD\s?\d|\d{2,3}[.,]?\d{3}/.test(m.cvText));
  assert.ok(withoutSalary.length >= 1, "hace falta un caso con datos faltantes para probar missingFields");
});

test("readDemoInbox devuelve copias: mutar el resultado no altera la constante", async () => {
  const messages = await readDemoInbox();
  messages[0].subject = "mutado";
  assert.notEqual(DEMO_INBOX_MESSAGES[0].subject, "mutado");
});
