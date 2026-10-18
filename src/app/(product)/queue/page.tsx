import { QueueBoard } from "@/components/queue/queue-board"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "HR queue" }

export default async function QueuePage() {
  const { session, store } = await requireOrg()
  if (session.role !== "hr") {
    return <p className="text-sm text-muted-foreground">The HR queue is visible to organization admins.</p>
  }
  const questions = await store.listQuestions(session.orgId)
  return <QueueBoard questions={questions} />
}
