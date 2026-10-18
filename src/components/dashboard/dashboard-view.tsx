import Link from "next/link"
import { MixChart, QuestionChart, SectionChart } from "@/components/dashboard/charts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWhen } from "@/lib/format"
import type { AnalyticsSnapshot, Conversation, PolicyGap } from "@/lib/types"

export function DashboardView({
  analytics,
  role,
  firstName,
  orgName,
  conversations,
  gaps,
  basePath = "",
}: {
  analytics: AnalyticsSnapshot
  role: "hr" | "employee"
  firstName: string
  orgName: string
  conversations: Conversation[]
  gaps: PolicyGap[]
  basePath?: string
}) {
  if (role === "employee") {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <p className="text-sm text-muted-foreground">{orgName}</p>
          <h1 className="font-heading text-3xl tracking-tight">Hello, {firstName}</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">Ask Liam about time off, pay, leave, or anything else in the handbook. He cites the section. If it is not written down, he sends it to HR.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Ask Liam</CardTitle>
            <CardDescription>Start with something people at Cedar & Pine actually look up.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {["How many vacation days do I get?", "What is parental leave?", "Can I work from California?"].map((prompt) => (
              <Link key={prompt} href={`${basePath}/chat?q=${encodeURIComponent(prompt)}`} className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted">
                {prompt}
              </Link>
            ))}
            <Link href={`${basePath}/chat`} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
              Open chat
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your recent questions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {conversations.length === 0 ? <p className="text-sm text-muted-foreground">You have not asked Liam anything yet.</p> : null}
            {conversations.slice(0, 5).map((conversation) => (
              <Link key={conversation.id} href={`${basePath}/chat/${conversation.id}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
                <span className="block font-medium">{conversation.title}</span>
                <span className="text-muted-foreground">{formatWhen(conversation.updatedAt)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    { label: "Questions, 30 days", value: String(analytics.questionsLast30Days) },
    { label: "Answered from the handbook or HR notes", value: `${analytics.handbookAnswerRate}%` },
    { label: "Waiting on HR", value: String(analytics.openQueue) },
    { label: "Open policy gaps", value: String(analytics.openGaps) },
  ]

  return (
    <div data-testid="dashboard" className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{orgName} · {analytics.activeAskers} people asked this month</p>
          <h1 className="font-heading text-3xl tracking-tight">What the handbook is being asked</h1>
        </div>
        <Link href={`${basePath}/queue`} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          Review the HR queue
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="font-heading text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Questions by day</CardTitle>
            <CardDescription>Handbook answers and the ones that went to HR.</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionChart series={analytics.series} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Where answers came from</CardTitle>
          </CardHeader>
          <CardContent>
            <MixChart mix={analytics.mix} />
            <ul className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {analytics.mix.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.value}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sections Liam cited</CardTitle>
            <CardDescription>Only questions the handbook or the knowledge base could answer.</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topSections.length === 0 ? <p className="text-sm text-muted-foreground">No citations yet.</p> : <SectionChart sections={analytics.topSections} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest questions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {analytics.recent.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.question}</p>
                  <Badge variant={item.outcome === "escalated" ? "outline" : "secondary"}>{item.outcome === "escalated" ? "Asked HR" : item.outcome === "knowledge" ? "HR note" : "Handbook"}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.askedByName} · {formatWhen(item.createdAt)}
                  {item.section ? ` · ${item.section}` : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Policy gaps to write</CardTitle>
          <CardDescription>Topics employees asked about that the handbook does not cover.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {gaps.filter((gap) => gap.status === "suggested").slice(0, 4).map((gap) => (
            <Link key={gap.id} href={`${basePath}/gaps`} className="rounded-lg border p-3 hover:bg-muted">
              <p className="font-medium">{gap.topic}</p>
              <p className="mt-1 text-sm text-muted-foreground">{gap.summary}</p>
              <p className="mt-2 text-xs text-copper">{gap.questionCount} question{gap.questionCount === 1 ? "" : "s"}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
