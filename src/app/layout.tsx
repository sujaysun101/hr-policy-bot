import type { Metadata } from "next"
import { Fraunces, Source_Sans_3 } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Providers } from "@/components/providers"
import { resolveClerkKeys } from "@/lib/auth"
import "./globals.css"

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Handbookly",
    template: "%s · Handbookly",
  },
  description: "Your employee handbook, answerable any hour. Liam cites the exact policy section and sends anything the handbook does not cover to HR.",
  openGraph: {
    title: "Handbookly",
    description: "Your employee handbook, answerable any hour. Liam cites the section.",
    type: "website",
  },
}

const clerkAppearance = {
  variables: {
    colorPrimary: "#1F6B4A",
    colorBackground: "#FBF8F3",
    colorText: "#1C2B24",
    colorTextSecondary: "#5C675F",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#1C2B24",
    borderRadius: "0.8rem",
    fontFamily: "var(--font-source), 'Source Sans 3', sans-serif",
  },
  elements: {
    card: "shadow-none bg-transparent border-0",
    headerTitle: "font-heading",
    formButtonPrimary: "bg-[#1F6B4A]",
    footerActionLink: "text-[#1F6B4A]",
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { publishableKey } = await resolveClerkKeys()
  const body = (
    <Providers>
      {children}
    </Providers>
  )
  return (
    <html lang="en" className={`${sourceSans.variable} ${fraunces.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        {publishableKey ? <ClerkProvider publishableKey={publishableKey} appearance={clerkAppearance}>{body}</ClerkProvider> : body}
      </body>
    </html>
  )
}
