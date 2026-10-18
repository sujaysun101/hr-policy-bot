import { computeAnalytics } from "@/lib/analytics"
import { searchCorpus, type RankedHit } from "@/lib/retrieval/search"
import { buildDemoDataset, DEMO_ORG_ID, DEMO_ORG_NAME } from "@/lib/seed/demo"
import type {
  AnalyticsSnapshot,
  AppStore,
  Ask,
  Chunk,
  Conversation,
  GapStatus,
  Handbook,
  HrQuestion,
  KnowledgeEntry,
  Message,
  PolicyGap,
  StoreInfo,
} from "@/lib/types"

type MemoryState = {
  orgs: Map<string, string>
  handbooks: Handbook[]
  chunks: Chunk[]
  conversations: Conversation[]
  messages: Message[]
  questions: HrQuestion[]
  gaps: PolicyGap[]
  knowledge: KnowledgeEntry[]
  asks: Ask[]
}

function emptyState(): MemoryState {
  return {
    orgs: new Map(),
    handbooks: [],
    chunks: [],
    conversations: [],
    messages: [],
    questions: [],
    gaps: [],
    knowledge: [],
    asks: [],
  }
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`
}

function applyDataset(state: MemoryState, orgId: string, name: string) {
  const demo = buildDemoDataset(orgId)
  state.orgs.set(orgId, name)
  state.handbooks.push(demo.handbook)
  state.chunks.push(...demo.chunks)
  state.conversations.push(...demo.conversations)
  state.messages.push(...demo.messages)
  state.questions.push(...demo.questions)
  state.gaps.push(...demo.gaps)
  state.knowledge.push(...demo.knowledge)
  state.asks.push(...demo.asks)
}

export function createMemoryStore(): AppStore {
  const globalState = globalThis as typeof globalThis & { __handbooklyMemory?: MemoryState }
  if (!globalState.__handbooklyMemory) {
    const state = emptyState()
    applyDataset(state, DEMO_ORG_ID, DEMO_ORG_NAME)
    globalState.__handbooklyMemory = state
  }
  const state = globalState.__handbooklyMemory

  const info = (): StoreInfo => ({ mode: "memory", retrieval: "bm25", demoData: true })

  return {
    info,
    async ensureOrg(orgId, name) {
      state.orgs.set(orgId, name)
      if (!state.handbooks.some((handbook) => handbook.orgId === orgId)) {
        applyDataset(state, orgId, name)
      }
    },
    async importSample(orgId, name) {
      if (state.handbooks.some((handbook) => handbook.orgId === orgId && handbook.sample)) {
        return { created: false }
      }
      applyDataset(state, orgId, name)
      return { created: true }
    },
    async listHandbooks(orgId) {
      return state.handbooks.filter((handbook) => handbook.orgId === orgId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    },
    async getHandbook(orgId, id) {
      const handbook = state.handbooks.find((item) => item.orgId === orgId && item.id === id)
      if (!handbook) return null
      const chunks = state.chunks.filter((chunk) => chunk.handbookId === id)
      return { ...handbook, chunks }
    },
    async deleteHandbook(orgId, id) {
      state.handbooks = state.handbooks.filter((handbook) => !(handbook.orgId === orgId && handbook.id === id))
      state.chunks = state.chunks.filter((chunk) => !(chunk.orgId === orgId && chunk.handbookId === id))
    },
    async addHandbook(input) {
      const handbook: Handbook = {
        id: createId("hb"),
        orgId: input.orgId,
        title: input.title,
        fileName: input.fileName,
        mimeType: input.mimeType,
        status: "ready",
        chunkCount: input.chunks.length,
        uploadedBy: input.uploadedBy,
        uploadedByName: input.uploadedByName,
        createdAt: new Date().toISOString(),
        sample: Boolean(input.sample),
      }
      const chunks: Chunk[] = input.chunks.map((chunk, index) => ({
        id: createId("chk"),
        orgId: input.orgId,
        handbookId: handbook.id,
        handbookTitle: handbook.title,
        sectionNumber: chunk.sectionNumber || `${index + 1}`,
        sectionTitle: chunk.sectionTitle || "Section",
        content: chunk.content,
        page: chunk.page,
      }))
      state.handbooks.push(handbook)
      state.chunks.push(...chunks)
      return handbook
    },
    async search(orgId, query, limit = 6): Promise<RankedHit[]> {
      return searchCorpus(
        state.chunks.filter((chunk) => chunk.orgId === orgId),
        state.knowledge.filter((entry) => entry.orgId === orgId),
        query,
      ).slice(0, limit)
    },
    async listConversations(orgId, userId) {
      return state.conversations
        .filter((conversation) => conversation.orgId === orgId && conversation.userId === userId)
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    },
    async getConversation(orgId, id, userId, isHr) {
      const conversation = state.conversations.find((item) => item.orgId === orgId && item.id === id)
      if (!conversation) return null
      if (!isHr && conversation.userId !== userId) return null
      const messages = state.messages
        .filter((message) => message.conversationId === id)
        .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      return { ...conversation, messages }
    },
    async saveTurn(input) {
      const now = new Date().toISOString()
      let conversation = input.conversationId
        ? state.conversations.find((item) => item.id === input.conversationId && item.orgId === input.orgId && item.userId === input.userId)
        : undefined
      if (!conversation) {
        conversation = {
          id: createId("con"),
          orgId: input.orgId,
          userId: input.userId,
          userName: input.userName,
          title: input.userText.slice(0, 80),
          createdAt: now,
          updatedAt: now,
        }
        state.conversations.push(conversation)
      } else {
        conversation.updatedAt = now
      }
      const userMessage: Message = {
        id: createId("msg"),
        conversationId: conversation.id,
        orgId: input.orgId,
        role: "user",
        content: input.userText,
        citations: [],
        suggestAskHr: false,
        sample: false,
        createdAt: now,
      }
      const assistantMessage: Message = {
        id: createId("msg"),
        conversationId: conversation.id,
        orgId: input.orgId,
        role: "assistant",
        content: input.assistant.content,
        citations: input.assistant.citations,
        confidence: input.assistant.confidence,
        suggestAskHr: input.assistant.suggestAskHr,
        sample: input.assistant.sample,
        questionId: input.assistant.questionId,
        createdAt: new Date(Date.now() + 1).toISOString(),
      }
      state.messages.push(userMessage, assistantMessage)
      return { conversation, userMessage, assistantMessage }
    },
    async listQuestions(orgId) {
      return state.questions.filter((question) => question.orgId === orgId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    },
    async createQuestion(input) {
      const question: HrQuestion = {
        ...input,
        id: createId("hq"),
        status: input.status ?? "open",
        addedToKb: false,
        createdAt: new Date().toISOString(),
      }
      state.questions.push(question)
      return question
    },
    async updateQuestion(orgId, id, patch) {
      const question = state.questions.find((item) => item.orgId === orgId && item.id === id)
      if (!question) return null
      Object.assign(question, patch)
      return question
    },
    async listGaps(orgId) {
      return state.gaps.filter((gap) => gap.orgId === orgId).sort((a, b) => b.questionCount - a.questionCount)
    },
    async upsertGap(orgId, topic, question) {
      const existing = state.gaps.find((gap) => gap.orgId === orgId && gap.topic === topic.topic && gap.status !== "addressed")
      const now = new Date().toISOString()
      if (!existing) {
        const gap: PolicyGap = {
          id: createId("gap"),
          orgId,
          topic: topic.topic,
          summary: topic.summary,
          questionCount: 1,
          sampleQuestions: [question],
          status: "suggested",
          suggestedOutline: topic.outline,
          updatedAt: now,
        }
        state.gaps.push(gap)
        return gap
      }
      existing.questionCount += 1
      if (!existing.sampleQuestions.includes(question) && existing.sampleQuestions.length < 4) {
        existing.sampleQuestions.push(question)
      }
      if (existing.status === "dismissed") existing.status = "suggested"
      existing.updatedAt = now
      return existing
    },
    async updateGap(orgId, id, status: GapStatus) {
      const gap = state.gaps.find((item) => item.orgId === orgId && item.id === id)
      if (!gap) return null
      gap.status = status
      gap.updatedAt = new Date().toISOString()
      return gap
    },
    async listKnowledge(orgId) {
      return state.knowledge.filter((entry) => entry.orgId === orgId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    },
    async addKnowledge(input) {
      const entry: KnowledgeEntry = { ...input, id: createId("kb"), createdAt: new Date().toISOString() }
      state.knowledge.push(entry)
      return entry
    },
    async deleteKnowledge(orgId, id) {
      state.knowledge = state.knowledge.filter((entry) => !(entry.orgId === orgId && entry.id === id))
    },
    async recordAsk(ask) {
      state.asks.push({ ...ask, id: createId("ask") })
    },
    async analytics(orgId): Promise<AnalyticsSnapshot> {
      return computeAnalytics(
        state.asks.filter((ask) => ask.orgId === orgId),
        state.questions.filter((question) => question.orgId === orgId),
        state.gaps.filter((gap) => gap.orgId === orgId),
      )
    },
    async countOpenQuestions(orgId) {
      return state.questions.filter((question) => question.orgId === orgId && question.status === "open").length
    },
    async linkQuestion(orgId, messageId, questionId) {
      const message = state.messages.find((item) => item.orgId === orgId && item.id === messageId)
      if (message) message.questionId = questionId
    },
  }
}
