import { readFileSync } from "node:fs"
import path from "node:path"
import { and, desc, eq } from "drizzle-orm"
import { computeAnalytics } from "@/lib/analytics"
import { getDatabase } from "@/lib/db/client"
import * as schema from "@/lib/db/schema"
import { embedText, toVectorLiteral } from "@/lib/retrieval/embeddings"
import { searchCorpus, type RankedHit } from "@/lib/retrieval/search"
import { buildDemoDataset } from "@/lib/seed/demo"
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

type Row = Record<string, unknown>

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function handbookFrom(row: typeof schema.handbooks.$inferSelect): Handbook {
  return {
    id: row.id,
    orgId: row.orgId,
    title: row.title,
    fileName: row.fileName,
    mimeType: row.mimeType,
    status: row.status === "failed" ? "failed" : "ready",
    chunkCount: row.chunkCount,
    uploadedBy: row.uploadedBy,
    uploadedByName: row.uploadedByName,
    createdAt: row.createdAt,
    sample: row.sample,
  }
}

function chunkFrom(row: typeof schema.chunks.$inferSelect): Chunk {
  return {
    id: row.id,
    orgId: row.orgId,
    handbookId: row.handbookId,
    handbookTitle: row.handbookTitle,
    sectionNumber: row.sectionNumber,
    sectionTitle: row.sectionTitle,
    content: row.content,
    page: row.page,
  }
}

function knowledgeFrom(row: typeof schema.knowledgeEntries.$inferSelect): KnowledgeEntry {
  return {
    id: row.id,
    orgId: row.orgId,
    question: row.question,
    answer: row.answer,
    topic: row.topic,
    sourceQuestionId: row.sourceQuestionId ?? undefined,
    createdByName: row.createdByName,
    createdAt: row.createdAt,
  }
}

function messageFrom(row: typeof schema.messages.$inferSelect): Message {
  return {
    id: row.id,
    conversationId: row.conversationId,
    orgId: row.orgId,
    role: row.role === "user" ? "user" : "assistant",
    content: row.content,
    citations: row.citations ?? [],
    confidence: row.confidence === "high" || row.confidence === "medium" || row.confidence === "low" ? row.confidence : undefined,
    suggestAskHr: row.suggestAskHr,
    sample: row.sample,
    questionId: row.questionId ?? undefined,
    createdAt: row.createdAt,
  }
}

function questionFrom(row: typeof schema.hrQuestions.$inferSelect): HrQuestion {
  const status = row.status === "answered" || row.status === "dismissed" ? row.status : "open"
  return {
    id: row.id,
    orgId: row.orgId,
    askedByUserId: row.askedByUserId,
    askedByName: row.askedByName,
    question: row.question,
    conversationId: row.conversationId ?? undefined,
    messageId: row.messageId ?? undefined,
    status,
    answer: row.answer ?? undefined,
    answeredByName: row.answeredByName ?? undefined,
    answeredAt: row.answeredAt ?? undefined,
    addedToKb: row.addedToKb,
    topic: row.topic,
    closestSection: row.closestSection ?? undefined,
    createdAt: row.createdAt,
  }
}

function gapFrom(row: typeof schema.policyGaps.$inferSelect): PolicyGap {
  const status = row.status === "addressed" || row.status === "dismissed" ? row.status : "suggested"
  return {
    id: row.id,
    orgId: row.orgId,
    topic: row.topic,
    summary: row.summary,
    questionCount: row.questionCount,
    sampleQuestions: row.sampleQuestions ?? [],
    status,
    suggestedOutline: row.suggestedOutline,
    updatedAt: row.updatedAt,
  }
}

function askFrom(row: typeof schema.asks.$inferSelect): Ask {
  const outcome = row.outcome === "knowledge" || row.outcome === "escalated" ? row.outcome : "handbook"
  return {
    id: row.id,
    orgId: row.orgId,
    userId: row.userId,
    userName: row.userName,
    question: row.question,
    createdAt: row.createdAt,
    outcome,
    sectionTitle: row.sectionTitle ?? undefined,
    conversationId: row.conversationId,
  }
}

export async function createPostgresStore(): Promise<AppStore> {
  const connection = getDatabase()
  if (!connection) throw new Error("DATABASE_URL is not set")
  const { db, sql } = connection

  const ddl = readFileSync(path.join(process.cwd(), "drizzle/0000_init.sql"), "utf8")
  for (const statement of ddl.split("--> statement-breakpoint").map((part) => part.trim()).filter(Boolean)) {
    await sql.unsafe(statement)
  }

  let retrieval: StoreInfo["retrieval"] = "bm25"
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`
    await sql`ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding vector(256)`
    retrieval = "pgvector"
  } catch (error) {
    console.warn("pgvector is not available; using BM25.", error instanceof Error ? error.message : "extension error")
    retrieval = "bm25"
  }

  async function writeEmbedding(id: string, text: string) {
    if (retrieval !== "pgvector") return
    const literal = toVectorLiteral(embedText(text))
    await sql`UPDATE chunks SET embedding = ${literal}::vector WHERE id = ${id}`
  }

  async function ensureOrg(orgId: string, name: string) {
    const existing = await db.select().from(schema.orgs).where(eq(schema.orgs.id, orgId))
    if (existing.length === 0) {
      await db.insert(schema.orgs).values({ id: orgId, name, createdAt: new Date().toISOString() })
    } else if (existing[0]?.name !== name) {
      await db.update(schema.orgs).set({ name }).where(eq(schema.orgs.id, orgId))
    }
  }

  return {
    info: () => ({ mode: "postgres", retrieval, demoData: false }),
    ensureOrg,
    async importSample(orgId, name) {
      await ensureOrg(orgId, name)
      const existing = await db
        .select()
        .from(schema.handbooks)
        .where(and(eq(schema.handbooks.orgId, orgId), eq(schema.handbooks.sample, true)))
      if (existing.length > 0) return { created: false }
      const demo = buildDemoDataset(orgId)
      await db.insert(schema.handbooks).values(demo.handbook)
      if (demo.chunks.length) await db.insert(schema.chunks).values(demo.chunks)
      for (const chunk of demo.chunks) {
        await writeEmbedding(chunk.id, `${chunk.sectionNumber} ${chunk.sectionTitle} ${chunk.content}`)
      }
      if (demo.knowledge.length) await db.insert(schema.knowledgeEntries).values(demo.knowledge)
      if (demo.conversations.length) await db.insert(schema.conversations).values(demo.conversations)
      if (demo.messages.length) await db.insert(schema.messages).values(demo.messages)
      if (demo.questions.length) await db.insert(schema.hrQuestions).values(demo.questions)
      if (demo.gaps.length) await db.insert(schema.policyGaps).values(demo.gaps)
      if (demo.asks.length) await db.insert(schema.asks).values(demo.asks)
      return { created: true }
    },
    async listHandbooks(orgId) {
      const rows = await db.select().from(schema.handbooks).where(eq(schema.handbooks.orgId, orgId)).orderBy(desc(schema.handbooks.createdAt))
      return rows.map(handbookFrom)
    },
    async getHandbook(orgId, id) {
      const rows = await db.select().from(schema.handbooks).where(and(eq(schema.handbooks.orgId, orgId), eq(schema.handbooks.id, id)))
      const handbook = rows[0]
      if (!handbook) return null
      const chunkRows = await db.select().from(schema.chunks).where(eq(schema.chunks.handbookId, id))
      return { ...handbookFrom(handbook), chunks: chunkRows.map(chunkFrom) }
    },
    async deleteHandbook(orgId, id) {
      await db.delete(schema.chunks).where(and(eq(schema.chunks.orgId, orgId), eq(schema.chunks.handbookId, id)))
      await db.delete(schema.handbooks).where(and(eq(schema.handbooks.orgId, orgId), eq(schema.handbooks.id, id)))
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
      const chunkRows: Chunk[] = input.chunks.map((chunk, index) => ({
        id: createId("chk"),
        orgId: input.orgId,
        handbookId: handbook.id,
        handbookTitle: handbook.title,
        sectionNumber: chunk.sectionNumber || `${index + 1}`,
        sectionTitle: chunk.sectionTitle || "Section",
        content: chunk.content,
        page: chunk.page,
      }))
      await db.insert(schema.handbooks).values(handbook)
      if (chunkRows.length) await db.insert(schema.chunks).values(chunkRows)
      for (const chunk of chunkRows) {
        await writeEmbedding(chunk.id, `${chunk.sectionNumber} ${chunk.sectionTitle} ${chunk.content}`)
      }
      return handbook
    },
    async search(orgId, query, limit = 6): Promise<RankedHit[]> {
      const chunkRows = (await db.select().from(schema.chunks).where(eq(schema.chunks.orgId, orgId))).map(chunkFrom)
      const knowledgeRows = (await db.select().from(schema.knowledgeEntries).where(eq(schema.knowledgeEntries.orgId, orgId))).map(knowledgeFrom)
      let vectorScores: Map<string, number> | undefined
      if (retrieval === "pgvector") {
        try {
          const literal = toVectorLiteral(embedText(query))
          const rows = await sql<Row[]>`
            SELECT id, (1 - (embedding <=> ${literal}::vector)) AS sim
            FROM chunks
            WHERE org_id = ${orgId} AND embedding IS NOT NULL
            ORDER BY embedding <=> ${literal}::vector
            LIMIT 20
          `
          vectorScores = new Map(rows.map((row) => [asString(row.id), Number(row.sim)]))
        } catch (error) {
          console.warn("Vector search failed; using BM25.", error instanceof Error ? error.message : "query error")
        }
      }
      return searchCorpus(chunkRows, knowledgeRows, query, vectorScores).slice(0, limit)
    },
    async listConversations(orgId, userId) {
      const rows = await db
        .select()
        .from(schema.conversations)
        .where(and(eq(schema.conversations.orgId, orgId), eq(schema.conversations.userId, userId)))
        .orderBy(desc(schema.conversations.updatedAt))
      return rows.map((row) => ({
        id: row.id,
        orgId: row.orgId,
        userId: row.userId,
        userName: row.userName,
        title: row.title,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }))
    },
    async getConversation(orgId, id, userId, isHr) {
      const rows = await db.select().from(schema.conversations).where(and(eq(schema.conversations.orgId, orgId), eq(schema.conversations.id, id)))
      const conversation = rows[0]
      if (!conversation) return null
      if (!isHr && conversation.userId !== userId) return null
      const messageRows = await db.select().from(schema.messages).where(eq(schema.messages.conversationId, id)).orderBy(schema.messages.createdAt)
      return {
        id: conversation.id,
        orgId: conversation.orgId,
        userId: conversation.userId,
        userName: conversation.userName,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: messageRows.map(messageFrom),
      }
    },
    async saveTurn(input) {
      const now = new Date().toISOString()
      let conversation: Conversation | undefined
      if (input.conversationId) {
        const rows = await db
          .select()
          .from(schema.conversations)
          .where(and(eq(schema.conversations.id, input.conversationId), eq(schema.conversations.orgId, input.orgId), eq(schema.conversations.userId, input.userId)))
        const found = rows[0]
        if (found) {
          conversation = {
            id: found.id,
            orgId: found.orgId,
            userId: found.userId,
            userName: found.userName,
            title: found.title,
            createdAt: found.createdAt,
            updatedAt: now,
          }
          await db.update(schema.conversations).set({ updatedAt: now }).where(eq(schema.conversations.id, found.id))
        }
      }
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
        await db.insert(schema.conversations).values(conversation)
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
      await db.insert(schema.messages).values([userMessage, assistantMessage])
      return { conversation, userMessage, assistantMessage }
    },
    async listQuestions(orgId) {
      const rows = await db.select().from(schema.hrQuestions).where(eq(schema.hrQuestions.orgId, orgId)).orderBy(desc(schema.hrQuestions.createdAt))
      return rows.map(questionFrom)
    },
    async createQuestion(input) {
      const question: HrQuestion = {
        ...input,
        id: createId("hq"),
        status: input.status ?? "open",
        addedToKb: false,
        createdAt: new Date().toISOString(),
      }
      await db.insert(schema.hrQuestions).values(question)
      return question
    },
    async updateQuestion(orgId, id, patch) {
      const rows = await db.select().from(schema.hrQuestions).where(and(eq(schema.hrQuestions.orgId, orgId), eq(schema.hrQuestions.id, id)))
      if (!rows[0]) return null
      await db.update(schema.hrQuestions).set(patch).where(eq(schema.hrQuestions.id, id))
      return questionFrom({ ...rows[0], ...patch })
    },
    async listGaps(orgId) {
      const rows = await db.select().from(schema.policyGaps).where(eq(schema.policyGaps.orgId, orgId))
      return rows.map(gapFrom).sort((a, b) => b.questionCount - a.questionCount)
    },
    async upsertGap(orgId, topic, questionText) {
      const rows = await db.select().from(schema.policyGaps).where(eq(schema.policyGaps.orgId, orgId))
      const existing = rows.map(gapFrom).find((gap) => gap.topic === topic.topic && gap.status !== "addressed")
      const now = new Date().toISOString()
      if (!existing) {
        const gap: PolicyGap = {
          id: createId("gap"),
          orgId,
          topic: topic.topic,
          summary: topic.summary,
          questionCount: 1,
          sampleQuestions: [questionText],
          status: "suggested",
          suggestedOutline: topic.outline,
          updatedAt: now,
        }
        await db.insert(schema.policyGaps).values(gap)
        return gap
      }
      const sampleQuestions = existing.sampleQuestions.includes(questionText) || existing.sampleQuestions.length >= 4
        ? existing.sampleQuestions
        : [...existing.sampleQuestions, questionText]
      const status = existing.status === "dismissed" ? "suggested" : existing.status
      await db
        .update(schema.policyGaps)
        .set({ questionCount: existing.questionCount + 1, sampleQuestions, status, updatedAt: now })
        .where(eq(schema.policyGaps.id, existing.id))
      return { ...existing, questionCount: existing.questionCount + 1, sampleQuestions, status, updatedAt: now }
    },
    async updateGap(orgId, id, status: GapStatus) {
      const rows = await db.select().from(schema.policyGaps).where(and(eq(schema.policyGaps.orgId, orgId), eq(schema.policyGaps.id, id)))
      if (!rows[0]) return null
      const updatedAt = new Date().toISOString()
      await db.update(schema.policyGaps).set({ status, updatedAt }).where(eq(schema.policyGaps.id, id))
      return gapFrom({ ...rows[0], status, updatedAt })
    },
    async listKnowledge(orgId) {
      const rows = await db.select().from(schema.knowledgeEntries).where(eq(schema.knowledgeEntries.orgId, orgId)).orderBy(desc(schema.knowledgeEntries.createdAt))
      return rows.map(knowledgeFrom)
    },
    async addKnowledge(input) {
      const entry: KnowledgeEntry = { ...input, id: createId("kb"), createdAt: new Date().toISOString() }
      await db.insert(schema.knowledgeEntries).values(entry)
      return entry
    },
    async deleteKnowledge(orgId, id) {
      await db.delete(schema.knowledgeEntries).where(and(eq(schema.knowledgeEntries.orgId, orgId), eq(schema.knowledgeEntries.id, id)))
    },
    async recordAsk(ask) {
      await db.insert(schema.asks).values({ ...ask, id: createId("ask") })
    },
    async analytics(orgId): Promise<AnalyticsSnapshot> {
      const askRows = (await db.select().from(schema.asks).where(eq(schema.asks.orgId, orgId))).map(askFrom)
      const questionRows = (await db.select().from(schema.hrQuestions).where(eq(schema.hrQuestions.orgId, orgId))).map(questionFrom)
      const gapRows = (await db.select().from(schema.policyGaps).where(eq(schema.policyGaps.orgId, orgId))).map(gapFrom)
      return computeAnalytics(askRows, questionRows, gapRows)
    },
    async countOpenQuestions(orgId) {
      const rows = await db.select().from(schema.hrQuestions).where(and(eq(schema.hrQuestions.orgId, orgId), eq(schema.hrQuestions.status, "open")))
      return rows.length
    },
    async linkQuestion(orgId, messageId, questionId) {
      await db.update(schema.messages).set({ questionId }).where(and(eq(schema.messages.orgId, orgId), eq(schema.messages.id, messageId)))
    },
  }
}
