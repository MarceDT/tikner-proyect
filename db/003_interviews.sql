-- TalentScore — propuestas y agendas de entrevista gobernadas por HITL.
-- El proveedor actual es local simulado: esta migración no conecta calendarios ni correo.

BEGIN;

ALTER TABLE talent_selection_reports
  ADD COLUMN IF NOT EXISTS interview_proposal_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS planned_interviews JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS talent_interview_proposals (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES talent_selection_reports(id) ON DELETE CASCADE,
  candidate_application_id TEXT NOT NULL REFERENCES talent_applications(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('pending_human_approval', 'scheduled', 'rejected', 'provider_error')),
  starts_at TIMESTAMPTZ NOT NULL,
  document JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talent_interviews (
  id TEXT PRIMARY KEY,
  proposal_id TEXT NOT NULL UNIQUE REFERENCES talent_interview_proposals(id) ON DELETE RESTRICT,
  report_id TEXT NOT NULL REFERENCES talent_selection_reports(id) ON DELETE CASCADE,
  candidate_application_id TEXT NOT NULL REFERENCES talent_applications(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'provider_error')),
  document JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS talent_interview_proposals_report_idx ON talent_interview_proposals(report_id);
CREATE INDEX IF NOT EXISTS talent_interviews_report_idx ON talent_interviews(report_id);
CREATE INDEX IF NOT EXISTS talent_interviews_starts_at_idx ON talent_interviews(starts_at);

COMMIT;
