import { isResponse, jsonError, requireApiSession } from "@/lib/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can remove a handbook.", 403)
  const { id } = await context.params
  if (!id) return jsonError("Missing handbook.")
  await store.deleteHandbook(session.orgId || "", id)
  return Response.json({ ok: true })
}
