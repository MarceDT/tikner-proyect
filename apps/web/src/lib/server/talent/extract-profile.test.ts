import { test } from "node:test";
import assert from "node:assert/strict";
import { extractProfile, type ExtractorFn, PROFILE_FIELDS } from "./extract-profile";

const CV = `Ana Pérez
Senior Engineer — ana@example.com
6 años de experiencia con TypeScript y Next.js.
Pretensión salarial: a convenir.`;

const base = {
  name: "Ana Pérez",
  contact: { email: "ana@example.com", phone: null, location: null },
  currentTitle: "Senior Engineer",
  experienceYears: 6,
  experience: [],
  skills: ["TypeScript", "Next.js"],
  salaryExpectation: { amount: null, currency: null, raw: "a convenir" },
  evidence: [
    { field: "experienceYears", quote: "6 años de experiencia" },
    { field: "skills", quote: "TypeScript y Next.js" },
  ],
  missingFields: [],
  confidence: { overall: 0.9, fields: { name: 1, experienceYears: 0.9 } },
};

const fake = (out: unknown): ExtractorFn => async () => out;
const input = { cvText: CV, emailSubject: "Postulación", emailFrom: "ana@example.com" };

test("acepta un perfil válido y recalcula missingFields desde los nulls", async () => {
  const profile = await extractProfile(input, fake(base));
  assert.equal(profile.name, "Ana Pérez");
  assert.deepEqual(
    [...profile.missingFields].sort(),
    ["contact.location", "contact.phone", "experience", "salaryExpectation"].sort(),
  );
  assert.equal(profile.evidence.length, 2);
});

test("descarta evidencia cuya cita no aparece en el CV y penaliza la confianza", async () => {
  const profile = await extractProfile(
    input,
    fake({ ...base, evidence: [...base.evidence, { field: "skills", quote: "experto en Kubernetes" }] }),
  );
  assert.equal(profile.evidence.length, 2);
  assert.ok(profile.confidence.overall < 0.9, "la confianza debe bajar al descartar evidencia inventada");
});

test("nunca acepta un salario numérico que no esté en el texto", async () => {
  const profile = await extractProfile(
    input,
    fake({ ...base, salaryExpectation: { amount: 95000, currency: "USD", raw: "USD 95,000" } }),
  );
  assert.equal(profile.salaryExpectation.amount, null);
  assert.ok(profile.missingFields.includes("salaryExpectation"));
});

test("mantiene el salario cuando el número sí figura en el CV", async () => {
  const cv = `${CV}\nPretensión: USD 88,000 anuales`;
  const profile = await extractProfile(
    { ...input, cvText: cv },
    fake({ ...base, salaryExpectation: { amount: 88000, currency: "USD", raw: "USD 88,000 anuales" } }),
  );
  assert.equal(profile.salaryExpectation.amount, 88000);
});

test("rechaza salidas del LLM que no cumplen el schema", async () => {
  await assert.rejects(extractProfile(input, fake({ name: 42 })), /perfil/i);
});

test("PROFILE_FIELDS cubre los campos que se evalúan como faltantes", () => {
  assert.ok(PROFILE_FIELDS.includes("salaryExpectation"));
  assert.ok(PROFILE_FIELDS.includes("experienceYears"));
});
