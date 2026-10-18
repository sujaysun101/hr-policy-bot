import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { getStore } from "@/lib/store"

export async function requireUser() {
  const session = await getSession()
  if (!session) redirect("/sign-in")
  return session
}

export async function requireOrg() {
  const session = await requireUser()
  if (!session.orgId) redirect("/onboarding")
  const store = await getStore()
  await store.ensureOrg(session.orgId, session.orgName)
  return { session: { ...session, orgId: session.orgId }, store }
}
