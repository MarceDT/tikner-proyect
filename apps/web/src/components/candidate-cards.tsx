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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7.53 1.282a.5.5 0 01.94 0l1.19 3.662a.5.5 0 00.375.326l3.847.559a.5.5 0 01.277.853l-2.784 2.714a.5.5 0 00-.144.442l.657 3.832a.5.5 0 01-.725.527L7.72 12.18a.5.5 0 00-.44 0l-3.447 2.017a.5.5 0 01-.725-.527l.657-3.832a.5.5 0 00-.144-.442L.882 6.682a.5.5 0 01.277-.853l3.847-.559a.5.5 0 00.375-.326L7.53 1.282z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8.75-3a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0V5zM7.25 7.5a.75.75 0 011.5 0v3.75a.75.75 0 01-1.5 0V7.5z" />
    </svg>
  );
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
        <div className="ts-gen-badge">Matriz Comparativa</div>
        <h3 className="ts-gen-title">{title}</h3>
        <p className="ts-gen-subtitle">
          Puesto: <strong>{roleTarget}</strong> · Presupuesto tope: <strong>{budgetCap}</strong>
        </p>
      </div>

      {!candidates || candidates.length === 0 ? (
        <div className="ts-gen-loading">Generando análisis comparativo de perfiles…</div>
      ) : (
        <div className="ts-comp-grid">
          {candidates.map((c, idx) => {
            const isOverBudget = c.withinBudget === false;
            return (
              <div
                key={idx}
                className={`ts-comp-col ${isOverBudget ? "is-over-budget" : "is-within-budget"}`}
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
                  <span>Pretensión: <strong>{c.salary || "N/A"}</strong></span>
                  <span className={`ts-budget-tag ${isOverBudget ? "ts-tag-danger" : "ts-tag-success"}`}>
                    {isOverBudget ? (
                      <>
                        <AlertIcon /> Excede Budget
                      </>
                    ) : (
                      <>
                        <CheckIcon /> En Presupuesto
                      </>
                    )}
                  </span>
                </div>

                {c.strengths && c.strengths.length > 0 && (
                  <div className="ts-comp-section">
                    <div className="ts-section-label">Fortalezas Clave</div>
                    <ul className="ts-comp-list">
                      {c.strengths.map((s, i) => (
                        <li key={i}>
                          <CheckIcon /> <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {c.concerns && c.concerns.length > 0 && (
                  <div className="ts-comp-section">
                    <div className="ts-section-label">Puntos de Atención / Riesgos</div>
                    <ul className="ts-comp-list ts-list-concerns">
                      {c.concerns.map((r, i) => (
                        <li key={i}>
                          <AlertIcon /> <span>{r}</span>
                        </li>
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
            );
          })}
        </div>
      )}

      {recommendation && (
        <div className="ts-gen-recommendation">
          <span className="ts-rec-icon">
            <SparkIcon />
          </span>
          <div>
            <strong>Recomendación del Agente:</strong>
            <p style={{ margin: "3px 0 0" }}>{recommendation}</p>
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
  benefits = ["Cobertura médica premium (100%)", "Stipend de Home Office ($1,500)", "Días libres flexibles (PTO)"],
  justification,
}: OfferProposalProps) {
  return (
    <div className="ts-gen-card ts-offer-card">
      <div className="ts-gen-header">
        <div className="ts-gen-badge ts-badge-emerald">Propuesta de Oferta Formal</div>
        <h3 className="ts-gen-title">Propuesta Económica para {candidateName}</h3>
        <p className="ts-gen-subtitle">
          {roleTitle} · {department}
        </p>
      </div>

      <div className="ts-offer-breakdown">
        <div className="ts-offer-stat">
          <span className="ts-stat-label">Salario Base Anual</span>
          <span className="ts-stat-value">{baseSalary}</span>
          <span className="ts-stat-subtext ts-color-success">{salaryVsBudget}</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Bono de Firma (Sign-on)</span>
          <span className="ts-stat-value">{signingBonus}</span>
          <span className="ts-stat-subtext">Pago único a 30 días</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Equity / Participación</span>
          <span className="ts-stat-value">{equity}</span>
          <span className="ts-stat-subtext">1-year cliff</span>
        </div>

        <div className="ts-offer-stat">
          <span className="ts-stat-label">Fecha de Inicio</span>
          <span className="ts-stat-value">{startDate}</span>
          <span className="ts-stat-subtext">Modalidad Remota</span>
        </div>
      </div>

      {benefits && benefits.length > 0 && (
        <div className="ts-offer-benefits">
          <span className="ts-section-label">Beneficios del Paquete:</span>
          <div className="ts-benefit-pills">
            {benefits.map((b, i) => (
              <span key={i} className="ts-benefit-pill">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {justification && (
        <div className="ts-offer-justification">
          <span className="ts-section-label">Justificación Técnica & Financiera:</span>
          <p style={{ margin: "3px 0 0" }}>{justification}</p>
        </div>
      )}

      <div className="ts-offer-footer">
        <span className="ts-offer-note" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <InfoIcon /> Esta propuesta requiere confirmación del Hiring Manager antes de su formalización.
        </span>
      </div>
    </div>
  );
}
