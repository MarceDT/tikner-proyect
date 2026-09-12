# CLAUDE.md — TalentScore Project Guidelines

## Project Context
You are working on **TalentScore**, an AI agent built for an ATS & Recruiting Web Dashboard (`apps/web`), submitted to the **AI Tinkerers Global Hackathon: Agents, Everywhere**.

## Team Division
The work is divided among 3 members:
1. **Amin (Backend & Agent Core):** Owns `packages/agent-core/`, `apps/web/src/app/api/copilotkit/`, server actions, tools and prompts. See `team/amin/README.md`.
2. **Milena (Frontend & Generative UI):** Owns `apps/web/src/app/page.tsx`, `apps/web/src/components/generative-ui.tsx`, and frontend tools (`app-control.tsx`). See `team/milena/README.md`.
3. **Marcelo (Domain, Human-in-the-Loop & Pitch):** Owns `apps/web/src/lib/candidates.ts`, approval modal/flow (`workplace-followups.tsx`), `SUBMISSION.md` and pitch demo. See `team/marcelo/README.md`.

## Key Commands
- Start Web app: `npm run dev:web`
- Run typecheck: `npm run typecheck`
- Verify tests/lint: `npm run verify`

## Critical Rules
- Consult `AGENTS.md` and `team/TEAM_WORKFLOW.md` before making architectural changes.
- Always check which team member you are assisting to respect code ownership and avoid merge conflicts.
