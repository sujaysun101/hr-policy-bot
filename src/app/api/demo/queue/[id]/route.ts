import { jsonError, readJson } from "@/lib/api"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { queueActionSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const parsed = queueActionSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("Choose an action for this question.")
  const { id } = await context.params
  const current = (await access.store.listQuestions(access.orgId)).find((question) => question.id === id)
  if (!current) return jsonError("That question is not in the queue.")
  if (parsed.data.action === "dismiss") {
    const question = await access.store.updateQuestion(access.orgId, id, { status: "dismissed" })
    return Response.json({ question })
  }
  const answer = parsed.data.answer?.trim()
  if (!answer) return jsonError("Write an answer before saving it.")
  const question = await access.store.updateQuestion(access.orgId, id, {
    status: "answered",
    answer,
    answeredByName: access.name,
    answeredAt: new Date().toISOString(),
    addedToKb: parsed.data.action === "add_to_kb",
  })
  if (parsed.data.action === "add_to_kb") {
    await access.store.addKnowledge({
      orgId: access.orgId,
      question: current.question,
      answer,
      topic: current.topic,
      sourceQuestionId: current.id,
      createdByName: access.name,
    })
    const gap = (await access.store.listGaps(access.orgId)).find((item) => item.topic === current.topic && item.status === "suggested")
    if (gap) await access.store.updateGap(access.orgId, gap.id, "addressed")
  }
  return Response.json({ question })
}
