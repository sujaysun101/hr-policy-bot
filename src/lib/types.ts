export type Role = "hr" | "employee"
export type Confidence = "high" | "medium" | "low"
export type QuestionStatus = "open" | "answered" | "dismissed"
export type GapStatus = "suggested" | "addressed" | "dismissed"
export type Outcome = "handbook" | "knowledge" | "escalated"
export type RetrievalMode = "pgvector" | "bm25"
export type StoreMode = "postgres" | "memory"

export type Citation = {
  chunkId: string
  source: "handbook" | "knowledge"
  sectionNumber: string
  sectionTitle: string
  excerpt: string
  handbookId?: string
  handbookTitle?: string
  page?: number
  related: boolean
}

export type Handbook = {
  id: string
  orgId: string
  title: string
  fileName: string
  mimeType: string
  status: "ready" | "failed"
  chunkCount: number
  uploadedBy: string
  uploadedByName: string
  createdAt: string
  sample: boolean
}

export type Chunk = {
  id: string
  orgId: string
  handbookId: string
  handbookTitle: string
  sectionNumber: string
  sectionTitle: string
  content: string
  page: number
}

export type KnowledgeEntry = {
  id: string
  orgId: string
  question: string
  answer: string
  topic: string
  sourceQuestionId?: string
  createdByName: string
  createdAt: string
}

export type Conversation = {
  id: string
  orgId: string
  userId: string
  userName: string
  title: string
  createdAt: string
  updatedAt: string
}

export type Message = {
  id: string
  conversationId: string
  orgId: string
  role: "user" | "assistant"
  content: string
  citations: Citation[]
  confidence?: Confidence
  suggestAskHr: boolean
  sample: boolean
  questionId?: string
  createdAt: string
}

export type HrQuestion = {
  id: string
  orgId: string
  askedByUserId: string
  askedByName: string
  question: string
  conversationId?: string
  messageId?: string
  status: QuestionStatus
  answer?: string
  answeredByName?: string
  answeredAt?: string
  addedToKb: boolean
  topic: string
  closestSection?: string
  createdAt: string
}

export type PolicyGap = {
  id: string
  orgId: string
  topic: string
  summary: string
  questionCount: number
  sampleQuestions: string[]
  status: GapStatus
  suggestedOutline: string
  updatedAt: string
}

export type Ask = {
  id: string
  orgId: string
  userId: string
  userName: string
  question: string
  createdAt: string
  outcome: Outcome
  sectionTitle?: string
  conversationId: string
}

export type AnalyticsSnapshot = {
  questionsLast30Days: number
  handbookAnswerRate: number
  openQueue: number
  openGaps: number
  activeAskers: number
  series: { date: string; label: string; questions: number; escalated: number }[]
  topSections: { section: string; count: number }[]
  mix: { name: string; value: number }[]
  recent: {
    id: string
    question: string
    askedByName: string
    createdAt: string
    outcome: Outcome
    section?: string
  }[]
}

export type StoreInfo = {
  mode: StoreMode
  retrieval: RetrievalMode
  demoData: boolean
}

export type NewChunkInput = {
  sectionNumber: string
  sectionTitle: string
  content: string
  page: number
}

export type AppStore = {
  info: () => StoreInfo
  ensureOrg: (orgId: string, name: string) => Promise<void>
  importSample: (orgId: string, name: string) => Promise<{ created: boolean }>
  listHandbooks: (orgId: string) => Promise<Handbook[]>
  getHandbook: (orgId: string, id: string) => Promise<(Handbook & { chunks: Chunk[] }) | null>
  deleteHandbook: (orgId: string, id: string) => Promise<void>
  addHandbook: (input: {
    orgId: string
    title: string
    fileName: string
    mimeType: string
    uploadedBy: string
    uploadedByName: string
    sample?: boolean
    chunks: NewChunkInput[]
  }) => Promise<Handbook>
  search: (orgId: string, query: string, limit?: number) => Promise<import("@/lib/retrieval/search").RankedHit[]>
  listConversations: (orgId: string, userId: string) => Promise<Conversation[]>
  getConversation: (
    orgId: string,
    id: string,
    userId: string,
    isHr: boolean,
  ) => Promise<(Conversation & { messages: Message[] }) | null>
  saveTurn: (input: {
    orgId: string
    userId: string
    userName: string
    conversationId?: string
    userText: string
    assistant: Omit<Message, "id" | "conversationId" | "orgId" | "role" | "createdAt">
  }) => Promise<{ conversation: Conversation; userMessage: Message; assistantMessage: Message }>
  listQuestions: (orgId: string) => Promise<HrQuestion[]>
  createQuestion: (input: Omit<HrQuestion, "id" | "createdAt" | "status" | "addedToKb"> & { status?: QuestionStatus }) => Promise<HrQuestion>
  updateQuestion: (
    orgId: string,
    id: string,
    patch: Partial<Pick<HrQuestion, "status" | "answer" | "answeredByName" | "answeredAt" | "addedToKb">>,
  ) => Promise<HrQuestion | null>
  listGaps: (orgId: string) => Promise<PolicyGap[]>
  upsertGap: (orgId: string, topic: { topic: string; summary: string; outline: string }, question: string) => Promise<PolicyGap>
  updateGap: (orgId: string, id: string, status: GapStatus) => Promise<PolicyGap | null>
  listKnowledge: (orgId: string) => Promise<KnowledgeEntry[]>
  addKnowledge: (input: Omit<KnowledgeEntry, "id" | "createdAt">) => Promise<KnowledgeEntry>
  deleteKnowledge: (orgId: string, id: string) => Promise<void>
  recordAsk: (ask: Omit<Ask, "id">) => Promise<void>
  analytics: (orgId: string) => Promise<AnalyticsSnapshot>
  countOpenQuestions: (orgId: string) => Promise<number>
  linkQuestion: (orgId: string, messageId: string, questionId: string) => Promise<void>
}
