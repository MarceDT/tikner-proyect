# Notes for coding agents

## 🎯 Current Project: TalentScore (AI Tinkerers Hackathon)
We are building **TalentScore**, an AI agent inside an ATS & Recruiting Web Dashboard (`apps/web`).
- The domain model and candidate data live in [`apps/web/src/lib/candidates.ts`](apps/web/src/lib/candidates.ts).
- The team has 3 members with distinct workspaces and responsibilities:
  1. **Amin:** Backend & Agent Tools -> [`team/amin/README.md`](team/amin/README.md)
  2. **Milena:** Frontend & Generative UI -> [`team/milena/README.md`](team/milena/README.md)
  3. **Marcelo:** Dominio, Human-in-the-Loop & Pitch -> [`team/marcelo/README.md`](team/marcelo/README.md)
- Team coordination guide: [`team/TEAM_WORKFLOW.md`](team/TEAM_WORKFLOW.md).

> **Instruction for AI Agents:** When interacting with the user, check or ask which role they are working on (Amin, Milena, or Marcelo) and prioritize their specific README and domain boundaries to avoid merge conflicts.

Read [hackathon-overview.md](hackathon-overview.md), [hackathon-rules.md](hackathon-rules.md), and [using-sponsor-tools.md](using-sponsor-tools.md), then `apps/web/README.md`. Build the team's own workflow; the incident app is infrastructure reference code.

CopilotKit powers the Slack and web templates. The mobile starting point in `apps/mobile` has its own install and environment; follow its README for setup and checks.

For setup, follow [CopilotKit onboarding](README.md#copilotkit-onboarding) after choosing an app. For Slack, run `npm run channel:setup -- --no-clipboard` and continue with the emitted prompt and installed `channels-setup` skill. For web/mobile, explain the model-only and Intelligence options before starting the official `onboard start` workflow. Preserve the chosen app and its working behavior; do not scaffold over this checkout or provision every template. Use current CLI instructions instead of copying authentication and provisioning steps from memory.

Read `.agents/skills/build-channels-agent/SKILL.md` before touching anything in
`apps/channel/`. It carries the verified API surface; the most common
failure mode in this codebase is inventing a plausible-looking Channels API.

Hard-won rules that are easy to get wrong here:

- **`@ag-ui/client` must stay deduped.** The root `package.json` pins it via
  `overrides` to the exact version `@copilotkit/runtime` declares. Two copies
  produce two `AbstractAgent` types and every `createChannel({ agent })` fails
  on a private `_debug` property. If you bump `@copilotkit/runtime`, re-check
  `npm ls @ag-ui/client` and update the override.
- **`@copilotkit/channels` and `@copilotkit/runtime` are a tested pair.** Bump
  together, keep them exact.
- **Files containing JSX must be `.tsx`**, and the tsconfig must set
  `jsxImportSource: "@copilotkit/channels"`. This is not React.
- **`maxSteps` defaults to 1** on `BuiltInAgent`. Any agent with tools needs more,
  or it calls one tool and stops before seeing the result.
- **Do not add `identifyUser` to `CopilotRuntime`.** It belongs on
  `createChannel`, and must be absent on a Channels-only runtime.
- **Handlers return `void`.** `thread.post()` returns a `MessageRef`, so a
  concise arrow body fails under `strict`. Use a block body and `await`.
- **Never invent a component or prop.** The vocabulary is fixed — see
  `references/ui-components.md` in the skill.
- Run `npm run typecheck` before claiming anything works.
