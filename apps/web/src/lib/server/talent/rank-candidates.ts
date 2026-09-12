/**
 * Ranking determinista y explicable sobre perfiles extraídos.
 *
 * El LLM no puntúa: cada criterio devuelve score, razonamiento y evidencia. Un dato ausente
 * puntúa 0 en su criterio y se registra en `missingData`/`risks` — nunca se estima.
 */
import type {
  Application,
  CandidateProfile,
  CandidateRanking,
  RankingCriterion,
  TargetRoleSnapshot,
} from "@/lib/talent-types";

export const RANKING_WEIGHTS = { skills: 40, experience: 25, budget: 25, completeness: 10 } as const;

/** Un requisito puede escribirse de varias formas en un CV. */
const SKILL_ALIASES: Record<string, string[]> = {
  "python / agents": ["python", "langgraph", "langchain", "agents", "openai api", "crewai", "autogen"],
  "next.js": ["next.js", "nextjs", "next"],
  "distributed systems": ["distributed systems", "sistemas distribuidos", "kafka", "microservices", "microservicios"],
  "system design": ["system design", "diseño de sistemas", "arquitectura"],
};

const norm = (s: string) => s.trim().toLowerCase();

function hasSkill(profileSkills: string[], required: string): boolean {
  const wanted = SKILL_ALIASES[norm(required)] ?? [norm(required)];
  return profileSkills.some((s) => wanted.some((w) => norm(s) === w || norm(s).includes(w)));
}

function quotesFor(profile: CandidateProfile, field: string, max = 2): string[] {
  return profile.evidence.filter((e) => e.field === field).slice(0, max).map((e) => e.quote);
}

function scoreSkills(profile: CandidateProfile, target: TargetRoleSnapshot): RankingCriterion {
  const matched = target.requiredSkills.filter((r) => hasSkill(profile.skills, r));
  const missing = target.requiredSkills.filter((r) => !matched.includes(r));
  const score = target.requiredSkills.length ? Math.round((matched.length / target.requiredSkills.length) * 100) : 0;
  return {
    criterion: "skills",
    weight: RANKING_WEIGHTS.skills,
    score,
    reasoning: `Cubre ${matched.length}/${target.requiredSkills.length} skills requeridas` +
      (matched.length ? ` (${matched.join(", ")})` : "") +
      (missing.length ? `. Faltan: ${missing.join(", ")}.` : "."),
    evidence: quotesFor(profile, "skills"),
  };
}

function scoreExperience(profile: CandidateProfile): RankingCriterion {
  const years = profile.experienceYears;
  if (years === null) {
    return {
      criterion: "experience",
      weight: RANKING_WEIGHTS.experience,
      score: 0,
      reasoning: "El CV no declara años de experiencia; no se estima.",
      evidence: [],
    };
  }
  const score = Math.min(100, Math.round((years / 5) * 100));
  return {
    criterion: "experience",
    weight: RANKING_WEIGHTS.experience,
    score,
    reasoning: `${years} años de experiencia declarados (referencia para Lead: 5+).`,
    evidence: quotesFor(profile, "experienceYears"),
  };
}

function scoreBudget(profile: CandidateProfile, target: TargetRoleSnapshot): RankingCriterion & { risk?: string; missing?: string } {
  const { amount, currency, raw } = profile.salaryExpectation;
  const base = { criterion: "budget" as const, weight: RANKING_WEIGHTS.budget, evidence: quotesFor(profile, "salaryExpectation") };
  if (amount === null) {
    return {
      ...base,
      score: 0,
      reasoning: raw ? `Pretensión no numérica ("${raw}"); no se puede comparar con el presupuesto.` : "El CV no declara pretensión salarial.",
      missing: "Pretensión salarial no declarada o no numérica.",
      risk: "Sin pretensión salarial: el ajuste presupuestario no se puede verificar.",
    };
  }
  if (currency && currency.toUpperCase() !== target.currency.toUpperCase()) {
    return {
      ...base,
      score: 0,
      reasoning: `Pretensión en ${currency}; el presupuesto está en ${target.currency}. No se convierte automáticamente.`,
      risk: `Moneda distinta al presupuesto (${currency} vs ${target.currency}).`,
    };
  }
  if (amount <= target.budgetMaxSalary) {
    const margin = target.budgetMaxSalary - amount;
    return {
      ...base,
      score: 100,
      reasoning: `Dentro del presupuesto: ${target.currency} ${amount.toLocaleString("en-US")} vs tope ${target.budgetMaxSalary.toLocaleString("en-US")} (margen ${margin.toLocaleString("en-US")}).`,
    };
  }
  const excess = amount - target.budgetMaxSalary;
  const excessRatio = excess / target.budgetMaxSalary; // 0 en tope, 0.4 ⇒ 0 puntos
  const score = Math.max(0, Math.round(100 - (excessRatio / 0.4) * 100));
  const excessK = Math.round(excess / 1000);
  return {
    ...base,
    score,
    reasoning: `Excede el presupuesto en ${target.currency} ${excess.toLocaleString("en-US")} (${amount.toLocaleString("en-US")} vs tope ${target.budgetMaxSalary.toLocaleString("en-US")}).`,
    risk: `Pretensión ${target.currency} ${excessK}k por encima del presupuesto (${amount.toLocaleString("en-US")} vs ${target.budgetMaxSalary.toLocaleString("en-US")}).`,
  };
}

function scoreCompleteness(profile: CandidateProfile): RankingCriterion {
  const missing = profile.missingFields.length;
  const score = Math.max(0, Math.round(profile.confidence.overall * 100 - missing * 10));
  return {
    criterion: "completeness",
    weight: RANKING_WEIGHTS.completeness,
    score,
    reasoning: `Confianza de extracción ${(profile.confidence.overall * 100).toFixed(0)}%` +
      (missing ? `; ${missing} campo(s) sin dato: ${profile.missingFields.join(", ")}.` : "; perfil completo."),
    evidence: [],
  };
}

export function rankApplication(application: Application, target: TargetRoleSnapshot): CandidateRanking | null {
  const profile = application.profile;
  if (!profile) return null;
  const skills = scoreSkills(profile, target);
  const experience = scoreExperience(profile);
  const { risk: budgetRisk, missing: budgetMissing, ...budget } = scoreBudget(profile, target);
  const completeness = scoreCompleteness(profile);
  const breakdown = [skills, experience, budget, completeness];
  const score = Math.round(breakdown.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0));

  const risks: string[] = [];
  const missingData: string[] = [];
  if (budgetRisk) risks.push(budgetRisk);
  if (budgetMissing) missingData.push(budgetMissing);
  if (profile.experienceYears === null) missingData.push("Años de experiencia no declarados.");
  const missingSkills = target.requiredSkills.filter((r) => !hasSkill(profile.skills, r));
  if (missingSkills.length >= 2) risks.push(`Sin evidencia de: ${missingSkills.join(", ")}.`);
  for (const f of profile.missingFields) {
    if (f !== "salaryExpectation" && f !== "experienceYears") missingData.push(`Campo sin dato en el CV: ${f}.`);
  }
  if (profile.confidence.overall < 0.6) risks.push("Extracción de baja confianza: revisar el CV original.");

  return {
    applicationId: application.id,
    candidateName: profile.name ?? application.email.from,
    rank: 0,
    score,
    breakdown,
    risks,
    missingData,
  };
}

export function rankApplications(applications: Application[], target: TargetRoleSnapshot): CandidateRanking[] {
  return applications
    .map((a) => rankApplication(a, target))
    .filter((r): r is CandidateRanking => r !== null)
    .sort((a, b) => b.score - a.score || a.candidateName.localeCompare(b.candidateName))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
