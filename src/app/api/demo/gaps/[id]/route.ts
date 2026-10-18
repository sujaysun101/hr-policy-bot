import { jsonError, readJson } from "@/lib/api"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { gapActionSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const parsed = gapActionSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("Choose whether this gap is addressed or dismissed.")
  const { id } = await context.params
  const gap = await access.store.updateGap(access.orgId, id, parsed.data.action === "addressed" ? "addressed" : "dismissed")
  if (!gap) return jsonError("That gap was not found.")
  return Response.json({ gap })
}
