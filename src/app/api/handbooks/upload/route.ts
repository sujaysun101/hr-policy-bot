import { HandbookParseError, parseHandbookFile } from "@/lib/parse/document"
import { isResponse, jsonError, requireApiSession } from "@/lib/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  const access = await requireApiSession()
  if (isResponse(access)) return access
  const { session, store } = access
  if (session.role !== "hr") return jsonError("Only HR admins can upload a handbook.", 403)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return jsonError("Upload a PDF or DOCX file.")
  }
  const file = form.get("file")
  if (!(file instanceof File)) return jsonError("Choose a PDF or DOCX handbook.")
  const name = file.name.toLowerCase()
  if (!name.endsWith(".pdf") && !name.endsWith(".docx")) return jsonError("Upload a PDF or DOCX handbook.")
  if (file.size > MAX_BYTES) return jsonError("Files need to be 8 MB or smaller.")

  try {
    const parsed = await parseHandbookFile(file)
    const handbook = await store.addHandbook({
      orgId: session.orgId || "",
      title: parsed.title,
      fileName: file.name,
      mimeType: file.type || (name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      uploadedBy: session.userId,
      uploadedByName: session.name,
      chunks: parsed.chunks,
    })
    return Response.json({ handbook })
  } catch (error) {
    if (error instanceof HandbookParseError) return jsonError(error.message)
    console.error("Upload failed", error instanceof Error ? error.message : "upload error")
    return jsonError("We could not read that file. Try a text-based PDF or DOCX.")
  }
}
