import { pgTable, text, integer, boolean, jsonb, index } from "drizzle-orm/pg-core"
import type { Citation } from "@/lib/types"

export const orgs = pgTable("orgs", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
})

export const handbooks = pgTable(
  "handbooks",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    title: text("title").notNull(),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    status: text("status").notNull(),
    chunkCount: integer("chunk_count").notNull().default(0),
    uploadedBy: text("uploaded_by").notNull(),
    uploadedByName: text("uploaded_by_name").notNull(),
    createdAt: text("created_at").notNull(),
    sample: boolean("sample").notNull().default(false),
  },
  (table) => [index("handbooks_org_idx").on(table.orgId)],
)

export const chunks = pgTable(
  "chunks",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    handbookId: text("handbook_id").notNull(),
    handbookTitle: text("handbook_title").notNull(),
    sectionNumber: text("section_number").notNull(),
    sectionTitle: text("section_title").notNull(),
    content: text("content").notNull(),
    page: integer("page").notNull().default(1),
  },
  (table) => [index("chunks_org_idx").on(table.orgId), index("chunks_handbook_idx").on(table.handbookId)],
)

export const knowledgeEntries = pgTable(
  "knowledge_entries",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    topic: text("topic").notNull(),
    sourceQuestionId: text("source_question_id"),
    createdByName: text("created_by_name").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("knowledge_org_idx").on(table.orgId)],
)

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    title: text("title").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("conversations_org_user_idx").on(table.orgId, table.userId)],
)

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    orgId: text("org_id").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    citations: jsonb("citations").$type<Citation[]>().notNull(),
    confidence: text("confidence"),
    suggestAskHr: boolean("suggest_ask_hr").notNull().default(false),
    sample: boolean("sample").notNull().default(false),
    questionId: text("question_id"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)],
)

export const hrQuestions = pgTable(
  "hr_questions",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    askedByUserId: text("asked_by_user_id").notNull(),
    askedByName: text("asked_by_name").notNull(),
    question: text("question").notNull(),
    conversationId: text("conversation_id"),
    messageId: text("message_id"),
    status: text("status").notNull(),
    answer: text("answer"),
    answeredByName: text("answered_by_name"),
    answeredAt: text("answered_at"),
    addedToKb: boolean("added_to_kb").notNull().default(false),
    topic: text("topic").notNull(),
    closestSection: text("closest_section"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("hr_questions_org_idx").on(table.orgId)],
)

export const policyGaps = pgTable(
  "policy_gaps",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    topic: text("topic").notNull(),
    summary: text("summary").notNull(),
    questionCount: integer("question_count").notNull().default(1),
    sampleQuestions: jsonb("sample_questions").$type<string[]>().notNull(),
    status: text("status").notNull(),
    suggestedOutline: text("suggested_outline").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("policy_gaps_org_idx").on(table.orgId)],
)

export const asks = pgTable(
  "asks",
  {
    id: text("id").primaryKey(),
    orgId: text("org_id").notNull(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    question: text("question").notNull(),
    createdAt: text("created_at").notNull(),
    outcome: text("outcome").notNull(),
    sectionTitle: text("section_title"),
    conversationId: text("conversation_id").notNull(),
  },
  (table) => [index("asks_org_idx").on(table.orgId)],
)
