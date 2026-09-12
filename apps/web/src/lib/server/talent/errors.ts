/** Errores de dominio del pipeline de talento. `status` es el código HTTP sugerido. */
export class TalentError extends Error {
  /** Marcador estructural: en Next dev el singleton puede venir de otro chunk y `instanceof` falla. */
  readonly talentError = true as const;
  constructor(
    message: string,
    readonly status: number = 400,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export function isTalentError(error: unknown): error is TalentError {
  return (
    error instanceof Error &&
    (error as Partial<TalentError>).talentError === true &&
    typeof (error as Partial<TalentError>).status === "number"
  );
}

export class NotFoundError extends TalentError {
  constructor(what: string, id: string) {
    super(`${what} '${id}' no encontrado.`, 404);
  }
}

/** La exportación requiere una aprobación humana registrada en el reporte. */
export class ApprovalRequiredError extends TalentError {
  constructor(reportId: string, currentStatus: string) {
    super(
      `El reporte '${reportId}' no puede exportarse: su aprobación está en estado '${currentStatus}'. Un humano debe aprobarlo primero.`,
      409,
    );
  }
}

export class NotConfiguredError extends TalentError {
  constructor(what: string) {
    super(what, 503);
  }
}
