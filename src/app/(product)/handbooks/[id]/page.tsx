import { notFound } from "next/navigation"
import { DeleteHandbookButton } from "@/components/handbooks/handbook-actions"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Handbook" }

export default async function HandbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { session, store } = await requireOrg()
  const { id } = await params
  const handbook = await store.getHandbook(session.orgId, id)
  if (!handbook) notFound()
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <h1 className="font-heading text-2xl">{handbook.title}</h1>
        <p className="mt-1 text-xs text-muted-foreground">{handbook.chunkCount} sections</p>
        <nav aria-label="Sections" className="mt-4 flex max-h-[70vh] flex-col gap-1 overflow-y-auto text-sm">
          {handbook.chunks.map((chunk) => (
            <a key={chunk.id} href={`#${chunk.id}`} className="rounded px-2 py-1 hover:bg-muted">
              <span className="text-copper">{chunk.sectionNumber}</span> {chunk.sectionTitle}
            </a>
          ))}
        </nav>
        {session.role === "hr" ? (
          <div className="mt-4">
            <DeleteHandbookButton id={handbook.id} />
          </div>
        ) : null}
      </aside>
      <div className="space-y-6">
        {handbook.chunks.map((chunk) => (
          <article key={chunk.id} id={chunk.id} className="scroll-mt-20 rounded-2xl border bg-card p-5">
            <p className="text-xs text-copper">
              {chunk.sectionNumber} · page {chunk.page}
            </p>
            <h2 className="mt-1 font-heading text-2xl">{chunk.sectionTitle}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{chunk.content}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
