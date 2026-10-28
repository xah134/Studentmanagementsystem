"use client"

import { AcademicCalendarPanel } from "@/components/calendar/academic-calendar-panel"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusCalendarPage() {
  const { institutionId, siteId } = useCampusPortal()

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Calendar</PageTitle>
      <p className="text-sm text-muted-foreground">
        Institution academic calendar for this campus (read-only).
      </p>
      <AcademicCalendarPanel
        institutionId={institutionId}
        siteId={siteId}
        editable={false}
      />
    </div>
  )
}
