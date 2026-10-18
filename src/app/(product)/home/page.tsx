import { DashboardView } from "@/components/dashboard/dashboard-view"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Dashboard" }

export default async function HomePage() {
  const { session, store } = await requireOrg()
  const [analytics, conversations, gaps] = await Promise.all([
    store.analytics(session.orgId),
    store.listConversations(session.orgId, session.userId),
    store.listGaps(session.orgId),
  ])
  return (
    <DashboardView
      analytics={analytics}
      role={session.role}
      firstName={session.firstName}
      orgName={session.orgName}
      conversations={conversations}
      gaps={gaps}
    />
  )
}
