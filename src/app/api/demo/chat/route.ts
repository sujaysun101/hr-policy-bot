import { askLiam } from "@/lib/chat/ask"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { jsonError, readJson } from "@/lib/api"
import { chatInputSchema, chatOutputSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const parsed = chatInputSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid question.")
  const saved = await askLiam(access.store, {
    orgId: access.orgId,
    userId: access.userId,
    userName: access.name,
    message: parsed.data.message,
    conversationId: parsed.data.conversationId,
  })
  const payload = {
    conversationId: saved.conversation.id,
    sample: saved.assistantMessage.sample,
    message: {
      id: saved.assistantMessage.id,
      content: saved.assistantMessage.content,
      citations: saved.assistantMessage.citations,
      confidence: saved.assistantMessage.confidence,
      suggestAskHr: saved.assistantMessage.suggestAskHr,
      sample: saved.assistantMessage.sample,
      questionId: saved.assistantMessage.questionId,
    },
  }
  const output = chatOutputSchema.safeParse(payload)
  if (!output.success) return jsonError("Liam could not prepare that answer.")
  return Response.json(output.data)
}
