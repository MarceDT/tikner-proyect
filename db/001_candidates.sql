-- TalentScore / inker — PostgreSQL schema and local seed data.
-- Apply later with: npm run db:migrate   (o: psql "$DATABASE_URL" -f db/001_candidates.sql)

BEGIN;

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  current_title TEXT NOT NULL,
  applied_role TEXT NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  salary_expectation TEXT NOT NULL,
  salary_number INTEGER NOT NULL CHECK (salary_number > 0),
  location TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (
    status IN ('Review', 'Interviewing', 'Finalist', 'Offer Extended', 'Hired', 'Rejected')
  ),
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  ratings JSONB NOT NULL DEFAULT '{}'::jsonb,
  pros JSONB NOT NULL DEFAULT '[]'::jsonb,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  round TEXT NOT NULL,
  interviewer TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('Strong Yes', 'Yes', 'Neutral', 'No')),
  interview_date DATE NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  role TEXT NOT NULL,
  proposed_salary INTEGER NOT NULL CHECK (proposed_salary > 0),
  salary_currency CHAR(3) NOT NULL DEFAULT 'USD',
  budget_max_salary INTEGER NOT NULL CHECK (budget_max_salary > 0),
  equity TEXT NOT NULL,
  start_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT
);

CREATE INDEX IF NOT EXISTS interview_notes_candidate_id_idx ON interview_notes(candidate_id);
CREATE INDEX IF NOT EXISTS offers_candidate_id_idx ON offers(candidate_id);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);

INSERT INTO candidates (
  id, name, current_title, applied_role, experience_years, salary_expectation,
  salary_number, location, status, headline, summary, skills, ratings, pros, red_flags
) VALUES
  (
    'CAND-101', 'Sofía Albarracín', 'Senior Fullstack Architect',
    'Lead Fullstack & AI Systems Engineer', 7, '$92,000 / año', 92000,
    'Remoto (LatAm / UTC-3)', 'Finalist',
    'Especialista en escalabilidad de plataformas web y orquestación de agentes con TypeScript.',
    '7 años liderando squads técnicos en startups de alto crecimiento.',
    '["TypeScript", "Next.js", "Python", "CopilotKit", "PostgreSQL", "Docker", "System Design"]'::jsonb,
    '{"systemDesign": 9, "coding": 9, "architecture": 9, "leadership": 8, "communication": 9}'::jsonb,
    '["Dentro del presupuesto", "Experiencia en Next.js y agentes", "Strong Yes técnico y cultural"]'::jsonb,
    '["Experiencia limitada en Kubernetes bare-metal"]'::jsonb
  ),
  (
    'CAND-102', 'Lucas Varela', 'Principal Systems Engineer',
    'Lead Fullstack & AI Systems Engineer', 11, '$125,000 / año', 125000,
    'Buenos Aires, Argentina (Híbrido)', 'Interviewing',
    'Ingeniero veterano en sistemas de baja latencia y bases de datos distribuidas.',
    'Más de una década de experiencia técnica sólida en infraestructura compleja.',
    '["Go", "Rust", "TypeScript", "PostgreSQL", "Kafka", "Kubernetes", "C++"]'::jsonb,
    '{"systemDesign": 10, "coding": 9, "architecture": 10, "leadership": 6, "communication": 5}'::jsonb,
    '["Técnica sobresaliente", "Experiencia en sistemas de millones de RPS"]'::jsonb,
    '["Pretensión $30k sobre presupuesto", "Riesgo de colaboración ágil"]'::jsonb
  ),
  (
    'CAND-103', 'Elena Rostova', 'Senior Frontend & Creative Technologist',
    'Lead Fullstack & AI Systems Engineer', 5, '$80,000 / año', 80000,
    'Remoto (España / UTC+2)', 'Review',
    'Desarrolladora creativa especializada en interfaces de IA generativa.',
    '5 años construyendo productos digitales y prototipos de IA.',
    '["React", "Next.js", "Three.js", "Tailwind CSS", "Design Systems", "Python"]'::jsonb,
    '{"systemDesign": 7, "coding": 8, "architecture": 7, "leadership": 7, "communication": 10}'::jsonb,
    '["Excelente costo-beneficio", "Comunicación brillante"]'::jsonb,
    '["Menor experiencia en backend distribuido"]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  current_title = EXCLUDED.current_title,
  experience_years = EXCLUDED.experience_years,
  salary_expectation = EXCLUDED.salary_expectation,
  salary_number = EXCLUDED.salary_number,
  location = EXCLUDED.location,
  status = EXCLUDED.status,
  headline = EXCLUDED.headline,
  summary = EXCLUDED.summary,
  skills = EXCLUDED.skills,
  ratings = EXCLUDED.ratings,
  pros = EXCLUDED.pros,
  red_flags = EXCLUDED.red_flags,
  updated_at = NOW();

COMMIT;
