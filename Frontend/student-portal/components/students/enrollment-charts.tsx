"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { apiUrl } from "@/lib/api"

type EnrollmentOverview = {
  totalStudents: number
  byYear: { year: string; count: number }[]
  byCampus: { siteId: string; siteName: string; count: number }[]
}

const CAMPUS_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "hsl(199 89% 48%)",
  "hsl(142 71% 45%)",
  "hsl(262 83% 58%)",
]

const yearChartConfig = {
  count: {
    label: "Students",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function EnrollmentCharts({ institutionId }: { institutionId: string }) {
  const [data, setData] = React.useState<EnrollmentOverview | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ institutionId })
    fetch(`${apiUrl()}/students/stats/enrollment?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || "Failed to load enrollment stats")
        }
        return payload.data as EnrollmentOverview
      })
      .then((overview) => {
        if (cancelled) return
        setData(overview)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        setError(err instanceof Error ? err.message : "Failed to load charts")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [institutionId])

  const campusConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    for (const [index, campus] of (data?.byCampus ?? []).entries()) {
      config[campus.siteId] = {
        label: campus.siteName,
        color: CAMPUS_COLORS[index % CAMPUS_COLORS.length],
      }
    }
    return config
  }, [data?.byCampus])

  const campusData = React.useMemo(
    () =>
      (data?.byCampus ?? []).map((campus) => ({
        siteId: campus.siteId,
        siteName: campus.siteName,
        students: campus.count,
        fill: `var(--color-${campus.siteId})`,
      })),
    [data?.byCampus]
  )

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollments by year</CardTitle>
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students by campus</CardTitle>
            <CardDescription>Loading…</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <p className="text-sm text-destructive">
        {error || "Enrollment charts unavailable"}
      </p>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Enrollments by year</CardTitle>
          <CardDescription>
            New student registrations · {data.totalStudents} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.byYear.length === 0 ? (
            <p className="text-sm text-muted-foreground">No student data yet.</p>
          ) : (
            <ChartContainer config={yearChartConfig} className="aspect-[4/3] w-full">
              <BarChart
                accessibilityLayer
                data={data.byYear}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students by campus</CardTitle>
          <CardDescription>Current distribution across sites</CardDescription>
        </CardHeader>
        <CardContent>
          {campusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campus data yet.</p>
          ) : (
            <ChartContainer
              config={campusConfig}
              className="mx-auto aspect-square max-h-[280px] w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="siteName" hideLabel />}
                />
                <Pie
                  data={campusData}
                  dataKey="students"
                  nameKey="siteId"
                  innerRadius={58}
                  outerRadius={96}
                  strokeWidth={2}
                >
                  {campusData.map((entry) => (
                    <Cell key={entry.siteId} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {data.totalStudents}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 18}
                              className="fill-muted-foreground text-xs"
                            >
                              students
                            </tspan>
                          </text>
                        )
                      }
                      return null
                    }}
                  />
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="siteId" />}
                  className="-translate-y-1 flex-wrap gap-2"
                />
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
