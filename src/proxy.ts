import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server"
import { resolveClerkKeys } from "@/lib/auth"

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/demo(.*)", "/api/demo(.*)"])

export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isPublicRoute(request)) return NextResponse.next()

  const keys = await resolveClerkKeys()
  if (!keys.publishableKey || !keys.secretKey) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("redirect_url", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  const handle = clerkMiddleware(
    async (auth) => {
      await auth.protect()
    },
    {
      publishableKey: keys.publishableKey,
      secretKey: keys.secretKey,
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
    },
  )
  return handle(request, event)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
}
