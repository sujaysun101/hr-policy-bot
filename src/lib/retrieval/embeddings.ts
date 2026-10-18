import { tokenize } from "@/lib/retrieval/tokenize"

const DIMS = 256

function hashToken(token: string): number {
  let hash = 2166136261
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash | 0
}

/** Local feature-hash embedding so pgvector can rank chunks without an embedding API. */
export function embedText(input: string): number[] {
  const vector = new Array<number>(DIMS).fill(0)
  const counts = new Map<string, number>()
  for (const token of tokenize(input)) counts.set(token, (counts.get(token) ?? 0) + 1)
  for (const [token, count] of counts) {
    const hash = hashToken(token)
    const index = Math.abs(hash) % DIMS
    const sign = hash % 2 === 0 ? 1 : -1
    const current = vector[index] ?? 0
    vector[index] = current + sign * (1 + Math.log(count))
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1
  return vector.map((value) => value / norm)
}

export function toVectorLiteral(vector: number[]): string {
  return `[${vector.map((value) => (Number.isFinite(value) ? value.toFixed(6) : "0")).join(",")}]`
}

export const EMBEDDING_DIMS = DIMS
