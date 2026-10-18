import Link from "next/link"
import { Logo } from "@/components/brand/logo"

export function AuthSplit({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
        <Link href="/" aria-label="Handbookly home">
          <Logo inverted />
        </Link>
        <div>
          <p className="font-heading text-4xl leading-tight tracking-tight">{title}</p>
          <div className="mt-8 max-w-sm rounded-2xl bg-sidebar-accent p-4 text-sm leading-6">
            <p className="text-xs text-copper">Liam · section 4.5</p>
            <p className="mt-2">After 6 months, a birthing parent receives 12 weeks of paid parental leave. The other parent receives 6 weeks.</p>
          </div>
        </div>
        <p className="text-sm text-sidebar-foreground/70">HR admins upload the handbook. Employees ask. Unanswered questions wait for you.</p>
      </aside>
      <main className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 md:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
