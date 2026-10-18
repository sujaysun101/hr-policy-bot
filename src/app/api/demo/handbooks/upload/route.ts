import { jsonError } from "@/lib/api"
import { demoStore, isNextResponse } from "@/lib/demo-api"
import { HandbookParseError, parseHandbookFile } from "@/lib/parse/document"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const access = demoStore()
  if (isNextResponse(access)) return access
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return jsonError("Upload a PDF or DOCX file.")
  }
  const file = form.get("file")
  if (!(file instanceof File)) return jsonError("Choose a PDF or DOCX handbook.")
  if (file.size > 8 * 1024 * 1024) return jsonError("Files need to be 8 MB or smaller.")
  try {
    const parsed = await parseHandbookFile(file)
    const handbook = await access.store.addHandbook({
      orgId: access.orgId,
      title: parsed.title,
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      uploadedBy: access.userId,
      uploadedByName: access.name,
      chunks: parsed.chunks,
    })
    return Response.json({ handbook })
  } catch (error) {
    if (error instanceof HandbookParseError) return jsonError(error.message)
    return jsonError("We could not read that file.")
  }
}
