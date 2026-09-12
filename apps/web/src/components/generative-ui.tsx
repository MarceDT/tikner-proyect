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
            <span className="ts-gate-icon">✓</span>
            <div>
              <strong>Acción registrada:</strong>
              <p>{result ? String(result) : "Completada por el usuario."}</p>
            </div>
          </div>
        );
      }
      return (
        <div className="ts-gate-card">
          <div className="ts-gate-badge">Human-in-the-Loop Gate 🔒</div>
          <h4 className="ts-gate-title">{args.action ?? "Confirmar decisión de contratación"}</h4>
          {args.candidateName && (
            <p className="ts-gate-target">
              Candidato: <strong>{args.candidateName}</strong>
            </p>
          )}
          <p className="ts-gate-impact">
            <strong>Impacto:</strong> {args.impact}
          </p>
          <div className="ts-gate-actions">
            <button
              type="button"
              className="ts-btn ts-btn-primary"
              onClick={() =>
                respond("Aprobado por el reclutador. Emite la oferta formal y actualiza el estado en el sistema.")
              }
            >
              ✓ Aprobar y Emitir Oferta Formal
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
              ✕ Rechazar o Ajustar
            </button>
          </div>
        </div>
      );
    },
  });

  return null;
}
