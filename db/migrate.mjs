// Aplica db/*.sql en orden alfabético. Idempotente (los scripts usan IF NOT EXISTS / ON CONFLICT).
// Uso: npm run db:migrate   (lee DATABASE_URL de .env)
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = dirname(fileURLToPath(import.meta.url));
const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL no está definida. Ver db/README.md.");
  process.exit(1);
}
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    process.stdout.write(`→ ${file} ... `);
    await client.query(await readFile(join(dir, file), "utf8"));
    console.log("ok");
  }
} finally {
  await client.end();
}
