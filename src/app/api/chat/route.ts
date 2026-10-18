import { askLiam } from "@/lib/chat/ask"
import { isResponse, jsonError, readJson, requireApiSession } from "@/lib/api"
import { rateLimit } from "@/lib/rate-limit"
import { chatInputSchema, chatOutputSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  const limit = await rateLimit(`chat:${session.userId}`)
  if (!limit.ok) return jsonError("You have asked a lot of questions this hour. Try again later.", 429)

  const parsed = chatInputSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Invalid question.")

  try {
    const saved = await askLiam(store, {
      orgId: session.orgId || "",
      userId: session.userId,
      userName: session.name,
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
  } catch (error) {
    console.error("Chat failed", error instanceof Error ? error.message : "chat error")
    return jsonError("Liam could not answer that just now.")
  }
}
