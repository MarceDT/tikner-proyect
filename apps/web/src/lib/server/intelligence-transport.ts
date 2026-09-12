type Environment = Record<string, string | undefined>;

export const LEARNING_CONTAINER_ID = "talentscore-recruiting";

export type IntelligenceTransportConfiguration =
  | { enabled: false }
  | {
      enabled: true;
      apiKey: string;
      apiUrl?: string;
      wsUrl?: string;
    };

function firstDefined(environment: Environment, names: string[]) {
  return names
    .map((name) => environment[name]?.trim())
    .find((value): value is string => Boolean(value));
}

function validateGatewayUrl(
  value: string,
  name: string,
  protocol: "http:" | "https:" | "ws:" | "wss:",
) {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }

  const allowsLocalDevelopmentProtocol =
    (protocol === "https:" && parsed.protocol === "http:") ||
    (protocol === "wss:" && parsed.protocol === "ws:");
  if (parsed.protocol !== protocol && !allowsLocalDevelopmentProtocol) {
    throw new Error(
      `${name} must use ${protocol.replace(":", "")} or its local development equivalent.`,
    );
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(
      `${name} must be a bare gateway URL without a path, query, or hash.`,
    );
  }

  return parsed.toString().replace(/\/$/, "");
}

/** Resolves the Intelligence API and WebSocket transport as one configuration. */
export function resolveIntelligenceTransportConfiguration(
  environment: Environment = process.env,
): IntelligenceTransportConfiguration {
  const apiKey = firstDefined(environment, [
    "CPK_INTELLIGENCE_API_KEY",
    "COPILOTKIT_API_KEY",
    "INTELLIGENCE_API_KEY",
  ]);

  if (!apiKey) return { enabled: false };

  const configuredApiUrl = firstDefined(environment, [
    "INTELLIGENCE_API_URL",
    "COPILOTKIT_API_URL",
  ]);
  const configuredWsUrl = firstDefined(environment, [
    "INTELLIGENCE_WS_URL",
    "COPILOTKIT_WS_URL",
  ]);

  if (Boolean(configuredApiUrl) !== Boolean(configuredWsUrl)) {
    throw new Error(
      "Configure INTELLIGENCE_API_URL and INTELLIGENCE_WS_URL together (or their COPILOTKIT_* aliases).",
    );
  }

  return {
    enabled: true,
    apiKey,
    ...(configuredApiUrl && configuredWsUrl
      ? {
          apiUrl: validateGatewayUrl(
            configuredApiUrl,
            "INTELLIGENCE_API_URL",
            "https:",
          ),
          wsUrl: validateGatewayUrl(
            configuredWsUrl,
            "INTELLIGENCE_WS_URL",
            "wss:",
          ),
        }
      : {}),
  };
}
