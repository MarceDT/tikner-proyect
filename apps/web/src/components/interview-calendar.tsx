"use client";

import React, { useState, useMemo } from "react";
import {
  ScheduledInterview,
  initialScheduledInterviews,
  evaluateInterviewConflicts,
} from "@/lib/interview-types";
import { Candidate } from "@/lib/candidates";

export interface InterviewCalendarProps {
  candidates: Candidate[];
  onSelectCandidate: (candidateId: string) => void;
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25A1.75 1.75 0 0115 3.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75A1.75 1.75 0 012.75 2H4V.75A.75.75 0 014.75 0zm0 3.5h-2a.25.25 0 00-.25.25V6h11V3.75a.25.25 0 00-.25-.25h-2V4.5a.75.75 0 01-1.5 0V3.5h-5V4.5a.75.75 0 01-1.5 0V3.5zM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 4.75a.75.75 0 00-1.5 0v3.5c0 .2.08.39.22.53l2.5 2.5a.75.75 0 001.06-1.06L8.75 8V4.75z" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.78 6.28l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L6.75 9.19l3.97-3.97a.75.75 0 011.06 1.06z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0-2.5-3-4-6-4s-6 1.5-6 4v1h12v-1z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
    </svg>
  );
}

export function InterviewCalendar({
  candidates,
  onSelectCandidate,
}: InterviewCalendarProps) {
  // Estado local para entrevistas programadas (empieza vacío por contrato de dominio)
  const [scheduledList, setScheduledList] = useState<ScheduledInterview[]>(initialScheduledInterviews);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);

  // Formulario para programar nueva entrevista
  const [newCandidateId, setNewCandidateId] = useState(candidates[0]?.id ?? "");
  const [newInterviewer, setNewInterviewer] = useState("Marcelo (Product Lead)");
  const [newRound, setNewRound] = useState("System Design & Architecture");
  const [newDate, setNewDate] = useState("2026-09-15");
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:00");

  // Evaluar conflictos dinámicamente sobre la lista programada
  const evaluatedInterviews = useMemo(() => {
    return evaluateInterviewConflicts(scheduledList);
  }, [scheduledList]);

  // Contar conflictos activos
  const conflictCount = useMemo(() => {
    return evaluatedInterviews.filter((i) => i.hasConflict).length;
  }, [evaluatedInterviews]);

  // Extraer el historial real de notas de entrevistas de los candidatos existentes
  const historicalRounds = useMemo(() => {
    const list: Array<{
      candidate: Candidate;
      round: string;
      interviewer: string;
      rating: string;
      date: string;
      notes: string;
    }> = [];

    for (const c of candidates) {
      for (const n of c.interviewNotes) {
        list.push({
          candidate: c,
          round: n.round,
          interviewer: n.interviewer,
          rating: n.rating,
          date: n.date,
          notes: n.notes,
        });
      }
    }
    return list;
  }, [candidates]);

  const handleAddInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === newCandidateId);
    if (!cand) return;

    const newItem: ScheduledInterview = {
      id: `INT-${Date.now()}`,
      candidateId: cand.id,
      candidateName: cand.name,
      candidateAvatar: cand.avatar,
      interviewer: newInterviewer,
      round: newRound,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: "scheduled",
    };

    setScheduledList((prev) => [...prev, newItem]);
    setIsSchedulingOpen(false);
  };

  const handleRemoveInterview = (id: string) => {
    setScheduledList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="ts-calendar-container">
      {/* ── Header Bar ─────────────────────────────────────────────────────── */}
      <div className="ts-cal-header">
        <div>
          <div className="ts-cal-title-group">
            <CalendarIcon />
            <h2 className="ts-cal-title">Calendario de Entrevistas</h2>
          </div>
          <p className="ts-cal-subtitle">
            Agenda del equipo de contratación · Detección visual de conflictos de horario y panel de entrevistadores
          </p>
        </div>

        <p className="ck-local-note" style={{ margin: 0 }}>
          Solo lectura. La confirmación se realiza desde la propuesta HITL del agente.
        </p>
      </div>

      {/* ── Tabs & Stats Summary ───────────────────────────────────────────── */}
      <div className="ts-cal-bar">
        <div className="ts-cal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "upcoming"}
            className={`ts-cal-tab-btn ${activeTab === "upcoming" ? "is-active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            <span>Próximas Entrevistas</span>
            <span className="ts-cal-tab-pill">{scheduledList.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={`ts-cal-tab-btn ${activeTab === "history" ? "is-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <span>Historial de Rondas Realizadas</span>
            <span className="ts-cal-tab-pill">{historicalRounds.length}</span>
          </button>
        </div>

        {conflictCount > 0 && (
          <div className="ts-cal-conflict-banner">
            <AlertTriangleIcon />
            <span>
              <strong>{conflictCount} conflicto(s)</strong> de agenda detectado(s) en las entrevistas programadas.
            </span>
          </div>
        )}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      {activeTab === "upcoming" ? (
        <div className="ts-cal-content">
          {evaluatedInterviews.length === 0 ? (
            <div className="ts-cal-empty-state">
              <div className="ts-cal-empty-icon">
                <CalendarIcon />
              </div>
              <h3 className="ts-cal-empty-title">Sin entrevistas futuras programadas</h3>
              <p className="ts-cal-empty-desc">
                Actualmente no hay citas agendadas en el calendario. El contrato tipado{" "}
                <code>ScheduledInterview</code> está activo y listo para sincronizar con la capa de
                persistencia de Marcelo y los endpoints de backend de Amin.
              </p>
              <div className="ts-cal-empty-actions">
                <p className="ck-local-note">Pedí una propuesta al agente y revisala antes de confirmar la agenda.</p>
              </div>
            </div>
          ) : (
            <div className="ts-cal-grid">
              {evaluatedInterviews.map((intItem) => {
                return (
                  <div
                    key={intItem.id}
                    className={`ts-cal-card ${intItem.hasConflict ? "is-conflict" : ""}`}
                  >
                    {intItem.hasConflict && (
                      <div className="ts-cal-conflict-strip">
                        <AlertTriangleIcon />
                        <span>{intItem.conflictReason}</span>
                      </div>
                    )}

                    <div className="ts-cal-card-body">
                      <div className="ts-cal-time-badge">
                        <ClockIcon />
                        <span>
                          {intItem.date} · {intItem.startTime} - {intItem.endTime} hs
                        </span>
                        <span className="ts-status-badge ts-status-interviewing">
                          {intItem.status}
                        </span>
                      </div>

                      <div className="ts-cal-cand-row">
                        {intItem.candidateAvatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={intItem.candidateAvatar}
                            alt=""
                            className="ts-cal-avatar"
                            aria-hidden="true"
                          />
                        )}
                        <div>
                          <h4 className="ts-cal-cand-name">{intItem.candidateName}</h4>
                          <span className="ts-cal-round-title">{intItem.round}</span>
                        </div>
                      </div>

                      <div className="ts-cal-interviewer-row">
                        <UserIcon />
                        <span>Entrevistador: <strong>{intItem.interviewer}</strong></span>
                      </div>

                      <div className="ts-cal-card-footer">
                        <button
                          type="button"
                          className="ts-btn ts-btn-outline"
                          onClick={() => onSelectCandidate(intItem.candidateId)}
                        >
                          Ver Perfil
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Historical Completed Interviews ────────────────────────────── */
        <div className="ts-cal-history-list">
          <div className="ts-cal-history-header">
            <CheckCircleIcon />
            <span>Rondas de Entrevistas Ejecutadas y Evaluadas por el Equipo (Datos Reales de Dominio)</span>
          </div>

          <div className="ts-cal-history-grid">
            {historicalRounds.map((roundItem, idx) => (
              <div key={idx} className="ts-cal-history-card">
                <div className="ts-cal-hist-top">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={roundItem.candidate.avatar}
                    alt=""
                    className="ts-cal-avatar"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="ts-cal-cand-name">{roundItem.candidate.name}</h4>
                    <span className="ts-cal-round-title">{roundItem.round}</span>
                  </div>
                  <span
                    className={`ts-interview-rating ${
                      roundItem.rating === "Strong Yes"
                        ? "ts-rating-strong-yes"
                        : roundItem.rating === "Neutral"
                        ? "ts-rating-neutral"
                        : "ts-rating-no"
                    }`}
                  >
                    {roundItem.rating}
                  </span>
                </div>

                <div className="ts-cal-hist-meta">
                  <span>📅 {roundItem.date}</span>
                  <span>👤 {roundItem.interviewer}</span>
                </div>

                <p className="ts-cal-hist-notes">&ldquo;{roundItem.notes}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legacy local form intentionally disabled: it bypassed the protected HITL route. */}
      {false && isSchedulingOpen && (
        <div className="ts-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="schedule-title">
          <div className="ts-modal-box">
            <div className="ts-modal-header">
              <div className="ts-modal-icon-wrap" aria-hidden="true">
                <CalendarIcon />
              </div>
              <div>
                <span className="ts-modal-eyebrow">Agenda de Contratación</span>
                <h3 id="schedule-title" className="ts-modal-title">
                  Programar Nueva Entrevista
                </h3>
              </div>
            </div>

            <form onSubmit={handleAddInterview}>
              <div className="ts-modal-content">
                <div className="ts-form-field">
                  <label htmlFor="cand-select">Candidato:</label>
                  <select
                    id="cand-select"
                    className="ts-input"
                    value={newCandidateId}
                    onChange={(e) => setNewCandidateId(e.target.value)}
                    required
                  >
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.appliedRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ts-form-field">
                  <label htmlFor="interviewer-select">Entrevistador:</label>
                  <select
                    id="interviewer-select"
                    className="ts-input"
                    value={newInterviewer}
                    onChange={(e) => setNewInterviewer(e.target.value)}
                    required
                  >
                    <option value="Marcelo (Product Lead)">Marcelo (Product Lead)</option>
                    <option value="Amin (Tech Lead)">Amin (Tech Lead)</option>
                    <option value="Milena (Design Systems Engineer)">Milena (Design Systems Engineer)</option>
                    <option value="Comité Ejecutivo">Comité Ejecutivo</option>
                  </select>
                </div>

                <div className="ts-form-field">
                  <label htmlFor="round-select">Tipo de Ronda:</label>
                  <input
                    id="round-select"
                    type="text"
                    className="ts-input"
                    value={newRound}
                    onChange={(e) => setNewRound(e.target.value)}
                    required
                  />
                </div>

                <div className="ts-form-row">
                  <div className="ts-form-field">
                    <label htmlFor="date-input">Fecha:</label>
                    <input
                      id="date-input"
                      type="date"
                      className="ts-input"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ts-form-field">
                    <label htmlFor="start-input">Hora Inicio:</label>
                    <input
                      id="start-input"
                      type="time"
                      className="ts-input"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ts-form-field">
                    <label htmlFor="end-input">Hora Fin:</label>
                    <input
                      id="end-input"
                      type="time"
                      className="ts-input"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <p className="ts-modal-disclaimer">
                  💡 Si programas a un entrevistador en un horario donde ya tenga otra sesión, el detector
                  visual de conflictos alertará automáticamente en pantalla.
                </p>
              </div>

              <div className="ts-modal-actions">
                <button type="submit" className="ts-btn ts-btn-primary">
                  <CheckCircleIcon /> Confirmar Cita
                </button>
                <button
                  type="button"
                  className="ts-btn ts-btn-outline"
                  onClick={() => setIsSchedulingOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
