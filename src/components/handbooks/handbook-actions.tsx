"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function HandbookActions({ apiBase = "/api", showSample }: { apiBase?: string; showSample: boolean }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [fileName, setFileName] = useState("")

  async function upload(file: File) {
    setPending(true)
    setFileName(file.name)
    try {
      const body = new FormData()
      body.set("file", file)
      const response = await fetch(`${apiBase}/handbooks/upload`, { method: "POST", body })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not read that file.")
        return
      }
      toast.success(`${data.handbook?.title || "Handbook"} is ready for Liam.`)
      router.refresh()
    } catch {
      toast.error("Could not read that file.")
    } finally {
      setPending(false)
    }
  }

  async function loadSample() {
    setPending(true)
    try {
      const response = await fetch(`${apiBase}/handbooks/sample`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error || "Could not load the sample.")
        return
      }
      toast.success(data.created ? "Cedar & Pine sample handbook loaded." : "The sample handbook is already here.")
      router.refresh()
    } catch {
      toast.error("Could not load the sample.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-dashed bg-card p-5">
      <h2 className="font-heading text-xl">Upload a handbook</h2>
      <p className="mt-1 text-sm text-muted-foreground">PDF or DOCX, up to 8 MB. Liam splits it into sections and cites those sections.</p>
      <label className="mt-4 flex cursor-pointer flex-col items-start gap-2">
        <span className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{pending ? "Working..." : "Choose a file"}</span>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void upload(file)
            event.target.value = ""
          }}
        />
        {fileName ? <span className="text-xs text-muted-foreground">{fileName}</span> : null}
      </label>
      {showSample ? (
        <Button variant="outline" className="mt-4" disabled={pending} onClick={loadSample}>
          Load the Cedar & Pine sample
        </Button>
      ) : null}
    </div>
  )
}

export function DeleteHandbookButton({ id, apiBase = "/api" }: { id: string; apiBase?: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const response = await fetch(`${apiBase}/handbooks/${id}`, { method: "DELETE" })
        const data = await response.json()
        setPending(false)
        if (!response.ok) {
          toast.error(data.error || "Could not remove that handbook.")
          return
        }
        toast.success("Handbook removed.")
        router.push(apiBase.startsWith("/api/demo") ? "/demo/handbooks" : "/handbooks")
        router.refresh()
      }}
    >
      Remove handbook
    </Button>
  )
}
