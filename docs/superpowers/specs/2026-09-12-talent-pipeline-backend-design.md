# TalentScore — Backend del flujo "CV por email → perfil → ranking → shortlist aprobada → export"

**Owner:** Amin (Backend, Runtime & Agent Tools) · **Fecha:** 2026-09-12 · **Estado:** aprobado para implementación

## Objetivo

Implementar el tramo servidor que recibe postulaciones (bandeja simulada), extrae un perfil
estructurado con LLM, rankea candidatos de forma explicable, registra una shortlist aprobada por
un humano y exporta un `SelectionReport` a PDF/DOCX/XLSX. El agente de IA puede leer, evaluar y
comparar; **nunca** aprueba ni exporta.

## Qué es real y qué es demo

| Pieza | Estado |
|---|---|
| Bandeja de entrada | **Simulada** (`demo-inbox.ts`, 3 emails hardcodeados). No hay Gmail/IMAP/OAuth. |
| Adjuntos PDF/DOCX | **Simulados**: el texto del CV ya viene en texto plano. No hay parsing de PDF real. |
| Extracción de perfil | **Real** vía LLM (`generateObject`, modelo de `resolveModel()`), con post-validación determinista. Requiere `OPENAI_API_KEY`. |
| Ranking | **Real y determinista** (rúbrica sobre el perfil extraído vs `TARGET_ROLE`). |
| Persistencia | **Real, PostgreSQL local** (`DATABASE_URL`). Tests unitarios usan store en memoria. |
| Exportaciones | **Reales** (`pdf-lib`, `docx`, `exceljs`) desde un único `SelectionReport`. |
| Aprobación humana | **Real**: endpoint `decision`; el export devuelve `409` sin aprobación registrada. |

## Modelo de dominio (`apps/web/src/lib/talent-types.ts`, isomórfico)

No se modifica `Candidate` ni `TARGET_ROLE` de `candidates.ts`.

```ts
Application { id, source: "demo-inbox", email: { messageId, from, subject, receivedAt, attachmentName? },
  rawCvText, profile: CandidateProfile | null, status: "received"|"extracted"|"failed",
  extractionError?, createdAt, updatedAt }

CandidateProfile { name: string|null, contact: { email: string|null, phone: string|null, location: string|null },
  currentTitle: string|null, experienceYears: number|null,
  experience: { company, role, period, highlights: string[] }[], skills: string[],
  salaryExpectation: { amount: number|null, currency: string|null, raw: string|null },
  evidence: { field: string, quote: string }[], missingFields: string[],
  confidence: { overall: number /*0-1*/, fields: Record<string, number> } }

CandidateRanking { applicationId, candidateName, rank, score /*0-100*/,
  breakdown: { criterion, weight, score /*0-100*/, reasoning, evidence: string[] }[],
  risks: string[], missingData: string[] }

SelectionReport { id, roleTitle, targetRole: { title, department, budgetMaxSalary, currency, requiredSkills[] },
  topN, generatedAt, rankings: CandidateRanking[], shortlistApplicationIds: string[],
  approval: { status: "pending"|"approved"|"rejected", decidedBy?, decidedAt?, note? } }

ExportEvent { id, reportId, format: "pdf"|"docx"|"xlsx", fileName, sizeBytes, requestedBy, createdAt }
```

## Componentes (`apps/web/src/lib/server/talent/`)

| Archivo | Responsabilidad |
|---|---|
| `demo-inbox.ts` | `DEMO_INBOX_MESSAGES` (3) + `readDemoInbox()`. Etiquetado como datos de demostración. |
| `extract-profile.ts` | `extractProfile(rawCvText, llm)`. Prompt "solo datos presentes"; post-validación: `evidence.quote` debe ser substring del CV, salario solo si hay número en el texto; calcula `missingFields` y ajusta `confidence`. `llm` es inyectable (`ExtractorFn`). `createLlmExtractor()` usa `generateObject` del paquete `ai`. |
| `rank-candidates.ts` | `rankApplications(apps, targetRole)` → `CandidateRanking[]`. Pesos: skills requeridas 40, experiencia 25, presupuesto 25, completitud/confianza 10. Dato ausente ⇒ 0 en el criterio + `missingData` + `risks`. |
| `store.ts` | `TalentStore` (interfaz), `InMemoryTalentStore` (tests), `PgTalentStore` (`pg`). |
| `service.ts` | `TalentService`: `syncInbox()` (idempotente por `messageId`), `listApplications()`, `getApplication(id)`, `evaluate(id)`, `compare(ids)`, `buildReport(topN, requestedBy)`, `decide(reportId, decision, decidedBy, note)`, `exportReport(reportId, format, requestedBy)` → lanza `ApprovalRequiredError` si no está aprobado. |
| `exports/pdf.ts`, `exports/docx.ts`, `exports/xlsx.ts` | `(report) → Promise<Buffer>`; puras. |
| `errors.ts` | `TalentError`, `ApprovalRequiredError`, `NotFoundError`. |
| `http.ts` | Guardas comunes (loopback, Origin en POST, JSON) reutilizadas por las rutas. |

## Tools del agente (`packages/agent-core/src/capabilities/talent.ts`)

`defineTool` + zod. Se construyen con `createTalentTools(service)` y se pasan a `makeAgent(threadId, { tools })`
desde `apps/web/src/app/api/copilotkit/[[...path]]/route.ts`.

- `list_applications()` · `get_candidate_profile({ applicationId })` · `evaluate_candidate({ applicationId })`
- `compare_candidates({ applicationIds: string[2..10] })` · `build_selection_report({ topN: 1..10 })` → reporte `pending`
- **No existe** tool de aprobación ni de exportación. El prompt lo dice explícitamente.

## Endpoints (`apps/web/src/app/api/talent/`)

Todas: loopback-only; POST exige `Origin` = host y `Content-Type: application/json` (mismo criterio que `followups`).

| Método y ruta | Cuerpo / respuesta |
|---|---|
| `POST /api/talent/inbox/sync` | → `{ applications, created, skipped }` |
| `GET /api/talent/applications` · `GET /api/talent/applications/[id]` | → `Application` |
| `POST /api/talent/reports` | `{ topN, requestedBy }` → `SelectionReport` (pending) |
| `GET /api/talent/reports` · `GET /api/talent/reports/[id]` | → `SelectionReport` (+ `exports: ExportEvent[]` en detalle) |
| `POST /api/talent/reports/[id]/decision` | `{ decision: "approved"\|"rejected", decidedBy, note? }` → `SelectionReport` |
| `GET /api/talent/reports/[id]/export?format=pdf\|docx\|xlsx&requestedBy=` | archivo (`Content-Disposition: attachment`) · `409` si no aprobado · `400` formato inválido |

Errores: `{ error: string }` con 400/404/409/503 (`503` cuando falta `DATABASE_URL` u `OPENAI_API_KEY`).

## Persistencia (PostgreSQL)

- `db/002_talent.sql`: `applications`, `selection_reports`, `export_events` (perfil, rankings y approval como JSONB; `applications.message_id` UNIQUE).
- `db/docker-compose.yml` (postgres:16, usuario/db `talentscore`), `db/README.md`, script raíz `npm run db:migrate` (aplica `db/*.sql` en orden con `pg`).
- `.env.example` documenta `DATABASE_URL`.

## Testing

`node:test` en `apps/web/src/lib/server/talent/*.test.ts`: extractor (fake LLM, descarte de evidencia inventada, salario sin número ⇒ null), ranking (orden, dato ausente ⇒ riesgo, presupuesto excedido), servicio (sync idempotente, gate de aprobación ⇒ `ApprovalRequiredError`, evento de export registrado), exports (magic bytes `%PDF`, `PK`). Integración Pg solo si `DATABASE_URL` está definida.
`apps/web/scripts/demo-talent.ts`: sync → reporte top 3 → aprobación → exporta 3 archivos a `.data/talent-exports/`.

## Fuera de alcance

Gmail/IMAP, parsing real de PDF/DOCX, UI (Milena), cambios a `Candidate` (Marcelo), autenticación de usuarios.
