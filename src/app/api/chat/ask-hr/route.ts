import { isResponse, jsonError, readJson, requireApiSession } from "@/lib/api"
import { classifyTopic } from "@/lib/retrieval/topics"
import { askHrSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  const parsed = askHrSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("That request is missing the question.")

  const conversation = await store.getConversation(session.orgId || "", parsed.data.conversationId, session.userId, session.role === "hr")
  if (!conversation) return jsonError("That conversation was not found.")
  const message = conversation.messages.find((item) => item.id === parsed.data.messageId && item.role === "assistant")
  if (!message) return jsonError("That answer was not found.")
  if (message.questionId) return Response.json({ questionId: message.questionId, alreadySent: true })

  const userMessage = [...conversation.messages].reverse().find((item) => item.role === "user" && item.createdAt <= message.createdAt)
  const questionText = userMessage?.content
  if (!questionText) return jsonError("There is no employee question to send.")

  const topic = classifyTopic(questionText)
  const question = await store.createQuestion({
    orgId: session.orgId || "",
    askedByUserId: conversation.userId,
    askedByName: conversation.userName,
    question: questionText,
    conversationId: conversation.id,
    messageId: message.id,
    topic: topic.topic,
    closestSection: message.citations[0] ? `${message.citations[0].sectionNumber} ${message.citations[0].sectionTitle}` : undefined,
  })
  await store.linkQuestion(session.orgId || "", message.id, question.id)
  await store.upsertGap(session.orgId || "", topic, questionText)
  return Response.json({ questionId: question.id, alreadySent: false })
}
