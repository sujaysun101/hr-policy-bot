import { createMemoryStore } from "@/lib/store/memory"
import { createPostgresStore } from "@/lib/store/postgres"
import type { AppStore } from "@/lib/types"

const globalForStore = globalThis as typeof globalThis & { __handbooklyStore?: Promise<AppStore> }

export async function getStore(): Promise<AppStore> {
  if (!globalForStore.__handbooklyStore) {
    globalForStore.__handbooklyStore = (async () => {
      if (!process.env.DATABASE_URL) return createMemoryStore()
      try {
        return await createPostgresStore()
      } catch (error) {
        console.error("Database unavailable. Handbookly is using demo data.", error instanceof Error ? error.message : "connection error")
        return createMemoryStore()
      }
    })()
  }
  return globalForStore.__handbooklyStore
}
