import type { NewChunkInput } from "@/lib/types"

export class HandbookParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "HandbookParseError"
  }
}

function clean(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

function pack(sections: { sectionNumber: string; sectionTitle: string; content: string; page: number }[]): NewChunkInput[] {
  const chunks: NewChunkInput[] = []
  for (const section of sections) {
    const content = clean(section.content)
    if (content.length < 40) continue
    if (content.length <= 1800) {
      chunks.push({ ...section, content })
      continue
    }
    const paragraphs = content.split(/\n\n+/)
    let buffer = ""
    let part = 1
    const flush = () => {
      if (buffer.trim().length < 40) return
      chunks.push({
        sectionNumber: part === 1 ? section.sectionNumber : `${section.sectionNumber}.${part}`,
        sectionTitle: part === 1 ? section.sectionTitle : `${section.sectionTitle} (continued)`,
        content: buffer.trim(),
        page: section.page,
      })
      part += 1
      buffer = ""
    }
    for (const paragraph of paragraphs) {
      if ((buffer + paragraph).length > 1600) flush()
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph
    }
    flush()
  }
  if (chunks.length === 0) throw new HandbookParseError("That file did not contain enough text to make a handbook section.")
  return chunks
}

function chunkPlain(pages: string[]): NewChunkInput[] {
  const sections: { sectionNumber: string; sectionTitle: string; content: string; page: number }[] = []
  let current = { sectionNumber: "1", sectionTitle: "Handbook", content: "", page: 1 }
  const push = () => {
    if (current.content.trim()) sections.push({ ...current })
  }
  pages.forEach((pageText, pageIndex) => {
    const lines = pageText.split(/\n/)
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) {
        current.content += "\n"
        continue
      }
      const numbered = line.match(/^(\d+(?:\.\d+)*)\s+([A-Z][^.]{2,80})$/)
      const heading = line.length < 80 && !/[.!?]$/.test(line) && /[A-Za-z]/.test(line) && line === line.replace(/ {2,}/g, " ") && /^[A-Z0-9]/.test(line) && line.split(" ").length <= 10
      if (numbered || (heading && current.content.trim().length > 80)) {
        push()
        current = {
          sectionNumber: numbered?.[1] || `${sections.length + 1}`,
          sectionTitle: numbered?.[2] || line,
          content: "",
          page: pageIndex + 1,
        }
        continue
      }
      current.content += `${line}\n`
    }
  })
  push()
  return pack(sections)
}

function chunkHtml(html: string): NewChunkInput[] {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, "")
  const parts = withoutScripts.split(/<h[1-3][^>]*>/i)
  const sections: { sectionNumber: string; sectionTitle: string; content: string; page: number }[] = []
  parts.forEach((part, index) => {
    const [headingRaw, ...rest] = part.split(/<\/h[1-3]>/i)
    const heading = clean((headingRaw ?? "").replace(/<[^>]+>/g, " "))
    const body = clean((rest.join(" ") || (index === 0 ? headingRaw : "")).replace(/<[^>]+>/g, " "))
    if (!body) return
    const numbered = heading.match(/^(\d+(?:\.\d+)*)\s+(.+)$/)
    sections.push({
      sectionNumber: numbered?.[1] || `${sections.length + 1}`,
      sectionTitle: numbered?.[2] || heading || `Section ${sections.length + 1}`,
      content: body,
      page: 1,
    })
  })
  return pack(sections)
}

export async function parseHandbookFile(file: File): Promise<{ title: string; chunks: NewChunkInput[] }> {
  const name = file.name.toLowerCase()
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.byteLength === 0) throw new HandbookParseError("That file is empty.")
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const { extractText, getDocumentProxy } = await import("unpdf")
    const pdf = await getDocumentProxy(bytes)
    const extracted = await extractText(pdf, { mergePages: false })
    const pages = Array.isArray(extracted.text) ? extracted.text : [extracted.text]
    const chunks = chunkPlain(pages.map((page) => page.replace(/\s+\n/g, "\n")))
    const title = chunks[0]?.sectionTitle && chunks[0].sectionTitle !== "Handbook" ? file.name.replace(/\.pdf$/i, "") : file.name.replace(/\.pdf$/i, "")
    return { title, chunks }
  }
  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth")
    const result = await mammoth.convertToHtml({ buffer: Buffer.from(bytes) })
    const chunks = chunkHtml(result.value)
    return { title: file.name.replace(/\.docx$/i, ""), chunks }
  }
  throw new HandbookParseError("Upload a PDF or DOCX handbook.")
}
