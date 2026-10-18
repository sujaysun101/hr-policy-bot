import { CreateOrganization } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { requireUser } from "@/lib/guard"

export const metadata = { title: "Create your company" }
export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const session = await requireUser()
  if (session.orgId) redirect("/home")
  const showClerk = process.env.NODE_ENV === "development" || Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-heading text-3xl tracking-tight">Create your company</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Handbookly uses a Clerk organization. You, as the admin, are HR. People you invite as members are employees. Enable Organizations in the Clerk dashboard if the form below cannot create one.
      </p>
      <div className="mt-6">
        {showClerk ? (
          <CreateOrganization afterCreateOrganizationUrl="/home" skipInvitationScreen />
        ) : (
          <p className="rounded-xl border p-4 text-sm">Add Clerk keys before creating a company.</p>
        )}
      </div>
    </div>
  )
}
