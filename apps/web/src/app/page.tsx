"use client";

import { useCallback, useState } from "react";
import {
  CopilotChat,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { GenerativeUI } from "@/components/generative-ui";
import { AppControl } from "@/components/app-control";
import { candidates, getOrFirstCandidate, TARGET_ROLE } from "@/lib/candidates";
import { useWorkplace } from "@/lib/use-workplace";
import { WorkplaceFollowups } from "@/components/workplace-followups";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(candidates[0].id);
  const workplace = useWorkplace(selectedId);
  const candidate = getOrFirstCandidate(selectedId);

  const selectCandidate = useCallback((id: string) => {
    const found = getOrFirstCandidate(id);
    setSelectedId(found.id);
  }, []);

  useConfigureSuggestions(
    {
      suggestions: [
        {
          title: "¿Es Sofía la indicada?",
          message:
            "Analiza a Sofía Albarracín para el puesto de Lead Fullstack. ¿Cómo se comparan sus pretensiones salariales con el presupuesto de $95k y cuál es el feedback de las entrevistas?",
        },
        {
          title: "Comparar con Lucas Varela",
          message:
            "Compara a Sofía con Lucas Varela. ¿Vale la pena considerar a Lucas a pesar de que pide $125k ($30k por encima del presupuesto)?",
        },
        {
          title: "Preparar Oferta Formal",
          message:
            "Genera una propuesta formal de oferta salarial para el candidato seleccionado considerando el tope presupuestario y paquete de beneficios.",
        },
      ],
      available: "before-first-message",
    },
    [],
  );

  const isOverBudget = candidate.salaryNumber > TARGET_ROLE.budgetMaxSalary;
  const budgetDiff = TARGET_ROLE.budgetMaxSalary - candidate.salaryNumber;

  return (
    <>
      <GenerativeUI />
      <AppControl
        selectedId={selectedId}
        selectCandidate={selectCandidate}
        selectIncident={selectCandidate}
        workplace={workplace}
      />
      <main className="ck-workspace">
        <header className="ck-workspace-header">
          <div>
            <p className="ck-eyebrow">TalentScore · ATS Inteligente &amp; People Ops</p>
            <h1>Evaluación y Ofertas de Talento</h1>
            <p className="ck-intro">
              Vacante objetivo: <strong>{TARGET_ROLE.title}</strong> · Presupuesto departamental: <strong>${TARGET_ROLE.budgetMaxSalary.toLocaleString("en-US")} USD/año</strong>
            </p>
          </div>
          <span className="ck-tag">AI Tinkerers Hackathon 2026</span>
        </header>

        <div className="ck-workspace-grid">
          <section className="ck-panel" aria-labelledby="candidate-profile-title">
            {/* Selector de Candidatos */}
            <div className="ck-incident-picker">
              <label htmlFor="candidate-select">Candidato evaluado:</label>
              <select
                id="candidate-select"
                value={selectedId}
                onChange={(event) => selectCandidate(event.target.value)}
              >
                {candidates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id} · {item.name} — {item.salaryExpectation} ({item.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Ficha Principal del Candidato */}
            <div className="ck-detail">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <span className="ck-status-label" style={{ marginBottom: "0.5rem" }}>{candidate.status}</span>
                  <h2 id="candidate-profile-title" style={{ fontSize: "1.75rem", margin: "0.25rem 0" }}>
                    {candidate.name}
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem", margin: 0 }}>
                    {candidate.currentTitle} · {candidate.location} · {candidate.experienceYears} años de experiencia
                  </p>
                </div>
                {/* Badge de presupuesto */}
                <div style={{
                  padding: "0.5rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textAlign: "right",
                  background: isOverBudget ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                  color: isOverBudget ? "#f87171" : "#4ade80",
                  border: isOverBudget ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(34, 197, 94, 0.3)"
                }}>
                  <div>Pretensión: {candidate.salaryExpectation}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                    {isOverBudget
                      ? `⚠️ Excede tope por $${Math.abs(budgetDiff).toLocaleString("en-US")} USD`
                      : `✓ Margen a favor: +$${budgetDiff.toLocaleString("en-US")} USD`}
                  </div>
                </div>
              </div>

              <p style={{ fontStyle: "italic", marginTop: "1rem", color: "#cbd5e1" }}>
                &ldquo;{candidate.headline}&rdquo;
              </p>
              <p>{candidate.summary}</p>

              {/* Habilidades */}
              <div style={{ marginTop: "1rem" }}>
                <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  Habilidades Clave:
                </strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
                  {candidate.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem"
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Desplegable de Notas de Entrevista y Métricas */}
              <details className="ck-more" key={candidate.id} style={{ marginTop: "1.25rem" }}>
                <summary>📊 Ver Calificaciones Técnicas y Rondas de Entrevista</summary>
                
                {/* Calificaciones Radar / Scorecard */}
                <h3 style={{ marginTop: "1rem" }}>Evaluación Técnica &amp; Competencias (1 al 10)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.5rem", margin: "0.75rem 0" }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>System Design</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#38bdf8" }}>{candidate.ratings.systemDesign} / 10</div>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Live Coding</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#38bdf8" }}>{candidate.ratings.coding} / 10</div>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Arquitectura</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#38bdf8" }}>{candidate.ratings.architecture} / 10</div>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Liderazgo</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#a855f7" }}>{candidate.ratings.leadership} / 10</div>
                  </div>
                  <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "0.5rem", borderRadius: "6px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Comunicación</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#a855f7" }}>{candidate.ratings.communication} / 10</div>
                  </div>
                </div>

                {/* Pros y Red Flags */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1rem 0" }}>
                  <div style={{ background: "rgba(34, 197, 94, 0.08)", padding: "0.75rem", borderRadius: "8px", borderLeft: "3px solid #22c55e" }}>
                    <strong style={{ color: "#4ade80", fontSize: "0.85rem" }}>✓ Puntos Fuertes (Pros):</strong>
                    <ul style={{ margin: "0.4rem 0 0 1rem", padding: 0, fontSize: "0.85rem", color: "#cbd5e1" }}>
                      {candidate.pros.map((p, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: "rgba(239, 68, 68, 0.08)", padding: "0.75rem", borderRadius: "8px", borderLeft: "3px solid #ef4444" }}>
                    <strong style={{ color: "#f87171", fontSize: "0.85rem" }}>⚠️ Alertas / Riesgos (Red Flags):</strong>
                    <ul style={{ margin: "0.4rem 0 0 1rem", padding: 0, fontSize: "0.85rem", color: "#cbd5e1" }}>
                      {candidate.redFlags.map((rf, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Timeline de Entrevistas */}
                <h3>Rondas de Entrevista con el Equipo</h3>
                <ol className="ck-timeline">
                  {candidate.interviewNotes.map((note) => (
                    <li key={note.round}>
                      <time>{note.date}</time>
                      <div>
                        <strong>{note.round} — {note.interviewer} ({note.rating})</strong>
                        <p>{note.notes}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </details>
            </div>

            {/* Puerta de Aprobación Human-in-the-Loop de Marcelo */}
            <WorkplaceFollowups candidateId={selectedId} workplace={workplace} />
          </section>

          {/* Panel Lateral: Asistente CopilotChat */}
          <section
            className="ck-panel ck-assistant"
            aria-labelledby="assistant-title"
          >
            <header className="ck-assistant-header">
              <h2 id="assistant-title">Copiloto TalentScore</h2>
              <p>Analiza el candidato seleccionado, compara métricas y propone ofertas formales.</p>
            </header>
            <CopilotChat
              className="ck-chat"
              labels={{
                welcomeMessageText: "Hola, soy TalentScore. ¿Qué candidato deseas evaluar o comparar hoy?",
                chatInputPlaceholder: "Pregunta sobre este candidato o pide una oferta…",
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}
