import { answerWithLiam } from "@/lib/ai/liam"
import { classifyTopic } from "@/lib/retrieval/topics"
import type { AppStore, Message } from "@/lib/types"

export async function askLiam(
  store: AppStore,
  input: { orgId: string; userId: string; userName: string; message: string; conversationId?: string },
) {
  const history = input.conversationId
    ? ((await store.getConversation(input.orgId, input.conversationId, input.userId, false))?.messages ?? []).map((message) => ({
        role: message.role,
        content: message.content,
      }))
    : []
  const hits = await store.search(input.orgId, input.message, 6)
  const answer = await answerWithLiam({ question: input.message, hits, history })
  const saved = await store.saveTurn({
    orgId: input.orgId,
    userId: input.userId,
    userName: input.userName,
    conversationId: input.conversationId,
    userText: input.message,
    assistant: {
      content: answer.content,
      citations: answer.citations,
      confidence: answer.confidence,
      suggestAskHr: answer.suggestAskHr,
      sample: answer.sample,
    },
  })
  const outcome = answer.suggestAskHr ? "escalated" : answer.citations[0]?.source === "knowledge" ? "knowledge" : "handbook"
  await store.recordAsk({
    orgId: input.orgId,
    userId: input.userId,
    userName: input.userName,
    question: input.message,
    createdAt: saved.userMessage.createdAt,
    outcome,
    sectionTitle: answer.suggestAskHr ? undefined : answer.closestSection,
    conversationId: saved.conversation.id,
  })
  if (answer.suggestAskHr) {
    const topic = classifyTopic(input.message)
    const question = await store.createQuestion({
      orgId: input.orgId,
      askedByUserId: input.userId,
      askedByName: input.userName,
      question: input.message,
      conversationId: saved.conversation.id,
      messageId: saved.assistantMessage.id,
      topic: topic.topic,
      closestSection: answer.closestSection,
    })
    saved.assistantMessage.questionId = question.id
    await store.linkQuestion(input.orgId, saved.assistantMessage.id, question.id)
    await store.upsertGap(input.orgId, topic, input.message)
  }
  return saved
}

export type SavedTurn = {
  conversation: { id: string }
  assistantMessage: Message
}
