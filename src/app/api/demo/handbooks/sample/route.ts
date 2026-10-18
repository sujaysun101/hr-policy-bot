import { demoStore, isNextResponse } from "@/lib/demo-api"
import { DEMO_ORG_NAME } from "@/lib/seed/demo"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const result = await access.store.importSample(access.orgId, DEMO_ORG_NAME)
  return Response.json(result)
}
