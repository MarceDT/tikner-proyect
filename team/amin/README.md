# 🧠 Workspace de Amin — Backend & Agent Core

## 🎯 Tu Misión en el Hackathon
Eres el responsable de que el agente de IA sea inteligente, responda rápido y ejecute acciones reales en el servidor. Tu código vive en el backend y en la configuración del modelo y herramientas.

## 📂 Archivos y Áreas de Trabajo
1. `starter-kit/apps/web/src/app/api/copilotkit/[[...path]]/route.ts`: Endpoint principal del runtime de CopilotKit.
2. `starter-kit/packages/agent-core/`: Configuración del modelo (OpenAI / OpenRouter) y el system prompt.
3. `starter-kit/apps/web/src/app/api/followups/route.ts` (o tu nuevo endpoint de acciones): Lógica de persistencia en el backend (guardar registros, base de datos local SQLite/JSON o Ambiguous AI MCP).
4. `starter-kit/apps/web/src/lib/server/`: Lógica del servidor para procesar datos aprobados.

## 📋 Checklist de Tareas
- [ ] Configurar variables de entorno `.env` (`OPENAI_API_KEY`, `MODEL`, etc.).
- [ ] Definir el System Prompt adaptado al dominio del proyecto.
- [ ] Implementar los schemas de validación con Zod para las herramientas del agente.
- [ ] Crear el endpoint de servidor que procesa la acción final cuando el usuario hace clic en "Aprobar".
- [ ] Asegurar que el guardado sea persistente (que los datos no se borren al reiniciar o refrescar).

---

## 📬 Pipeline de postulaciones por email (implementado 12 sep 2026)

Flujo servidor: **bandeja demo → perfil estructurado (LLM) → ranking explicable → shortlist aprobada por un humano → export PDF/DOCX/XLSX**.
Spec: `docs/superpowers/specs/2026-09-12-talent-pipeline-backend-design.md`.

### Qué es real y qué es demo (no afirmar lo contrario en el pitch)

| Pieza | Estado |
|---|---|
| Bandeja de entrada | **Simulada**: `apps/web/src/lib/server/talent/demo-inbox.ts` (3 emails). Sin Gmail/IMAP/OAuth. |
| Adjuntos PDF/DOCX | **Simulados**: el CV ya viene como texto plano. Sin parsing real. |
| Extracción de perfil | **Real (LLM)** con `generateObject` sobre el modelo de `.env`. Post-validación: evidencia debe ser cita literal, salario solo si el número figura. Requiere `OPENAI_API_KEY`. |
| Ranking | **Real y determinista** (`rank-candidates.ts`): skills 40 / experiencia 25 / presupuesto 25 / completitud 10. Dato ausente ⇒ 0 + riesgo. El LLM explica, no puntúa. |
| Persistencia | **Real, PostgreSQL local** (`db/`, `DATABASE_URL`). Tests unitarios usan store en memoria. |
| Exportaciones | **Reales** desde un único `SelectionReport` (`pdf-lib`, `docx`, `exceljs`). |
| Aprobación humana | **Real**: `POST /api/talent/reports/:id/decision`. El export responde `409` sin aprobación. El agente **no** tiene tool para aprobar ni exportar. |

### Contratos expuestos

- **Tipos** (Milena/Marcelo): `apps/web/src/lib/talent-types.ts` → `Application`, `CandidateProfile`, `CandidateRanking`, `SelectionReport`, `ExportEvent`. `Candidate` no cambia.
- **Tools del agente** (`packages/agent-core/src/capabilities/talent.ts`): `list_applications`, `get_candidate_profile`, `evaluate_candidate`, `compare_candidates`, `build_selection_report(topN 1-10)`.
- **Endpoints** (loopback-only; POST con `Origin` propio + JSON):

| Método | Ruta | Cuerpo → Respuesta |
|---|---|---|
| POST | `/api/talent/inbox/sync` | → `{ applications, created, skipped, failed }` |
| GET | `/api/talent/applications` · `/api/talent/applications/:id` | → `Application` |
| POST | `/api/talent/reports` | `{ topN, requestedBy }` → `SelectionReport` (201, `pending`) |
| GET | `/api/talent/reports` · `/api/talent/reports/:id` | → `SelectionReport` (+ `exports[]`) |
| POST | `/api/talent/reports/:id/decision` | `{ decision: "approved"\|"rejected", decidedBy, note? }` → `SelectionReport` |
| GET | `/api/talent/reports/:id/export?format=pdf\|docx\|xlsx&requestedBy=` | archivo (`attachment`) · `409` sin aprobación |

Errores: `{ error }` con 400 / 404 / 409 / 413 / 415 / 503 (falta `DATABASE_URL`).

### Cómo probar

```bash
sudo dnf install -y nodejs            # Node 22 (si no está)
npm install
docker compose -f db/docker-compose.yml up -d
echo 'DATABASE_URL=postgresql://talentscore:talentscore@127.0.0.1:5432/talentscore' >> .env
npm run db:migrate
npm run typecheck && npm test         # unitarios sin red; el test Pg corre solo con DATABASE_URL
npm run demo:talent                   # sync → ranking → 409 sin aprobación → aprobación → 3 archivos en .data/talent-exports/
npm run dev:web                       # y en el chat: "Listá las postulaciones y compará las mejores"
```

### Limitaciones conocidas

- Sin `OPENAI_API_KEY` válida la extracción falla y las postulaciones quedan en `failed` (no hay modo sin LLM, por decisión de diseño).
- No hay autenticación de usuarios: `decidedBy`/`requestedBy` se registran tal como los declara la UI. Un despliegue real debe autenticar en `http.ts`.
- La bandeja demo se reinserta solo si faltan mensajes (dedupe por `message_id`); para re-extraer, hacé reset de la DB (`db/README.md`).
