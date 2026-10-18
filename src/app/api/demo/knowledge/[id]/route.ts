import { demoStore, isNextResponse } from "@/lib/demo-api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const { id } = await context.params
  await access.store.deleteKnowledge(access.orgId, id)
  return Response.json({ ok: true })
}
