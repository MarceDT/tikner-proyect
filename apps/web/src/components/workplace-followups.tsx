"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { WorkplaceControls } from "@/lib/use-workplace";
import {
  type JobOfferDetails,
  formatOfferDescription,
  parseOfferDescription,
} from "@/lib/followup-types";
import {
  getOrFirstCandidate,
  approveCandidateOffer,
  rejectCandidateOffer,
  getOfferForCandidate,
  saveOfferDraft,
  TARGET_ROLE,
  type CandidateOffer,
} from "@/lib/candidates";

export interface WorkplaceFollowupsProps {
  incidentId?: string;
  candidateId?: string;
  workplace: WorkplaceControls;
}

export function WorkplaceFollowups({
  incidentId,
  candidateId,
  workplace,
}: WorkplaceFollowupsProps) {
  const activeId = candidateId ?? incidentId ?? "CAND-101";
  const candidate = getOrFirstCandidate(activeId);

  const [role, setRole] = useState(candidate.appliedRole || TARGET_ROLE.title);
  const [salary, setSalary] = useState(candidate.salaryNumber);
  const [equity, setEquity] = useState("0.25% (4 años vesting, 1 año cliff)");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [notes, setNotes] = useState(
    candidate.headline || "Propuesta formal según desempeño en rondas de entrevistas.",
  );
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [localProposal, setLocalProposal] = useState<JobOfferDetails | null>(null);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<CandidateOffer | undefined>(
    () => getOfferForCandidate(candidate.id),
  );

  const { status, proposal, busy, notice } = workplace;
  const tasks = status?.status === "connected" ? status.tasks : [];

  // Update form inputs when selected candidate changes
  useEffect(() => {
    setRole(candidate.appliedRole || TARGET_ROLE.title);
    setSalary(candidate.salaryNumber);
    setNotes(candidate.headline || "Propuesta formal según rondas técnicas.");
    setIsAdjusting(false);
    setLocalProposal(null);
    setError("");
    const existing = getOfferForCandidate(candidate.id);
    setCurrentOffer(existing);
    if (existing?.status === "approved") {
      setSuccessNotice(
        `Oferta formal aprobada previamente para ${candidate.name} ($${existing.proposedSalary.toLocaleString()} ${existing.salaryCurrency}/año).`,
      );
    } else {
      setSuccessNotice("");
    }
  }, [candidate.id, candidate.appliedRole, candidate.salaryNumber, candidate.headline, candidate.name]);

  // Derive active proposal from workplace.proposal (via agent) or local recruiter draft
  const agentOffer = proposal ? parseOfferDescription(proposal.description) : null;
  const proposalMatchesCandidate = Boolean(
    proposal &&
      (proposal.candidateId === candidate.id ||
        proposal.incidentId === candidate.id ||
        (agentOffer && agentOffer.candidateId === candidate.id)),
  );
  const relevantProposal = proposalMatchesCandidate ? proposal : null;
  const relevantAgentOffer = proposalMatchesCandidate ? agentOffer : null;

  const activeProposal: JobOfferDetails | null =
    relevantAgentOffer ??
    localProposal ??
    (relevantProposal
      ? {
          candidateId: candidate.id,
          candidateName: candidate.name,
          role: relevantProposal.title || TARGET_ROLE.title,
          proposedSalary: salary,
          salaryCurrency: TARGET_ROLE.currency,
          budgetMaxSalary: TARGET_ROLE.budgetMaxSalary,
          equity,
          startDate,
          notes: relevantProposal.description,
        }
      : null);

  // Propose an offer to the Human-in-the-Loop approval gate
  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPreparing(true);
    setError("");
    setSuccessNotice("");

    const parsedSalary = Number(salary);
    if (isNaN(parsedSalary) || parsedSalary <= 0) {
      setError("El salario propuesto debe ser un número positivo mayor a 0 USD.");
      setPreparing(false);
      return;
    }
    if (!role.trim()) {
      setError("El puesto ofertado no puede estar vacío.");
      setPreparing(false);
      return;
    }
    if (!startDate.trim()) {
      setError("La fecha tentativa de inicio es obligatoria.");
      setPreparing(false);
      return;
    }

    const draft: JobOfferDetails = {
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: role.trim(),
      proposedSalary: parsedSalary,
      salaryCurrency: TARGET_ROLE.currency,
      budgetMaxSalary: TARGET_ROLE.budgetMaxSalary,
      equity: equity.trim() || "0.25%",
      startDate: startDate.trim(),
      notes: notes.trim(),
    };

    const offerRecord: CandidateOffer = {
      id: `OFFER-${candidate.id}-${Date.now()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      role: draft.role,
      proposedSalary: draft.proposedSalary,
      salaryCurrency: draft.salaryCurrency,
      budgetMaxSalary: draft.budgetMaxSalary,
      equity: draft.equity,
      startDate: draft.startDate,
      notes: draft.notes,
      status: "pending_approval",
      createdAt: new Date().toISOString(),
    };

    try {
      // Target ID for backend Ambiguous sync: use incidentId if provided (for incident-backed session), otherwise candidate.id
      const syncIncidentId = incidentId ?? candidate.id;
      if (status?.status === "connected") {
        const { title, details } = {
          title: `Oferta: ${draft.candidateName} — ${draft.role}`,
          details: formatOfferDescription(draft),
        };
        await workplace.propose({ incidentId: syncIncidentId, title, details });
      }
      saveOfferDraft(offerRecord);
      setLocalProposal(draft);
      setIsAdjusting(false);
    } catch {
      // In local demo without Ambiguous credentials or when sync fails, still allow HITL local flow
      saveOfferDraft(offerRecord);
      setLocalProposal(draft);
      setIsAdjusting(false);
    } finally {
      setPreparing(false);
    }
  }

  // Action: "Aprobar y Emitir Oferta Formal"
  async function handleApprove() {
    if (!activeProposal || busy) return;
    if (isNaN(activeProposal.proposedSalary) || activeProposal.proposedSalary <= 0) {
      setError("El salario de la propuesta no es válido.");
      return;
    }
    setError("");

    try {
      // 1. Commit domain approval in candidates.ts
      const approved = approveCandidateOffer(
        candidate.id,
        {
          role: activeProposal.role,
          proposedSalary: activeProposal.proposedSalary,
          salaryCurrency: activeProposal.salaryCurrency,
          budgetMaxSalary: activeProposal.budgetMaxSalary,
          equity: activeProposal.equity,
          startDate: activeProposal.startDate,
          notes: activeProposal.notes,
        },
        "Recruiting Lead (Marcelo)",
      );

      // 2. If workplace has an active proposal, commit it through workplace API
      if (proposal && proposalMatchesCandidate) {
        await workplace.approve();
      }

      setCurrentOffer(approved);
      setLocalProposal(null);
      setIsAdjusting(false);
      setSuccessNotice(
        `✅ Oferta formal aprobada y emitida a ${approved.candidateName} (${approved.role}) por $${approved.proposedSalary.toLocaleString()} ${approved.salaryCurrency}/año. Estado actualizado a 'Offer Extended'.`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo emitir la oferta formal.",
      );
    }
  }

  // Action: "Rechazar / Ajustar"
  async function handleRejectOrAdjust() {
    if (busy) return;
    setError("");

    try {
      if (proposal && proposalMatchesCandidate) {
        await workplace.deny();
      }
      const rejected = rejectCandidateOffer(
        candidate.id,
        "Ajuste de términos requerido por el Reclutador",
      );
      if (rejected) {
        setCurrentOffer(rejected);
      }
      setLocalProposal(null);
      setIsAdjusting(true);
      setSuccessNotice(
        "Propuesta cancelada / devuelta para ajustes. No se emitió ninguna oferta sin tu aprobación.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cancelar la propuesta.",
      );
    }
  }

  async function refresh() {
    setError("");
    try {
      await workplace.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron refrescar los datos desde el servidor.",
      );
    }
  }

  // Budget calculations & validations
  const comparisonSalary = activeProposal ? activeProposal.proposedSalary : Number(salary);
  const isValidSalary = !isNaN(comparisonSalary) && comparisonSalary > 0;
  const salaryDiff = isValidSalary ? TARGET_ROLE.budgetMaxSalary - comparisonSalary : 0;
  const isWithinBudget = isValidSalary && salaryDiff >= 0;
  const variancePct =
    isValidSalary && TARGET_ROLE.budgetMaxSalary > 0
      ? ((Math.abs(salaryDiff) / TARGET_ROLE.budgetMaxSalary) * 100).toFixed(1)
      : "0.0";

  return (
    <section className="ck-followups" aria-labelledby="offer-section-title">
      <header className="ck-followups-header">
        <div>
          <h2 id="offer-section-title">Aprobación de Oferta Laboral</h2>
          <p className="ck-local-note">
            Human-in-the-Loop: El agente analiza y propone; el reclutador humano
            aprueba y emite formalmente.
          </p>
        </div>
        <span
          className="ck-tag"
          style={{
            background: !isValidSalary ? "#fef2f2" : isWithinBudget ? "#ecfdf5" : "#fef2f2",
            borderColor: !isValidSalary ? "#fecaca" : isWithinBudget ? "#a7f3d0" : "#fecaca",
            color: !isValidSalary ? "#991b1b" : isWithinBudget ? "#065f46" : "#991b1b",
          }}
        >
          {!isValidSalary ? "⚠️ Salario Inválido" : isWithinBudget ? "Presupuesto OK" : "⚠️ Sobre Presupuesto"}
        </span>
      </header>

      {/* Human-in-the-Loop Gate: Proposed Offer Review Card */}
      {activeProposal && (
        <section
          className="ck-approval"
          aria-label="Revisión de Oferta Formal"
          style={{
            borderColor: isWithinBudget ? "#10b981" : "#f59e0b",
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span>🛡️</span>
              <span>Revisión de Oferta Formal (Puerta HITL)</span>
            </h3>
            <span
              className="ck-tag"
              style={{
                background: "#f0fdf4",
                borderColor: "#bbf7d0",
                color: "#166534",
                fontSize: "11px",
              }}
            >
              Aprobación Requerida
            </span>
          </div>

          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: 14 }}>
            Revisa los términos económicos antes de formalizar la contratación de{" "}
            <strong>{activeProposal.candidateName}</strong>. Ninguna oferta será enviada sin tu consentimiento explícito.
          </p>

          <div
            style={{
              background: "#f9fafb",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 14,
              marginBottom: 14,
            }}
          >
            {/* Candidate summary */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingBottom: 12,
                marginBottom: 12,
                borderBottom: "1px solid var(--border)",
              }}
            >
              <img
                src={candidate.avatar}
                alt={activeProposal.candidateName}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <strong style={{ fontSize: "14px", display: "block" }}>
                  {activeProposal.candidateName}
                </strong>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {activeProposal.role} · {candidate.location}
                </span>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <span className="ck-tag">{candidate.status}</span>
              </div>
            </div>

            {/* Compensation breakdown vs Budget */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Salario Propuesto
                </div>
                <div style={{ fontSize: "18px", fontWeight: 700, marginTop: 2 }}>
                  ${activeProposal.proposedSalary.toLocaleString()}{" "}
                  <span style={{ fontSize: "11px", fontWeight: 400 }}>
                    {activeProposal.salaryCurrency}/año
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Presupuesto Tope
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    marginTop: 2,
                    color: "var(--muted)",
                  }}
                >
                  ${activeProposal.budgetMaxSalary.toLocaleString()}{" "}
                  <span style={{ fontSize: "11px", fontWeight: 400 }}>
                    {activeProposal.salaryCurrency}/año
                  </span>
                </div>
              </div>
            </div>

            {/* Budget status banner */}
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 6,
                fontSize: "12px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background:
                  activeProposal.proposedSalary <= activeProposal.budgetMaxSalary
                    ? "#ecfdf5"
                    : "#fff1f2",
                color:
                  activeProposal.proposedSalary <= activeProposal.budgetMaxSalary
                    ? "#065f46"
                    : "#9f1239",
                border: `1px solid ${
                  activeProposal.proposedSalary <= activeProposal.budgetMaxSalary
                    ? "#a7f3d0"
                    : "#fecdd3"
                }`,
              }}
            >
              <span>{activeProposal.proposedSalary <= activeProposal.budgetMaxSalary ? "✓" : "⚠️"}</span>
              <span>
                {activeProposal.proposedSalary <= activeProposal.budgetMaxSalary
                  ? `Dentro del presupuesto: Margen de $${(
                      activeProposal.budgetMaxSalary - activeProposal.proposedSalary
                    ).toLocaleString()} USD (+${(
                      ((activeProposal.budgetMaxSalary - activeProposal.proposedSalary) /
                        activeProposal.budgetMaxSalary) *
                      100
                    ).toFixed(1)}% margen disponible).`
                  : `Excede el presupuesto en $${(
                      activeProposal.proposedSalary - activeProposal.budgetMaxSalary
                    ).toLocaleString()} USD (+${(
                      ((activeProposal.proposedSalary - activeProposal.budgetMaxSalary) /
                        activeProposal.budgetMaxSalary) *
                      100
                    ).toFixed(1)}% sobre el tope). Requiere excepción del Director de Finanzas.`}
              </span>
            </div>

            {/* Equity and Start Date */}
            <dl className="ck-facts" style={{ margin: "0 0 10px" }}>
              <div>
                <dt>Equity / Participación</dt>
                <dd style={{ fontWeight: 500 }}>{activeProposal.equity}</dd>
              </div>
              <div>
                <dt>Fecha de Incorporación</dt>
                <dd style={{ fontWeight: 500 }}>{activeProposal.startDate}</dd>
              </div>
            </dl>

            {activeProposal.notes && (
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--muted)",
                  background: "#fff",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid var(--border)",
                }}
              >
                <strong>Observaciones:</strong> {activeProposal.notes}
              </div>
            )}
          </div>

          <p className="ck-local-note" style={{ margin: "0 0 14px" }}>
            🔒 <strong>Seguridad HITL:</strong> Al presionar &quot;Aprobar y Emitir Oferta Formal&quot;, el candidato pasa inmediatamente a estado <code>Offer Extended</code> con firma y registro auditable.
          </p>

          <div className="ck-approval-actions">
            <button
              type="button"
              className="ck-btn ck-btn--primary"
              disabled={busy || preparing}
              onClick={handleApprove}
            >
              {busy ? "Emitiendo oferta…" : "✓ Aprobar y Emitir Oferta Formal"}
            </button>
            <button
              type="button"
              className="ck-btn"
              disabled={busy || preparing}
              onClick={handleRejectOrAdjust}
              style={{ borderColor: "#ef4444", color: "#b91c1c" }}
            >
              ✕ Rechazar / Ajustar
            </button>
          </div>
        </section>
      )}

      {/* Active approved offer display */}
      {!activeProposal && currentOffer?.status === "approved" && !isAdjusting && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 8,
            padding: 14,
            margin: "14px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <strong style={{ color: "#166534", fontSize: "14px" }}>
              🎉 Oferta Formal Vigente Extendida
            </strong>
            <span
              className="ck-tag"
              style={{ background: "#dcfce7", borderColor: "#86efac", color: "#166534" }}
            >
              Offer Extended
            </span>
          </div>
          <p style={{ fontSize: "13px", margin: "0 0 10px", color: "#14532d" }}>
            Se ha formalizado la oferta a <strong>{candidate.name}</strong> por{" "}
            <strong>${currentOffer.proposedSalary.toLocaleString()} {currentOffer.salaryCurrency}/año</strong> con {currentOffer.equity}. Fecha de inicio prevista: {currentOffer.startDate}.
          </p>
          <div style={{ fontSize: "11px", color: "#166534" }}>
            Aprobada por: <code>{currentOffer.approvedBy ?? "Marcelo"}</code>
            {currentOffer.approvedAt && ` el ${new Date(currentOffer.approvedAt).toLocaleDateString()}`}
          </div>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="ck-btn"
              onClick={() => {
                if (currentOffer) {
                  setRole(currentOffer.role);
                  setSalary(currentOffer.proposedSalary);
                  setEquity(currentOffer.equity);
                  setStartDate(currentOffer.startDate);
                  if (currentOffer.notes) setNotes(currentOffer.notes);
                }
                setIsAdjusting(true);
              }}
            >
              ✏️ Modificar o Re-negociar Oferta
            </button>
          </div>
        </div>
      )}

      {/* Offer Proposal / Adjustment Form */}
      {((!activeProposal && currentOffer?.status !== "approved") || isAdjusting) && (
        <form onSubmit={submitProposal} className="ck-task-form ck-task-form--stacked">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label htmlFor="offer-role" style={{ fontSize: "12px", fontWeight: 600 }}>
              Puesto Ofertado
            </label>
            <span style={{ fontSize: "11px", color: "var(--muted)" }}>
              Candidato: {candidate.name}
            </span>
          </div>
          <input
            id="offer-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            maxLength={120}
            placeholder="Puesto..."
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label htmlFor="offer-salary" style={{ fontSize: "12px", fontWeight: 600 }}>
                Salario Anual (USD)
              </label>
              <input
                id="offer-salary"
                type="number"
                value={salary}
                onChange={(event) => setSalary(Number(event.target.value))}
                min={10000}
                max={500000}
                step={1000}
                required
              />
            </div>
            <div>
              <label htmlFor="offer-equity" style={{ fontSize: "12px", fontWeight: 600 }}>
                Equity / Stock Options
              </label>
              <input
                id="offer-equity"
                value={equity}
                onChange={(event) => setEquity(event.target.value)}
                maxLength={60}
                placeholder="0.25%..."
                required
              />
            </div>
          </div>

          {/* Dynamic real-time budget indicator */}
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: !isValidSalary ? "#fef2f2" : isWithinBudget ? "#ecfdf5" : "#fff1f2",
              color: !isValidSalary ? "#991b1b" : isWithinBudget ? "#065f46" : "#9f1239",
              border: `1px solid ${!isValidSalary ? "#fecaca" : isWithinBudget ? "#a7f3d0" : "#fecdd3"}`,
            }}
          >
            <span>{!isValidSalary ? "❌" : isWithinBudget ? "✓" : "⚠️"}</span>
            <span>
              {!isValidSalary
                ? "Ingresa un salario anual válido mayor a 0 USD."
                : isWithinBudget
                ? `Dentro del presupuesto ($${TARGET_ROLE.budgetMaxSalary.toLocaleString()} USD max): margen de $${salaryDiff.toLocaleString()} USD (+${variancePct}%).`
                : `Excede el presupuesto de $${TARGET_ROLE.budgetMaxSalary.toLocaleString()} USD por $${Math.abs(salaryDiff).toLocaleString()} USD (+${variancePct}%).`}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label htmlFor="offer-start-date" style={{ fontSize: "12px", fontWeight: 600 }}>
                Fecha Tentativa de Inicio
              </label>
              <input
                id="offer-start-date"
                type="text"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                placeholder="2026-10-01"
                required
              />
            </div>
            <div>
              <label htmlFor="candidate-expectation" style={{ fontSize: "12px", color: "var(--muted)" }}>
                Pretensión Original
              </label>
              <input
                id="candidate-expectation"
                value={candidate.salaryExpectation}
                disabled
                style={{ background: "#f3f4f6", color: "var(--muted)" }}
              />
            </div>
          </div>

          <label htmlFor="offer-notes" style={{ fontSize: "12px", fontWeight: 600 }}>
            Observaciones y Paquete de Beneficios
          </label>
          <textarea
            id="offer-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={1000}
            placeholder="Detalles sobre bono de contratación, equipo, beneficios remotos..."
            rows={2}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="ck-btn ck-btn--primary"
              disabled={preparing || busy}
              type="submit"
            >
              {preparing ? "Preparando propuesta…" : "📋 Revisar Propuesta para Aprobación"}
            </button>
            {isAdjusting && currentOffer?.status === "approved" && (
              <button
                type="button"
                className="ck-btn"
                onClick={() => setIsAdjusting(false)}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {/* Workplace Ambiguous provider tasks sync (when connected) */}
      {status?.status === "connected" && tasks.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: "13px", fontWeight: 600, marginBottom: 8 }}>
            Registros Sincronizados con Workspace ({status.workspaceId})
          </h3>
          <ul className="ck-task-list">
            {tasks.map((task) => (
              <li key={task.id}>
                <span aria-hidden="true">○</span>
                <div>
                  <strong>{task.title}</strong>
                  <code className="ck-record-id">{task.id}</code>
                  {task.url && (
                    <a href={task.url} target="_blank" rel="noreferrer">
                      Ver en Workspace
                    </a>
                  )}
                  <details>
                    <summary>Detalles</summary>
                    <p className="ck-preserve-lines">{task.description}</p>
                  </details>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ck-btn"
            disabled={busy}
            onClick={refresh}
          >
            Refrescar Registros
          </button>
        </div>
      )}

      {/* Feedback alerts and error messages */}
      {(error || workplace.error) && (
        <p role="alert" className="ck-error" style={{ marginTop: 12 }}>
          {error || workplace.error}
        </p>
      )}

      {successNotice && (
        <p
          role="status"
          style={{
            marginTop: 12,
            background: "#f0fdf4",
            color: "#166534",
            padding: 10,
            borderRadius: 6,
            fontSize: "13px",
            border: "1px solid #bbf7d0",
          }}
        >
          {successNotice}
        </p>
      )}

      {notice && (
        <p role="status" className="ck-notice">
          {notice}
        </p>
      )}
    </section>
  );
}
