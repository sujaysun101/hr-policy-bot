import Link from "next/link"
import { BookMarked, Inbox, ScanSearch } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Rise } from "@/components/marketing/rise"
import { ThemeToggle } from "@/components/theme-toggle"

const FEATURES = [
  {
    icon: BookMarked,
    title: "Citations, not guesses",
    body: "Liam answers from the handbook you upload and names the section number. If the policy is not there, he says so.",
  },
  {
    icon: Inbox,
    title: "A queue for what you still owe",
    body: "Unanswered questions land with HR. An answer can be saved into the knowledge base, and the next person hears it with a citation.",
  },
  {
    icon: ScanSearch,
    title: "The gaps, collected",
    body: "When people ask about something the handbook never mentions, Handbookly groups those questions so you can write the missing section.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-in" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
            Sign in
          </Link>
          <Link href="/sign-up" className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            Open Handbookly
          </Link>
        </div>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-8 pb-12 md:grid-cols-2 md:pt-16">
          <Rise>
            <p className="text-sm font-medium text-copper">For small teams</p>
            <h1 className="mt-3 font-heading text-5xl leading-[1.05] tracking-tight md:text-6xl">Your handbook, answerable any hour.</h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Handbookly gives every employee a way to ask Liam. He answers from the policies you upload, cites the section, and sends the rest to HR.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-up" className="rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                Start with your handbook
              </Link>
              <Link href="/sign-in" className="rounded-lg border px-4 py-2.5 text-sm">
                I already have an account
              </Link>
            </div>
          </Rise>
          <Rise delay={0.08} className="rounded-3xl border bg-card p-4 shadow-sm">
            <p className="px-2 text-xs text-muted-foreground">Example from the Cedar & Pine sample handbook</p>
            <div className="mt-3 rounded-2xl bg-muted/60 p-4">
              <p className="text-sm">How many vacation days do I get?</p>
            </div>
            <div className="mt-3 px-1">
              <p className="text-xs font-medium text-copper">Liam</p>
              <p className="mt-1 text-sm leading-6">
                Section 4.1, Paid time off: Full-time employees receive 18 days, which is 144 hours, of paid time off per calendar year. It accrues at 1.5 days per month.
              </p>
              <div className="mt-3 rounded-xl border bg-background p-3">
                <p className="text-xs"><span className="font-medium text-copper">4.1</span> Paid time off · p. 9</p>
                <p className="mt-1 text-sm text-muted-foreground">You may use paid time off after 30 days of employment. The carryover cap is 27 days.</p>
              </div>
            </div>
          </Rise>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Rise key={feature.title} delay={index * 0.06} className="rounded-2xl border bg-card p-5">
                <Icon className="size-5 text-primary" aria-hidden />
                <h2 className="mt-3 font-heading text-2xl">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </Rise>
            )
          })}
        </section>
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="rounded-3xl bg-sidebar px-6 py-10 text-sidebar-foreground md:px-10">
            <h2 className="font-heading text-4xl tracking-tight">Put the handbook where people already ask.</h2>
            <p className="mt-3 max-w-xl text-sidebar-foreground/80">HR uploads the PDF. Employees ask Liam. You see the questions your handbook never answered.</p>
            <Link href="/sign-up" className="mt-6 inline-flex rounded-lg bg-sidebar-primary px-4 py-2.5 text-sm text-sidebar-primary-foreground">
              Create your company
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t px-5 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>Handbookly. Liam is the assistant. The policies stay yours.</p>
          <Link href="/sign-in">Sign in</Link>
        </div>
      </footer>
    </div>
  )
}
