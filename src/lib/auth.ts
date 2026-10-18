export type AppSession = {
  userId: string
  orgId: string | null
  orgName: string
  role: "hr" | "employee"
  name: string
  firstName: string
  email: string
  imageUrl?: string
  clerk: true
}

export function roleFromOrgRole(orgRole: string | null | undefined): "hr" | "employee" {
  if (!orgRole) return "employee"
  const normalized = orgRole.toLowerCase()
  if (normalized === "org:admin" || normalized === "admin" || normalized.endsWith(":admin") || normalized.includes("hr")) return "hr"
  return "employee"
}

export function clerkKeysConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

const globalForClerk = globalThis as typeof globalThis & {
  __handbooklyClerkKeys?: Promise<{ publishableKey?: string; secretKey?: string }>
}

async function resolveClerkKeysOnce(): Promise<{ publishableKey?: string; secretKey?: string }> {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || undefined
  const secretKey = process.env.CLERK_SECRET_KEY || undefined
  if (publishableKey && secretKey) return { publishableKey, secretKey }
  if (process.env.NODE_ENV !== "development") return { publishableKey, secretKey }
  if (process.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED === "true") return { publishableKey, secretKey }
  try {
    const { clerkKeyless } = await import("@/lib/clerk-keyless")
    const keys = await Promise.race([
      clerkKeyless().resolveKeysWithKeylessFallback(publishableKey, secretKey),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ])
    if (!keys) {
      console.error("Clerk keyless mode timed out. Sign-in stays unavailable until keys are set.")
      return { publishableKey, secretKey }
    }
    return {
      publishableKey: keys.publishableKey || publishableKey,
      secretKey: keys.secretKey || secretKey,
    }
  } catch (error) {
    console.error("Clerk keyless mode could not start.", error instanceof Error ? error.message : "keyless error")
    return { publishableKey, secretKey }
  }
}

export function resolveClerkKeys(): Promise<{ publishableKey?: string; secretKey?: string }> {
  if (!globalForClerk.__handbooklyClerkKeys) {
    globalForClerk.__handbooklyClerkKeys = resolveClerkKeysOnce()
  }
  return globalForClerk.__handbooklyClerkKeys
}

export async function getSession(): Promise<AppSession | null> {
  if (!clerkKeysConfigured() && process.env.NODE_ENV === "production") return null
  try {
    const { auth, clerkClient, currentUser } = await import("@clerk/nextjs/server")
    const session = await auth()
    if (!session.userId) return null
    const user = await currentUser()
    const name = user?.fullName || user?.firstName || "Teammate"
    let orgName = session.orgSlug || "Your company"
    if (session.orgId) {
      try {
        const client = await clerkClient()
        const org = await client.organizations.getOrganization({ organizationId: session.orgId })
        orgName = org.name
      } catch {
        orgName = session.orgSlug || "Your company"
      }
    }
    return {
      userId: session.userId,
      orgId: session.orgId ?? null,
      orgName,
      role: session.orgId ? roleFromOrgRole(session.orgRole) : "employee",
      name,
      firstName: user?.firstName || name.split(" ")[0] || name,
      email: user?.primaryEmailAddress?.emailAddress || "",
      imageUrl: user?.imageUrl,
      clerk: true,
    }
  } catch (error) {
    console.error("Clerk session lookup failed.", error instanceof Error ? error.message : "auth error")
    return null
  }
}
