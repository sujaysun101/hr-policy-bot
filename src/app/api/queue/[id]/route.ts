import { isResponse, jsonError, readJson, requireApiSession } from "@/lib/api"
import { queueActionSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can update the queue.", 403)
  const { id } = await context.params
  const parsed = queueActionSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("Choose an action for this question.")
  const orgId = session.orgId || ""
  const questions = await store.listQuestions(orgId)
  const current = questions.find((question) => question.id === id)
  if (!current) return jsonError("That question is not in the queue.")

  if (parsed.data.action === "dismiss") {
    const updated = await store.updateQuestion(orgId, id, { status: "dismissed" })
    return Response.json({ question: updated })
  }
  const answer = parsed.data.answer?.trim()
  if (!answer) return jsonError("Write an answer before saving it.")
  const updated = await store.updateQuestion(orgId, id, {
    status: "answered",
    answer,
    answeredByName: session.name,
    answeredAt: new Date().toISOString(),
    addedToKb: parsed.data.action === "add_to_kb",
  })
  if (parsed.data.action === "add_to_kb") {
    await store.addKnowledge({
      orgId,
      question: current.question,
      answer,
      topic: current.topic,
      sourceQuestionId: current.id,
      createdByName: session.name,
    })
    const gaps = await store.listGaps(orgId)
    const gap = gaps.find((item) => item.topic === current.topic && item.status === "suggested")
    if (gap) await store.updateGap(orgId, gap.id, "addressed")
  }
  return Response.json({ question: updated })
}
