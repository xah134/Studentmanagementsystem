"use client"

import * as React from "react"

import { CreateFacultyDialog } from "@/components/faculties/create-faculty-dialog"
import { FacultiesTable } from "@/components/faculties/faculties-table"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusDepartmentsPage() {
  const { institutionId, siteId } = useCampusPortal()
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Departments</PageTitle>
      <div className="flex justify-end">
        <CreateFacultyDialog
          institutionId={institutionId}
          showTrigger
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <FacultiesTable
        institutionId={institutionId}
        siteId={siteId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
