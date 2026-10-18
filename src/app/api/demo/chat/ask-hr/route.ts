import { jsonError, readJson } from "@/lib/api"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { classifyTopic } from "@/lib/retrieval/topics"
import { askHrSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const parsed = askHrSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError("That request is missing the question.")
  const conversation = await access.store.getConversation(access.orgId, parsed.data.conversationId, access.userId, true)
  if (!conversation) return jsonError("That conversation was not found.")
  const message = conversation.messages.find((item) => item.id === parsed.data.messageId)
  const userMessage = [...conversation.messages].reverse().find((item) => item.role === "user")
  if (!message || !userMessage) return jsonError("That answer was not found.")
  if (message.questionId) return Response.json({ questionId: message.questionId, alreadySent: true })
  const topic = classifyTopic(userMessage.content)
  const question = await access.store.createQuestion({
    orgId: access.orgId,
    askedByUserId: conversation.userId,
    askedByName: conversation.userName,
    question: userMessage.content,
    conversationId: conversation.id,
    messageId: message.id,
    topic: topic.topic,
    closestSection: message.citations[0] ? `${message.citations[0].sectionNumber} ${message.citations[0].sectionTitle}` : undefined,
  })
  await access.store.linkQuestion(access.orgId, message.id, question.id)
  await access.store.upsertGap(access.orgId, topic, userMessage.content)
  return Response.json({ questionId: question.id, alreadySent: false })
}
