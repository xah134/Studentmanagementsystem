"use client"

import { CampusAttendancePanel } from "@/components/attendance/campus-attendance-panel"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusAttendancePage() {
  const { institutionId, siteId } = useCampusPortal()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <PageTitle>Attendance</PageTitle>
        <p className="text-sm text-muted-foreground">
          Mark Present or Absent for a course class slot on a specific date.
        </p>
      </div>
      <CampusAttendancePanel institutionId={institutionId} siteId={siteId} />
    </div>
  )
}
