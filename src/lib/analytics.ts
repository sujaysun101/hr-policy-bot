import type { AnalyticsSnapshot, Ask, PolicyGap, HrQuestion } from "@/lib/types"

function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function computeAnalytics(
  asks: Ask[],
  questions: HrQuestion[],
  gaps: PolicyGap[],
  now = new Date(),
): AnalyticsSnapshot {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 29)

  const recentAsks = asks.filter((ask) => new Date(ask.createdAt) >= start)
  const handbookOrKnowledge = recentAsks.filter((ask) => ask.outcome !== "escalated").length
  const rate = recentAsks.length === 0 ? 0 : Math.round((handbookOrKnowledge / recentAsks.length) * 100)

  const series = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = dayKey(date)
    const dayAsks = recentAsks.filter((ask) => ask.createdAt.slice(0, 10) === key)
    return {
      date: key,
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
      questions: dayAsks.length,
      escalated: dayAsks.filter((ask) => ask.outcome === "escalated").length,
    }
  })

  const sectionCounts = new Map<string, number>()
  for (const ask of recentAsks) {
    if (!ask.sectionTitle || ask.outcome === "escalated") continue
    sectionCounts.set(ask.sectionTitle, (sectionCounts.get(ask.sectionTitle) ?? 0) + 1)
  }
  const topSections = [...sectionCounts.entries()]
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  const mix = [
    { name: "Handbook", value: recentAsks.filter((ask) => ask.outcome === "handbook").length },
    { name: "HR knowledge", value: recentAsks.filter((ask) => ask.outcome === "knowledge").length },
    { name: "Asked HR", value: recentAsks.filter((ask) => ask.outcome === "escalated").length },
  ].filter((item) => item.value > 0)

  const recent = [...asks]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6)
    .map((ask) => ({
      id: ask.id,
      question: ask.question,
      askedByName: ask.userName,
      createdAt: ask.createdAt,
      outcome: ask.outcome,
      section: ask.sectionTitle,
    }))

  return {
    questionsLast30Days: recentAsks.length,
    handbookAnswerRate: rate,
    openQueue: questions.filter((question) => question.status === "open").length,
    openGaps: gaps.filter((gap) => gap.status === "suggested").length,
    activeAskers: new Set(recentAsks.map((ask) => ask.userId)).size,
    series,
    topSections,
    mix,
    recent,
  }
}
