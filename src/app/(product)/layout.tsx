import { AppShell } from "@/components/app/shell"
import { getSession } from "@/lib/auth"
import { getStore } from "@/lib/store"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  const store = await getStore()
  if (session.orgId) await store.ensureOrg(session.orgId, session.orgName)
  const info = store.info()
  const queueCount = session.orgId && session.role === "hr" ? await store.countOpenQuestions(session.orgId) : 0
  return (
    <AppShell
      session={{
        name: session.name,
        email: session.email,
        role: session.role,
        orgName: session.orgName,
        clerk: true,
      }}
      demoData={info.demoData || info.mode === "memory"}
      retrieval={info.retrieval}
      queueCount={queueCount}
    >
      {children}
    </AppShell>
  )
}
