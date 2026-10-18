import "dotenv/config"
import { DEMO_ORG_ID, DEMO_ORG_NAME } from "@/lib/seed/demo"
import { createPostgresStore } from "@/lib/store/postgres"

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. The in-memory store already includes the Cedar & Pine sample.")
    process.exit(1)
  }

  const orgId = process.env.SEED_ORG_ID || DEMO_ORG_ID
  const store = await createPostgresStore()
  const result = await store.importSample(orgId, DEMO_ORG_NAME)
  console.log(result.created ? `Seeded ${DEMO_ORG_NAME} into ${orgId}.` : `The sample handbook is already stored for ${orgId}.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
