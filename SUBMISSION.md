# Submission Checklist — TalentScore

**Project Name:** TalentScore — Context-Aware AI Recruiting Agent & Human-in-the-Loop Offer Gate  
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
- **Automated Verification Suite (`apps/web/src/lib/candidates.test.ts`)**: 45 unit and integration tests passing with 100% success rate, validating offer creation, budget boundaries, approval transitions, CRLF resilience, and serialization.

---

## Title and description

**Title:** TalentScore: Context-Aware AI Recruiting Dashboard with Human-in-the-Loop Governance

**What you built**
TalentScore embeds an autonomous yet strictly governed AI agent directly inside an ATS (Applicant Tracking System) dashboard. The agent evaluates technical interview notes, compares candidate strengths against the job description and salary budget, highlights compensation discrepancies (such as candidates exceeding the $95,000 USD cap), and drafts formal offer proposals. Through a dedicated **Human-in-the-Loop Security Gate**, the human recruiter maintains absolute control over legally binding actions: the recruiter inspects the financial breakdown, adjusts equity or salary in real time, and must click **"Aprobar y Emitir Oferta Formal"** to transition the candidate to `Offer Extended` and persist the record.

**Who it is for**
Technical Recruiters, Hiring Managers, and Heads of Talent who make high-stakes hiring decisions under tight deadlines and strict compensation budgets.

**Why the context matters**
A generic chatbot in a separate tab cannot see candidate interview scores, does not know the department's authorized budget ceiling ($95,000 USD), and cannot execute auditable status changes. Because TalentScore lives directly inside the ATS surface:
1. It continuously observes the active candidate profile, interview sentiment (e.g. 3x "Strong Yes" for Sofía Albarracín), and compensation expectations.
2. It detects budget risks before offers are drafted (e.g. flagging Lucas Varela as $30,000 over budget).
3. It projects interactive Generative UI and approval gates directly where the recruiter works.

**Sponsor technologies used**
- **CopilotKit**: Powers the in-app conversational agent, Generative UI hooks (`useComponent`, `useHumanInTheLoop`), front-end tools (`useFrontendTool`), and live context synchronization (`useAgentContext`).
- **Ambiguous AI / MCP**: Enables persistent enterprise record auditing and synchronization of approved offer follow-ups across workspaces.
- **Next.js 15 & React 19**: Modern reactive web architecture with Turbopack for low-latency streaming interactions.

---

## Evidence for the judging criteria

Judges score each of the four official criteria from 1–5:

| Official criterion | Show in your project and demo | TalentScore Implementation Evidence |
|---|---|---|
| **1. Core Requirements & Functionality** | Run one complete workflow in the intended environment, from user request through tools to a verified result. Repeat with live integrations. | **Complete End-to-End Workflow:**<br>1. Recruiter selects candidate `Sofía Albarracín (CAND-101)`.<br>2. Recruiter asks the agent: *"¿Es Sofía adecuada para el puesto de Lead Fullstack y cómo se compara con el presupuesto?"*<br>3. Agent reads interview notes (3x Strong Yes), validates her $92,000 expectation against the $95,000 cap, and proposes a formal offer package.<br>4. The HITL Review Gate renders with real-time budget comparison (+$3,000 USD available margin, green indicator).<br>5. Recruiter clicks **"Aprobar y Emitir Oferta Formal"**.<br>6. Candidate status immediately updates to `Offer Extended`, an auditable timestamp and reviewer signature are recorded, and persisted. |
| **2. Innovation & Theme Alignment** | Show surrounding context before prompt, explain original interaction. Compare with context removed. | **True "Agents Everywhere" Surface Integration:**<br>Without surface context, a standalone LLM requires tedious copy-pasting of resumes, interview feedback, and budget sheets. With TalentScore, switching between candidates (`CAND-101`, `CAND-102`, `CAND-103`) dynamically updates the agent's context. When inspecting Lucas Varela, the agent instantly sounds the alarm on his $125k expectation vs $95k budget, preventing costly recruitment errors. |
| **3. Technical Execution & Integration** | Show how tools, data, and environment connect. Demonstrate failure/cancellation path, recovery, persistence. | **Fail-Safe HITL Architecture & Edge Case Handling:**<br>- **Safety Boundary:** The AI agent *cannot* execute writes or extend offers directly; attempts to bypass the UI gate fail.<br>- **Rejection/Adjustment Path:** Clicking **"Rechazar / Ajustar"** safely dismisses the proposal, prevents writes, and allows modifying salary/equity.<br>- **Deterministic Formatting:** Locale-independent currency and number parsers (`en-US` formatting with regex fallbacks and CRLF support).<br>- **Type Safety & Testing:** 45 automated tests (`npm test`) verify zero regressions; `npm run typecheck` passes with zero errors across all workspaces. |
| **4. Usefulness & Agentic Experience** | Identify user and problem, show meaningful action, clear feedback, appropriate control. | **High-Value Enterprise Impact:**<br>- Eliminates manual offer letter preparation and cross-referencing between interview tools and compensation spreadsheets.<br>- Prevents compliance and budget violations with real-time visual variance banners (green for within budget, red alert for over budget).<br>- Recruiter retains 100% agency: clear feedback states (`Offer Extended`, approval signatures, rejection justifications). |

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

1. **0:00 – 0:30 | The Problem & Context:**
   - Show the ATS Dashboard with candidate scorecards (`Sofía Albarracín`, `Lucas Varela`, `Elena Rostova`).
   - Point out the departmental budget limit: `$95,000 USD` for the `Lead Fullstack & AI Systems Engineer` role.
   - Explain the danger of unassisted or un-governed AI: either recruiters spend hours preparing offer packages, or autonomous agents risk sending unauthorized compensation commitments.
2. **0:30 – 1:15 | The Agentic Evaluation & Generative UI:**
   - Select Sofía Albarracín. Ask TalentScore to evaluate her cultural and technical fit and formulate an offer.
   - The agent reads her 3 rounds of interviews (Marcelo, Amin, Milena: all "Strong Yes"), confirms her $92k salary expectation fits within the $95k budget, and structures an offer proposal.
3. **1:15 – 1:45 | The Human-in-the-Loop Security Gate:**
   - Highlight the **Human-in-the-Loop Approval Gate** rendered in the dashboard.
   - Show the budget variance comparison: `+$3,000 USD (+3.2% margen disponible)`.
   - Contrast with Lucas Varela ($125,000 USD), showing the red alert warning: `⚠️ Excede el presupuesto en $30,000 USD`.
   - Click **"Aprobar y Emitir Oferta Formal"**.
4. **1:45 – 2:00 | Verified Outcome & Sponsor Credits:**
   - Show candidate status instantly changing to `Offer Extended` with verified timestamp and reviewer audit trail.
   - Credit **CopilotKit** for conversational runtime & HITL primitives, and **AI Tinkerers** for the hackathon framework.

---

## Social post and final submission

- [x] Project summary drafted with sponsor tags (`@CopilotKit`, `@aitinkerers`).
- [x] Public repository link and demo video verified.
- [x] Checked live integration and automated tests before submission.
