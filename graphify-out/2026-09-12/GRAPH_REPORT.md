# Graph Report - tinker-proyect  (2026-09-12)

## Corpus Check
- 164 files · ~513,776 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1143 nodes · 1492 edges · 88 communities (76 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `11f59792`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/workplace.ts
- candidate-cards.tsx
- channel.tsx
- finance.ts
- mobile/package.json
- Build the Slack template with Channels
- package.json
- auth0/package.json
- agent-core/package.json
- compilerOptions
- agent-factory.test.tsx
- compilerOptions
- expo
- web/package.json
- compilerOptions
- compilerOptions
- Troubleshooting
- channel/package.json
- streamed-cards.tsx
- README.md
- Build your first Slack agent with CopilotKit Channels SDK
- TalentScore — AI Agent in your ATS & Recruiting Dashboard
- 👑 Workspace de Marcelo — Dominio, Human-in-the-Loop & Pitch
- app/page.tsx
- The `PlatformAdapter` contract
- metro.config.js
- .mcp.json
- channels-ui component reference
- auth0/README.md
- React Native agent
- A complete incident demo
- Using sponsor tools
- Channels
- React Native template walkthrough
- Tools, native UI, and approval gates
- Submission Checklist — TalentScore
- Slack thread agent
- An agent inside your web app
- Deploy
- Hackathon overview
- TEAM_WORKFLOW.md
- Human-in-the-loop patterns
- CLAUDE.md
- Choose a model provider
- Setup
- CopilotKit Channels
- 🎨 Workspace de Milena — Frontend & Generative UI
- CopilotKit Channels
- rules/graphify.md
- skills/README.md
- workflows/graphify.md
- amin/README.md
- index.ts
- Notes for coding agents
- Hackathon rules for coding agents
- Set up a Slack Channel for a local Channels agent
- Set up a Slack Channel for a local Channels agent
- Troubleshooting a managed Slack Channel
- Troubleshooting a managed Slack Channel
- Inspector Workbench
- Intelligence Landing Page
- Inspector Workbench
- Intelligence Landing Page
- Inspector Docs Callouts
- Local runtime and agent
- Slack workspace and app
- Inspector Docs Callouts
- Local runtime and agent
- Slack workspace and app
- Intelligence project, API key, and Channel
- Intelligence project, API key, and Channel
- CopilotKit CLI
- CopilotKit
- Optional live E2E harness
- CopilotKit CLI
- CopilotKit
- Optional live E2E harness
- Secrets and credentials
- Secrets and credentials
- Set up a CopilotKit Channel
- Set up a CopilotKit Channel
- Inspector pane map
- Inspector pane map
- Sources
- Sources

## God Nodes (most connected - your core abstractions)
1. `Build the Slack template with Channels` - 18 edges
2. `Troubleshooting` - 17 edges
3. `compilerOptions` - 16 edges
4. `FollowupError` - 15 edges
5. `Set up a Slack Channel for a local Channels agent` - 15 edges
6. `Set up a Slack Channel for a local Channels agent` - 15 edges
7. `WorkplaceTask` - 13 edges
8. `FollowupService` - 13 edges
9. `Troubleshooting a managed Slack Channel` - 13 edges
10. `Troubleshooting a managed Slack Channel` - 13 edges

## Surprising Connections (you probably didn't know these)
- `makeChannelAgent()` --indirect_call--> `makeAgent()`  [INFERRED]
  apps/channel/src/agent.ts → packages/agent-core/src/agent.ts
- `runtime` --calls--> `makeAgent()`  [EXTRACTED]
  apps/web/src/app/api/mobile-copilotkit/[[...path]]/route.ts → packages/agent-core/src/agent.ts
- `POST()` --calls--> `searchWeb()`  [EXTRACTED]
  apps/web/src/app/api/search/route.ts → packages/agent-core/src/capabilities/search.ts
- `createAgentInstance()` --calls--> `makeAgent()`  [EXTRACTED]
  apps/web/src/app/api/copilotkit/[[...path]]/route.ts → packages/agent-core/src/agent.ts
- `list()` --indirect_call--> `marker()`  [INFERRED]
  apps/web/src/lib/server/followup-http.test.ts → apps/web/src/lib/server/followups.ts

## Import Cycles
- None detected.

## Communities (88 total, 9 thin omitted)

### Community 0 - "server/workplace.ts"
Cohesion: 0.05
Nodes (40): main(), dynamic, GET, handler, POST, runtime, Proposal, WorkplaceTask (+32 more)

### Community 1 - "candidate-cards.tsx"
Cohesion: 0.17
Nodes (6): CandidateComparisonCard(), CandidateComparisonItem, CandidateComparisonProps, OfferProposalCard(), OfferProposalProps, GenerativeUI()

### Community 2 - "channel.tsx"
Cohesion: 0.08
Nodes (27): channel, tools, IncidentCard, SEVERITY, baseIncident, ctx, Timeline, welcomeMessage() (+19 more)

### Community 3 - "finance.ts"
Cohesion: 0.09
Nodes (31): isSafeAssistantLink(), AssistantMarkdown(), AssistantMarkdownProps, markdownStyles, monospace, ChatScreen(), Account, addExpense() (+23 more)

### Community 4 - "mobile/package.json"
Cohesion: 0.05
Nodes (37): App(), dependencies, @copilotkit/react-native, expo, expo-status-bar, react, react-native, react-native-get-random-values (+29 more)

### Community 5 - "Build the Slack template with Channels"
Cohesion: 0.08
Nodes (24): Adding a new platform, Agent-rendered components (0.7+), Build the Slack template with Channels, Channel handlers, Common mistakes to avoid, Context, createChannel — the entry point, Direct adapter — only when you own the platform connection (+16 more)

### Community 6 - "package.json"
Cohesion: 0.07
Nodes (28): description, devDependencies, tsx, @types/node, typescript, engines, node, tsx (+20 more)

### Community 7 - "auth0/package.json"
Cohesion: 0.09
Nodes (21): runDemo(), dependencies, express, express-oauth2-jwt-bearer, devDependencies, jose, engines, node (+13 more)

### Community 8 - "agent-core/package.json"
Cohesion: 0.10
Nodes (19): dependencies, @ai-sdk/openai, @copilotkit/runtime, exa-js, zod, description, exports, ./mobile-finance-prompt (+11 more)

### Community 9 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 10 - "agent-factory.test.tsx"
Cohesion: 0.11
Nodes (9): ChannelAgentFactory, ChannelRunAgent, ControlledInnerAgent, demoTool, FakeModel, FakeStreamOptions, ObjectLanguageModel, StreamController (+1 more)

### Community 11 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, jsx, jsxImportSource, lib, module, moduleResolution, noEmit, skipLibCheck (+4 more)

### Community 12 - "expo"
Cohesion: 0.15
Nodes (12): package, expo, android, ios, name, newArchEnabled, orientation, slug (+4 more)

### Community 13 - "web/package.json"
Cohesion: 0.05
Nodes (39): nextConfig, dependencies, agent-core, @copilotkit/react-core, @copilotkit/runtime, @modelcontextprotocol/sdk, next, @openai/agents (+31 more)

### Community 14 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, lib, module, moduleResolution, noEmit, noUncheckedIndexedAccess, skipLibCheck, strict (+3 more)

### Community 15 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, allowImportingTsExtensions, jsx, moduleResolution, paths, strict, extends, include (+1 more)

### Community 16 - "Troubleshooting"
Cohesion: 0.12
Nodes (17): A Slack run stops after the first native card, A web follow-up does not appear after refresh, `AI SDK Warning: System messages in the prompt or messages fields…`, An `xapp-` token is in my .env, It boots, reports online, and answers nothing, It will not compile, `npm install` fails with "Cannot read properties of null (reading 'edgesOut')", OpenRouter-only setup asks for an OpenAI key (+9 more)

### Community 17 - "channel/package.json"
Cohesion: 0.11
Nodes (18): dependencies, agent-core, @copilotkit/channels, @copilotkit/runtime, zod, description, agent-core, @copilotkit/runtime (+10 more)

### Community 18 - "streamed-cards.tsx"
Cohesion: 0.38
Nodes (5): IncidentCard(), IncidentCardProps, Timeline(), TimelineProps, toneColor

### Community 20 - "Build your first Slack agent with CopilotKit Channels SDK"
Cohesion: 0.17
Nodes (12): 1. Sign in and create an Intelligence project, 2. Name your Channel and select Slack, 3. Create and install the Slack app, 4. Connect the Slack credentials to Intelligence, 5. Install the starter and select your project, 6. Start the Channels runtime, 7. Invite the bot and ask for an incident card, 8. Continue the conversation without another mention (+4 more)

### Community 21 - "TalentScore — AI Agent in your ATS & Recruiting Dashboard"
Cohesion: 0.17
Nodes (12): 1. Slack — an agent that joins the thread, 2. Web — an agent inside your app, 3. React Native — an agent in your pocket, AI Tinkerers Global Hackathon: *Agents, Everywhere*, Coding agent, CopilotKit onboarding, Get started, Make the demo yours (+4 more)

### Community 22 - "👑 Workspace de Marcelo — Dominio, Human-in-the-Loop & Pitch"
Cohesion: 0.40
Nodes (4): 📂 Archivos y Áreas de Trabajo, 📋 Checklist de Tareas, 🎯 Tu Misión en el Hackathon, 👑 Workspace de Marcelo — Dominio, Human-in-the-Loop & Pitch

### Community 23 - "app/page.tsx"
Cohesion: 0.08
Nodes (33): Home(), AppControl(), WorkplaceFollowups(), handleApprove(), handleRejectOrAdjust(), refresh(), submitProposal(), WorkplaceFollowupsProps (+25 more)

### Community 24 - "The `PlatformAdapter` contract"
Cohesion: 0.20
Nodes (9): Agent streaming, Capabilities, Decoding & lookup, Egress — render the IR, Ingress — report inbound events to the engine, Reference implementation, Testing an adapter, The `PlatformAdapter` contract (+1 more)

### Community 27 - "channels-ui component reference"
Cohesion: 0.22
Nodes (8): Call `Modal(...)`, don't write `<Modal>`, channels-ui component reference, Choosing components, Durability of handlers, Handler context (onClick / onSelect / onSubmit / onReaction), Interactive components, Layout & content components, Modal components

### Community 28 - "auth0/README.md"
Cohesion: 0.27
Nodes (5): Auth0 protected API recipe, Source and verification, Launch commands, Slack to Teams, Surface map

### Community 29 - "React Native agent"
Cohesion: 0.22
Nodes (9): Customize these files, Get started, Give this to your coding agent, Make it yours, React Native agent, Runtime URL, Try the flow, Upstream source (+1 more)

### Community 30 - "A complete incident demo"
Cohesion: 0.25
Nodes (8): 1. Establish the surrounding context, 2. Research with visible sources, 3. Approve a concrete follow-up, A complete incident demo, Add a persistent workplace record, Browser: ambient context and approved workplace actions, Record a focused video, Slack: context, sources, card, follow-up

### Community 31 - "Using sponsor tools"
Cohesion: 0.25
Nodes (8): Ambiguous AI, Auth0, CopilotKit, Exa, OpenAI, OpenRouter, Standalone protected API call, Using sponsor tools

### Community 32 - "Channels"
Cohesion: 0.29
Nodes (6): Channels, Claim-based delivery, Delivery is two legs, and neither is Socket Mode, Status is not health, Turn routing is not symmetric, What the managed path does and does not deliver

### Community 33 - "React Native template walkthrough"
Cohesion: 0.29
Nodes (7): 1. Start the runtime and Expo, 2. Render app state in chat, 3. Approve a local write, 4. Cancel a second write, 5. Check formatted assistant output, Evidence boundary, React Native template walkthrough

### Community 34 - "Tools, native UI, and approval gates"
Cohesion: 0.29
Nodes (7): Agent-rendered components — `defineChannelComponent`, Context — `ContextEntry`, Managed action proposals, Memory, Native UI — Channels JSX, Tools — `defineChannelTool`, Tools, native UI, and approval gates

### Community 35 - "Submission Checklist — TalentScore"
Cohesion: 0.29
Nodes (7): Build eligibility, Evidence for the judging criteria, Public repository, Social post and final submission, Submission Checklist — TalentScore, Title and description, Two-minute demo video script

### Community 36 - "Slack thread agent"
Cohesion: 0.33
Nodes (6): Customize these files, Get started, Give this to your coding agent, Slack thread agent, Try the flow, Verify and limits

### Community 37 - "An agent inside your web app"
Cohesion: 0.33
Nodes (6): An agent inside your web app, Customize these files, Get started, Give this to your coding agent, Try the flow, Verify and limits

### Community 38 - "Deploy"
Cohesion: 0.29
Nodes (6): Deploy, Health checks, Requirements, Scaling, Secrets, The one thing that will bite you

### Community 39 - "Hackathon overview"
Cohesion: 0.33
Nodes (6): Challenge, Choose infrastructure, then make the project yours, Four surfaces, Hackathon overview, Instructions for a coding agent, Judging criteria

### Community 40 - "TEAM_WORKFLOW.md"
Cohesion: 0.33
Nodes (5): 🧠 Amin — Backend, CopilotKit Runtime & Tools, 🔒 Contrato de Interfaces Activo, 👥 Integrantes y Responsabilidades, 👑 Marcelo — Dominio, Human-in-the-Loop & Pitch, 🎨 Milena — Frontend, Generative UI & Dashboard

### Community 41 - "Human-in-the-loop patterns"
Cohesion: 0.40
Nodes (4): 1. `awaitChoice` — your code asks, 2. `onInterrupt` + `resume` — the agent pauses, Human-in-the-loop patterns, Why handlers survive (or don't) a restart

### Community 42 - "CLAUDE.md"
Cohesion: 0.40
Nodes (4): Critical Rules, Key Commands, Project Context, Team Division

### Community 43 - "Choose a model provider"
Cohesion: 0.40
Nodes (5): Bring another agent backend, Choose a model provider, Existing configurations, OpenAI, OpenRouter

### Community 44 - "Setup"
Cohesion: 0.40
Nodes (5): Add one useful capability, Add Slack, Setup, Start with one model provider, Verify offline, then prove the live path

### Community 45 - "CopilotKit Channels"
Cohesion: 0.10
Nodes (20): A Channel has two halves, CopilotKit Channels, Customising a scaffolded Channel, Decide which path you are on first, Deployment shape, Never do these, Online, but silent — a different failure, Online, silent, and nothing in the log at all — a short-scoped Slack token (+12 more)

### Community 46 - "🎨 Workspace de Milena — Frontend & Generative UI"
Cohesion: 0.40
Nodes (4): 📂 Archivos y Áreas de Trabajo, 📋 Checklist de Tareas, 🎯 Tu Misión en el Hackathon, 🎨 Workspace de Milena — Frontend & Generative UI

### Community 47 - "CopilotKit Channels"
Cohesion: 0.10
Nodes (20): A Channel has two halves, CopilotKit Channels, Customising a scaffolded Channel, Decide which path you are on first, Deployment shape, Never do these, Online, but silent — a different failure, Online, silent, and nothing in the log at all — a short-scoped Slack token (+12 more)

### Community 51 - "amin/README.md"
Cohesion: 0.50
Nodes (3): 📂 Archivos y Áreas de Trabajo, 📋 Checklist de Tareas, 🎯 Tu Misión en el Hackathon

### Community 53 - "index.ts"
Cohesion: 0.05
Nodes (46): createAgentInstance(), createLocalLearningSnapshot(), GET(), intelApp, intelligence, intelRuntime, LEARNING_CONTAINER_ID, OPTIONS (+38 more)

### Community 57 - "Hackathon rules for coding agents"
Cohesion: 0.50
Nodes (4): Build eligibility, Hackathon rules for coding agents, Repository and demo preparation, Required deliverables

### Community 58 - "Set up a Slack Channel for a local Channels agent"
Cohesion: 0.11
Nodes (17): Decide these with the developer before you open a browser, Done means three things, all verified, How delivery actually works — two legs, two mechanisms, Never do these, Phase 0 — Establish the route and the contract, Phase 1 — Workspace, and start the Channel wizard to get the manifest, Phase 2 — Create and install the Slack app from that manifest, Phase 3 — Finish the Channel: adapter credentials and API key (+9 more)

### Community 59 - "Set up a Slack Channel for a local Channels agent"
Cohesion: 0.11
Nodes (17): Decide these with the developer before you open a browser, Done means three things, all verified, How delivery actually works — two legs, two mechanisms, Never do these, Phase 0 — Establish the route and the contract, Phase 1 — Workspace, and start the Channel wizard to get the manifest, Phase 2 — Create and install the Slack app from that manifest, Phase 3 — Finish the Channel: adapter credentials and API key (+9 more)

### Community 60 - "Troubleshooting a managed Slack Channel"
Cohesion: 0.14
Nodes (13): A shared agent instance blocks unrelated conversations, Agent layer, Dashboard fields that lie, and the one that doesn't, First move: make the runtime tell the truth, Ground truth: `status()`, not "it started", Handler routing — the silent no-op that looks like a Slack failure, Intelligence layer, Silent drops, and what concurrency actually does (+5 more)

### Community 61 - "Troubleshooting a managed Slack Channel"
Cohesion: 0.14
Nodes (13): A shared agent instance blocks unrelated conversations, Agent layer, Dashboard fields that lie, and the one that doesn't, First move: make the runtime tell the truth, Ground truth: `status()`, not "it started", Handler routing — the silent no-op that looks like a Slack failure, Intelligence layer, Silent drops, and what concurrency actually does (+5 more)

### Community 62 - "Inspector Workbench"
Cohesion: 0.18
Nodes (10): Decision Tree, Default host, Error Handling, Inspector Workbench, Procedure 1: Start the workbench, Procedure 2: Edit, screenshot, look, Procedure 3: Stop the workbench, Procedures (+2 more)

### Community 63 - "Intelligence Landing Page"
Cohesion: 0.18
Nodes (10): Decision Tree, Error Handling, Intelligence Landing Page, Landing sources, Procedure 1: Add a feature or docs page, Procedure 2: Rename or move a page, Procedure 3: Remove a feature or page, Procedures (+2 more)

### Community 64 - "Inspector Workbench"
Cohesion: 0.18
Nodes (10): Decision Tree, Default host, Error Handling, Inspector Workbench, Procedure 1: Start the workbench, Procedure 2: Edit, screenshot, look, Procedure 3: Stop the workbench, Procedures (+2 more)

### Community 65 - "Intelligence Landing Page"
Cohesion: 0.18
Nodes (10): Decision Tree, Error Handling, Intelligence Landing Page, Landing sources, Procedure 1: Add a feature or docs page, Procedure 2: Rename or move a page, Procedure 3: Remove a feature or page, Procedures (+2 more)

### Community 68 - "Inspector Docs Callouts"
Cohesion: 0.20
Nodes (9): Decision Tree, Error Handling, Inspector Docs Callouts, Procedure 1: Map a shipped pane to docs, Procedure 2: Remove a pane, Procedure 3: Quickstart sanity-check step, Procedures, Red Flags (+1 more)

### Community 69 - "Local runtime and agent"
Cohesion: 0.20
Nodes (9): Assert the Channel is actually online, Configure, Install, Keep it alive, Local runtime and agent, Ports, Prerequisites, Start the agent first (+1 more)

### Community 70 - "Slack workspace and app"
Cohesion: 0.20
Nodes (9): Create the app from the Channel wizard's manifest, Install it and collect the two credentials, Invite the bot to a test channel, Phase 2 is done when, Pick a workspace, Settings that must stay as the manifest sets them, Slack workspace and app, Understand the approval boundary before promising a timeline (+1 more)

### Community 71 - "Inspector Docs Callouts"
Cohesion: 0.20
Nodes (9): Decision Tree, Error Handling, Inspector Docs Callouts, Procedure 1: Map a shipped pane to docs, Procedure 2: Remove a pane, Procedure 3: Quickstart sanity-check step, Procedures, Red Flags (+1 more)

### Community 72 - "Local runtime and agent"
Cohesion: 0.20
Nodes (9): Assert the Channel is actually online, Configure, Install, Keep it alive, Local runtime and agent, Ports, Prerequisites, Start the agent first (+1 more)

### Community 73 - "Slack workspace and app"
Cohesion: 0.20
Nodes (9): Create the app from the Channel wizard's manifest, Install it and collect the two credentials, Invite the bot to a test channel, Phase 2 is done when, Pick a workspace, Settings that must stay as the manifest sets them, Slack workspace and app, Understand the approval boundary before promising a timeline (+1 more)

### Community 76 - "Intelligence project, API key, and Channel"
Cohesion: 0.22
Nodes (8): If the dashboard cannot do what this phase needs, Intelligence project, API key, and Channel, One consumer per Channel, Reading the status, The four things that must line up, The order to do it in, The wizard, and the labels it actually uses, Things that are not required

### Community 77 - "Intelligence project, API key, and Channel"
Cohesion: 0.22
Nodes (8): If the dashboard cannot do what this phase needs, Intelligence project, API key, and Channel, One consumer per Channel, Reading the status, The four things that must line up, The order to do it in, The wizard, and the labels it actually uses, Things that are not required

### Community 79 - "CopilotKit CLI"
Cohesion: 0.29
Nodes (6): CopilotKit CLI, Other commands, Signing in and picking a project, Starting a project, `verify` — do this before debugging, What `verify` does not cover

### Community 80 - "CopilotKit"
Cohesion: 0.29
Nodes (6): Before you debug anything, CopilotKit, Setup, The search tools, Two versions exist, Where the answers are

### Community 81 - "Optional live E2E harness"
Cohesion: 0.29
Nodes (6): Configure, Interpreting failures, Optional live E2E harness, Run, Scope limits, Why this phase is allowed to hold Slack tokens

### Community 82 - "CopilotKit CLI"
Cohesion: 0.29
Nodes (6): CopilotKit CLI, Other commands, Signing in and picking a project, Starting a project, `verify` — do this before debugging, What `verify` does not cover

### Community 83 - "CopilotKit"
Cohesion: 0.29
Nodes (6): Before you debug anything, CopilotKit, Setup, The search tools, Two versions exist, Where the answers are

### Community 84 - "Optional live E2E harness"
Cohesion: 0.29
Nodes (6): Configure, Interpreting failures, Optional live E2E harness, Run, Scope limits, Why this phase is allowed to hold Slack tokens

### Community 85 - "Secrets and credentials"
Cohesion: 0.33
Nodes (5): If a secret does leak, Rotation and blast radius, Rules for the agent, Secrets and credentials, Who owns what

### Community 86 - "Secrets and credentials"
Cohesion: 0.33
Nodes (5): If a secret does leak, Rotation and blast radius, Rules for the agent, Secrets and credentials, Who owns what

### Community 87 - "Set up a CopilotKit Channel"
Cohesion: 0.40
Nodes (4): Do this, If you did not get the guide, Set up a CopilotKit Channel, Verify you actually got the guide

### Community 88 - "Set up a CopilotKit Channel"
Cohesion: 0.40
Nodes (4): Do this, If you did not get the guide, Set up a CopilotKit Channel, Verify you actually got the guide

### Community 89 - "Inspector pane map"
Cohesion: 0.50
Nodes (3): Inspector pane map, Surfaces that do not get the Open Inspector step, Unshipped (no Callout)

### Community 90 - "Inspector pane map"
Cohesion: 0.50
Nodes (3): Inspector pane map, Surfaces that do not get the Open Inspector step, Unshipped (no Callout)

## Knowledge Gaps
- **651 isolated node(s):** `copilotkit`, `exa`, `name`, `version`, `private` (+646 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 742 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Troubleshooting` connect `Troubleshooting` to `README.md`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `TalentScore — AI Agent in your ATS & Recruiting Dashboard` connect `TalentScore — AI Agent in your ATS & Recruiting Dashboard` to `README.md`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `Build the Slack template with Channels` connect `Build the Slack template with Channels` to `README.md`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `copilotkit`, `exa`, `name` to the rest of the system?**
  _651 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server/workplace.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.051425213047311194 - nodes in this community are weakly interconnected._
- **Should `channel.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08405797101449275 - nodes in this community are weakly interconnected._
- **Should `finance.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._