"use client";

import { useCallback, useState, useMemo } from "react";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { GenerativeUI } from "@/components/generative-ui";
import { AppControl } from "@/components/app-control";
import {
  candidates as initialCandidates,
  findCandidate,
  TARGET_ROLE,
  Candidate,
} from "@/lib/candidates";

export default function Home() {
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(initialCandidates);
  const [selectedId, setSelectedId] = useState<string>(initialCandidates[0].id);

  // Get active candidate
  const candidate = useMemo(() => {
    return candidatesList.find((c) => c.id === selectedId) ?? candidatesList[0];
  }, [candidatesList, selectedId]);

  const selectCandidate = useCallback((id: string) => {
    const found = findCandidate(id);
    setSelectedId(found.id);
  }, []);

  const updateCandidateStatus = useCallback((id: string, newStatus: Candidate["status"]) => {
    setCandidatesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  }, []);

  // Suggestions for the CopilotChat before first message
  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "⚖️ Comparar candidatos con el budget",
          message:
            "Compara a los 3 candidatos frente al presupuesto tope de $95k y los requisitos de Lead Engineer. Muestra la matriz comparativa.",
        },
        {
          title: "🔍 Analizar fit de Sofía Albarracín",
          message:
            "Analiza el perfil de Sofía Albarracín. ¿Por qué es la principal finalista y qué opinaron los entrevistadores?",
        },
        {
          title: "⚠️ Evaluar riesgos de Lucas Varela",
          message:
            "Revisa el perfil de Lucas Varela. ¿Cuáles son los riesgos respecto a su pretensión salarial y fit cultural?",
        },
        {
          title: "📝 Proponer oferta formal para Sofía",
          message:
            "Prepara una propuesta formal de oferta para Sofía Albarracín dentro del presupuesto de $95k. Incluye bono y equity.",
        },
      ],
      available: "before-first-message",
    },
    []
  );

  // Budget calculations
  const budgetDiff = TARGET_ROLE.budgetMaxSalary - candidate.salaryNumber;
  const isWithinBudget = budgetDiff >= 0;

  return (
    <>
      <GenerativeUI />
      <AppControl
        selectedId={selectedId}
        selectCandidate={selectCandidate}
        onUpdateStatus={updateCandidateStatus}
      />

      {/* Top Navigation Bar */}
      <header className="ts-navbar">
        <div className="ts-navbar-inner">
          <div className="ts-logo-group">
            <div className="ts-logo-icon">🎯</div>
            <div>
              <h1 className="ts-logo-title">TalentScore</h1>
              <p className="ts-logo-tagline">AI Agent in your ATS & Recruiting Dashboard</p>
            </div>
          </div>

          <div className="ts-nav-role-badge">
            <span className="ts-role-dot" />
            <strong>{TARGET_ROLE.title}</strong>
            <span>· {TARGET_ROLE.department}</span>
            <span className="ts-nav-budget-pill">
              Tope: ${TARGET_ROLE.budgetMaxSalary.toLocaleString()} {TARGET_ROLE.currency}
            </span>
          </div>

          <div className="ts-nav-actions">
            <div className="ts-user-badge">
              <span className="ts-user-avatar">M</span>
              <span>Milena · Design & UI Lead</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="ts-container">
        {/* Quick Suggestion Pills */}
        <div className="ts-quick-prompts">
          <span className="ts-prompt-label">Sugerencias rápidas:</span>
          <button
            type="button"
            className="ts-prompt-chip"
            onClick={() => selectCandidate("CAND-101")}
          >
            👤 Ver Sofía (Finalista)
          </button>
          <button
            type="button"
            className="ts-prompt-chip"
            onClick={() => selectCandidate("CAND-102")}
          >
            ⚠️ Ver Lucas (+$30k)
          </button>
          <button
            type="button"
            className="ts-prompt-chip"
            onClick={() => selectCandidate("CAND-103")}
          >
            ✨ Ver Elena ($80k)
          </button>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="ts-grid-layout">
          {/* Column 1: Candidates Pipeline */}
          <aside className="ts-panel" aria-label="Pipeline de Candidatos">
            <div className="ts-panel-header">
              <h2 className="ts-panel-title">
                <span>Pipeline de Talento</span>
              </h2>
              <span className="ts-panel-count">{candidatesList.length} activos</span>
            </div>

            <div className="ts-candidate-list">
              {candidatesList.map((item) => {
                const isSelected = item.id === selectedId;
                const statusClass =
                  item.status === "Finalist"
                    ? "ts-status-finalist"
                    : item.status === "Interviewing"
                    ? "ts-status-interviewing"
                    : item.status === "Offer Extended"
                    ? "ts-status-offer"
                    : "ts-status-review";

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`ts-candidate-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => selectCandidate(item.id)}
                  >
                    <div className="ts-cand-top">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="ts-cand-avatar"
                      />
                      <div className="ts-cand-meta">
                        <div className="ts-cand-name">{item.name}</div>
                        <div className="ts-cand-role">{item.currentTitle}</div>
                      </div>
                    </div>

                    <div className="ts-cand-bottom">
                      <span className="ts-salary-tag">💰 {item.salaryExpectation}</span>
                      <span className={`ts-status-badge ${statusClass}`}>
                        {item.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Column 2: Candidate Deep Dive */}
          <section className="ts-detail-container" aria-label="Detalle del Candidato">
            {/* Hero Card */}
            <div className="ts-hero-card">
              <div className="ts-hero-glow" />
              <div className="ts-hero-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="ts-hero-avatar"
                />
                <div className="ts-hero-info">
                  <div className="ts-hero-name-row">
                    <h2 className="ts-hero-name">{candidate.name}</h2>
                    <span
                      className={`ts-status-badge ${
                        candidate.status === "Finalist"
                          ? "ts-status-finalist"
                          : candidate.status === "Interviewing"
                          ? "ts-status-interviewing"
                          : candidate.status === "Offer Extended"
                          ? "ts-status-offer"
                          : "ts-status-review"
                      }`}
                    >
                      {candidate.status}
                    </span>
                  </div>
                  <div className="ts-hero-title">{candidate.currentTitle}</div>
                  <div className="ts-hero-facts">
                    <span className="ts-hero-fact">📍 {candidate.location}</span>
                    <span className="ts-hero-fact">💼 {candidate.experienceYears} años de exp.</span>
                    <span className="ts-hero-fact">🎯 Aplicó a: {candidate.appliedRole}</span>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <div className="ts-headline-box">
                &ldquo;{candidate.headline}&rdquo;
              </div>

              {/* Salary vs Budget Indicator */}
              <div className={`ts-budget-banner ${isWithinBudget ? "is-ok" : "is-over"}`}>
                <div className="ts-budget-info">
                  <span className="ts-budget-title">
                    {isWithinBudget
                      ? "✓ Pretensión Salarial en Rango Presupuestario"
                      : "⚠️ Alerta de Compensación: Supera Presupuesto"}
                  </span>
                  <span className="ts-budget-desc">
                    Pide {candidate.salaryExpectation} · Presupuesto disponible: $
                    {TARGET_ROLE.budgetMaxSalary.toLocaleString()} {TARGET_ROLE.currency}
                  </span>
                </div>
                <span className="ts-budget-pill-large">
                  {isWithinBudget
                    ? `-$${Math.abs(budgetDiff).toLocaleString()} margen disponible`
                    : `+$${Math.abs(budgetDiff).toLocaleString()} por encima del tope`}
                </span>
              </div>

              {/* Summary & Required Skills */}
              <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", margin: "14px 0" }}>
                {candidate.summary}
              </p>

              <div className="ts-skills-section">
                <span className="ts-section-label">Habilidades y Tecnologías:</span>
                <div className="ts-skills-tags">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="ts-skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Matrix (Ratings 1-10) */}
            <div className="ts-card">
              <h3 className="ts-card-title">
                <span>Matriz de Competencias Técnicas & Liderazgo</span>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>
                  Escala 1 a 10
                </span>
              </h3>

              <div className="ts-ratings-grid">
                <div className="ts-rating-row">
                  <span className="ts-rating-label">System Design</span>
                  <div className="ts-bar-track">
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.systemDesign * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.systemDesign} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Coding & Algoritmos</span>
                  <div className="ts-bar-track">
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.coding * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.coding} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Arquitectura de Software</span>
                  <div className="ts-bar-track">
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.architecture * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.architecture} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Liderazgo y Mentoría</span>
                  <div className="ts-bar-track">
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.leadership * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.leadership} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Comunicación & Cultura</span>
                  <div className="ts-bar-track">
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.communication * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.communication} / 10</span>
                </div>
              </div>
            </div>

            {/* Pros & Red Flags */}
            <div className="ts-pros-cons-grid">
              <div className="ts-box ts-pros-box">
                <div className="ts-box-header">
                  <span>✓ Puntos Fuertes Destacados</span>
                </div>
                <ul className="ts-bullet-list">
                  {candidate.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div className="ts-box ts-cons-box">
                <div className="ts-box-header">
                  <span>⚠️ Puntos de Atención / Red Flags</span>
                </div>
                <ul className="ts-bullet-list">
                  {candidate.redFlags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Feed */}
            <div className="ts-card">
              <h3 className="ts-card-title">
                <span>Feed de Entrevistas & Feedback del Equipo</span>
                <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: "normal" }}>
                  {candidate.interviewNotes.length} rondas completadas
                </span>
              </h3>

              <div className="ts-interview-timeline">
                {candidate.interviewNotes.map((note, index) => {
                  const ratingClass =
                    note.rating === "Strong Yes"
                      ? "ts-rating-strong-yes"
                      : note.rating === "Neutral"
                      ? "ts-rating-neutral"
                      : "ts-rating-no";

                  return (
                    <div key={index} className="ts-interview-item">
                      <div className="ts-interview-header">
                        <div className="ts-interview-meta">
                          <span className="ts-interview-round">{note.round}</span>
                          <span className="ts-interview-interviewer">· por {note.interviewer}</span>
                        </div>
                        <span className={`ts-interview-rating ${ratingClass}`}>
                          {note.rating}
                        </span>
                      </div>
                      <p className="ts-interview-notes">{note.notes}</p>
                      <time className="ts-interview-date">{note.date}</time>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Column 3: Talent Copilot */}
          <aside className="ts-copilot-panel" aria-label="Asistente Copilot">
            <div className="ts-copilot-header">
              <div className="ts-copilot-title-group">
                <div className="ts-copilot-avatar">✨</div>
                <div>
                  <h3 className="ts-copilot-title">Talent Copilot</h3>
                  <p className="ts-copilot-subtitle">
                    <span className="ts-role-dot" /> Conectado al workspace
                  </p>
                </div>
              </div>
            </div>

            <CopilotChat
              className="ts-copilot-chat"
              labels={{
                welcomeMessageText: `¡Hola! Soy tu asistente de reclutamiento para la posición de ${TARGET_ROLE.title}. Estoy analizando a ${candidate.name}. ¿Qué deseas consultar o evaluar?`,
                chatInputPlaceholder: `Pregunta sobre ${candidate.name}, compara o pide una oferta…`,
              }}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
