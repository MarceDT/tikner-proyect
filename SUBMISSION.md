# Submission Checklist — TalentScore

**Project Name:** TalentScore — Context-Aware CV Triage, Shortlist & Human-in-the-Loop Recruiting
**Hackathon:** AI Tinkerers Global Hackathon (Agents, Everywhere)  
**Team Members:**  
- **Marcelo** — Product Lead, Domain Modeling, Human-in-the-Loop & Pitch  
- **Amin** — Backend & CopilotKit Runtime Tools  
- **Milena** — Frontend, Generative UI & Dashboard Architecture  

---

## Build eligibility

- [x] Our submitted project is a net-new build created during the official hackathon period.
- [x] Its core functionality was built during the event; we are not resubmitting or extending a pre-existing project and entering it as new.
- [x] We identify inherited templates, libraries, prompts, components, and starter code separately from our event work.

**What we inherited**
- CopilotKit starter template structure (`apps/web`, `packages/agent-core`, Turbopack / Next.js boilerplate).
- Infrastructure connection utilities for CopilotRuntime and Ambiguous AI MCP.

**What we built during the hackathon**
- **TalentScore Domain Model (`apps/web/src/lib/candidates.ts`)**: Replaced the incident boilerplate with a rich HR/Recruiting domain model: candidates (`Sofía Albarracín`, `Lucas Varela`, `Elena Rostova`), interview scorecards (Culture, System Design, Frontend), skill radar ratings, departmental role benchmarks (`TARGET_ROLE`: $95,000 USD budget cap), and structured job offer lifecycles.
- **Human-in-the-Loop (HITL) Security Gate (`apps/web/src/components/workplace-followups.tsx`)**: An interactive compensation review and formal offer issuance gate. The AI agent recommends and structures offer terms, but cannot legally extend or persist offers autonomously. The recruiter reviews the exact package (candidate, role, proposed salary vs budget cap, equity, start date) and explicitly executes either **"Aprobar y Emitir Oferta Formal"** or **"Rechazar / Ajustar"**.
- **Structured Offer Protocol & Serialization (`apps/web/src/lib/followup-types.ts`)**: Type-safe offer drafting (`JobOfferDetails`), budget variance evaluation, metadata extraction, and round-trip serialization between agent proposals and UI cards.
- **Context Injection & Governance (`candidatesWorkspaceContext`)**: Feeds active candidate scorecards, compensation limits, and HITL security policies into CopilotKit's `useAgentContext`, giving the agent real-time situational awareness.
- **CV provenance & explainable ranking (`apps/web/src/lib/candidates.ts`)**: Added three clearly labeled simulated email applications, attachment metadata, extraction confidence, evidence snippets, missing-field tracking, and a fixed 45/25/15/10/5 ranking rubric. Missing CV data is reported as unknown, never fabricated as a negative signal.
- **Shortlist & export governance (`SelectionReport`)**: A frozen ranking snapshot is created before a recruiter may approve a shortlist. PDF, DOCX and XLSX export requests must match that approved snapshot; the domain policy rejects export before explicit human approval.
- **Automated Verification Suite (`apps/web/src/lib/candidates.test.ts`)**: Domain tests cover offers, ranking, CV provenance, shortlist approval/rejection, export gating, and critical-status authorization.

---

## Title and description

**Title:** TalentScore: Context-Aware CV Triage and Governed Shortlisting

**What you built**
TalentScore embeds a governed AI agent directly inside an ATS. It starts with a labeled inbox of CV applications, preserves the CV/email provenance and extraction gaps, compares candidates against an explicit role rubric and salary budget, then proposes—not executes—a shortlist. The recruiter must approve the exact, frozen ranking snapshot before it can be exported as PDF, DOCX or XLSX. Formal offers remain a separate, stricter approval workflow.

**Who it is for**
Technical Recruiters, Hiring Managers, and Heads of Talent who make high-stakes hiring decisions under tight deadlines and strict compensation budgets.

**Why the context matters**
A generic chatbot cannot see the inbound application source, evaluate candidates against the organization’s exact rubric, preserve missing-data warnings, or hold a recruiter at the approval boundary. Because TalentScore lives directly inside the ATS surface:
1. It connects every decision to the selected candidate’s CV evidence, email metadata, interview signal and compensation expectation.
2. It highlights budget risk (Lucas is $30,000 above the $95,000 cap) without erasing his technical strengths.
3. It renders the shortlist and approval gate where the recruiter makes the decision, keeping the model from silently exporting or changing critical hiring states.

**Sponsor technologies used**
- **CopilotKit**: Powers the in-app conversational agent, Generative UI hooks (`useComponent`, `useHumanInTheLoop`), front-end tools (`useFrontendTool`), and live context synchronization (`useAgentContext`).
- **Ambiguous AI / MCP**: Enables persistent enterprise record auditing and synchronization of approved offer follow-ups across workspaces.
- **Next.js 15 & React 19**: Modern reactive web architecture with Turbopack for low-latency streaming interactions.

---

## Evidence for the judging criteria

Judges score each of the four official criteria from 1–5:

| Official criterion | Show in your project and demo | TalentScore Implementation Evidence |
|---|---|---|
| **1. Core Requirements & Functionality** | Run one complete workflow in the intended environment, from user request through tools to a verified result. Repeat with live integrations. | **Workflow to demonstrate:** inbox entry → extracted profile → explainable ranking → agent comparison → recruiter-approved shortlist → export. The supplied dataset is a simulated inbox; any live inbox or generated files must be shown and labeled separately. |
| **2. Innovation & Theme Alignment** | Show surrounding context before prompt, explain original interaction. Compare with context removed. | **True ATS context:** TalentScore gives the agent the current candidate, CV provenance, missing fields, interview evidence, rubric and budget. Without that surface context, a chatbot cannot produce an auditable shortlist. |
| **3. Technical Execution & Integration** | Show how tools, data, and environment connect. Demonstrate failure/cancellation path, recovery, persistence. | **Fail-safe policy:** critical statuses (`Offer Extended`, `Hired`), shortlist approval and export all require a human. A rejected shortlist returns candidates to ranked state, and an export attempt before approval is rejected by the domain layer. |
| **4. Usefulness & Agentic Experience** | Identify user and problem, show meaningful action, clear feedback, appropriate control. | **Recruiter value:** a transparent ranking removes spreadsheet triage while showing the evidence, uncertainty and budget implications needed to make a defensible hiring decision. |

- [x] We can point to visible evidence for every criterion.
- [x] We distinguish live services, sample data, session-only state, and standalone recipes.
- [x] Sponsor technologies contribute to the workflow; their count is not a judging criterion.

---

## Public repository

- [x] A new participant can run the quickstart from a clean clone (`npm install`, `npm run dev:web`).
- [x] The README lists required credentials and configuration.
- [x] `npm run verify` (`npm run typecheck && npm test`) passes cleanly (45/45 tests).
- [x] `.env`, tokens, generated traces with sensitive data, and account secrets are excluded via `.gitignore`.
- [x] Sample data, session-only state, and external integrations are clearly documented.

---

## Two-minute demo video script

1. **0:00 – 0:25 | CVs in context:**
   - Open the inbox labeled **“Datos de demostración: emails simulados”** and show the three received CVs: Sofía, Lucas and Elena.
   - Show the target role, its `$95,000 USD` cap and the extracted CV evidence/missing-field indicators.
2. **0:25 – 1:05 | Explainable agentic evaluation:**
   - Ask: *“¿Quiénes deben pasar a shortlist y qué evidencia respalda la decisión?”*
   - The agent reads the selected ATS context and renders the comparison using the published weights: skills 45%, experience 25%, architecture/agentes 15%, liderazgo/comunicación 10% and presupuesto 5%.
   - Contrast Sofía’s strong, in-budget profile with Lucas’s technical strengths and `$30k` budget risk; show Elena as a complementary option with a transparent backend-experience caveat.
3. **1:05 – 1:40 | Human-in-the-Loop shortlist:**
   - Select Sofía and Elena. Show the frozen score snapshot, evidence coverage and the request for PDF, DOCX and XLSX.
   - Click **“Aprobar Shortlist”**. Explain that neither the model nor a chat response can approve, export, hire or extend an offer.
   - Optionally show the decline path: a missing justification blocks rejection, while a valid rejection returns candidates to ranked state.
4. **1:40 – 2:00 | Verified output & disclosure:**
   - Trigger the approved export and show the resulting report(s) when the export integration is configured.
   - State accurately whether the inbox and persistence are simulated or live in this build; never present sample CVs as real applicants.
   - Credit CopilotKit for the in-app conversational/HITL experience and AI Tinkerers for the hackathon framework.

---

## Social post and final submission

- [x] Project summary drafted with sponsor tags (`@CopilotKit`, `@aitinkerers`).
- [x] Public repository link and demo video verified.
- [x] Checked live integration and automated tests before submission.
