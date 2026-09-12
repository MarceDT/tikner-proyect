/**
 * Ranking determinista, explicable y gobernado por evidencia del CV.
 * Un dato ausente queda `unknown`: su peso se excluye del total normalizado,
 * nunca se convierte artificialmente en un cero ni en una penalización.
 */
import type { Application, CandidateProfile, CandidateRanking, RankingCriterion, TargetRoleSnapshot } from "@/lib/talent-types";

export const RANKING_WEIGHTS = {
  requiredSkills: 45,
  relevantExperience: 25,
  architectureAndAgents: 15,
  leadershipAndCommunication: 10,
  budgetAlignment: 5,
} as const;

const SKILL_ALIASES: Record<string, string[]> = {
  "python / agents": ["python", "langgraph", "langchain", "agents", "openai api", "crewai", "autogen", "copilotkit"],
  "next.js": ["next.js", "nextjs", "next"],
  "distributed systems": ["distributed systems", "sistemas distribuidos", "kafka", "microservices", "microservicios"],
  "system design": ["system design", "diseño de sistemas", "arquitectura"],
};
const norm = (value: string) => value.trim().toLowerCase();
const profileIsMissing = (profile: CandidateProfile, field: string) => profile.missingFields.some((item) => norm(item).includes(norm(field)));
const quotesFor = (profile: CandidateProfile, field: string, max = 2) => profile.evidence.filter((e) => e.field === field).slice(0, max).map((e) => e.quote);

function hasSkill(profileSkills: string[], required: string): boolean {
  const wanted = SKILL_ALIASES[norm(required)] ?? [norm(required)];
  return profileSkills.some((skill) => wanted.some((alias) => norm(skill) === alias || norm(skill).includes(alias)));
}

function unknown(criterion: RankingCriterion["criterion"], weight: number, reasoning: string): RankingCriterion {
  return { criterion, weight, score: null, status: "unknown", reasoning, evidence: [] };
}

function scoreRequiredSkills(profile: CandidateProfile, target: TargetRoleSnapshot): RankingCriterion {
  if (profileIsMissing(profile, "skill") || !profile.skills.length) {
    return unknown("requiredSkills", RANKING_WEIGHTS.requiredSkills, "El CV no aporta una lista suficiente de habilidades; no se asume ausencia de skills.");
  }
  const matched = target.requiredSkills.filter((required) => hasSkill(profile.skills, required));
  const missing = target.requiredSkills.filter((required) => !matched.includes(required));
  return {
    criterion: "requiredSkills", weight: RANKING_WEIGHTS.requiredSkills,
    score: target.requiredSkills.length ? Math.round((matched.length / target.requiredSkills.length) * 100) : 0,
    status: "assessed",
    reasoning: `Cubre ${matched.length}/${target.requiredSkills.length} habilidades requeridas${matched.length ? ` (${matched.join(", ")})` : ""}${missing.length ? `. Sin evidencia de: ${missing.join(", ")}.` : "."}`,
    evidence: quotesFor(profile, "skills"),
  };
}

function scoreExperience(profile: CandidateProfile): RankingCriterion {
  if (profile.experienceYears === null || profileIsMissing(profile, "experience")) {
    return unknown("relevantExperience", RANKING_WEIGHTS.relevantExperience, "El CV no declara experiencia relevante verificable; queda como desconocida.");
  }
  return {
    criterion: "relevantExperience", weight: RANKING_WEIGHTS.relevantExperience,
    score: Math.min(100, Math.round((profile.experienceYears / 5) * 100)), status: "assessed",
    reasoning: `${profile.experienceYears} años de experiencia declarados (referencia para Lead: 5+).`, evidence: quotesFor(profile, "experienceYears"),
  };
}

function scoreArchitectureAndAgents(profile: CandidateProfile): RankingCriterion {
  if (profileIsMissing(profile, "architecture") || profileIsMissing(profile, "agent")) {
    return unknown("architectureAndAgents", RANKING_WEIGHTS.architectureAndAgents, "No hay evidencia suficiente sobre arquitectura o agentes; queda como desconocido.");
  }
  const signals = ["python / agents", "system design", "distributed systems"];
  const matched = signals.filter((signal) => hasSkill(profile.skills, signal));
  if (!matched.length) return { criterion: "architectureAndAgents", weight: RANKING_WEIGHTS.architectureAndAgents, score: 0, status: "assessed", reasoning: "El CV declara habilidades, pero no evidencia arquitectura distribuida ni agentes.", evidence: [] };
  return {
    criterion: "architectureAndAgents", weight: RANKING_WEIGHTS.architectureAndAgents,
    score: Math.round((matched.length / signals.length) * 100), status: "assessed",
    reasoning: `Evidencia ${matched.length}/${signals.length} señales de arquitectura/agentes: ${matched.join(", ")}.`,
    evidence: [...quotesFor(profile, "skills"), ...quotesFor(profile, "experience")].slice(0, 2),
  };
}

function scoreLeadership(profile: CandidateProfile): RankingCriterion {
  const highlights = profile.experience.flatMap((item) => item.highlights);
  if (profileIsMissing(profile, "leadership") || profileIsMissing(profile, "communication") || !highlights.length) {
    return unknown("leadershipAndCommunication", RANKING_WEIGHTS.leadershipAndCommunication, "No hay evidencia suficiente de liderazgo/comunicación; queda como desconocido.");
  }
  const text = highlights.join(" ").toLowerCase();
  const leadership = /lead|lider|mentor|manage|manager/.test(text);
  const communication = /communicat|comunic|stakeholder|present|cliente/.test(text);
  return {
    criterion: "leadershipAndCommunication", weight: RANKING_WEIGHTS.leadershipAndCommunication,
    score: (leadership ? 50 : 0) + (communication ? 50 : 0), status: "assessed",
    reasoning: `Evidencia de liderazgo: ${leadership ? "sí" : "no"}; comunicación: ${communication ? "sí" : "no"}.`, evidence: highlights.slice(0, 2),
  };
}

function scoreBudget(profile: CandidateProfile, target: TargetRoleSnapshot): RankingCriterion & { risk?: string; missing?: string } {
  const { amount, currency, raw } = profile.salaryExpectation;
  const base = { criterion: "budgetAlignment" as const, weight: RANKING_WEIGHTS.budgetAlignment, evidence: quotesFor(profile, "salaryExpectation") };
  if (amount === null || profileIsMissing(profile, "salary")) return { ...base, score: null, status: "unknown", reasoning: raw ? `Pretensión no numérica (${raw}); no se puede comparar.` : "El CV no declara pretensión salarial.", missing: "Pretensión salarial desconocida; no se puede verificar el ajuste presupuestario." };
  if (currency && currency.toUpperCase() !== target.currency.toUpperCase()) return { ...base, score: null, status: "unknown", reasoning: `Pretensión en ${currency}; el presupuesto está en ${target.currency}. No se convierte automáticamente.`, missing: `Moneda distinta al presupuesto (${currency} vs ${target.currency}).` };
  if (amount <= target.budgetMaxSalary) return { ...base, score: 100, status: "assessed", reasoning: `Dentro del presupuesto: ${target.currency} ${amount.toLocaleString("en-US")} vs tope ${target.budgetMaxSalary.toLocaleString("en-US")}.` };
  const excess = amount - target.budgetMaxSalary;
  return {
    ...base, score: Math.max(0, Math.round(100 - ((excess / target.budgetMaxSalary) / 0.4) * 100)), status: "assessed",
    reasoning: `Excede el presupuesto en ${target.currency} ${excess.toLocaleString("en-US")} (${amount.toLocaleString("en-US")} vs tope ${target.budgetMaxSalary.toLocaleString("en-US")}).`,
    risk: `Pretensión ${target.currency} ${Math.round(excess / 1000)}k por encima del presupuesto (${amount.toLocaleString("en-US")} vs ${target.budgetMaxSalary.toLocaleString("en-US")}).`,
  };
}

export function rankApplication(application: Application, target: TargetRoleSnapshot): CandidateRanking | null {
  const profile = application.profile;
  if (!profile) return null;
  const skills = scoreRequiredSkills(profile, target);
  const experience = scoreExperience(profile);
  const architecture = scoreArchitectureAndAgents(profile);
  const leadership = scoreLeadership(profile);
  const { risk: budgetRisk, missing: budgetMissing, ...budget } = scoreBudget(profile, target);
  const breakdown = [skills, experience, architecture, leadership, budget];
  const evaluated = breakdown.filter((item) => item.status === "assessed");
  const evaluatedWeight = evaluated.reduce((sum, item) => sum + item.weight, 0);
  const score = evaluatedWeight ? Math.round(evaluated.reduce((sum, item) => sum + (item.score ?? 0) * item.weight, 0) / evaluatedWeight) : 0;
  const missingData = [
    ...breakdown.filter((item) => item.status === "unknown").map((item) => item.reasoning),
    ...(budgetMissing ? [budgetMissing] : []),
    ...profile.missingFields.map((field) => `Campo sin dato en el CV: ${field}.`),
  ];
  const risks: string[] = [];
  if (budgetRisk) risks.push(budgetRisk);
  const missingSkills = target.requiredSkills.filter((required) => !hasSkill(profile.skills, required));
  if (skills.status === "assessed" && missingSkills.length >= 2) risks.push(`Sin evidencia de: ${missingSkills.join(", ")}.`);
  if (profile.confidence.overall < 0.6) risks.push("Extracción de baja confianza: revisar el CV original.");
  return { applicationId: application.id, candidateName: profile.name ?? application.email.from, rank: 0, score, evaluatedWeight, unknownWeight: 100 - evaluatedWeight, breakdown, risks, missingData: [...new Set(missingData)] };
}

export function rankApplications(applications: Application[], target: TargetRoleSnapshot): CandidateRanking[] {
  return applications.map((application) => rankApplication(application, target)).filter((ranking): ranking is CandidateRanking => ranking !== null).sort((left, right) => right.score - left.score || left.candidateName.localeCompare(right.candidateName)).map((ranking, index) => ({ ...ranking, rank: index + 1 }));
}
