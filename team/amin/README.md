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
