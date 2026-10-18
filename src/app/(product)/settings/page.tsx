import { aiConfigured } from "@/lib/ai/liam"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const { session, store } = await requireOrg()
  const info = store.info()
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl tracking-tight">Settings</h1>
      <dl className="mt-6 space-y-4 text-sm">
        <div className="rounded-2xl border bg-card p-4">
          <dt className="text-muted-foreground">Company</dt>
          <dd className="mt-1 text-base">{session.orgName}</dd>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <dt className="text-muted-foreground">Your role</dt>
          <dd className="mt-1 text-base">{session.role === "hr" ? "HR admin" : "Employee"}</dd>
          <p className="mt-2 text-muted-foreground">In Clerk, organization admins are HR. Everyone else in the organization is an employee. Admins upload handbooks, answer the queue, and edit the knowledge base.</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <dt className="text-muted-foreground">Data</dt>
          <dd className="mt-1 text-base">{info.mode === "postgres" ? "Postgres" : "Demo data, in memory"}</dd>
          <p className="mt-2 text-muted-foreground">
            {info.mode === "memory"
              ? "DATABASE_URL is not set, so this browser session is showing the Cedar & Pine sample. Uploads last until the server restarts."
              : "Handbooks, questions, and answers are stored in your database."}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <dt className="text-muted-foreground">Search</dt>
          <dd className="mt-1 text-base">{info.retrieval === "pgvector" ? "pgvector plus BM25" : "BM25 keyword search"}</dd>
          <p className="mt-2 text-muted-foreground">If the Postgres vector extension is available, Liam blends it with keyword search. Otherwise he uses BM25 only.</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <dt className="text-muted-foreground">Answers</dt>
          <dd className="mt-1 text-base">{aiConfigured() ? "Claude is configured" : "Sample answers from the handbook text"}</dd>
          <p className="mt-2 text-muted-foreground">Model calls stay on the server. Set ANTHROPIC_API_KEY and optionally AI_MODEL. Without a key, Liam still searches and quotes the matching section, and the reply is labeled as a sample.</p>
        </div>
      </dl>
    </div>
  )
}
