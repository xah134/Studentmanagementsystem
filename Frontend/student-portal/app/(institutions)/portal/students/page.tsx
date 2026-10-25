"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { CreateStudentDialog } from "@/components/students/create-student-dialog"
import { StudentsTable } from "@/components/students/students-table"
import { PageTitle } from "@/components/page-title"

export default function StudentsPage() {
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
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
