"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { PolicyGap } from "@/lib/types"

export function GapBoard({ gaps, apiBase = "/api" }: { gaps: PolicyGap[]; apiBase?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const open = gaps.filter((gap) => gap.status === "suggested")
  const closed = gaps.filter((gap) => gap.status !== "suggested")

  async function act(id: string, action: "addressed" | "dismiss") {
    setPending(id)
    try {
      const response = await fetch(`${apiBase}/gaps/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not update that gap.")
        return
      }
      toast.success(action === "addressed" ? "Marked as addressed." : "Gap dismissed.")
      router.refresh()
    } catch {
      toast.error("Could not update that gap.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="font-heading text-3xl tracking-tight">Policy gaps</h1>
        <p className="mt-1 text-muted-foreground">Topics people ask about when the handbook has no section. Write the missing policy, or mark it addressed after you add an HR note.</p>
      </div>
      {open.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">No open gaps. Liam is finding answers in the handbook.</p> : null}
      {open.map((gap) => (
        <article key={gap.id} className="rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-heading text-xl">{gap.topic}</h2>
            <p className="text-sm text-copper">{gap.questionCount} ask{gap.questionCount === 1 ? "" : "s"}</p>
          </div>
          <p className="mt-2 text-sm leading-6">{gap.summary}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {gap.sampleQuestions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-muted p-3 text-sm leading-6">{gap.suggestedOutline}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={pending === gap.id} onClick={() => act(gap.id, "addressed")}>
              Mark addressed
            </Button>
            <Button size="sm" variant="outline" disabled={pending === gap.id} onClick={() => act(gap.id, "dismiss")}>
              Dismiss
            </Button>
          </div>
        </article>
      ))}
      {closed.length > 0 ? (
        <div className="pt-4">
          <h2 className="text-sm font-medium text-muted-foreground">Closed</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {closed.map((gap) => (
              <li key={gap.id} className="rounded-lg border px-3 py-2">
                {gap.topic} · {gap.status}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
