"use client";

import React, { useState, useMemo } from "react";
import {
  Candidate,
  TARGET_ROLE,
  requiresHumanApprovalForStatus,
  CRITICAL_CANDIDATE_STATUSES,
  getBudgetAlignment,
} from "@/lib/candidates";

export interface KanbanBoardProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
  onUpdateStatus: (candidateId: string, newStatus: Candidate["status"]) => void;
  onOpenWorkspace: (candidateId: string) => void;
}

interface ColumnDef {
  id: Candidate["status"];
  title: string;
  subtitle: string;
  colorClass: string;
  badgeClass: string;
  isCritical?: boolean;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "Review",
    title: "Revisión Inicial",
    subtitle: "Extracción y screening",
    colorClass: "ts-col-review",
    badgeClass: "ts-badge-review",
  },
  {
    id: "Interviewing",
    title: "En Entrevistas",
    subtitle: "Rondas técnicas y cultura",
    colorClass: "ts-col-interviewing",
    badgeClass: "ts-badge-interviewing",
  },
  {
    id: "Finalist",
    title: "Finalistas",
    subtitle: "Evaluación directiva",
    colorClass: "ts-col-finalist",
    badgeClass: "ts-badge-finalist",
  },
  {
    id: "Offer Extended",
    title: "Oferta Emitida",
    subtitle: "HitL: Aprobación requerida",
    colorClass: "ts-col-offer",
    badgeClass: "ts-badge-offer",
    isCritical: true,
  },
  {
    id: "Hired",
    title: "Contratado",
    subtitle: "HitL: Cierre formal",
    colorClass: "ts-col-hired",
    badgeClass: "ts-badge-hired",
    isCritical: true,
  },
  {
    id: "Rejected",
    title: "Descartado",
    subtitle: "No alineado a requisitos",
    colorClass: "ts-col-rejected",
    badgeClass: "ts-badge-rejected",
  },
];

/* ── Clean SVG Icons ─────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
    </svg>
  );
}

function ShieldAlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 .5c-.27 0-.528.14-.675.372l-5 8A.75.75 0 003 10h2.25v4.25a.75.75 0 001.5 0V10h2.5a.75.75 0 00.675-1.128l-1.25-2 1.25-2A.75.75 0 009.425 4H8.75V1.25A.75.75 0 008 .5z" />
      <path d="M8 1a5 5 0 00-5 5v1h10V6a5 5 0 00-5-5zm-3.5 6V6a3.5 3.5 0 117 0v1h-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-4a.5.5 0 011 0v4a1.5 1.5 0 01-1.5 1.5H4a1.5 1.5 0 01-1.5-1.5V3a1.5 1.5 0 011.5-1.5h4a.5.5 0 010 1H4z" />
      <path d="M9.5 2a.5.5 0 01.5-.5h4.5a.5.5 0 01.5.5v4.5a.5.5 0 01-1 0V3.707L8.854 8.854a.5.5 0 11-.708-.708L13.293 3H10a.5.5 0 01-.5-.5z" />
    </svg>
  );
}

export function KanbanBoard({
  candidates,
  onSelectCandidate,
  onUpdateStatus,
  onOpenWorkspace,
}: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "within" | "over">("all");
  
  // Human-in-the-Loop Modal State for Critical Transitions
  const [pendingCriticalMove, setPendingCriticalMove] = useState<{
    candidate: Candidate;
    targetStatus: Candidate["status"];
  } | null>(null);

  // Filter candidates according to search and budget criteria
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const matchesSearch =
        cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.currentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const budgetAlignment = getBudgetAlignment(cand);
      const isWithinBudget = budgetAlignment === "within";
      const isOverBudget = budgetAlignment === "over";
      const matchesBudget =
        budgetFilter === "all" ||
        (budgetFilter === "within" && isWithinBudget) ||
        (budgetFilter === "over" && isOverBudget);

      return matchesSearch && matchesBudget;
    });
  }, [candidates, searchTerm, budgetFilter]);

  // Group filtered candidates by status column
  const candidatesByColumn = useMemo(() => {
    const map = new Map<Candidate["status"], Candidate[]>();
    for (const col of COLUMNS) {
      map.set(col.id, []);
    }
    for (const cand of filteredCandidates) {
      const list = map.get(cand.status) ?? [];
      list.push(cand);
      map.set(cand.status, list);
    }
    return map;
  }, [filteredCandidates]);

  // Handler for candidate status change
  const handleRequestStatusChange = (
    candidate: Candidate,
    newStatus: Candidate["status"]
  ) => {
    if (candidate.status === newStatus) return;

    // Check if transition is critical and requires explicit human approval
    if (requiresHumanApprovalForStatus(newStatus)) {
      setPendingCriticalMove({ candidate, targetStatus: newStatus });
      return;
    }

    // Direct non-critical transition
    onUpdateStatus(candidate.id, newStatus);
  };

  const confirmCriticalMove = () => {
    if (!pendingCriticalMove) return;
    onUpdateStatus(pendingCriticalMove.candidate.id, pendingCriticalMove.targetStatus);
    setPendingCriticalMove(null);
  };

  const cancelCriticalMove = () => {
    setPendingCriticalMove(null);
  };

  return (
    <div className="ts-kanban-container">
      {/* ── Kanban Controls Bar (Dense Header) ─────────────────────────────── */}
      <div className="ts-kanban-controls">
        <div className="ts-kanban-title-row">
          <div>
            <h2 className="ts-kanban-main-title">Tablero Kanban de Candidatos</h2>
            <p className="ts-kanban-main-subtitle">
              Lectura y progresión de candidatos por etapas de selección · Inspirado en densidad CIME
            </p>
          </div>

          <div className="ts-kanban-badge-role">
            <span className="ts-role-dot" aria-hidden="true" />
            <span>Tope Autorizado: <strong>${TARGET_ROLE.budgetMaxSalary.toLocaleString()} USD</strong></span>
          </div>
        </div>

        <div className="ts-kanban-filters">
          {/* Search Input */}
          <div className="ts-kanban-search-box">
            <SearchIcon />
            <input
              type="text"
              className="ts-kanban-search-input"
              placeholder="Buscar por nombre, cargo o skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Filtrar candidatos en el tablero"
            />
            {searchTerm && (
              <button
                type="button"
                className="ts-kanban-clear-btn"
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {/* Budget Filter Buttons */}
          <div className="ts-kanban-budget-filters" role="group" aria-label="Filtro de presupuesto">
            <button
              type="button"
              className={`ts-kanban-filter-pill ${budgetFilter === "all" ? "is-active" : ""}`}
              onClick={() => setBudgetFilter("all")}
            >
              Todos ({candidates.length})
            </button>
            <button
              type="button"
              className={`ts-kanban-filter-pill ${budgetFilter === "within" ? "is-active" : ""}`}
              onClick={() => setBudgetFilter("within")}
            >
              <CheckIcon /> En Rango (≤ $95k)
            </button>
            <button
              type="button"
              className={`ts-kanban-filter-pill ${budgetFilter === "over" ? "is-active" : ""}`}
              onClick={() => setBudgetFilter("over")}
            >
              <AlertTriangleIcon /> Excede Presupuesto
            </button>
          </div>
        </div>
      </div>

      {/* ── Horizontal Scrollable Board Columns ───────────────────────────── */}
      <div className="ts-kanban-board" role="region" aria-label="Columnas de candidatos por estado">
        {COLUMNS.map((col) => {
          const items = candidatesByColumn.get(col.id) ?? [];
          return (
            <div key={col.id} className={`ts-kanban-column ${col.colorClass}`}>
              <div className="ts-kanban-col-header">
                <div className="ts-kanban-col-title-group">
                  <div className="ts-kanban-col-indicator" aria-hidden="true" />
                  <div>
                    <h3 className="ts-kanban-col-title">{col.title}</h3>
                    <span className="ts-kanban-col-subtitle">{col.subtitle}</span>
                  </div>
                </div>
                <span className="ts-kanban-col-count">{items.length}</span>
              </div>

              {/* Column Body / Cards List */}
              <div className="ts-kanban-cards-list">
                {items.length === 0 ? (
                  <div className="ts-kanban-empty-slot">
                    <span>Sin candidatos en esta etapa</span>
                  </div>
                ) : (
                  items.map((cand) => {
                    const budgetAlignment = getBudgetAlignment(cand);
                    const budgetDiff = TARGET_ROLE.budgetMaxSalary - cand.salaryNumber;
                    const isWithinBudget = budgetAlignment === "within";
                    const isUnknownBudget = budgetAlignment === "unknown";

                    return (
                      <article
                        key={cand.id}
                        className="ts-kanban-card"
                        tabIndex={0}
                        onClick={() => onSelectCandidate(cand.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelectCandidate(cand.id);
                          }
                        }}
                        aria-label={`Tarjeta de ${cand.name}, estado: ${cand.status}`}
                      >
                        {/* Card Top: Avatar, Name & Detail link */}
                        <div className="ts-kcard-top">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cand.avatar}
                            alt=""
                            className="ts-kcard-avatar"
                            aria-hidden="true"
                          />
                          <div className="ts-kcard-name-group">
                            <h4 className="ts-kcard-name">{cand.name}</h4>
                            <span className="ts-kcard-role">{cand.currentTitle}</span>
                          </div>
                          <button
                            type="button"
                            className="ts-kcard-open-btn"
                            title="Abrir en Workspace"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenWorkspace(cand.id);
                            }}
                          >
                            <ExternalIcon />
                          </button>
                        </div>

                        {/* Salary and Budget Tag */}
                        <div className="ts-kcard-salary-row">
                          <span className="ts-kcard-salary-val">{cand.salaryExpectation}</span>
                          <span
                            className={`ts-kcard-budget-badge ${
                              isWithinBudget ? "is-ok" : "is-over"
                            }`}
                          >
                            {isUnknownBudget ? (
                              <>Desconocido</>
                            ) : isWithinBudget ? (
                              <>
                                <CheckIcon /> -$
                                {Math.abs(budgetDiff).toLocaleString()}
                              </>
                            ) : (
                              <>
                                <AlertTriangleIcon /> +$
                                {Math.abs(budgetDiff).toLocaleString()}
                              </>
                            )}
                          </span>
                        </div>

                        {/* Skills Chips Preview */}
                        <div className="ts-kcard-skills">
                          {cand.skills.slice(0, 3).map((skill) => (
                            <span key={skill} className="ts-kcard-skill-pill">
                              {skill}
                            </span>
                          ))}
                          {cand.skills.length > 3 && (
                            <span className="ts-kcard-skill-pill is-more">
                              +{cand.skills.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Card Footer: Metadata & Stage Move Selector */}
                        <div className="ts-kcard-footer">
                          <div className="ts-kcard-meta-facts">
                            <span className="ts-kcard-fact">
                              {cand.interviewNotes.length} rondas
                            </span>
                            <span className="ts-kcard-fact">
                              {cand.ratings.systemDesign}/10 sys
                            </span>
                          </div>

                          <div className="ts-kcard-action-wrap" onClick={(e) => e.stopPropagation()}>
                            <label htmlFor={`move-${cand.id}`} className="sr-only">
                              Mover de etapa
                            </label>
                            <select
                              id={`move-${cand.id}`}
                              className="ts-kcard-select-move"
                              value={cand.status}
                              onChange={(e) =>
                                handleRequestStatusChange(
                                  cand,
                                  e.target.value as Candidate["status"]
                                )
                              }
                            >
                              <option value="Review">Revisión</option>
                              <option value="Interviewing">Entrevista</option>
                              <option value="Finalist">Finalista</option>
                              <option value="Offer Extended">Oferta (HitL)</option>
                              <option value="Hired">Contratado (HitL)</option>
                              <option value="Rejected">Descartar</option>
                            </select>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Human-in-the-Loop Confirmation Modal for Critical Transitions ──── */}
      {pendingCriticalMove && (
        <div className="ts-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="hitl-title">
          <div className="ts-modal-box">
            <div className="ts-modal-header">
              <div className="ts-modal-icon-wrap" aria-hidden="true">
                <ShieldAlertIcon />
              </div>
              <div>
                <span className="ts-modal-eyebrow">Compuerta Human-in-the-Loop</span>
                <h3 id="hitl-title" className="ts-modal-title">
                  Confirmar Transición Crítica: {pendingCriticalMove.targetStatus}
                </h3>
              </div>
            </div>

            <div className="ts-modal-content">
              <p>
                Estás a punto de cambiar el estado de{" "}
                <strong>{pendingCriticalMove.candidate.name}</strong> a{" "}
                <span className="ts-status-badge ts-status-offer">
                  {pendingCriticalMove.targetStatus}
                </span>
                .
              </p>

              <div className="ts-modal-terms-box">
                <div className="ts-modal-term-row">
                  <span>Puesto Objetivo:</span>
                  <strong>{TARGET_ROLE.title}</strong>
                </div>
                <div className="ts-modal-term-row">
                  <span>Pretensión Salarial:</span>
                  <strong>{pendingCriticalMove.candidate.salaryExpectation}</strong>
                </div>
                <div className="ts-modal-term-row">
                  <span>Presupuesto Tope Autorizado:</span>
                  <strong>${TARGET_ROLE.budgetMaxSalary.toLocaleString()} USD</strong>
                </div>
                {pendingCriticalMove.candidate.salaryNumber > TARGET_ROLE.budgetMaxSalary && (
                  <div className="ts-modal-warning-box">
                    <AlertTriangleIcon />
                    <span>
                      Atención: El candidato supera el tope en $
                      {(
                        pendingCriticalMove.candidate.salaryNumber - TARGET_ROLE.budgetMaxSalary
                      ).toLocaleString()}{" "}
                      USD. Se requiere un acuerdo formal o ajuste salarial previo.
                    </span>
                  </div>
                )}
              </div>

              <p className="ts-modal-disclaimer">
                De acuerdo a la política de seguridad y gobernanza de TalentScore, las ofertas y
                contrataciones formales no pueden ser automatizadas por el agente sin la firma y
                consentimiento explícito del reclutador responsable.
              </p>
            </div>

            <div className="ts-modal-actions">
              <button
                type="button"
                className="ts-btn ts-btn-primary"
                onClick={confirmCriticalMove}
              >
                <CheckIcon /> Confirmar y Emitir como Reclutador
              </button>
              <button
                type="button"
                className="ts-btn ts-btn-outline"
                onClick={cancelCriticalMove}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
