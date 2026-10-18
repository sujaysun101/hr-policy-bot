import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import { composeGrounded, type GroundedAnswer } from "@/lib/ai/grounded"
import { bestExcerpt, type RankedHit } from "@/lib/retrieval/search"

export const AI_MAX_TOKENS = 1024
export const DEFAULT_MODEL = "claude-sonnet-4-6"

const modelAnswerSchema = z.object({
  answer: z.string().min(1).max(4000),
  citationIds: z.array(z.string()).max(4),
  confidence: z.enum(["high", "medium", "low"]),
  suggestAskHr: z.boolean(),
})

export function aiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

function citationsFor(hits: RankedHit[], ids: string[], question: string, related: boolean) {
  const allowed = new Map(hits.map((hit) => [hit.id, hit]))
  const chosen = ids.map((id) => allowed.get(id)).filter((hit): hit is RankedHit => Boolean(hit))
  const list = chosen.length > 0 ? chosen : hits.filter((hit) => hit.answerable).slice(0, 2)
  return list.map((hit) => ({
    chunkId: hit.id,
    source: hit.source,
    sectionNumber: hit.sectionNumber,
    sectionTitle: hit.sectionTitle,
    excerpt: bestExcerpt(hit.content, question),
    handbookId: hit.handbookId,
    handbookTitle: hit.handbookTitle,
    page: hit.page,
    related,
  }))
}

export async function answerWithLiam(input: {
  question: string
  hits: RankedHit[]
  history: { role: "user" | "assistant"; content: string }[]
}): Promise<GroundedAnswer> {
  const grounded = composeGrounded(input.question, input.hits, !aiConfigured())
  if (!aiConfigured()) return grounded

  const sources = input.hits.slice(0, 6).map((hit) => ({
    id: hit.id,
    sectionNumber: hit.sectionNumber,
    sectionTitle: hit.sectionTitle,
    source: hit.source,
    answerable: hit.answerable,
    excerpt: hit.content.slice(0, 1200),
  }))

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const history = input.history
      .slice(-6)
      .map((turn) => `${turn.role === "user" ? "Employee" : "Liam"}: ${turn.content}`)
      .join("\n")
    const response = await client.messages.create({
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: [
        "You are Liam, the handbook assistant in Handbookly.",
        "Answer only from the supplied handbook excerpts and HR knowledge entries.",
        "Name the section number and title when you state a policy.",
        "If the sources do not answer the question, say the handbook does not cover it and set suggestAskHr to true.",
        "Never invent a policy, a number, or a benefit.",
        "Do not give legal advice. You are reading the company's own handbook back to the employee.",
        "Keep the answer under 160 words.",
        'Return only JSON: {"answer": string, "citationIds": string[], "confidence": "high"|"medium"|"low", "suggestAskHr": boolean}.',
        "citationIds must be ids from the sources. Use an empty array when nothing answers the question.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: `Sources:\n${JSON.stringify(sources)}\n\n${history ? `Recent conversation:\n${history}\n\n` : ""}Employee question: ${input.question}`,
        },
      ],
    })
    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
    const match = text.match(/\{[\s\S]*\}/)
    const parsed = modelAnswerSchema.safeParse(match ? JSON.parse(match[0]) : null)
    if (!parsed.success) return { ...grounded, sample: true }
    if (!input.hits.some((hit) => hit.answerable)) {
      return { ...grounded, sample: false }
    }
    const answerableIds = new Set(input.hits.filter((hit) => hit.answerable).map((hit) => hit.id))
    const cited = parsed.data.citationIds.filter((id) => answerableIds.has(id))
    return {
      content: parsed.data.answer,
      citations: citationsFor(input.hits.filter((hit) => hit.answerable), cited, input.question, false),
      confidence: parsed.data.confidence,
      suggestAskHr: false,
      sample: false,
      closestSection: grounded.closestSection,
    }
  } catch (error) {
    console.error("Liam model call failed", error instanceof Error ? error.message : "model error")
    return { ...grounded, sample: true }
  }
}
