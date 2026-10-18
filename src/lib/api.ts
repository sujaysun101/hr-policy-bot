import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getStore } from "@/lib/store"
import type { AppSession } from "@/lib/auth"
import type { AppStore } from "@/lib/types"

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export async function requireApiSession(): Promise<{ session: AppSession; store: AppStore } | NextResponse> {
  const session = await getSession()
  if (!session) return jsonError("Sign in to use Handbookly.", 401)
  if (!session.orgId) return jsonError("Create or choose a company before continuing.", 401)
  const store = await getStore()
  await store.ensureOrg(session.orgId, session.orgName)
  return { session: { ...session, orgId: session.orgId }, store }
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}
