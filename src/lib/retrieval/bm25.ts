import { tokenize, unique } from "@/lib/retrieval/tokenize"
import { SOFT_TERMS } from "@/lib/retrieval/terms"

export type IndexedDoc = {
  id: string
  title: string
  text: string
}

export type Bm25Hit = {
  id: string
  score: number
  overlap: number
  titleMatches: number
  coverage: number
  answerable: boolean
}

const K1 = 1.4
const B = 0.65

export function rankBm25(docs: IndexedDoc[], query: string): Bm25Hit[] {
  const queryTerms = unique(tokenize(query))
  if (queryTerms.length === 0 || docs.length === 0) return []

  const tokenized = docs.map((doc) => tokenize(`${doc.title} ${doc.title} ${doc.text}`))
  const titleTokens = docs.map((doc) => new Set(tokenize(doc.title)))
  const averageLength = tokenized.reduce((sum, tokens) => sum + tokens.length, 0) / docs.length || 1
  const documentFrequency = new Map<string, number>()

  for (const tokens of tokenized) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }

  const hits: Bm25Hit[] = docs.map((doc, index) => {
    const tokens = tokenized[index] ?? []
    const termFrequency = new Map<string, number>()
    for (const token of tokens) termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1)

    let score = 0
    const matched: string[] = []
    let titleMatches = 0

    for (const term of queryTerms) {
      const frequency = termFrequency.get(term) ?? 0
      if (!frequency) continue
      matched.push(term)
      if (titleTokens[index]?.has(term)) {
        titleMatches += 1
        score += 0.55
      }
      const docsWithTerm = documentFrequency.get(term) ?? 0
      const idf = Math.log(1 + (docs.length - docsWithTerm + 0.5) / (docsWithTerm + 0.5))
      const denominator = frequency + K1 * (1 - B + B * (tokens.length / averageLength))
      score += idf * ((frequency * (K1 + 1)) / denominator)
    }

    const coverage = matched.length / queryTerms.length
    const hardTerms = queryTerms.filter((term) => !SOFT_TERMS.has(term))
    const matchedHard = matched.filter((term) => !SOFT_TERMS.has(term))
    const answerable = hardTerms.length === 0 ? matched.length > 0 && (titleMatches >= 1 || coverage >= 0.45) : matchedHard.length >= 1

    return {
      id: doc.id,
      score,
      overlap: matched.length,
      titleMatches,
      coverage,
      answerable,
    }
  })

  return hits.filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score)
}
