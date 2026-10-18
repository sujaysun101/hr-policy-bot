import { KnowledgeManager } from "@/components/knowledge/knowledge-manager"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Knowledge" }

export default async function KnowledgePage() {
  const { session, store } = await requireOrg()
  if (session.role !== "hr") {
    return <p className="text-sm text-muted-foreground">The knowledge base is edited by organization admins.</p>
  }
  const entries = await store.listKnowledge(session.orgId)
  return <KnowledgeManager entries={entries} />
}
