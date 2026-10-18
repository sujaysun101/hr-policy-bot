const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "at",
  "by",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "me",
  "my",
  "we",
  "our",
  "you",
  "your",
  "they",
  "them",
  "their",
  "do",
  "does",
  "did",
  "doing",
  "can",
  "could",
  "should",
  "would",
  "will",
  "just",
  "about",
  "into",
  "over",
  "after",
  "before",
  "what",
  "when",
  "where",
  "which",
  "who",
  "whom",
  "why",
  "how",
  "there",
  "here",
  "not",
  "no",
  "nor",
  "so",
  "than",
  "too",
  "very",
  "also",
  "any",
  "some",
  "such",
  "only",
  "own",
  "same",
  "other",
  "please",
  "tell",
  "need",
  "needs",
  "get",
  "got",
  "have",
  "has",
  "had",
  "having",
  "am",
])

/** Light stem so "biking" and "bike", or "days" and "day", land on the same token. */
export function stem(token: string): string {
  let value = token
  if (value.endsWith("ing") && value.length > 5) value = value.slice(0, -3)
  else if (value.endsWith("ed") && value.length > 4) value = value.slice(0, -2)
  else if (value.endsWith("s") && !value.endsWith("ss") && value.length > 3) value = value.slice(0, -1)
  if (value.endsWith("e") && value.length > 3) value = value.slice(0, -1)
  return value
}

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[$%]/g, " ")
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP.has(token))
    .map(stem)
}

export function unique(tokens: string[]): string[] {
  return [...new Set(tokens)]
}
