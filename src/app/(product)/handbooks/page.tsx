import Link from "next/link"
import { HandbookActions } from "@/components/handbooks/handbook-actions"
import { requireOrg } from "@/lib/guard"
import { formatDay } from "@/lib/format"

export const metadata = { title: "Handbooks" }

export default async function HandbooksPage() {
  const { session, store } = await requireOrg()
  const handbooks = await store.listHandbooks(session.orgId)
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Handbooks</h1>
        <p className="mt-1 text-muted-foreground">The documents Liam is allowed to cite.</p>
      </div>
      {session.role === "hr" ? <HandbookActions showSample={handbooks.every((handbook) => !handbook.sample)} /> : null}
      {handbooks.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No handbook yet. HR can upload a PDF or DOCX, or load the Cedar & Pine sample.</p> : null}
      <ul className="grid gap-3">
        {handbooks.map((handbook) => (
          <li key={handbook.id}>
            <Link href={`/handbooks/${handbook.id}`} className="block rounded-2xl border bg-card p-4 hover:bg-muted">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{handbook.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {handbook.fileName} · {handbook.chunkCount} sections · {handbook.uploadedByName} · {formatDay(handbook.createdAt)}
                  </p>
                </div>
                {handbook.sample ? <span className="text-xs text-copper">Sample</span> : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
