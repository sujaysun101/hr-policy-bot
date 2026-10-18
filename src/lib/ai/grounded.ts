import { bestExcerpt, type RankedHit } from "@/lib/retrieval/search"
import type { Citation, Confidence } from "@/lib/types"

export type GroundedAnswer = {
  content: string
  citations: Citation[]
  confidence: Confidence
  suggestAskHr: boolean
  sample: boolean
  closestSection?: string
}

function citationFromHit(hit: RankedHit, query: string, related: boolean): Citation {
  return {
    chunkId: hit.id,
    source: hit.source,
    sectionNumber: hit.sectionNumber,
    sectionTitle: hit.sectionTitle,
    excerpt: bestExcerpt(hit.content, query),
    handbookId: hit.handbookId,
    handbookTitle: hit.handbookTitle,
    page: hit.page,
    related,
  }
}

export function composeGrounded(question: string, hits: RankedHit[], sample: boolean): GroundedAnswer {
  const ranked = [...hits].sort((a, b) => Number(b.answerable) - Number(a.answerable) || b.score - a.score).slice(0, 5)
  const top = ranked.find((hit) => hit.answerable) ?? ranked[0]
  if (!top || !top.answerable) {
    const related = ranked.slice(0, 2).map((hit) => citationFromHit(hit, question, true))
    const closest = top ? `${top.sectionNumber} ${top.sectionTitle}` : undefined
    const closestSentence = closest
      ? ` The closest section I can see is ${closest}, and it does not answer this.`
      : ""
    return {
      content: `I could not find a handbook section that answers this.${closestSentence} I will not guess. Ask HR, and if they answer it they can add it to the knowledge base so the next person gets a citation.`,
      citations: related,
      confidence: "low",
      suggestAskHr: true,
      sample,
      closestSection: closest,
    }
  }

  const supporting = ranked.filter((hit) => hit.answerable).slice(0, 3)
  const primary = supporting[0] ?? top
  const excerpt = bestExcerpt(primary.content, question)
  const label =
    primary.source === "knowledge"
      ? `From the HR knowledge base, under ${primary.sectionTitle}`
      : `Section ${primary.sectionNumber}, ${primary.sectionTitle}`
  const secondary = supporting[1]
  const extra = secondary
    ? ` Related: section ${secondary.sectionNumber}, ${secondary.sectionTitle}.`
    : ""
  const confidence: Confidence = primary.coverage >= 0.5 || primary.titleMatches >= 2 ? "high" : "medium"

  return {
    content: `${label}: ${excerpt}${extra}`,
    citations: supporting.map((hit) => citationFromHit(hit, question, false)),
    confidence,
    suggestAskHr: false,
    sample,
    closestSection: `${primary.sectionNumber} ${primary.sectionTitle}`,
  }
}
