# 🎯 TalentScore — Proyecto Hackathon AI Tinkerers
**"AI Agent in your ATS & Recruiting Dashboard"**

## 👥 Integrantes y Responsabilidades

### 🧠 Amin — Backend, CopilotKit Runtime & Tools
- **Dominio:** `apps/web/src/app/api/copilotkit/`, `packages/agent-core/`
- **Tareas clave:**
  1. Adaptar el System Prompt para actuar como **Lead Talent & Compensation Scout**.
  2. Implementar herramientas (`compare_candidates`, `evaluate_fit`, `propose_offer`).
  3. Endpoint de backend para guardar la oferta aprobada con persistencia en disco o memoria.
- Guía detallada: `team/amin/README.md`

---

### 🎨 Milena — Frontend, Generative UI & Dashboard
- **Dominio:** `apps/web/src/app/page.tsx`, `apps/web/src/components/generative-ui.tsx`, `apps/web/src/components/app-control.tsx`
- **Tareas clave:**
  1. Diseñar el dashboard de candidatos (columna de candidatos, tarjeta del candidato seleccionado con avatar, notas de entrevista y pros/red flags).
  2. Programar componentes de Generative UI:
     - `CandidateComparisonCard`: radar o tabla comparativa en chat/pantalla.
     - `OfferProposalCard`: desglose salarial vs presupuesto, equity y fecha de inicio.
  3. Conectar `useAgentContext` con `candidatesWorkspaceContext(selectedId)` para que el agente vea el candidato activo.
- Guía detallada: `team/milena/README.md`

---

### 👑 Marcelo — Dominio, Human-in-the-Loop & Pitch
- **Dominio:** `apps/web/src/lib/candidates.ts`, `apps/web/src/components/workplace-followups.tsx`, `SUBMISSION.md`
- **Tareas clave:**
  1. Mantener los datos de candidatos en `apps/web/src/lib/candidates.ts`.
  2. Diseñar el flujo de aprobación manual: el reclutador revisa la propuesta salarial y presiona **"Aprobar y Emitir Oferta Formal"**.
  3. Preparar el video de 2 minutos para el jurado siguiendo los 4 criterios de evaluación.
- Guía detallada: `team/marcelo/README.md`

---

## 🔒 Contrato de Interfaces Activo
- Modelo de datos central definido en: `apps/web/src/lib/candidates.ts`
- No modificar los nombres de campos en `Candidate` sin avisar al equipo para evitar rupturas.
