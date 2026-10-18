"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Inbox, LayoutDashboard, Library, Menu, MessageSquareText, ScanSearch, Settings } from "lucide-react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { Logo } from "@/components/brand/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "cn"

export type ShellSession = {
  name: string
  email: string
  role: "hr" | "employee"
  orgName: string
  clerk: boolean
}

const NAV = [
  { href: "/home", label: "Dashboard", icon: LayoutDashboard, hr: false },
  { href: "/chat", label: "Ask Liam", icon: MessageSquareText, hr: false },
  { href: "/handbooks", label: "Handbooks", icon: BookOpen, hr: false },
  { href: "/queue", label: "HR queue", icon: Inbox, hr: true },
  { href: "/gaps", label: "Policy gaps", icon: ScanSearch, hr: true },
  { href: "/knowledge", label: "Knowledge", icon: Library, hr: true },
  { href: "/settings", label: "Settings", icon: Settings, hr: false },
]

export function AppShell({
  session,
  children,
  demoData,
  retrieval,
  queueCount,
  basePath = "",
}: {
  session: ShellSession
  children: React.ReactNode
  demoData: boolean
  retrieval: "pgvector" | "bm25"
  queueCount: number
  basePath?: string
}) {
  const pathname = usePathname()
  const items = NAV.filter((item) => !item.hr || session.role === "hr")

  const nav = (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const href = `${basePath}${item.href}`
        const active = pathname === href || pathname.startsWith(`${href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
            {item.href === "/queue" && queueCount > 0 ? (
              <span className="ml-auto rounded-full bg-copper px-1.5 py-0.5 text-[11px] font-medium text-white">{queueCount}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
          <div className="px-4 py-5">
            <Link href={`${basePath}/home`} aria-label="Handbookly home">
              <Logo inverted />
            </Link>
            <p className="mt-3 truncate px-1 text-xs text-sidebar-foreground/70">{session.orgName}</p>
          </div>
          <div className="flex flex-1 flex-col px-3 pb-4">{nav}</div>
          <p className="px-5 pb-5 text-xs text-sidebar-foreground/60">{session.role === "hr" ? "HR admin" : "Employee"} · Liam is on duty</p>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur md:px-6">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" className="bg-sidebar text-sidebar-foreground">
                <SheetHeader>
                  <SheetTitle className="text-sidebar-foreground">
                    <Logo inverted />
                  </SheetTitle>
                </SheetHeader>
                {nav}
              </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1 md:hidden">
              <Logo />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden text-xs text-muted-foreground lg:inline">{retrieval === "pgvector" ? "pgvector search" : "BM25 search"}</span>
              <ThemeToggle />
              {session.clerk ? (
                <>
                  <OrganizationSwitcher
                    hidePersonal
                    appearance={{
                      elements: { rootBox: "hidden sm:block", organizationSwitcherTrigger: "rounded-lg border border-border px-2 py-1" },
                    }}
                  />
                  <UserButton />
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-full border bg-card px-2 py-1">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground" aria-hidden>
                    {session.name.slice(0, 1)}
                  </span>
                  <span className="pr-1 text-sm">
                    <span className="block leading-none">{session.name}</span>
                    <span className="text-xs text-muted-foreground">{session.role === "hr" ? "People Lead" : "Employee"}</span>
                  </span>
                </div>
              )}
            </div>
          </header>
          {demoData ? (
            <div className="border-b bg-accent px-4 py-2 text-sm text-accent-foreground md:px-6">
              Demo data — Cedar & Pine, a fictional 25-person company. Connect DATABASE_URL to store your own handbook.
            </div>
          ) : null}
          <main id="main" className="flex-1 px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
