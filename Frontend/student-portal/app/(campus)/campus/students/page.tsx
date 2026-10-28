"use client"

import * as React from "react"

import { CreateStudentDialog } from "@/components/students/create-student-dialog"
import { StudentsTable } from "@/components/students/students-table"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusStudentsPage() {
  const { institutionId, siteId } = useCampusPortal()
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Students</PageTitle>
      <div className="flex justify-end">
        <CreateStudentDialog
          institutionId={institutionId}
          showTrigger
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <StudentsTable
        institutionId={institutionId}
        siteId={siteId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
