import { SignUp } from "@clerk/nextjs"
import { AuthSplit } from "@/components/auth/auth-split"

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  const showClerk = process.env.NODE_ENV === "development" || Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  return (
    <AuthSplit title="A handbook your team can actually ask.">
      {showClerk ? (
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
      ) : (
        <div className="rounded-2xl border bg-card p-6">
          <h1 className="font-heading text-3xl">Sign-up needs Clerk keys</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Set the Clerk environment variables, then create a company. The organization admin is HR. Members are employees.
          </p>
        </div>
      )}
    </AuthSplit>
  )
}
