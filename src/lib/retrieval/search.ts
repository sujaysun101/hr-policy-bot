import { rankBm25 } from "@/lib/retrieval/bm25"
import { SOFT_TERMS } from "@/lib/retrieval/terms"
import { tokenize, unique } from "@/lib/retrieval/tokenize"
import type { Chunk, KnowledgeEntry } from "@/lib/types"

export type RankedHit = {
  id: string
  source: "handbook" | "knowledge"
  handbookId?: string
  handbookTitle?: string
  sectionNumber: string
  sectionTitle: string
  content: string
  page?: number
  score: number
  answerable: boolean
  coverage: number
  titleMatches: number
}

export function searchCorpus(
  chunks: Chunk[],
  knowledge: KnowledgeEntry[],
  query: string,
  vectorScores?: Map<string, number>,
): RankedHit[] {
  const docs = [
    ...chunks.map((chunk) => ({
      id: chunk.id,
      title: `${chunk.sectionNumber} ${chunk.sectionTitle}`,
      text: chunk.content,
      hit: {
        id: chunk.id,
        source: "handbook" as const,
        handbookId: chunk.handbookId,
        handbookTitle: chunk.handbookTitle,
        sectionNumber: chunk.sectionNumber,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
        page: chunk.page,
      },
    })),
    ...knowledge.map((entry) => ({
      id: entry.id,
      title: entry.topic,
      text: `${entry.question}\n${entry.answer}`,
      hit: {
        id: entry.id,
        source: "knowledge" as const,
        sectionNumber: "HR",
        sectionTitle: entry.topic,
        content: entry.answer,
      },
    })),
  ]

  const ranked = rankBm25(
    docs.map((doc) => ({ id: doc.id, title: doc.title, text: doc.text })),
    query,
  )
  const byId = new Map(docs.map((doc) => [doc.id, doc.hit]))
  const maxBm25 = ranked[0]?.score || 1

  return ranked.map((hit) => {
    const base = byId.get(hit.id)
    if (!base) {
      throw new Error(`Missing search document ${hit.id}`)
    }
    const bm25 = hit.score / maxBm25
    const vector = vectorScores?.get(hit.id)
    const score = vector == null ? bm25 : bm25 * 0.62 + Math.max(0, vector) * 0.38
    return { ...base, score, answerable: hit.answerable, coverage: hit.coverage, titleMatches: hit.titleMatches }
  }).sort((a, b) => b.score - a.score)
}

export function bestExcerpt(content: string, query: string): string {
  const terms = unique(tokenize(query))
  const wantsNumber = /\b(how many|how much|how long)\b/i.test(query)
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
  if (sentences.length === 0) return content.slice(0, 280)

  const scored = sentences.map((sentence, index) => {
    const words = new Set(tokenize(sentence))
    let overlap = 0
    for (const term of terms) {
      if (!words.has(term)) continue
      overlap += SOFT_TERMS.has(term) ? 1 : 4
    }
    if (wantsNumber && /\d/.test(sentence)) overlap += 3
    return { sentence, index, overlap }
  })
  scored.sort((a, b) => b.overlap - a.overlap || a.index - b.index)
  const best = scored[0] ?? { sentence: content, index: 0, overlap: 0 }
  const next = sentences[best.index + 1]
  const excerpt = next && (best.sentence.length < 160 || (wantsNumber && !/\d/.test(best.sentence))) ? `${best.sentence} ${next}` : best.sentence
  return excerpt.length > 420 ? `${excerpt.slice(0, 417).trim()}...` : excerpt
}
