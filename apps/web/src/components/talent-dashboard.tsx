"use client";

import React from "react";
import {
  Candidate,
  TARGET_ROLE,
  getRankedCandidates,
} from "@/lib/candidates";

export interface TalentDashboardProps {
  candidates: Candidate[];
  shortlistIds: Set<string>;
  shortlistApproved: boolean;
  onNavigateView: (view: "inbox" | "kanban" | "calendar" | "workspace") => void;
  onSelectCandidate: (id: string) => void;
  onApproveShortlist: () => void;
}

/* ── Clean SVG Icons ─────────────────────────────────────────────────────── */
function SparklesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7.53 1.282a.5.5 0 01.94 0l1.19 3.662a.5.5 0 00.375.326l3.847.559a.5.5 0 01.277.853l-2.784 2.714a.5.5 0 00-.144.442l.657 3.832a.5.5 0 01-.725.527L7.72 12.18a.5.5 0 00-.44 0l-3.447 2.017a.5.5 0 01-.725-.527l.657-3.832a.5.5 0 00-.144-.442L.882 6.682a.5.5 0 01.277-.853l3.847-.559a.5.5 0 00.375-.326L7.53 1.282z" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.78 6.28l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L6.75 9.19l3.97-3.97a.75.75 0 011.06 1.06z" />
    </svg>
  );
}

function ShieldLockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 .5c-.27 0-.528.14-.675.372l-5 8A.75.75 0 003 10h2.25v4.25a.75.75 0 001.5 0V10h2.5a.75.75 0 00.675-1.128l-1.25-2 1.25-2A.75.75 0 009.425 4H8.75V1.25A.75.75 0 008 .5z" />
      <path d="M8 1a5 5 0 00-5 5v1h10V6a5 5 0 00-5-5zm-3.5 6V6a3.5 3.5 0 117 0v1h-7z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 010-1.06z" />
    </svg>
  );
}

export function TalentDashboard({
  candidates,
  shortlistIds,
  shortlistApproved,
  onNavigateView,
  onSelectCandidate,
  onApproveShortlist,
}: TalentDashboardProps) {
  const ranked = getRankedCandidates();
  const topCandidate = candidates.find((c) => c.id === "CAND-101") ?? candidates[0];

  const withinBudgetCount = candidates.filter(
    (c) => c.salaryNumber <= TARGET_ROLE.budgetMaxSalary
  ).length;

  const overBudgetCandidate = candidates.find(
    (c) => c.salaryNumber > TARGET_ROLE.budgetMaxSalary
  );

  return (
    <div className="ts-dash-container">
      {/* ── Executive KPI Row ───────────────────────────────────────────────── */}
      <div className="ts-dash-kpi-grid">
        <div className="ts-dash-kpi-card">
          <span className="ts-dash-kpi-label">Pipeline Activo</span>
          <div className="ts-dash-kpi-val-row">
            <span className="ts-dash-kpi-val">{candidates.length}</span>
            <span className="ts-dash-kpi-badge">3 evaluados</span>
          </div>
          <span className="ts-dash-kpi-subtext">Postulaciones extraídas por LLM</span>
        </div>

        <div className="ts-dash-kpi-card">
          <span className="ts-dash-kpi-label">Presupuesto Tope Autorizado</span>
          <div className="ts-dash-kpi-val-row">
            <span className="ts-dash-kpi-val">${(TARGET_ROLE.budgetMaxSalary / 1000).toFixed(0)}k</span>
            <span className="ts-dash-kpi-badge ts-badge-emerald">{TARGET_ROLE.currency}</span>
          </div>
          <span className="ts-dash-kpi-subtext">{TARGET_ROLE.title}</span>
        </div>

        <div className="ts-dash-kpi-card">
          <span className="ts-dash-kpi-label">Alineación Presupuestaria</span>
          <div className="ts-dash-kpi-val-row">
            <span className="ts-dash-kpi-val">{withinBudgetCount} / {candidates.length}</span>
            <span className="ts-dash-kpi-badge ts-badge-emerald">67% en rango</span>
          </div>
          <span className="ts-dash-kpi-subtext">1 candidato supera el límite</span>
        </div>

        <div className="ts-dash-kpi-card">
          <span className="ts-dash-kpi-label">Shortlist & Compuerta HitL</span>
          <div className="ts-dash-kpi-val-row">
            <span className="ts-dash-kpi-val">{shortlistIds.size}</span>
            <span className={`ts-dash-kpi-badge ${shortlistApproved ? "ts-badge-emerald" : "ts-badge-amber"}`}>
              {shortlistApproved ? "Aprobada" : "Pendiente"}
            </span>
          </div>
          <span className="ts-dash-kpi-subtext">Control humano requerido p/exportar</span>
        </div>
      </div>

      {/* ── Agent Recommended Action ────────────────────────────────────────── */}
      <div className="ts-dash-agent-recommendation">
        <div className="ts-agent-badge">
          <SparklesIcon />
          <span>Acción Recomendada por Talent Copilot</span>
        </div>

        <div className="ts-agent-body">
          <div className="ts-agent-left">
            <h3 className="ts-agent-title">
              Emitir Propuesta de Oferta Formal a {topCandidate.name}
            </h3>
            <p className="ts-agent-desc">
              Según el ranking transparente y las notas de entrevista de Marcelo, Amin y Milena,{" "}
              <strong>{topCandidate.name}</strong> es la principal candidata con un score de{" "}
              <strong>96/100</strong>. Su pretensión de <strong>$92,000 USD</strong> está dentro del
              tope de $95k (-$3,000 margen de ahorro).
            </p>
          </div>

          <div className="ts-agent-actions">
            <button
              type="button"
              className="ts-btn ts-btn-primary"
              onClick={() => {
                onSelectCandidate(topCandidate.id);
                onNavigateView("workspace");
              }}
            >
              Revisar Perfil en Workspace <ArrowRightIcon />
            </button>
            <button
              type="button"
              className="ts-btn ts-btn-outline"
              onClick={() => onNavigateView("kanban")}
            >
              Ver Tablero Kanban
            </button>
          </div>
        </div>
      </div>

      {/* ── Budget Alerts & Risk Monitor ───────────────────────────────────── */}
      <div className="ts-dash-two-col">
        {/* Budget Variance Analysis */}
        <div className="ts-card">
          <h3 className="ts-card-title">
            <span>Control de Compensación & Alertas Presupuestarias</span>
            <span className="ts-card-badge">Tope: $95,000 USD</span>
          </h3>

          <div className="ts-dash-budget-list">
            {candidates.map((cand) => {
              const diff = TARGET_ROLE.budgetMaxSalary - cand.salaryNumber;
              const isOver = diff < 0;

              return (
                <div
                  key={cand.id}
                  className={`ts-dash-budget-item ${isOver ? "is-over" : "is-within"}`}
                  onClick={() => {
                    onSelectCandidate(cand.id);
                    onNavigateView("workspace");
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver detalles de presupuesto de ${cand.name}`}
                >
                  <div className="ts-dash-cand-meta">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cand.avatar} alt="" className="ts-cand-avatar" aria-hidden="true" />
                    <div>
                      <span className="ts-dash-cand-name">{cand.name}</span>
                      <span className="ts-dash-cand-role">{cand.currentTitle}</span>
                    </div>
                  </div>

                  <div className="ts-dash-budget-figures">
                    <span className="ts-dash-salary">{cand.salaryExpectation}</span>
                    <span className={`ts-budget-pill ${isOver ? "ts-pill-danger" : "ts-pill-success"}`}>
                      {isOver ? (
                        <>
                          <AlertTriangleIcon /> +${Math.abs(diff).toLocaleString()}
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon /> -${Math.abs(diff).toLocaleString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {overBudgetCandidate && (
            <div className="ts-dash-alert-callout">
              <AlertTriangleIcon />
              <div>
                <strong>Alerta Salarial Crítica:</strong> {overBudgetCandidate.name} supera el presupuesto por{" "}
                <strong>+${(overBudgetCandidate.salaryNumber - TARGET_ROLE.budgetMaxSalary).toLocaleString()} USD</strong>.
                La rúbrica penaliza alineación presupuestaria a 0/5. Requiere renegociación humana antes de cualquier oferta.
              </div>
            </div>
          )}
        </div>

        {/* Risk & Shortlist Matrix */}
        <div className="ts-card">
          <h3 className="ts-card-title">
            <span>Rúbrica de Selección & Shortlist Aprobada</span>
            <span className="ts-card-badge">Human-in-the-Loop</span>
          </h3>

          <div className="ts-dash-ranking-table">
            <div className="ts-dash-table-header">
              <span>Candidato</span>
              <span>Score Rúbrica</span>
              <span>Estado Pipeline</span>
              <span>Riesgo Detectado</span>
            </div>

            {ranked.map((r) => {
              const cand = candidates.find((c) => c.id === r.candidateId);
              if (!cand) return null;
              return (
                <div
                  key={cand.id}
                  className="ts-dash-table-row"
                  onClick={() => {
                    onSelectCandidate(cand.id);
                    onNavigateView("workspace");
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="ts-dash-row-name">
                    <strong>{cand.name}</strong>
                  </span>
                  <span className="ts-dash-row-score">
                    <span className="ts-score-pill">{r.score}/100</span>
                  </span>
                  <span className="ts-dash-row-status">
                    <span className="ts-status-badge ts-status-finalist">{cand.status}</span>
                  </span>
                  <span className="ts-dash-row-risk">
                    {r.risks.length > 0 ? (
                      <span className="ts-risk-text" title={r.risks[0]}>
                        ⚠️ {r.risks[0]}
                      </span>
                    ) : (
                      <span className="ts-no-risk-text">✓ Sin riesgos</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Shortlist Gate Notice */}
          <div className="ts-dash-shortlist-footer">
            <div className="ts-shortlist-info">
              <ShieldLockIcon />
              <span>
                Shortlist actual: <strong>{shortlistIds.size} candidato(s)</strong> seleccionados.
                {shortlistApproved
                  ? " ✓ Aprobación humana completada. Exportaciones habilitadas."
                  : " ⚠️ Requiere aprobación del reclutador antes de emitir dossier PDF/DOCX/XLSX."}
              </span>
            </div>

            {!shortlistApproved && shortlistIds.size > 0 && (
              <button
                type="button"
                className="ts-btn ts-btn-primary"
                onClick={onApproveShortlist}
              >
                Aprobar Shortlist (HitL)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
