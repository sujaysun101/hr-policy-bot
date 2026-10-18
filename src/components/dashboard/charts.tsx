"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { AnalyticsSnapshot } from "@/lib/types"

const PIE = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]

export function QuestionChart({ series }: { series: AnalyticsSnapshot["series"] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} interval={4} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={28} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
          <Area type="monotone" dataKey="questions" name="Questions" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} strokeWidth={2} />
          <Area type="monotone" dataKey="escalated" name="Asked HR" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SectionChart({ sections }: { sections: AnalyticsSnapshot["topSections"] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sections} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="section" width={120} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
          <Bar dataKey="count" name="Citations" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MixChart({ mix }: { mix: AnalyticsSnapshot["mix"] }) {
  if (mix.length === 0) return <p className="text-sm text-muted-foreground">No questions in the last 30 days.</p>
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={mix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3}>
            {mix.map((entry, index) => (
              <Cell key={entry.name} fill={PIE[index % PIE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
