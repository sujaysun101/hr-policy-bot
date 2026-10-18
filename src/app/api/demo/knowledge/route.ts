import { jsonError, readJson } from "@/lib/api"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { knowledgeInputSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  const parsed = knowledgeInputSchema.safeParse(await readJson(request))
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the question and answer.")
  const entry = await access.store.addKnowledge({
    orgId: access.orgId,
    question: parsed.data.question,
    answer: parsed.data.answer,
    topic: parsed.data.topic,
    createdByName: access.name,
  })
  return Response.json({ entry })
}
