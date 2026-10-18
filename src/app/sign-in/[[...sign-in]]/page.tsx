import { SignIn } from "@clerk/nextjs"
import { AuthSplit } from "@/components/auth/auth-split"
import { resolveClerkKeys } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function SignInPage() {
  const { publishableKey } = await resolveClerkKeys()
  const showClerk = Boolean(publishableKey)
  return (
    <AuthSplit title="Ask the handbook. Cite the section.">
      {showClerk ? (
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/home" />
      ) : (
        <div className="rounded-2xl border bg-card p-6">
          <h1 className="font-heading text-3xl">Sign-in needs Clerk keys</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY. In local development, Handbookly uses Clerk keyless mode and creates a temporary app if those keys are missing.
          </p>
        </div>
      )}
    </AuthSplit>
  )
}
