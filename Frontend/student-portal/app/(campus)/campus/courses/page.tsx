"use client"

import * as React from "react"

import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { CoursesTable } from "@/components/courses/courses-table"
import { PageTitle } from "@/components/page-title"
import { useCampusPortal } from "@/lib/campus-portal"

export default function CampusCoursesPage() {
  const { institutionId, siteId } = useCampusPortal()
  const [refreshKey, setRefreshKey] = React.useState(0)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Courses</PageTitle>
      <div className="flex justify-end">
        <CreateCourseDialog
          institutionId={institutionId}
          showTrigger
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <CoursesTable
        institutionId={institutionId}
        siteId={siteId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
        viewHrefBase="/campus/courses"
      />
    </div>
  )
}
