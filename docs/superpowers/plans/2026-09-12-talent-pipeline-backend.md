# Talent Pipeline Backend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Backend completo "inbox demo → perfil LLM → ranking explicable → aprobación humana → export PDF/DOCX/XLSX" con persistencia PostgreSQL y tools tipadas para el agente.

**Architecture:** Servicio `TalentService` sobre una interfaz `TalentStore` (Pg / memoria), consumido por rutas Next.js `api/talent/*` y por tools `defineTool` inyectadas en `makeAgent`. Exportadores puros desde un único `SelectionReport`. El agente nunca aprueba ni exporta.

**Tech Stack:** Next.js 15 route handlers, zod 4, `ai` v6 (`generateObject`), `pg`, `pdf-lib`, `docx`, `exceljs`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-12-talent-pipeline-backend-design.md`

## Global Constraints
- No renombrar campos de `Candidate` (`apps/web/src/lib/candidates.ts`).
- No tocar `page.tsx`, `generative-ui.tsx`, estilos.
- Etiquetar como demo: bandeja simulada, sin Gmail, sin parsing PDF real.
- `npm run typecheck` y `npm test --workspace web` en verde antes de afirmar algo.
- Commits frecuentes con la atribución de sesión.

---

### Task 1: Tipos de dominio + errores
- Create `apps/web/src/lib/talent-types.ts` (interfaces del spec + `TargetRoleSnapshot`, `ExportFormat`, `ReportDecision`).
- Create `apps/web/src/lib/server/talent/errors.ts` (`TalentError` base con `status`, `NotFoundError` 404, `ApprovalRequiredError` 409, `NotConfiguredError` 503).
- Produces: todos los tipos usados abajo.

### Task 2: Bandeja demo
- Create `apps/web/src/lib/server/talent/demo-inbox.ts`: `DemoInboxMessage { messageId, from, subject, receivedAt, attachmentName?, bodyText, cvText }`, `DEMO_INBOX_MESSAGES` (3), `readDemoInbox()`.
- Test `demo-inbox.test.ts`: 3 mensajes, messageIds únicos, cada uno con cvText no vacío, uno sin salario numérico.

### Task 3: Extractor LLM con post-validación
- Create `extract-profile.ts`: `candidateProfileSchema` (zod), `type ExtractorFn = (input: { cvText, emailSubject, emailFrom }) => Promise<unknown>`, `extractProfile(input, llm): Promise<CandidateProfile>` (parse zod → `validateEvidence` descarta quotes que no son substring → `salaryExpectation.amount` null si no hay dígitos en raw/cv → `missingFields` recalculado → `confidence.overall` recortado), `createLlmExtractor(): ExtractorFn` con `generateObject({ model: resolveModel(), schema, system, prompt })`.
- Test `extract-profile.test.ts` con fake: evidencia inventada se descarta y baja confianza; salario "a convenir" ⇒ amount null y en missingFields; campos null ⇒ missingFields.

### Task 4: Ranking determinista
- Create `rank-candidates.ts`: `rankApplications(apps: Application[], target: TargetRoleSnapshot): CandidateRanking[]`; criterios `skills`(40) `experience`(25) `budget`(25) `completeness`(10); `scoreSkills` (match case-insensitive, sinónimos simples), `scoreExperience` (>=5 años = 100, lineal), `scoreBudget` (≤ budget 100; >budget lineal hasta 0 en +40%; null ⇒ 0 + risk), `scoreCompleteness` (confidence.overall*100 − 10 por missingField).
- Test: orden desc por score, empate por nombre; sin salario ⇒ risk + missingData; over-budget ⇒ risk con monto; sin perfil (status failed) ⇒ excluido.

### Task 5: Store (interfaz + memoria + Pg) y SQL
- Create `store.ts`: `interface TalentStore { upsertApplication, getApplication, listApplications, findApplicationByMessageId, saveReport, getReport, listReports, recordExport, listExports(reportId) }`, `InMemoryTalentStore`.
- Create `store-pg.ts`: `PgTalentStore` con `pg.Pool`, `createPgStoreFromEnv()`.
- Create `db/002_talent.sql`, `db/docker-compose.yml`, `db/README.md`, `db/migrate.mjs`, script raíz `db:migrate`; `.env.example` DATABASE_URL.
- Test `store.test.ts` sobre memoria; `store-pg.test.ts` se salta si no hay `DATABASE_URL`.

### Task 6: TalentService
- Create `service.ts`: `TalentService(store, extractor, inbox = readDemoInbox, target = TARGET_ROLE)`: `syncInbox()`, `listApplications()`, `getApplication(id)`, `evaluate(id)`, `compare(ids)`, `buildReport({ topN, requestedBy })`, `decide(reportId, { decision, decidedBy, note })`, `exportReport(reportId, format, requestedBy)`.
- Test `service.test.ts`: sync idempotente (2 llamadas ⇒ 3 apps); extracción fallida ⇒ status failed sin romper; export sin aprobación ⇒ `ApprovalRequiredError`; aprobado ⇒ buffer + ExportEvent registrado; reporte rechazado ⇒ 409.

### Task 7: Exportadores
- Create `exports/pdf.ts` (`pdf-lib`), `exports/docx.ts` (`docx`), `exports/xlsx.ts` (`exceljs`), `exports/index.ts` (`renderReport(report, format)`).
- Test `exports.test.ts`: `%PDF` / `PK` magic bytes; xlsx tiene hoja "Ranking" con N+1 filas.

### Task 8: Tools del agente + prompt
- Create `packages/agent-core/src/capabilities/talent.ts`: `TalentToolsBackend` (interfaz mínima), `createTalentTools(backend): ToolDefinition[]`.
- Modify `agent.ts` (`tools?: ToolDefinition[]`), `index.ts` export, `prompt.ts` (reglas de tools + "no aprobás ni exportás").
- Modify `apps/web/src/app/api/copilotkit/[[...path]]/route.ts` para inyectar tools con el servicio real.
- Test `talent.test.ts` en agent-core: nombres de tools, no existe approve/export, zod rechaza topN 11.

### Task 9: Rutas HTTP
- Create `apps/web/src/lib/server/talent/http.ts` (guardas + `handle(fn)` mapeando errores), `runtime.ts` (`getTalentService()` singleton desde env).
- Create rutas `api/talent/inbox/sync`, `applications`, `applications/[id]`, `reports`, `reports/[id]`, `reports/[id]/decision`, `reports/[id]/export`.
- Test `http.test.ts`: origin inválido ⇒ 403; error mapping 404/409/503.

### Task 10: Demo script + docs
- Create `apps/web/scripts/demo-talent.ts` (`npm run demo:talent --workspace web`).
- Update `team/amin/README.md` (cómo probar, contratos, limitaciones) y `.env.example`.
- Run `npm run typecheck`, `npm test`, demo con archivos generados en `.data/talent-exports/`.
