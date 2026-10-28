"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { AcademicCalendarPanel } from "@/components/calendar/academic-calendar-panel"
import { PageTitle } from "@/components/page-title"

export default function InstitutionCalendarPage() {
  const router = useRouter()
  const [institutionId, setInstitutionId] = React.useState<string | null>(null)

  React.useEffect(() => {
    const id = sessionStorage.getItem("portal.institutionId")
    if (!id) {
      router.replace("/institutions")
      return
    }
    setInstitutionId(id)
  }, [router])

  if (!institutionId) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Calendar</PageTitle>
      <p className="text-sm text-muted-foreground">
        Define the academic year and important dates. Campuses can view these
        events read-only.
      </p>
      <AcademicCalendarPanel institutionId={institutionId} editable />
    </div>
  )
}
