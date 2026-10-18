"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatWhen } from "@/lib/format"
import type { HrQuestion } from "@/lib/types"

export function QueueBoard({ questions, apiBase = "/api" }: { questions: HrQuestion[]; apiBase?: string }) {
  const router = useRouter()
  const [filter, setFilter] = useState<"open" | "answered" | "dismissed">("open")
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [pending, setPending] = useState<string | null>(null)
  const visible = questions.filter((question) => question.status === filter)

  async function act(id: string, action: "answer" | "dismiss" | "add_to_kb") {
    setPending(id + action)
    try {
      const response = await fetch(`${apiBase}/queue/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, answer: drafts[id] || "" }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not update that question.")
        return
      }
      toast.success(action === "add_to_kb" ? "Answer added to the knowledge base." : action === "dismiss" ? "Question dismissed." : "Answer saved.")
      router.refresh()
    } catch {
      toast.error("Could not update that question.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">HR queue</h1>
        <p className="mt-1 text-muted-foreground">Questions Liam could not answer from the handbook. Reply, then add the answer so the next person gets a citation.</p>
      </div>
      <div className="flex gap-2" role="tablist" aria-label="Queue status">
        {(["open", "answered", "dismissed"] as const).map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={filter === status}
            className={`rounded-full px-3 py-1 text-sm capitalize ${filter === status ? "bg-primary text-primary-foreground" : "border"}`}
            onClick={() => setFilter(status)}
          >
            {status} ({questions.filter((question) => question.status === status).length})
          </button>
        ))}
      </div>
      {visible.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nothing in {filter}.</p> : null}
      {visible.map((question) => (
        <article key={question.id} className="rounded-2xl border bg-card p-4">
          <p className="font-medium">{question.question}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {question.askedByName} · {formatWhen(question.createdAt)} · {question.topic}
            {question.closestSection ? ` · closest: ${question.closestSection}` : ""}
          </p>
          {question.answer ? <p className="mt-3 text-sm leading-6">{question.answer}</p> : null}
          {question.status === "open" ? (
            <div className="mt-3 space-y-2">
              <label className="text-sm font-medium" htmlFor={`answer-${question.id}`}>
                Answer
              </label>
              <Textarea
                id={`answer-${question.id}`}
                value={drafts[question.id] ?? ""}
                onChange={(event) => setDrafts((current) => ({ ...current, [question.id]: event.target.value }))}
                placeholder="Write the policy the way you want Liam to repeat it"
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={pending !== null} onClick={() => act(question.id, "add_to_kb")}>
                  Add to knowledge base
                </Button>
                <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => act(question.id, "answer")}>
                  Save answer only
                </Button>
                <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => act(question.id, "dismiss")}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
