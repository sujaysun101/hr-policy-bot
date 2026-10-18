import { notFound } from "next/navigation"
import { AppShell } from "@/components/app/shell"
import { ChatView } from "@/components/chat/chat-view"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { GapBoard } from "@/components/gaps/gap-board"
import { DeleteHandbookButton, HandbookActions } from "@/components/handbooks/handbook-actions"
import { KnowledgeManager } from "@/components/knowledge/knowledge-manager"
import { QueueBoard } from "@/components/queue/queue-board"
import { aiConfigured } from "@/lib/ai/liam"
import { formatDay } from "@/lib/format"
import { DEMO_ORG_ID, DEMO_ORG_NAME } from "@/lib/seed/demo"
import { createMemoryStore } from "@/lib/store/memory"
import Link from "next/link"

export const dynamic = "force-dynamic"

const session = {
  name: "Avery Chen",
  email: "avery.chen@cedarandpine.example",
  role: "hr" as const,
  orgName: DEMO_ORG_NAME,
  clerk: false,
}

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{ q?: string }>
}) {
  if (process.env.DEMO_SCREENSHOT !== "1") notFound()
  const { slug = [] } = await params
  const query = await searchParams
  const store = createMemoryStore()
  const orgId = DEMO_ORG_ID
  const [analytics, conversations, gaps, questions, handbooks, knowledge, queueCount] = await Promise.all([
    store.analytics(orgId),
    store.listConversations(orgId, "user_avery"),
    store.listGaps(orgId),
    store.listQuestions(orgId),
    store.listHandbooks(orgId),
    store.listKnowledge(orgId),
    store.countOpenQuestions(orgId),
  ])
  const section = slug[0] || "home"
  const id = slug[1]
  let content: React.ReactNode = null

  if (section === "home") {
    content = (
      <DashboardView
        analytics={analytics}
        role="hr"
        firstName="Avery"
        orgName={DEMO_ORG_NAME}
        conversations={conversations}
        gaps={gaps}
        basePath="/demo"
      />
    )
  } else if (section === "chat") {
    const active = id ? await store.getConversation(orgId, id, "user_avery", true) : null
    content = (
      <ChatView
        basePath="/demo"
        apiBase="/api/demo"
        conversations={conversations}
        active={active}
        aiConfigured={aiConfigured()}
        initialDraft={query.q || ""}
      />
    )
  } else if (section === "handbooks" && id) {
    const handbook = await store.getHandbook(orgId, id)
    if (!handbook) notFound()
    content = (
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <h1 className="font-heading text-2xl">{handbook.title}</h1>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            {handbook.chunks.map((chunk) => (
              <a key={chunk.id} href={`#${chunk.id}`} className="rounded px-2 py-1 hover:bg-muted">
                <span className="text-copper">{chunk.sectionNumber}</span> {chunk.sectionTitle}
              </a>
            ))}
          </nav>
          <div className="mt-4">
            <DeleteHandbookButton id={handbook.id} apiBase="/api/demo" />
          </div>
        </aside>
        <div className="space-y-6">
          {handbook.chunks.map((chunk) => (
            <article key={chunk.id} id={chunk.id} className="scroll-mt-20 rounded-2xl border bg-card p-5">
              <p className="text-xs text-copper">{chunk.sectionNumber}</p>
              <h2 className="font-heading text-2xl">{chunk.sectionTitle}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{chunk.content}</p>
            </article>
          ))}
        </div>
      </div>
    )
  } else if (section === "handbooks") {
    content = (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <h1 className="font-heading text-3xl">Handbooks</h1>
        <HandbookActions apiBase="/api/demo" showSample={handbooks.every((handbook) => !handbook.sample)} />
        <ul className="grid gap-3">
          {handbooks.map((handbook) => (
            <li key={handbook.id}>
              <Link href={`/demo/handbooks/${handbook.id}`} className="block rounded-2xl border bg-card p-4 hover:bg-muted">
                <h2 className="font-medium">{handbook.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {handbook.chunkCount} sections · {formatDay(handbook.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  } else if (section === "queue") {
    content = <QueueBoard questions={questions} apiBase="/api/demo" />
  } else if (section === "gaps") {
    content = <GapBoard gaps={gaps} apiBase="/api/demo" />
  } else if (section === "knowledge") {
    content = <KnowledgeManager entries={knowledge} apiBase="/api/demo" />
  } else if (section === "settings") {
    content = (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-3xl">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          You are viewing the Cedar & Pine sample as Avery Chen, People Lead. Search is BM25 in this preview. Organization admins are HR. Members are employees.
        </p>
      </div>
    )
  } else {
    notFound()
  }

  return (
    <AppShell session={session} demoData retrieval="bm25" queueCount={queueCount} basePath="/demo">
      {content}
    </AppShell>
  )
}
