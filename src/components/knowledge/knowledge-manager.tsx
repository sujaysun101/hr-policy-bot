"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatDay } from "@/lib/format"
import type { KnowledgeEntry } from "@/lib/types"

export function KnowledgeManager({ entries, apiBase = "/api" }: { entries: KnowledgeEntry[]; apiBase?: string }) {
  const router = useRouter()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [topic, setTopic] = useState("")
  const [pending, setPending] = useState(false)

  async function add(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const response = await fetch(`${apiBase}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, topic }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not save that note.")
        return
      }
      setQuestion("")
      setAnswer("")
      setTopic("")
      toast.success("Liam can cite this note now.")
      router.refresh()
    } catch {
      toast.error("Could not save that note.")
    } finally {
      setPending(false)
    }
  }

  async function remove(id: string) {
    const response = await fetch(`${apiBase}/knowledge/${id}`, { method: "DELETE" })
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error || "Could not remove that note.")
      return
    }
    toast.success("Note removed.")
    router.refresh()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Knowledge base</h1>
        <p className="mt-1 text-muted-foreground">Notes HR added after the handbook was silent. Liam searches these alongside the PDF and cites them as HR knowledge.</p>
      </div>
      <form onSubmit={add} className="space-y-3 rounded-2xl border bg-card p-4">
        <div>
          <label htmlFor="topic" className="text-sm font-medium">Topic</label>
          <Input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-1 h-10" required />
        </div>
        <div>
          <label htmlFor="kb-question" className="text-sm font-medium">Question employees ask</label>
          <Input id="kb-question" value={question} onChange={(event) => setQuestion(event.target.value)} className="mt-1 h-10" required />
        </div>
        <div>
          <label htmlFor="kb-answer" className="text-sm font-medium">Answer Liam should give</label>
          <Textarea id="kb-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} className="mt-1" required />
        </div>
        <Button type="submit" disabled={pending}>{pending ? "Saving" : "Add note"}</Button>
      </form>
      <ul className="space-y-3">
        {entries.length === 0 ? <li className="text-sm text-muted-foreground">No HR notes yet.</li> : null}
        {entries.map((entry) => (
          <li key={entry.id} id={entry.id} className="rounded-2xl border bg-card p-4">
            <p className="text-xs text-copper">{entry.topic}</p>
            <h2 className="mt-1 font-medium">{entry.question}</h2>
            <p className="mt-2 text-sm leading-6">{entry.answer}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{entry.createdByName} · {formatDay(entry.createdAt)}</span>
              <Button variant="ghost" size="sm" onClick={() => remove(entry.id)}>Remove</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
