"use client";

import React from "react";

// Types for streamed Generative UI components
export interface CandidateComparisonItem {
  name: string;
  matchScore?: number; // 0 - 100
  salary?: string;
  withinBudget?: boolean;
  strengths?: string[];
  concerns?: string[];
  verdict?: string;
}

export interface CandidateComparisonProps {
  title?: string;
  roleTarget?: string;
  budgetCap?: string;
  candidates?: CandidateComparisonItem[];
  recommendation?: string;
}

export interface OfferProposalProps {
  candidateName?: string;
  roleTitle?: string;
  department?: string;
  baseSalary?: string;
  salaryVsBudget?: string; // e.g. "Dentro del presupuesto (-$3,000)"
  signingBonus?: string;
  equity?: string;
  startDate?: string;
  benefits?: string[];
  justification?: string;
}

export function CandidateComparisonCard({
  title = "Comparativa de Candidatos vs Rol Objetivo",
  roleTarget = "Lead Fullstack & AI Systems Engineer",
  budgetCap = "$95,000 USD",
  candidates = [],
  recommendation,
}: CandidateComparisonProps) {
  return (
    <div className="ts-gen-card ts-comparison-card">
      <div className="ts-gen-header">
        <div className="ts-gen-badge">Generative UI · Matriz Comparativa</div>
        <h3 className="ts-gen-title">{title}</h3>
        <p className="ts-gen-subtitle">
          Rol: <strong>{roleTarget}</strong> · Presupuesto tope: <strong>{budgetCap}</strong>
        </p>
      </div>

      {!candidates || candidates.length === 0 ? (
        <div className="ts-gen-loading">Generando análisis comparativo de perfiles…</div>
      ) : (
        <div className="ts-comp-grid">
          {candidates.map((c, idx) => (
            <div
              key={idx}
              className={`ts-comp-col ${c.withinBudget === false ? "is-over-budget" : "is-within-budget"}`}
            >
              <div className="ts-comp-top">
                <div className="ts-comp-name">{c.name || "Candidato"}</div>
                {c.matchScore !== undefined && (
                  <span className="ts-comp-score">
                    {c.matchScore}% Match
                  </span>
                )}
              </div>

              <div className="ts-comp-salary-badge">
                💰 {c.salary || "N/A"}
                <span className={`ts-budget-tag ${c.withinBudget === false ? "ts-tag-danger" : "ts-tag-success"}`}>
                  {c.withinBudget === false ? "⚠️ Excede Budget" : "✓ En Presupuesto"}
                </span>
              </div>

              {c.strengths && c.strengths.length > 0 && (
                <div className="ts-comp-section">
                  <div className="ts-section-label">Puntos Fuertes</div>
                  <ul className="ts-comp-list">
                    {c.strengths.map((s, i) => (
                      <li key={i}>✓ {s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {c.concerns && c.concerns.length > 0 && (
                <div className="ts-comp-section">
                  <div className="ts-section-label">Puntos de Atención / Riesgos</div>
                  <ul className="ts-comp-list ts-list-concerns">
                    {c.concerns.map((r, i) => (
                      <li key={i}>⚠️ {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {c.verdict && (
                <div className="ts-comp-verdict">
                  <strong>Veredicto:</strong> {c.verdict}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {recommendation && (
        <div className="ts-gen-recommendation">
          <span className="ts-rec-icon">💡</span>
          <div>
            <strong>Recomendación del Agente:</strong>
            <p>{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function OfferProposalCard({
  candidateName = "Candidato Seleccionado",
  roleTitle = "Lead Fullstack & AI Systems Engineer",
  department = "Product Engineering",
  baseSalary = "$92,000 USD / año",
  salaryVsBudget = "Dentro del presupuesto (-$3,000)",
  signingBonus = "$5,000 USD",
  equity = "0.25% Stock Options (4-year vesting)",
  startDate = "01 de Octubre, 2026",
  benefits = ["Cobertura de salud premium (100%)", "Stipend de Home Office ($1,500)", "Días libres ilimitados (PTO)"],
  justification,
}: OfferProposalProps) {
  return (
    <div className="ts-gen-card ts-offer-card">
      <div className="ts-gen-header">
        <div className="ts-gen-badge ts-badge-emerald">Propuesta de Oferta Formal</div>
        <h3 className="ts-gen-title">Borrador de Oferta para {candidateName}</h3>
        <p className="ts-gen-subtitle">
          {roleTitle} · {department}
        </p>
      </div>

      <div className="ts-offer-breakdown">
        <div className="ts-offer-stat">
          <span className="ts-stat-label">Salario Base Propuesto</span>
          <span className="ts-stat-value">{baseSalary}</span>
          <span className="ts-stat-subtext ts-color-success">{salaryVsBudget}</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Bono de Firma (Sign-on)</span>
          <span className="ts-stat-value">{signingBonus}</span>
          <span className="ts-stat-subtext">Pago único a los 30 días</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Equity / Participación</span>
          <span className="ts-stat-value">{equity}</span>
          <span className="ts-stat-subtext">1-year cliff</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Fecha Tentativa de Inicio</span>
          <span className="ts-stat-value">{startDate}</span>
          <span className="ts-stat-subtext">Modalidad Remota</span>
        </div>
      </div>

      {benefits && benefits.length > 0 && (
        <div className="ts-offer-benefits">
          <span className="ts-section-label">Beneficios Adicionales del Paquete:</span>
          <div className="ts-benefit-pills">
            {benefits.map((b, i) => (
              <span key={i} className="ts-benefit-pill">
                ✦ {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {justification && (
        <div className="ts-offer-justification">
          <span className="ts-section-label">Justificación del Agente:</span>
          <p>{justification}</p>
        </div>
      )}

      <div className="ts-offer-footer">
        <span className="ts-offer-note">
          ℹ️ Esta propuesta requiere la confirmación del Hiring Manager antes de emitirse legalmente.
        </span>
      </div>
    </div>
  );
}
