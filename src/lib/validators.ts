import { z } from "zod"

export const chatInputSchema = z.object({
  message: z.string().trim().min(1, "Ask a question.").max(2000),
  conversationId: z.string().trim().min(1).max(80).optional(),
})

export const askHrSchema = z.object({
  conversationId: z.string().trim().min(1).max(80),
  messageId: z.string().trim().min(1).max(80),
})

export const queueActionSchema = z.object({
  action: z.enum(["answer", "dismiss", "add_to_kb"]),
  answer: z.string().trim().max(4000).optional(),
})

export const gapActionSchema = z.object({
  action: z.enum(["addressed", "dismiss"]),
})

export const knowledgeInputSchema = z.object({
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(4000),
  topic: z.string().trim().min(1).max(120),
})

export const chatOutputSchema = z.object({
  conversationId: z.string(),
  sample: z.boolean(),
  message: z.object({
    id: z.string(),
    content: z.string(),
    citations: z.array(
      z.object({
        chunkId: z.string(),
        source: z.enum(["handbook", "knowledge"]),
        sectionNumber: z.string(),
        sectionTitle: z.string(),
        excerpt: z.string(),
        handbookId: z.string().optional(),
        handbookTitle: z.string().optional(),
        page: z.number().optional(),
        related: z.boolean(),
      }),
    ),
    confidence: z.enum(["high", "medium", "low"]).optional(),
    suggestAskHr: z.boolean(),
    sample: z.boolean(),
    questionId: z.string().optional(),
  }),
})
