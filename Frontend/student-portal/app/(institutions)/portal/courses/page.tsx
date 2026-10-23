"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { CoursesTable } from "@/components/courses/courses-table"
import { PageTitle } from "@/components/page-title"

export default function CoursesPage() {
  const router = useRouter()
  const [institutionId, setInstitutionId] = React.useState<string | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    const id = sessionStorage.getItem("portal.institutionId")
    if (!id) {
      router.replace("/institutions")
      return
    }
    setInstitutionId(id)
  }, [router])

  if (!institutionId) {
    return null
  }

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
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
