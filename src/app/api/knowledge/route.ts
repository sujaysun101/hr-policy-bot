import { isResponse, jsonError, readJson, requireApiSession } from "@/lib/api"
import { knowledgeInputSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can add knowledge.", 403)
  const parsed = knowledgeInputSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the question and answer.")
  const entry = await store.addKnowledge({
    orgId: session.orgId || "",
    question: parsed.data.question,
    answer: parsed.data.answer,
    topic: parsed.data.topic,
    createdByName: session.name,
  })
  return Response.json({ entry })
}
