"use client"

import * as React from "react"
import { Backpack, BookOpen, UserRound, type LucideIcon } from "lucide-react"

import { AcademicCalendarPanel } from "@/components/calendar/academic-calendar-panel"
import { KpiWidget } from "@/components/kpi/kpi-widget"
import { PageTitle } from "@/components/page-title"
import { apiUrl } from "@/lib/api"
import { useCampusPortal } from "@/lib/campus-portal"

function CountKpi({
  institutionId,
  siteId,
  path,
  label,
  description,
  icon,
}: {
  institutionId: string
  siteId: string
  path: string
  label: string
  description: string
  icon: LucideIcon
}) {
  const [value, setValue] = React.useState<number | null>(null)
  const [text, setText] = React.useState(description)

  React.useEffect(() => {
    const params = new URLSearchParams({
      institutionId,
      siteId,
      page: "1",
      pageSize: "1",
    })

    fetch(`${apiUrl()}/${path}?${params}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(payload.message || `Failed to load ${label.toLowerCase()} count`)
        }
        return payload
      })
      .then((payload) => {
        if (typeof payload?.summary?.totalCount !== "number") {
          throw new Error("Invalid response structure")
        }
        setValue(payload.summary.totalCount)
        setText(description)
      })
      .catch((error: unknown) => {
        setValue(null)
        setText(
          error instanceof Error ? error.message : "Error loading count"
        )
      })
  }, [institutionId, siteId, path, label, description])

  return (
    <KpiWidget label={label} value={value} description={text} icon={icon} />
  )
}

export default function CampusOverviewPage() {
  const { institutionId, siteId, campus } = useCampusPortal()
  const place = [campus.city, campus.state].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageTitle>{campus.name}</PageTitle>
        {place ? (
          <p className="text-muted-foreground">{place}</p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <CountKpi
          institutionId={institutionId}
          siteId={siteId}
          path="students"
          label="Students"
          description="Students on this campus"
          icon={Backpack}
        />
        <CountKpi
          institutionId={institutionId}
          siteId={siteId}
          path="lecturers"
          label="Lecturers"
          description="Lecturers on this campus"
          icon={UserRound}
        />
        <CountKpi
          institutionId={institutionId}
          siteId={siteId}
          path="courses"
          label="Courses"
          description="Courses on this campus"
          icon={BookOpen}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Academic calendar</h2>
        <p className="text-sm text-muted-foreground">
          Institution calendar for this campus (view only).
        </p>
        <AcademicCalendarPanel
          institutionId={institutionId}
          siteId={siteId}
          editable={false}
        />
      </div>
    </div>
  )
}
