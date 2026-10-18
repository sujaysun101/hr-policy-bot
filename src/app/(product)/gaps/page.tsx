import { GapBoard } from "@/components/gaps/gap-board"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Policy gaps" }

export default async function GapsPage() {
  const { session, store } = await requireOrg()
  if (session.role !== "hr") {
    return <p className="text-sm text-muted-foreground">Policy gaps are visible to organization admins.</p>
  }
  const gaps = await store.listGaps(session.orgId)
  return <GapBoard gaps={gaps} />
}
