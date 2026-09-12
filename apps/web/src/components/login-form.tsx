"use client";

import { useState, useId, useCallback, useRef } from "react";
import { signIn } from "@/lib/auth-client";

/* ── Inline styles ────────────────────────────────────────────────────────────
 * We write scoped CSS-in-JS-style objects here so that:
 *  1. No changes to globals.css are required (the brief says purely additive).
 *  2. All tokens consumed are the same CSS variables already on :root /
 *     [data-theme], so light/dark works automatically.
 *  3. Nothing bleeds onto existing pages.
 * ─────────────────────────────────────────────────────────────────────────── */

/* ── Tiny SVG icons ──────────────────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return hidden ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
      style={{ animation: "lp-spin 0.75s linear infinite" }}
    >
      <path d="M12 2a10 10 0 010 20" opacity="0.3" />
      <path d="M12 2a10 10 0 0110 10" />
    </svg>
  );
}

/* ── Validation ──────────────────────────────────────────────────────────── */
function validateIdentifier(value: string): string {
  if (!value.trim()) return "El email es obligatorio.";
  if (!value.includes("@") || !value.includes("."))
    return "Ingresá un email válido.";
  return "";
}

function validatePassword(value: string): string {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 8) return "Mínimo 8 caracteres.";
  return "";
}

/* ── Component ──────────────────────────────────────────────────────────── */
type Status = "idle" | "pending" | "success" | "error";

export function LoginForm() {
  const uid = useId();
  const idId = `${uid}-identifier`;
  const pwId = `${uid}-password`;
  const rmId = `${uid}-remember`;
  const errId = `${uid}-form-error`;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const identifierRef = useRef<HTMLInputElement>(null);

  const validateAll = useCallback(() => {
    const next = {
      identifier: validateIdentifier(identifier),
      password: validatePassword(password),
    };
    setErrors(next);
    return !next.identifier && !next.password;
  }, [identifier, password]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError("");
      if (!validateAll()) return;

      setStatus("pending");
      try {
        const result = await signIn({ identifier, password, remember });
        if (result.ok) {
          setStatus("success");
          // Navigation / redirect is the backend's job (after real auth).
          // The coworker's signIn implementation should trigger it, e.g. via
          // router.push("/") or a server redirect on successful Set-Cookie.
        } else {
          setStatus("error");
          setFormError(result.error);
        }
      } catch {
        setStatus("error");
        setFormError("Error de red. Intentá de nuevo.");
      }
    },
    [identifier, password, remember, validateAll]
  );

  const pending = status === "pending";

  return (
    <>
      {/* Scoped keyframe for the spinner — injected once in-component */}
      <style>{`@keyframes lp-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.page}>
        <div style={styles.card} role="main">
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoMark} aria-hidden="true">
              <LogoIcon />
            </div>
            <div>
              <div style={styles.logoTitle}>TalentScore</div>
              <div style={styles.logoTagline}>
                Enterprise ATS &amp; Recruiting Intelligence
              </div>
            </div>
          </div>

          <h1 style={styles.heading}>Iniciar sesión</h1>
          <p style={styles.subheading}>
            Ingresá tus credenciales para acceder al panel.
          </p>

          {/* Success banner */}
          {status === "success" && (
            <div style={styles.successBanner} role="status" aria-live="polite">
              ✓ Autenticación exitosa. Redirigiendo…
            </div>
          )}

          {/* Form-level error */}
          {formError && (
            <div
              id={errId}
              role="alert"
              aria-live="assertive"
              style={styles.formError}
            >
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-describedby={formError ? errId : undefined}
          >
            {/* ── Email / Identifier ── */}
            <div style={styles.fieldGroup}>
              <label htmlFor={idId} style={styles.label}>
                Email
              </label>
              <input
                id={idId}
                type="email"
                autoComplete="username email"
                required
                disabled={pending || status === "success"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() =>
                  setErrors((prev) => ({
                    ...prev,
                    identifier: validateIdentifier(identifier),
                  }))
                }
                placeholder="nombre@empresa.com"
                aria-invalid={!!errors.identifier}
                aria-describedby={
                  errors.identifier ? `${idId}-err` : undefined
                }
                style={{
                  ...styles.input,
                  ...(errors.identifier ? styles.inputError : {}),
                }}
              />
              {errors.identifier && (
                <span
                  id={`${idId}-err`}
                  role="alert"
                  style={styles.fieldError}
                >
                  {errors.identifier}
                </span>
              )}
            </div>

            {/* ── Password ── */}
            <div style={styles.fieldGroup}>
              <div style={styles.labelRow}>
                <label htmlFor={pwId} style={styles.label}>
                  Contraseña
                </label>
                <a href="/forgot-password" style={styles.forgotLink} tabIndex={0}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div style={styles.passwordWrapper}>
                <input
                  id={pwId}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={pending || status === "success"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      password: validatePassword(password),
                    }))
                  }
                  placeholder="Mínimo 8 caracteres"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? `${pwId}-err` : undefined
                  }
                  style={{
                    ...styles.input,
                    paddingRight: "44px",
                    ...(errors.password ? styles.inputError : {}),
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                  style={styles.eyeBtn}
                  tabIndex={0}
                >
                  <EyeIcon hidden={showPw} />
                </button>
              </div>
              {errors.password && (
                <span
                  id={`${pwId}-err`}
                  role="alert"
                  style={styles.fieldError}
                >
                  {errors.password}
                </span>
              )}
            </div>

            {/* ── Remember me ── */}
            <div style={styles.rememberRow}>
              <input
                id={rmId}
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={pending || status === "success"}
                style={styles.checkbox}
              />
              <label htmlFor={rmId} style={styles.checkboxLabel}>
                Recordarme en este dispositivo
              </label>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={pending || status === "success"}
              aria-busy={pending}
              style={{
                ...styles.submitBtn,
                ...(pending || status === "success"
                  ? styles.submitBtnDisabled
                  : {}),
              }}
            >
              {pending ? (
                <>
                  <SpinnerIcon />
                  Verificando…
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Scoped styles (CSS-variable-aware, zero global impact) ─────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    background: "var(--ground)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)",
    padding: "36px 32px",
    boxShadow: "var(--shadow-lg)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },
  logoMark: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-md)" as string,
    background: "var(--primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    flexShrink: 0,
    boxShadow: "var(--shadow-sm)",
  },
  logoTitle: {
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--text)",
    lineHeight: 1.2,
  },
  logoTagline: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    marginTop: "2px",
  },
  heading: {
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text)",
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
  },
  subheading: {
    fontSize: "13.5px",
    color: "var(--text-secondary)",
    margin: "0 0 24px",
    lineHeight: 1.5,
  },
  successBanner: {
    background: "var(--emerald-bg)",
    border: "1px solid var(--emerald-border)",
    color: "var(--emerald-text)",
    borderRadius: "var(--radius-md)" as string,
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "16px",
  },
  formError: {
    background: "var(--rose-bg)",
    border: "1px solid var(--rose-border)",
    color: "var(--rose-text)",
    borderRadius: "var(--radius-md)" as string,
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    marginBottom: "16px",
  },
  labelRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text)",
  },
  forgotLink: {
    fontSize: "12px",
    color: "var(--primary)",
    textDecoration: "none",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    background: "var(--surface-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)" as string,
    fontSize: "14px",
    color: "var(--text)",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  inputError: {
    borderColor: "var(--rose)",
    boxShadow: "0 0 0 2px var(--rose-bg)",
  },
  passwordWrapper: {
    position: "relative" as const,
  },
  eyeBtn: {
    position: "absolute" as const,
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "var(--muted)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-xs)" as string,
  },
  fieldError: {
    fontSize: "12px",
    color: "var(--rose-text)",
    fontWeight: 500,
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  checkbox: {
    width: "15px",
    height: "15px",
    accentColor: "var(--primary)",
    cursor: "pointer",
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  submitBtn: {
    width: "100%",
    padding: "10px 16px",
    background: "var(--primary)",
    color: "#ffffff",
    border: "1px solid var(--primary)",
    borderRadius: "var(--radius-md)" as string,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "42px",
    transition: "background 0.15s ease, opacity 0.15s ease",
    letterSpacing: "-0.01em",
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed" as const,
  },
};
