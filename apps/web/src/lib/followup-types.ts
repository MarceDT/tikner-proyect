export type WorkplaceTask = {
  id: string;
  title: string;
  description: string;
  url: string | null;
};
export type JobOfferDetails = {
  candidateId: string;
  candidateName: string;
  role: string;
  proposedSalary: number;
  salaryCurrency: string;
  budgetMaxSalary: number;
  equity: string;
  startDate: string;
  notes?: string;
};
export type Proposal = {
  id: string;
  incidentId: string;
  title: string;
  description: string;
  workspaceId: string;
  identityName: string;
  expiresAt: number;
  candidateId?: string;
  offerDetails?: JobOfferDetails;
};
export type WorkplaceStatus =
  | { status: "unconfigured"; message: string }
  | {
      status: "connected";
      workspaceId: string;
      identityName: string;
      tasks: WorkplaceTask[];
    };

export function formatOfferDescription(offer: JobOfferDetails): string {
  const diff = offer.budgetMaxSalary - offer.proposedSalary;
  const budget = offer.budgetMaxSalary > 0 ? offer.budgetMaxSalary : 1;
  const variancePct = ((Math.abs(diff) / budget) * 100).toFixed(1);
  const variance =
    diff >= 0
      ? `+$${diff.toLocaleString("en-US")} USD (${variancePct}% bajo presupuesto)`
      : `-$${Math.abs(diff).toLocaleString("en-US")} USD (${variancePct}% SOBRE PRESUPUESTO)`;

  return [
    `=== OFERTA FORMAL DE EMPLEO — TALENTSCORE ===`,
    `Candidato: ${offer.candidateName} (${offer.candidateId})`,
    `Puesto: ${offer.role}`,
    `Salario Propuesto: $${offer.proposedSalary.toLocaleString("en-US")} ${offer.salaryCurrency}/año`,
    `Presupuesto Máximo: $${offer.budgetMaxSalary.toLocaleString("en-US")} ${offer.salaryCurrency}/año`,
    `Evaluación Presupuestaria: ${variance}`,
    `Equity: ${offer.equity}`,
    `Fecha Tentativa de Incorporación: ${offer.startDate}`,
    offer.notes ? `Observaciones: ${offer.notes}` : "",
    `--- HITL SECURITY POLICY ---`,
    `Esta propuesta fue estructurada por el agente TalentScore. Requiere aprobación manual explícita del Lead de Recruiting antes de emitirse legalmente.`,
    `--- METADATA ---`,
    JSON.stringify(offer),
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseOfferDescription(
  description?: string,
): JobOfferDetails | null {
  if (!description) return null;

  // 1. Extract from METADATA section (handles CRLF and LF)
  const markerIdx = description.indexOf("--- METADATA ---");
  if (markerIdx !== -1) {
    try {
      const remainder = description
        .slice(markerIdx + "--- METADATA ---".length)
        .trim();
      const firstLine = remainder.split(/\r?\n/)[0].trim();
      const parsed = JSON.parse(firstLine);
      if (
        parsed &&
        typeof parsed === "object" &&
        "candidateName" in parsed &&
        "proposedSalary" in parsed
      ) {
        return parsed as JobOfferDetails;
      }
    } catch {
      // fallback
    }
  }

  // 2. Direct JSON payload
  try {
    const parsed = JSON.parse(description);
    if (
      parsed &&
      typeof parsed === "object" &&
      "candidateName" in parsed &&
      "proposedSalary" in parsed
    ) {
      return parsed as JobOfferDetails;
    }
  } catch {
    // fallback
  }

  // 3. Resilient text extraction for LLM responses without metadata block
  const candidateMatch = description.match(
    /Candidato:\s*([^\n\r(]+)(?:\s*\(([^)]+)\))?/i,
  );
  const salaryMatch = description.match(/Salario Propuesto:\s*\$?([0-9,]+)/i);
  const roleMatch = description.match(/Puesto:\s*([^\n\r]+)/i);
  const budgetMatch = description.match(
    /Presupuesto M[áa]ximo:\s*\$?([0-9,]+)/i,
  );
  const equityMatch = description.match(/Equity:\s*([^\n\r]+)/i);
  const dateMatch = description.match(
    /Fecha Tentativa de Incorporaci[óo]n:\s*([^\n\r]+)/i,
  );

  if (candidateMatch && salaryMatch) {
    const cleanSalary = Number(salaryMatch[1].replace(/,/g, ""));
    const cleanBudget = budgetMatch
      ? Number(budgetMatch[1].replace(/,/g, ""))
      : 95000;
    return {
      candidateId: candidateMatch[2]?.trim() || "CAND-101",
      candidateName: candidateMatch[1].trim(),
      role: roleMatch ? roleMatch[1].trim() : "Lead Fullstack & AI Systems Engineer",
      proposedSalary: cleanSalary,
      salaryCurrency: "USD",
      budgetMaxSalary: cleanBudget,
      equity: equityMatch ? equityMatch[1].trim() : "0.25%",
      startDate: dateMatch ? dateMatch[1].trim() : "2026-10-01",
    };
  }

  return null;
}


