import "dotenv/config"
import { readFileSync } from "node:fs"
import path from "node:path"
import postgres from "postgres"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL is not set. Handbookly uses the in-memory Cedar & Pine sample until a database is configured.")
    process.exit(1)
  }

  const sql = postgres(url, { prepare: false, max: 1 })
  const ddl = readFileSync(path.join(process.cwd(), "drizzle/0000_init.sql"), "utf8")
  for (const statement of ddl.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
    await sql.unsafe(statement)
  }

  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`
    await sql`ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding vector(256)`
    console.log("pgvector is available. Search will blend BM25 with local embeddings.")
  } catch (error) {
    console.log("pgvector is not available. Search will use BM25.", error instanceof Error ? error.message : "")
  }

  await sql.end()
  console.log("Schema applied.")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
