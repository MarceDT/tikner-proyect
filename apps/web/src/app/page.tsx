"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
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

/* ── Clean Corporate SVG Icons ───────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0a5 5 0 00-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.5 1A1.5 1.5 0 005 2.5V4H2.5A1.5 1.5 0 001 5.5v7A1.5 1.5 0 002.5 14h11a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0013.5 4H11V2.5A1.5 1.5 0 009.5 1h-3zM6 2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4H6V2.5z" />
    </svg>
  );
}

function RoleBadgeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 2a5 5 0 110 10A5 5 0 018 3zm0 3a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 008 5zm0 7a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7.53 1.282a.5.5 0 01.94 0l1.19 3.662a.5.5 0 00.375.326l3.847.559a.5.5 0 01.277.853l-2.784 2.714a.5.5 0 00-.144.442l.657 3.832a.5.5 0 01-.725.527L7.72 12.18a.5.5 0 00-.44 0l-3.447 2.017a.5.5 0 01-.725-.527l.657-3.832a.5.5 0 00-.144-.442L.882 6.682a.5.5 0 01.277-.853l3.847-.559a.5.5 0 00.375-.326L7.53 1.282z" />
    </svg>
  );
}

function UserGroupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zM5.5 5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm-3.5 9s-.5 0-.5-.5 1-3 4-3c.8 0 1.5.15 2.1.42-.56.76-.85 1.7-.85 2.58H2z" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M.5 3.5A1.5 1.5 0 012 2h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0114 14H2a1.5 1.5 0 01-1.5-1.5v-9zm1.5 0v9h12v-9H2zm6 5.38L2.72 5.06l.86-1.12L8 7.3l4.42-3.36.86 1.12L8 8.88z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 12l-4-4h2.5V1h3v7H12L8 12zM2 14v-2H1v3h14v-3h-1v2H2z" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0-2.5-3-4-6-4s-6 1.5-6 4v1h12v-1z" />
    </svg>
  );
}

export default function Home() {
  const [candidatesList, setCandidatesList] = useState<Candidate[]>(initialCandidates);
  const [selectedId, setSelectedId] = useState<string>(initialCandidates[0].id);
  const [mobileTab, setMobileTab] = useState<"detail" | "pipeline" | "copilot">("detail");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  // New State for Visual Workflow
  const [mainView, setMainView] = useState<"inbox" | "workspace">("inbox");
  const [shortlistIds, setShortlistIds] = useState<Set<string>>(new Set());
  const [shortlistApproved, setShortlistApproved] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "done">("idle");

  // ── Pop-click spring animation ───────────────────────────────────────────
  // Delegated from document: finds the closest pop-click target on mousedown,
  // then applies .is-popping on release so the spring CSS fires exactly once.
  // Skips nested interactive elements (buttons, links, inputs inside a card).
  // Respects prefers-reduced-motion.
  useEffect(() => {
    const POP_SELECTORS =
      ".ts-candidate-item,.ts-card,.ts-hero-card,.ts-prompt-chip,.ts-btn,.ts-theme-toggle,.ts-mobile-tab-btn";
    const INNER_INTERACTIVE = "a,button,input,select,textarea,[role='button']";

    let target: Element | null = null;

    function findPopTarget(el: EventTarget | null): Element | null {
      if (!(el instanceof Element)) return null;
      // If the direct click was on an inner interactive inside a card, skip.
      const innerEl = el.closest(INNER_INTERACTIVE);
      const card = el.closest(POP_SELECTORS);
      if (!card) return null;
      // Allow if the card itself IS the interactive element (e.g. ts-candidate-item is a button)
      if (innerEl && innerEl !== card) return null;
      return card;
    }

    function onPress(e: MouseEvent | TouchEvent) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      target = findPopTarget(e.target);
      if (target) {
        // Remove any in-flight animation so rapid clicks restart cleanly.
        target.classList.remove("is-popping");
        // Force reflow to restart animation
        void (target as HTMLElement).offsetWidth;
      }
    }

    function onRelease() {
      if (!target) return;
      const el = target;
      target = null;
      el.classList.add("is-popping");
      el.addEventListener(
        "animationend",
        () => {
          el.classList.remove("is-popping");
        },
        { once: true }
      );
    }

    document.addEventListener("mousedown", onPress, { passive: true });
    document.addEventListener("touchstart", onPress, { passive: true });
    document.addEventListener("mouseup", onRelease, { passive: true });
    document.addEventListener("touchend", onRelease, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onPress);
      document.removeEventListener("touchstart", onPress);
      document.removeEventListener("mouseup", onRelease);
      document.removeEventListener("touchend", onRelease);
    };
  }, []);

  // Sync theme with localStorage and documentElement on mount

  useEffect(() => {
    try {
      const saved = localStorage.getItem("talentscore_theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        // Default is light per requirement; only use system preference if dark preferred
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.setAttribute("data-theme", initial);
      }
    } catch {
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("talentscore_theme", next);
      } catch {
        // ignore
      }
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  // Get active candidate
  const candidate = useMemo(() => {
    return candidatesList.find((c) => c.id === selectedId) ?? candidatesList[0];
  }, [candidatesList, selectedId]);

  const selectCandidate = useCallback((id: string) => {
    const found = findCandidate(id);
    setSelectedId(found.id);
  }, []);

  const handleCandidateSelection = useCallback((id: string) => {
    selectCandidate(id);
    setMobileTab("detail");
  }, [selectCandidate]);

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
          title: "Comparar candidatos con el budget ($95k)",
          message:
            "Compara a los 3 candidatos frente al presupuesto tope de $95k y los requisitos de Lead Engineer. Muestra la matriz comparativa.",
        },
        {
          title: "Analizar perfil de Sofía Albarracín",
          message:
            "Analiza el perfil de Sofía Albarracín. ¿Por qué es la principal finalista y qué opinaron los entrevistadores?",
        },
        {
          title: "Evaluar riesgos salariales de Lucas Varela",
          message:
            "Revisa el perfil de Lucas Varela. ¿Cuáles son los riesgos respecto a su pretensión salarial y fit cultural?",
        },
        {
          title: "Proponer oferta formal para Sofía",
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
        shortlistApproved={shortlistApproved}
        shortlistIds={shortlistIds}
        onExportStart={() => {
          setExportStatus("exporting");
          setTimeout(() => setExportStatus("done"), 1500);
        }}
      />

      {/* Top Navigation Bar */}
      <header className="ts-navbar">
        <div className="ts-navbar-inner">
          <div className="ts-logo-group">
            <div className="ts-logo-mark" aria-hidden="true">
              <LogoIcon />
            </div>
            <div>
              <h1 className="ts-logo-title">TalentScore</h1>
              <p className="ts-logo-tagline">Enterprise ATS & Recruiting Intelligence</p>
            </div>
          </div>

          <div className="ts-nav-role-badge">
            <span className="ts-role-dot" aria-hidden="true" />
            <strong>{TARGET_ROLE.title}</strong>
            <span>· {TARGET_ROLE.department}</span>
            <span className="ts-nav-budget-pill">
              Tope: ${TARGET_ROLE.budgetMaxSalary.toLocaleString()} {TARGET_ROLE.currency}
            </span>
          </div>

          <div className="ts-nav-actions">
            {/* View Toggle */}
            <div className="ts-view-toggle">
              <button
                type="button"
                className={`ts-toggle-btn ${mainView === "inbox" ? "is-active" : ""}`}
                onClick={() => setMainView("inbox")}
              >
                <InboxIcon /> Bandeja
              </button>
              <button
                type="button"
                className={`ts-toggle-btn ${mainView === "workspace" ? "is-active" : ""}`}
                onClick={() => setMainView("workspace")}
              >
                <ProfileIcon /> Workspace
              </button>
            </div>

            {/* Accessible Theme Toggle */}
            <button
              type="button"
              className="ts-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
              title={`Cambiar a modo ${theme === "light" ? "oscuro" : "claro"}`}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
              <span>{theme === "light" ? "Oscuro" : "Claro"}</span>
            </button>

            <div className="ts-user-badge">
              <span className="ts-user-avatar" aria-hidden="true">M</span>
              <span>Milena · Lead UI & Product</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="ts-container">
        {mainView === "inbox" ? (
          <div className="ts-inbox-view">
            <div className="ts-inbox-header">
              <h2>Bandeja de Entrada Simulada</h2>
              <span className="ts-badge-simulated">Integración de Correo Simulada</span>
            </div>
            <p className="ts-inbox-desc">
              Estos correos representan aplicaciones extraídas automáticamente por la IA.
            </p>
            <div className="ts-inbox-list">
              {candidatesList.map((c) => (
                <div key={c.id} className="ts-inbox-item">
                  <div className="ts-inbox-meta">
                    <span className="ts-inbox-sender">{c.name.toLowerCase().replace(" ", ".")}@example.com</span>
                    <span className="ts-inbox-date">Hoy, 10:30 AM</span>
                  </div>
                  <div className="ts-inbox-subject">Aplicación para Lead Engineer: {c.name}</div>
                  <div className="ts-inbox-attachment">
                    <DownloadIcon /> CV_{c.name.replace(" ", "_")}.pdf
                  </div>
                  <div className="ts-inbox-status">
                    <span className="ts-status-badge ts-status-finalist">Extracción Completa</span>
                    <button className="ts-btn ts-btn-outline" onClick={() => {
                      setSelectedId(c.id);
                      setMainView("workspace");
                    }}>
                      Ver en Workspace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Segmented View Controller (Visible < 840px) */}
        <div className="ts-mobile-tabs" role="tablist" aria-label="Vistas del espacio de trabajo">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "detail"}
            className={`ts-mobile-tab-btn ${mobileTab === "detail" ? "is-active" : ""}`}
            onClick={() => setMobileTab("detail")}
          >
            <ProfileIcon /> Perfil
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "pipeline"}
            className={`ts-mobile-tab-btn ${mobileTab === "pipeline" ? "is-active" : ""}`}
            onClick={() => setMobileTab("pipeline")}
          >
            <UserGroupIcon /> Pipeline
            <span className="ts-mobile-tab-count">{candidatesList.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === "copilot"}
            className={`ts-mobile-tab-btn ${mobileTab === "copilot" ? "is-active" : ""}`}
            onClick={() => setMobileTab("copilot")}
          >
            <SparklesIcon /> Copilot
          </button>
        </div>

        {/* Quick Candidates Selector Bar */}
        <div className="ts-quick-prompts-bar">
          <div className="ts-quick-prompts" aria-label="Acceso rápido a candidatos">
            <span className="ts-prompt-label">Candidatos:</span>
            {candidatesList.map((item) => {
              const isSelected = item.id === selectedId;
              const isOver = item.salaryNumber > TARGET_ROLE.budgetMaxSalary;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`ts-prompt-chip ${isSelected ? "is-active" : ""}`}
                  onClick={() => handleCandidateSelection(item.id)}
                  aria-pressed={isSelected}
                >
                  <span>{item.name}</span>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>
                    {isOver ? `(+$${(item.salaryNumber - TARGET_ROLE.budgetMaxSalary) / 1000}k)` : `(${item.status})`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Responsive Grid with Mobile View Filter */}
        <div className={`ts-grid-layout ts-view-${mobileTab}`}>
          {/* Column 1: Candidates Pipeline */}
          <aside className="ts-panel" aria-label="Pipeline de Candidatos">
            <div className="ts-panel-header">
              <h2 className="ts-panel-title">
                <UserGroupIcon />
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
                  <div key={item.id} className="ts-candidate-item-wrapper">
                    <input
                      type="checkbox"
                      className="ts-shortlist-checkbox"
                      checked={shortlistIds.has(item.id)}
                      onChange={(e) => {
                        const next = new Set(shortlistIds);
                        if (e.target.checked) next.add(item.id);
                        else next.delete(item.id);
                        setShortlistIds(next);
                      }}
                      title="Agregar a Shortlist"
                    />
                    <button
                      type="button"
                      className={`ts-candidate-item ${isSelected ? "is-selected" : ""}`}
                      onClick={() => handleCandidateSelection(item.id)}
                      aria-current={isSelected ? "true" : undefined}
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
                        <span className="ts-salary-tag">{item.salaryExpectation}</span>
                        <span className={`ts-status-badge ${statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Column 2: Candidate Deep Dive */}
          <section
            key={candidate.id}
            className="ts-detail-container ts-detail-animated"
            aria-label="Detalle del Candidato"
          >
            {/* Candidate Header Profile Card */}
            <div className="ts-hero-card">
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
                    <span className="ts-hero-fact">
                      <LocationIcon /> {candidate.location}
                    </span>
                    <span className="ts-hero-fact">
                      <BriefcaseIcon /> {candidate.experienceYears} años de exp.
                    </span>
                    <span className="ts-hero-fact">
                      <RoleBadgeIcon /> Aplicó a: {candidate.appliedRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline */}
              <blockquote className="ts-headline-box">
                &ldquo;{candidate.headline}&rdquo;
              </blockquote>

              {/* Salary vs Budget Indicator */}
              <div className={`ts-budget-banner ${isWithinBudget ? "is-ok" : "is-over"}`}>
                <div className="ts-budget-info">
                  <span className="ts-budget-title">
                    {isWithinBudget ? (
                      <>
                        <CheckIcon /> Pretensión Salarial en Rango Presupuestario
                      </>
                    ) : (
                      <>
                        <AlertIcon /> Alerta de Compensación: Supera Presupuesto
                      </>
                    )}
                  </span>
                  <span className="ts-budget-desc">
                    Pretensión: {candidate.salaryExpectation} · Presupuesto tope disponible: $
                    {TARGET_ROLE.budgetMaxSalary.toLocaleString()} {TARGET_ROLE.currency}
                  </span>
                </div>
                <span className="ts-budget-pill-large">
                  {isWithinBudget
                    ? `-$${Math.abs(budgetDiff).toLocaleString()} margen disponible`
                    : `+$${Math.abs(budgetDiff).toLocaleString()} por encima del tope`}
                </span>
              </div>

              {/* Summary */}
              <p className="ts-candidate-summary-text">
                {candidate.summary}
              </p>

              {/* Required Skills */}
              <div className="ts-skills-section">
                <span className="ts-section-heading">Competencias Principales:</span>
                <div className="ts-skills-tags">
                  {candidate.skills.map((skill) => (
                    <span key={skill} className="ts-skill-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Competency Matrix (Ratings 1-10) */}
            <div className="ts-card">
              <h3 className="ts-card-title">
                <span>Matriz de Competencias Técnicas & Liderazgo</span>
                <span className="ts-card-badge">Escala 1 a 10</span>
              </h3>

              <div className="ts-ratings-grid">
                <div className="ts-rating-row">
                  <span className="ts-rating-label">System Design</span>
                  <div className="ts-bar-track" role="progressbar" aria-valuenow={candidate.ratings.systemDesign} aria-valuemin={1} aria-valuemax={10}>
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.systemDesign * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.systemDesign} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Coding & Algoritmos</span>
                  <div className="ts-bar-track" role="progressbar" aria-valuenow={candidate.ratings.coding} aria-valuemin={1} aria-valuemax={10}>
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.coding * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.coding} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Arquitectura de Software</span>
                  <div className="ts-bar-track" role="progressbar" aria-valuenow={candidate.ratings.architecture} aria-valuemin={1} aria-valuemax={10}>
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.architecture * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.architecture} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Liderazgo & Mentoría</span>
                  <div className="ts-bar-track" role="progressbar" aria-valuenow={candidate.ratings.leadership} aria-valuemin={1} aria-valuemax={10}>
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.leadership * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.leadership} / 10</span>
                </div>

                <div className="ts-rating-row">
                  <span className="ts-rating-label">Comunicación & Cultura</span>
                  <div className="ts-bar-track" role="progressbar" aria-valuenow={candidate.ratings.communication} aria-valuemin={1} aria-valuemax={10}>
                    <div
                      className="ts-bar-fill"
                      style={{ width: `${candidate.ratings.communication * 10}%` }}
                    />
                  </div>
                  <span className="ts-rating-value">{candidate.ratings.communication} / 10</span>
                </div>
              </div>
            </div>

            {/* Strengths & Red Flags */}
            <div className="ts-pros-cons-grid">
              <div className="ts-box ts-pros-box">
                <div className="ts-box-header">
                  <CheckIcon />
                  <span>Fortalezas Destacadas</span>
                </div>
                <ul className="ts-bullet-list">
                  {candidate.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>

              <div className="ts-box ts-cons-box">
                <div className="ts-box-header">
                  <AlertIcon />
                  <span>Puntos de Atención / Riesgos</span>
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
                <span className="ts-card-badge">
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
                          <span className="ts-interview-interviewer">· entrevistador: {note.interviewer}</span>
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

            {/* Export & Approval Gate (HitL) */}
            {shortlistIds.size > 0 && (
              <div className="ts-card ts-export-card">
                <div className="ts-box-header">
                  <DownloadIcon />
                  <span>Compuerta de Exportación (Shortlist Activa: {shortlistIds.size})</span>
                </div>
                <div style={{ padding: "16px", background: "var(--surface-hover)", borderRadius: "6px", marginTop: "12px", border: "1px solid var(--border)" }}>
                  <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--foreground-muted)" }}>
                    La exportación de datos y la confirmación de la shortlist requieren aprobación humana explícita.
                  </p>
                  
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {!shortlistApproved ? (
                      <button 
                        className="ts-btn" 
                        onClick={() => setShortlistApproved(true)}
                      >
                        <CheckIcon /> Aprobar Selección
                      </button>
                    ) : (
                      <>
                        <button 
                          className="ts-btn ts-btn-outline" 
                          disabled={exportStatus === "exporting"}
                          onClick={() => {
                            setExportStatus("exporting");
                            setTimeout(() => setExportStatus("done"), 1500);
                          }}
                        >
                          <DownloadIcon /> {exportStatus === "exporting" ? "Generando PDF..." : "Exportar Dossier PDF"}
                        </button>
                        <button 
                          className="ts-btn ts-btn-outline"
                          disabled={exportStatus === "exporting"}
                        >
                          Exportar a Excel
                        </button>
                        {exportStatus === "done" && (
                          <span style={{ color: "var(--color-emerald)", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckIcon /> Exportado
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Column 3: Talent Copilot Panel */}
          <aside className="ts-copilot-panel" aria-label="Asistente Talent Copilot">
            <div className="ts-copilot-header">
              <div className="ts-copilot-title-group">
                <div className="ts-copilot-icon" aria-hidden="true">
                  <SparklesIcon />
                </div>
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
                welcomeMessageText: `Hola. Asistente activo para ${TARGET_ROLE.title}. Estoy analizando a ${candidate.name}. ¿Deseas evaluar su fit, comparar candidatos o preparar una oferta?`,
                chatInputPlaceholder: `Consulta sobre ${candidate.name}, compara o redacta una oferta…`,
              }}
            />
          </aside>
        </div>
        </>
        )}
      </main>
    </>
  );
}
