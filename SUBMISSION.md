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
- **TalentScore Domain Model (`apps/web/src/lib/candidates.ts`)**: Replaced the incident boilerplate with a rich HR/Recruiting domain model: six explicitly fictional candidates (including Sofía, Lucas, Elena, Valentina, Camila and Mateo), interview scorecards, skill ratings, a `$95,000 USD` role cap, and structured offer lifecycles.
- **Human-in-the-Loop (HITL) Security Gate (`apps/web/src/components/workplace-followups.tsx`)**: An interactive compensation review and formal offer issuance gate. The AI agent recommends and structures offer terms, but cannot legally extend or persist offers autonomously. The recruiter reviews the exact package (candidate, role, proposed salary vs budget cap, equity, start date) and explicitly executes either **"Aprobar y Emitir Oferta Formal"** or **"Rechazar / Ajustar"**.
- **Structured Offer Protocol & Serialization (`apps/web/src/lib/followup-types.ts`)**: Type-safe offer drafting (`JobOfferDetails`), budget variance evaluation, metadata extraction, and round-trip serialization between agent proposals and UI cards.
- **Context Injection & Governance (`candidatesWorkspaceContext`)**: Feeds active candidate scorecards, compensation limits, and HITL security policies into CopilotKit's `useAgentContext`, giving the agent real-time situational awareness.
- **CV provenance & explainable ranking (`apps/web/src/lib/candidates.ts`)**: Added three clearly labeled simulated email applications, attachment metadata, extraction confidence, evidence snippets, missing-field tracking, and a fixed 45/25/15/10/5 ranking rubric. Missing CV data is reported as unknown, never fabricated as a negative signal.
- **Shortlist & export governance (`SelectionReport`)**: A frozen ranking snapshot is created before a recruiter may approve a shortlist. PDF, DOCX and XLSX export requests must match that approved snapshot; the domain policy rejects export before explicit human approval.
- **Interview proposal & scheduling gate**: The agent can read published availability and create an `InterviewProposal`; it never has a schedule, re-schedule, cancellation, invitation, export, shortlist, offer or hiring tool. A separate visible confirmation requires the recruiter to review candidate, date/time, timezone, interviewers, modality/link and consent. The current `simulated_local` adapter persists the audit record but sends no external invitation.
- **Automated Verification Suite**: Domain tests cover offers, ranking, CV provenance, shortlist approval/rejection, export gating, interview proposal/rejection/confirmation, invalid timezone, conflicts, audit history and the absence of autonomous scheduling tools.

---

## Title and description

**Title:** TalentScore: Context-Aware CV Triage and Governed Shortlisting

**What you built**
TalentScore embeds a governed AI agent directly inside an ATS. It starts with a labeled inbox of CV applications, preserves CV/email provenance and extraction gaps, compares candidates against an explicit 45/25/15/10/5 rubric and salary budget, then proposes—not executes—a shortlist. After a human approves that frozen shortlist, the agent can prepare an interview proposal with availability evidence and conflicts. A recruiter separately reviews and confirms the appointment; the current local demo persists that result without pretending to create a Google/Outlook event or send email. PDF, DOCX and XLSX exports remain independently gated by human approval.

**Who it is for**
Technical Recruiters, Hiring Managers, and Heads of Talent who make high-stakes hiring decisions under tight deadlines and strict compensation budgets.

**Why the context matters**
A generic chatbot cannot see the inbound application source, evaluate candidates against the organization’s exact rubric, preserve missing-data warnings, or hold a recruiter at the approval boundary. Because TalentScore lives directly inside the ATS surface:
1. It connects every decision to the selected candidate’s CV evidence, email metadata, interview signal and compensation expectation.
2. It highlights budget risk (Lucas is $30,000 above the $95,000 cap) without erasing his technical strengths.
3. It renders the shortlist and appointment gates where the recruiter makes the decision, keeping the model from silently exporting, scheduling or changing critical hiring states.

**Sponsor technologies used**
- **CopilotKit**: Powers the in-app conversational agent, Generative UI hooks (`useComponent`, `useHumanInTheLoop`), front-end tools (`useFrontendTool`), and live context synchronization (`useAgentContext`).
- **Ambiguous AI / MCP**: Enables persistent enterprise record auditing and synchronization of approved offer follow-ups across workspaces.
- **Next.js 15 & React 19**: Modern reactive web architecture with Turbopack for low-latency streaming interactions.

---

## Evidence for the judging criteria

Judges score each of the four official criteria from 1–5:

| Official criterion | Show in your project and demo | TalentScore Implementation Evidence |
|---|---|---|
| **1. Core Requirements & Functionality** | Run one complete workflow in the intended environment, from user request through tools to a verified result. Repeat with live integrations. | **Workflow to demonstrate:** labeled inbox → extracted profile → explainable ranking → agent proposal → recruiter-approved shortlist → recruiter-confirmed interview record → export. The inbox, availability and calendar provider shown are simulated; Postgres persistence is real only when `DATABASE_URL` is configured. |
| **2. Innovation & Theme Alignment** | Show surrounding context before prompt, explain original interaction. Compare with context removed. | **True ATS context:** TalentScore gives the agent the current candidate, CV provenance, missing fields, interview evidence, rubric and budget. Without that surface context, a chatbot cannot produce an auditable shortlist. |
| **3. Technical Execution & Integration** | Show how tools, data, and environment connect. Demonstrate failure/cancellation path, recovery, persistence. | **Fail-safe policy:** critical statuses (`Offer Extended`, `Hired`), shortlist approval, export and interview confirmation require a human. A conflict or invalid timezone blocks the agenda; a rejection stores an audit event but creates no appointment. |
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

1. **0:00 – 0:18 | Surface and context before prompting:**
   - Open the ATS dashboard before touching the chat. Point out the selected candidate, the six clearly fictional profiles, the inbox label **“datos de demostración: emails simulados”**, the `$95,000 USD` role cap and the evidence/missing-data indicators.
   - Say: *“Esto no es un chat aislado: TalentScore ya ve el CV, la evidencia, la rúbrica y las reglas de aprobación del reclutador.”*
2. **0:18 – 0:48 | One agent interaction:**
   - Prompt: *“Compará a Sofía, Lucas y Elena; recomendá una shortlist y prepará una entrevista para Sofía.”*
   - Show the visible comparison/result. Explain the published weights: skills 45%, experience 25%, architecture/agentes 15%, liderazgo/comunicación 10%, budget 5%. Contrast Sofía’s evidence and in-budget profile with Lucas’s `$30k` budget/collaboration warnings and Elena’s complementary frontend/UX signal with lower backend seniority.
3. **0:48 – 1:18 | Decision is not execution:**
   - Show the frozen shortlist. Say: *“La IA preparó una recomendación; todavía no tomó ninguna decisión.”* Click **Aprobar Shortlist** as the recruiter and show the status change.
   - Show the resulting `InterviewProposal`: time, `America/Asuncion`, interviewers, modality, agenda, availability evidence and any conflicts. State that this is still a proposal, not a calendar event.
4. **1:18 – 1:43 | Visible HITL execution:**
   - In the second gate, visibly tick candidate, date/time, timezone, interviewers, modality/link and consent. Click **Confirmar y agendar entrevista**.
   - Show the returned interview ID/audit record. Say: *“Ahora sí hay un cambio local persistible: una persona confirmó la agenda. El proveedor de calendario de este demo es local simulado; no enviamos correos ni inventamos una integración con Google u Outlook.”*
5. **1:43 – 2:00 | Export, sponsors and disclosure:**
   - Trigger PDF/DOCX/XLSX only after the human-approved shortlist and show the generated file/result.
   - Say: *“CopilotKit hace posible el agente dentro del ATS y sus herramientas/contexto; OpenAI habilita la extracción cuando la API está configurada. La bandeja, disponibilidad y calendario que ven son datos simulados; PostgreSQL persiste solo cuando `DATABASE_URL` está configurada.”* Check that the audio is clear and finish under two minutes.

---

## Social post and final submission

- [x] Project summary drafted with sponsor tags (`@CopilotKit`, `@aitinkerers`).
- [x] Public repository link and demo video verified.
- [x] Checked live integration and automated tests before submission.
