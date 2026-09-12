# 🎨 Workspace de Milena — Frontend & Generative UI

## 🎯 Tu Misión en el Hackathon
Eres la responsable de la experiencia visual y la interactividad. Harás que el agente no sea una simple ventana de texto aburrida, sino que proyecte componentes visuales vivos en el dashboard (Generative UI) y responda a lo que el usuario está viendo.

## 📂 Archivos y Áreas de Trabajo
1. `apps/web/src/app/page.tsx`: Maquetado y layout del dashboard principal de TalentScore (pipeline a la izquierda, deep dive con matrices de habilidades al centro, y Talent Copilot a la derecha).
2. `apps/web/src/components/candidate-cards.tsx`: Componentes React vivos (`CandidateComparisonCard`, `OfferProposalCard`).
3. `apps/web/src/components/generative-ui.tsx`: Registro de herramientas dinámicas (`candidate_comparison`, `offer_proposal`, `propose_action` / Human-in-the-Loop).
4. `apps/web/src/components/app-control.tsx`: Integración con `useAgentContext` (conectado a `candidatesWorkspaceContext`) y `useFrontendTool` (`select_candidate`, `update_candidate_status`).
5. `apps/web/src/app/globals.css`: Estilos modernos en tema obsidiana/slate de alto impacto visual.

## 📋 Checklist de Tareas
- [x] Diseñar el layout del dashboard (panel de lista a la izquierda, detalle al centro, Copilot Chat a la derecha).
- [x] Programar los componentes de Generative UI que el agente dibujará (`candidate_comparison` y `offer_proposal`).
- [x] Conectar `useAgentContext` para que cuando el usuario cambie de elemento en pantalla, el agente lo sepa al instante.
- [x] Implementar la compuerta de aprobación Human-in-the-Loop (`propose_action`) con botones interactivos.
- [x] Añadir estados visuales claros, badges de compensación vs presupuesto ($95k tope) y diseño pulido para impresionar en el video del demo.
