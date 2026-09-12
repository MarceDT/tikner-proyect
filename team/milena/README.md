# 🎨 Workspace de Milena — Frontend & Generative UI

## 🎯 Tu Misión en el Hackathon
Eres la responsable de la experiencia visual y la interactividad. Harás que el agente no sea una simple ventana de texto aburrida, sino que proyecte componentes visuales vivos en el dashboard (Generative UI) y responda a lo que el usuario está viendo.

## 📂 Archivos y Áreas de Trabajo
1. `starter-kit/apps/web/src/app/page.tsx`: Maquetado y layout del dashboard principal (Tailwind CSS, paneles, tablas).
2. `starter-kit/apps/web/src/components/generative-ui.tsx`: Componentes React que el agente invoca dinámicamente (tarjetas interactivas, métricas, alertas visuales).
3. `starter-kit/apps/web/src/components/app-control.tsx`: Integración con `useAgentContext` (darle ojos al agente sobre el registro seleccionado) y `useCopilotAction` (permitir que el agente cambie pestañas o filtre datos).
4. Estilos y feedback visual en tiempo real.

## 📋 Checklist de Tareas
- [ ] Diseñar el layout del dashboard (panel de lista a la izquierda, detalle al centro, Copilot Chat a la derecha).
- [ ] Programar los componentes de Generative UI que el agente dibujará.
- [ ] Conectar `useAgentContext` para que cuando el usuario cambie de elemento en pantalla, el agente lo sepa al instante.
- [ ] Añadir estados de carga, animaciones y diseño pulido para impresionar en el video del demo.
