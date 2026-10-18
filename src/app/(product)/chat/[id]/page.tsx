import { notFound } from "next/navigation"
import { ChatView } from "@/components/chat/chat-view"
import { aiConfigured } from "@/lib/ai/liam"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Ask Liam" }

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { session, store } = await requireOrg()
  const { id } = await params
  const [conversations, active] = await Promise.all([
    store.listConversations(session.orgId, session.userId),
    store.getConversation(session.orgId, id, session.userId, session.role === "hr"),
  ])
  if (!active) notFound()
  return <ChatView conversations={conversations} active={active} aiConfigured={aiConfigured()} />
}
