-- TalentScore — pipeline de talento (postulaciones, reportes de selección, exportaciones).
-- Aplicar con: npm run db:migrate   (o: psql "$DATABASE_URL" -f db/002_talent.sql)
-- Los documentos (perfil, rankings, aprobación) viven en JSONB; ver apps/web/src/lib/talent-types.ts.

BEGIN;

CREATE TABLE IF NOT EXISTS talent_applications (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('demo-inbox')),
  message_id TEXT NOT NULL UNIQUE,            -- dedupe de la bandeja
  email_from TEXT NOT NULL,
  email_subject TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  attachment_name TEXT,
  raw_cv_text TEXT NOT NULL,
  profile JSONB,                              -- CandidateProfile | null
  status TEXT NOT NULL CHECK (status IN ('received', 'extracted', 'failed')),
  extraction_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talent_selection_reports (
  id TEXT PRIMARY KEY,
  role_title TEXT NOT NULL,
  target_role JSONB NOT NULL,                 -- TargetRoleSnapshot
  top_n INTEGER NOT NULL CHECK (top_n BETWEEN 1 AND 10),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by TEXT NOT NULL,
  rankings JSONB NOT NULL,                    -- CandidateRanking[]
  shortlist_application_ids JSONB NOT NULL,   -- string[]
  approval JSONB NOT NULL,                    -- ReportApproval
  approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE IF NOT EXISTS talent_export_events (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES talent_selection_reports(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'docx', 'xlsx')),
  file_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  requested_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS talent_applications_status_idx ON talent_applications(status);
CREATE INDEX IF NOT EXISTS talent_selection_reports_status_idx ON talent_selection_reports(approval_status);
CREATE INDEX IF NOT EXISTS talent_export_events_report_idx ON talent_export_events(report_id);

COMMIT;
