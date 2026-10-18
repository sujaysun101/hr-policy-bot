"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Citation, Conversation, Message } from "@/lib/types"

const SUGGESTIONS = [
  "How many vacation days do I get?",
  "What is the parental leave policy?",
  "Do I need a receipt for a $40 team lunch?",
  "Can I bring my dog to the studio on Fridays?",
]

export function ChatView({
  basePath = "",
  apiBase = "/api",
  conversations,
  active,
  aiConfigured,
  initialDraft = "",
}: {
  basePath?: string
  apiBase?: string
  conversations: Conversation[]
  active: (Conversation & { messages: Message[] }) | null
  aiConfigured: boolean
  initialDraft?: string
}) {
  const router = useRouter()
  const [draft, setDraft] = useState(initialDraft)
  const [pending, setPending] = useState(false)
  const [asking, setAsking] = useState<string | null>(null)

  async function send(text: string) {
    const message = text.trim()
    if (!message || pending) return
    setPending(true)
    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId: active?.id }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Liam could not answer that.")
        return
      }
      setDraft("")
      router.push(`${basePath}/chat/${data.conversationId}`)
      router.refresh()
    } catch {
      toast.error("Liam could not answer that.")
    } finally {
      setPending(false)
    }
  }

  async function askHr(message: Message) {
    if (!active) return
    setAsking(message.id)
    try {
      const response = await fetch(`${apiBase}/chat/ask-hr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: active.id, messageId: message.id }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not send that to HR.")
        return
      }
      toast.success(data.alreadySent ? "HR already has this question." : "Sent to HR.")
      router.refresh()
    } catch {
      toast.error("Could not send that to HR.")
    } finally {
      setAsking(null)
    }
  }

  return (
    <div className="mx-auto grid h-[calc(100vh-8.5rem)] max-w-6xl gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden flex-col gap-2 overflow-y-auto lg:flex">
        <Link href={`${basePath}/chat`} className="rounded-lg bg-primary px-3 py-2 text-center text-sm text-primary-foreground">
          New question
        </Link>
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`${basePath}/chat/${conversation.id}`}
            className={`rounded-lg px-3 py-2 text-sm ${active?.id === conversation.id ? "bg-muted font-medium" : "hover:bg-muted"}`}
          >
            <span className="line-clamp-2">{conversation.title}</span>
          </Link>
        ))}
        {conversations.length === 0 ? <p className="px-2 text-sm text-muted-foreground">No conversations yet.</p> : null}
      </aside>
      <section className="flex min-h-0 flex-col rounded-2xl border bg-card">
        <div className="border-b px-4 py-3">
          <h1 className="font-heading text-xl">Ask Liam</h1>
          <p className="text-sm text-muted-foreground">
            {aiConfigured
              ? "Answers come from your handbook and any notes HR has added."
              : "Sample mode: no AI key is set, so Liam quotes the matching section directly."}
          </p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {!active || active.messages.length === 0 ? (
            <div className="mx-auto max-w-lg py-8 text-center">
              <p className="font-heading text-2xl">What does the handbook say?</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((prompt) => (
                  <button key={prompt} type="button" className="rounded-full border px-3 py-1.5 text-left text-sm hover:bg-muted" onClick={() => send(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {active?.messages.map((message) => (
            <article key={message.id} className={message.role === "user" ? "ml-auto max-w-xl rounded-2xl bg-primary px-4 py-3 text-primary-foreground" : "max-w-2xl"}>
              {message.role === "assistant" ? <p className="mb-1 text-xs font-medium text-copper">Liam</p> : null}
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
              {message.sample ? (
                <p className="mt-2 text-xs text-muted-foreground">Sample response. ANTHROPIC_API_KEY is not set, so this answer is quoted from the handbook instead of a model.</p>
              ) : null}
              {message.citations.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {message.citations.map((citation) => (
                    <li key={citation.chunkId}>
                      <CitationCard citation={citation} basePath={basePath} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {message.role === "assistant" && message.suggestAskHr ? (
                <div className="mt-3">
                  {message.questionId ? (
                    <Badge variant="outline">Sent to HR</Badge>
                  ) : (
                    <Button variant="outline" size="sm" disabled={asking === message.id} onClick={() => askHr(message)}>
                      {asking === message.id ? "Sending" : "Ask HR"}
                    </Button>
                  )}
                </div>
              ) : null}
            </article>
          ))}
          {pending ? <p className="text-sm text-muted-foreground">Liam is checking the handbook...</p> : null}
        </div>
        <form
          className="border-t p-3"
          onSubmit={(event) => {
            event.preventDefault()
            void send(draft)
          }}
        >
          <label htmlFor="question" className="sr-only">
            Question for Liam
          </label>
          <Textarea
            id="question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about PTO, leave, expenses, or anything else in the handbook"
            rows={2}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                void send(draft)
              }
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={pending || !draft.trim()}>
              {pending ? "Asking" : "Ask Liam"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CitationCard({ citation, basePath }: { citation: Citation; basePath: string }) {
  const href = citation.handbookId ? `${basePath}/handbooks/${citation.handbookId}#${citation.chunkId}` : `${basePath}/knowledge`
  return (
    <a href={href} className="block rounded-xl border bg-background p-3 text-foreground hover:bg-muted">
      <p className="text-xs">
        <span className="font-medium text-copper">{citation.sectionNumber}</span> {citation.sectionTitle}
        {citation.related ? " · related, not a direct answer" : ""}
        {citation.page ? ` · p. ${citation.page}` : ""}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{citation.excerpt}</p>
    </a>
  )
}
