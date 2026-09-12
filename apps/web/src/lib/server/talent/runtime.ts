/**
 * Composición del servicio real para la app (Postgres + extractor LLM).
 * Singleton por proceso guardado en globalThis para sobrevivir al hot-reload de Next dev.
 */
import { createLlmExtractor } from "./extract-profile";
import { TalentService } from "./service";
import { PgTalentStore } from "./store-pg";

const KEY = "__talentscore_service__";

export function getTalentService(): TalentService {
  const g = globalThis as typeof globalThis & { [KEY]?: TalentService };
  if (!g[KEY]) {
    // Lanza NotConfiguredError (503) si falta DATABASE_URL; el extractor falla por request si falta la API key.
    g[KEY] = new TalentService({ store: PgTalentStore.fromEnv(), extractor: createLlmExtractor() });
  }
  return g[KEY];
}
