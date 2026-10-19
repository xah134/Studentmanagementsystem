"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { CreateCampusDialog } from "@/components/campuses/create-campus-dialog"
import { CampusesTable } from "@/components/campuses/campuses-table"
import { PageTitle } from "@/components/page-title"

export default function CampusesPage() {
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
      <PageTitle>Campuses</PageTitle>
      <div className="flex justify-end">
        <CreateCampusDialog
          institutionId={institutionId}
          showTrigger
          onSaved={() => setRefreshKey((key) => key + 1)}
        />
      </div>
      <CampusesTable
        institutionId={institutionId}
        refreshKey={refreshKey}
        onChanged={() => setRefreshKey((key) => key + 1)}
      />
    </div>
  )
}
