import { ChatView } from "@/components/chat/chat-view"
import { aiConfigured } from "@/lib/ai/liam"
import { requireOrg } from "@/lib/guard"

export const metadata = { title: "Ask Liam" }

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { session, store } = await requireOrg()
  const params = await searchParams
  const conversations = await store.listConversations(session.orgId, session.userId)
  return <ChatView conversations={conversations} active={null} aiConfigured={aiConfigured()} initialDraft={params.q || ""} />
}
