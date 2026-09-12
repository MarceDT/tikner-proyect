# Base de datos (PostgreSQL) — TalentScore

Persistencia real de la app: postulaciones, reportes de selección y eventos de exportación.
Todos usamos el mismo esquema; los scripts son idempotentes.

## Levantar en 3 pasos

```bash
# 1. Postgres local (Docker)
docker compose -f db/docker-compose.yml up -d

# 2. Configurar la URL en el .env de la raíz
echo 'DATABASE_URL=postgresql://talentscore:talentscore@127.0.0.1:5432/talentscore' >> .env

# 3. Crear tablas y datos semilla
npm run db:migrate
```

Sin Docker: instalá PostgreSQL 14+, creá una base y apuntá `DATABASE_URL` a ella; luego `npm run db:migrate`.

## Scripts

| Archivo | Contenido |
|---|---|
| `001_candidates.sql` | Tablas `candidates`, `interview_notes`, `offers` + seed de los 3 candidatos de `candidates.ts` (Marcelo). |
| `002_talent.sql` | Tablas `talent_applications`, `talent_selection_reports`, `talent_export_events` (pipeline de Amin). |
| `migrate.mjs` | Aplica todos los `*.sql` en orden. |

## Qué es persistente y qué es demo

- **Persistente (Postgres):** postulaciones procesadas, perfiles extraídos, reportes, decisiones de aprobación y eventos de exportación.
- **Demo (código):** la bandeja de entrada simulada (`apps/web/src/lib/server/talent/demo-inbox.ts`). No hay Gmail ni parsing real de PDF; cada `sync` reinserta solo los mensajes que faltan (dedupe por `message_id`).

## Reset

```bash
docker compose -f db/docker-compose.yml down -v && docker compose -f db/docker-compose.yml up -d && npm run db:migrate
```
