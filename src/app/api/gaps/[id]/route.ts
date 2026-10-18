import { isResponse, jsonError, readJson, requireApiSession } from "@/lib/api"
import { gapActionSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can update policy gaps.", 403)
  const parsed = gapActionSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("Choose whether this gap is addressed or dismissed.")
  const { id } = await context.params
  const gap = await store.updateGap(session.orgId || "", id, parsed.data.action === "addressed" ? "addressed" : "dismissed")
  if (!gap) return jsonError("That gap was not found.")
  return Response.json({ gap })
}
