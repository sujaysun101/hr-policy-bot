import { NextResponse } from "next/server"
import { createMemoryStore } from "@/lib/store/memory"
import { DEMO_ORG_ID } from "@/lib/seed/demo"
import type { AppStore } from "@/lib/types"

export function demoDisabled() {
  return process.env.DEMO_SCREENSHOT !== "1"
}

export function demoStore(): { store: AppStore; orgId: string; userId: string; name: string } | NextResponse {
  if (demoDisabled()) return NextResponse.json({ error: "Not found." }, { status: 404 })
  return { store: createMemoryStore(), orgId: DEMO_ORG_ID, userId: "user_avery", name: "Avery Chen" }
}

export function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse
}
