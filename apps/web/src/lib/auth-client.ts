/**
 * auth-client.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Auth seam: one async function that the component calls for sign-in.
 *
 * COWORKER HANDOFF ─────────────────────────────────────────────────────────
 * Replace the body of `signIn` below with the real network request.
 * The function contract (inputs / return shape) must stay the same.
 *
 * • On success  → resolve with { ok: true }
 * • On failure  → resolve with { ok: false, error: "<user-facing message>" }
 *   (reject / throw only for truly unexpected errors)
 *
 * Do NOT persist tokens or credentials here — leave session handling to the
 * server response (Set-Cookie, etc.).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SignInParams {
  /** Email address or username entered by the user. */
  identifier: string;
  /** Plain-text password — never stored, passed straight to the request. */
  password: string;
  /** Whether the user checked "Remember me". Forward to the server. */
  remember: boolean;
}

export type SignInResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * STUB — Replace this function body with the real authentication request.
 *
 * Example replacement:
 *
 *   const res = await fetch("/api/auth/sign-in", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     credentials: "include",           // send/receive cookies
 *     body: JSON.stringify(params),
 *   });
 *   if (res.ok) return { ok: true };
 *   const { message } = await res.json().catch(() => ({}));
 *   return { ok: false, error: message ?? "Credenciales incorrectas." };
 */
export async function signIn(params: SignInParams): Promise<SignInResult> {
  // ── STUB: simulate network latency ────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 1200));

  // Demo: any "@" email with password >= 8 chars succeeds, everything else fails.
  // REMOVE this block entirely when wiring up the real backend.
  if (params.identifier.includes("@") && params.password.length >= 8) {
    return { ok: true };
  }
  return {
    ok: false,
    error: "Credenciales incorrectas. Verificá tu email y contraseña.",
  };
  // ── END STUB ──────────────────────────────────────────────────────────────
}
