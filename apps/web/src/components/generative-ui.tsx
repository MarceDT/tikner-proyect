"use client";

/**
 * TalentScore — Generative UI (Workspace de Milena)
 *
 * Registra componentes visuales ricos que el agente Copilot puede invocar
 * dinámicamente en el chat o en la pantalla.
 */
import { useComponent, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

import {
  CandidateComparisonCard,
  OfferProposalCard,
} from "./candidate-cards";

function ShieldLockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 .5c-.27 0-.528.14-.675.372l-5 8A.75.75 0 003 10h2.25v4.25a.75.75 0 001.5 0V10h2.5a.75.75 0 00.675-1.128l-1.25-2 1.25-2A.75.75 0 009.425 4H8.75V1.25A.75.75 0 008 .5z" />
      <path d="M8 1a5 5 0 00-5 5v1h10V6a5 5 0 00-5-5zm-3.5 6V6a3.5 3.5 0 117 0v1h-7z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
    </svg>
  );
}

export function GenerativeUI() {
  /**
   * 1. candidate_comparison:
   * Permite al agente proyectar una matriz comparativa entre varios candidatos,
   * evaluando sus pretensiones salariales frente al budget de $95k, fortalezas y veredicto.
   */
  useComponent({
    name: "candidate_comparison",
    description:
      "Dibuja una matriz comparativa visual entre candidatos para el rol objetivo. Invócalo cuando el usuario pida comparar candidatos, analizar opciones o revisar quién encaja mejor con el presupuesto y requisitos.",
    parameters: z.object({
      title: z.string().default("Comparativa de Candidatos vs Rol Objetivo"),
      roleTarget: z.string().default("Lead Fullstack & AI Systems Engineer"),
      budgetCap: z.string().default("$95,000 USD"),
      candidates: z.array(
        z.object({
          name: z.string().describe("Nombre completo del candidato"),
          matchScore: z.number().min(0).max(100).optional().describe("Porcentaje estimado de match (0-100)"),
          salary: z.string().describe("Pretensión salarial (ej. $92,000 / año)"),
          withinBudget: z.boolean().describe("true si está dentro del tope de $95k, false si lo excede"),
          strengths: z.array(z.string()).describe("1 a 3 fortalezas técnicas o de equipo"),
          concerns: z.array(z.string()).describe("Riesgos, banderas rojas o diferencias presupuestarias"),
          verdict: z.string().describe("Veredicto o síntesis del agente para este candidato"),
        })
      ),
      recommendation: z.string().optional().describe("Recomendación final consolidada del agente"),
    }),
    render: CandidateComparisonCard,
  });

  /**
   * 2. offer_proposal:
   * Permite al agente proyectar una propuesta formal de oferta para el candidato seleccionado,
   * con desglose financiero, beneficios y justificación antes de enviarla.
   */
  useComponent({
    name: "offer_proposal",
    description:
      "Dibuja un desglose detallado de propuesta de oferta formal para un candidato (salario base, bono de firma, equity, beneficios y fecha de inicio). Invócalo al preparar o sugerir una oferta.",
    parameters: z.object({
      candidateName: z.string().describe("Nombre del candidato a quien se le ofrece la posición"),
      roleTitle: z.string().default("Lead Fullstack & AI Systems Engineer"),
      department: z.string().default("Product Engineering"),
      baseSalary: z.string().describe("Salario base anual propuesto (ej. $92,000 USD / año)"),
      salaryVsBudget: z.string().describe("Comparativa con el presupuesto (ej. Dentro del presupuesto (-$3,000))"),
      signingBonus: z.string().optional().describe("Bono único de firma si aplica"),
      equity: z.string().optional().describe("Porcentaje de acciones o stock options"),
      startDate: z.string().optional().describe("Fecha tentativa de inicio"),
      benefits: z.array(z.string()).optional().describe("Beneficios destacados incluidos"),
      justification: z.string().optional().describe("Justificación técnica y económica de la oferta"),
    }),
    render: OfferProposalCard,
  });

  /**
   * 3. propose_action (Human-in-the-Loop):
   * Compuerta de aprobación para acciones críticas de contratación.
   * El agente NUNCA ejecuta una oferta o cambio legal sin la confirmación explícita del reclutador.
   */
  useHumanInTheLoop({
    name: "propose_action",
    description:
      "Solicita aprobación humana antes de realizar cualquier acción crítica (enviar oferta formal, cambiar estado a contratado o rechazar). Invócalo siempre antes de emitir decisiones.",
    parameters: z.object({
      action: z.string().describe("La acción crítica que se va a ejecutar en una frase clara."),
      candidateName: z.string().optional().describe("Candidato afectado por la acción."),
      impact: z.string().describe("Consecuencias de la acción (financieras, legales o de pipeline)."),
    }),
    render: ({ args, respond, result }) => {
      if (!respond) {
        return (
          <div className="ts-gate-card ts-gate-completed">
            <span className="ts-gate-icon">
              <CheckIcon />
            </span>
            <div>
              <strong>Acción confirmada:</strong>
              <p style={{ margin: "2px 0 0", color: "var(--text-secondary)" }}>
                {result ? String(result) : "Completada por el reclutador."}
              </p>
            </div>
          </div>
        );
      }
      return (
        <div className="ts-gate-card">
          <div className="ts-gate-badge">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <ShieldLockIcon /> Human-in-the-Loop Gate
            </span>
          </div>
          <h4 className="ts-gate-title">{args.action ?? "Confirmar decisión de contratación"}</h4>
          {args.candidateName && (
            <p className="ts-gate-target">
              Candidato evaluado: <strong>{args.candidateName}</strong>
            </p>
          )}
          <div className="ts-gate-impact">
            <strong>Impacto en Pipeline:</strong> {args.impact}
          </div>
          <div className="ts-gate-actions">
            <button
              type="button"
              className="ts-btn ts-btn-primary"
              onClick={() =>
                respond("Aprobado por el reclutador. Emite la oferta formal y actualiza el estado en el sistema.")
              }
            >
              <CheckIcon /> Aprobar y Emitir Oferta Formal
            </button>
            <button
              type="button"
              className="ts-btn ts-btn-outline"
              onClick={() =>
                respond(
                  "El reclutador declinó la acción. No modifiques ningún registro ni envíes comunicaciones, y explica qué cambios se requieren."
                )
              }
            >
              <CloseIcon /> Rechazar o Ajustar
            </button>
          </div>
        </div>
      );
    },
  });

  return null;
}
