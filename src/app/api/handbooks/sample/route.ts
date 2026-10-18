import { isResponse, jsonError, requireApiSession } from "@/lib/api"
import { DEMO_ORG_NAME } from "@/lib/seed/demo"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST() {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can load the sample handbook.", 403)
  const result = await store.importSample(session.orgId || "", session.orgName || DEMO_ORG_NAME)
  return Response.json(result)
}
