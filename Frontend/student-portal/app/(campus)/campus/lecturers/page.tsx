"use client"

import * as React from "react"

import { CreateLecturerDialog } from "@/components/lecturers/create-lecturer-dialog"
import { LecturersTable } from "@/components/lecturers/lecturers-table"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusLecturersPage() {
  const { institutionId, siteId } = useCampusPortal()
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Lecturers</PageTitle>
      <div className="flex justify-end">
        <CreateLecturerDialog
          institutionId={institutionId}
          showTrigger
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <LecturersTable
        institutionId={institutionId}
        siteId={siteId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
