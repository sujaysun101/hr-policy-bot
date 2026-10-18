import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/lib/db/schema"

type Sql = ReturnType<typeof postgres>
type Database = PostgresJsDatabase<typeof schema>

const globalForDb = globalThis as typeof globalThis & {
  __handbooklySql?: Sql
  __handbooklyDb?: Database
}

export function getDatabase(): { sql: Sql; db: Database } | null {
  const url = process.env.DATABASE_URL
  if (!url) return null
  if (!globalForDb.__handbooklySql || !globalForDb.__handbooklyDb) {
    const sql = postgres(url, { prepare: false, max: 5, idle_timeout: 20 })
    globalForDb.__handbooklySql = sql
    globalForDb.__handbooklyDb = drizzle(sql, { schema })
  }
  return { sql: globalForDb.__handbooklySql, db: globalForDb.__handbooklyDb }
}
