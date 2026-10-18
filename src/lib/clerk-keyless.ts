import { createClerkClient } from "@clerk/backend"
import { createKeylessService, createNodeFileStorage, type KeylessService } from "@clerk/shared/keyless"
import fs from "node:fs"
import path from "node:path"

const globalForKeyless = globalThis as typeof globalThis & { __handbooklyKeyless?: KeylessService }

export function clerkKeyless(): KeylessService {
  if (!globalForKeyless.__handbooklyKeyless) {
    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      userAgent: "@clerk/nextjs@7.9.17",
    })
    globalForKeyless.__handbooklyKeyless = createKeylessService({
      storage: createNodeFileStorage(fs, path, {
        cwd: () => process.cwd(),
        frameworkPackageName: "@clerk/nextjs",
      }),
      api: {
        async createAccountlessApplication(requestHeaders, source) {
          try {
            return await client.__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
              source,
            })
          } catch {
            return null
          }
        },
        async completeOnboarding(requestHeaders, source) {
          try {
            return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
              source,
            })
          } catch {
            return null
          }
        },
      },
      framework: "nextjs",
    })
  }
  return globalForKeyless.__handbooklyKeyless
}
